<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\User;
use App\Services\Payments\PayoneerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class InvoicePaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_mark_paid_route_no_longer_exists(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->create();

        // The old client-triggered "mark paid" endpoint must be gone entirely.
        $this->actingAs($admin)->postJson("/api/admin/invoices/{$invoice->id}/pay", [])
            ->assertStatus(404);
    }

    public function test_send_invoice_creates_real_checkout_session_and_emails_it(): void
    {
        Mail::fake();
        $this->partialMock(PayoneerService::class, function ($mock) {
            $mock->shouldReceive('createCheckoutSession')->once()->andReturn([
                'checkout_id' => 'chk_inv_1',
                'checkout_url' => 'https://sandbox.payoneer.com/checkout/chk_inv_1',
                'status' => 'pending',
            ]);
        });

        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['email' => 'billme@example.com']);
        $invoice = Invoice::factory()->create(['user_id' => $customer->id, 'status' => 'draft']);

        $response = $this->actingAs($admin)->postJson("/api/admin/invoices/{$invoice->id}/send");

        $response->assertStatus(200)
            ->assertJson(['payoneer_link' => 'https://sandbox.payoneer.com/checkout/chk_inv_1']);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'sent',
            'payoneer_invoice_id' => 'chk_inv_1',
        ]);
        Mail::assertQueued(\App\Mail\InvoiceSent::class);
    }

    public function test_webhook_marks_invoice_paid_only_with_valid_signature(): void
    {
        config(['payments.payoneer.webhook_secret' => 'inv-secret']);
        $invoice = Invoice::factory()->create(['status' => 'sent']);

        $body = json_encode(['event' => 'payment.succeeded', 'reference_id' => (string) $invoice->id, 'transaction_id' => 'txn_1']);

        // Wrong signature — rejected, nothing changes.
        $this->call('POST', '/api/invoices/webhook', [], [], [], [
            'HTTP_X-Payoneer-Signature' => 'bad',
            'CONTENT_TYPE' => 'application/json',
        ], $body)->assertStatus(401);
        $this->assertSame('sent', $invoice->fresh()->status);

        // Correct signature — invoice flips to paid.
        $signature = hash_hmac('sha256', $body, 'inv-secret');
        $this->call('POST', '/api/invoices/webhook', [], [], [], [
            'HTTP_X-Payoneer-Signature' => $signature,
            'CONTENT_TYPE' => 'application/json',
        ], $body)->assertStatus(200);

        $this->assertSame('paid', $invoice->fresh()->status);
        $this->assertSame('txn_1', $invoice->fresh()->gateway_transaction_id);
    }

    public function test_generic_update_endpoint_cannot_be_used_to_self_report_paid(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->create(['status' => 'sent']);

        $response = $this->actingAs($admin)->putJson("/api/admin/invoices/{$invoice->id}", ['status' => 'paid']);

        $response->assertStatus(422);
        $this->assertSame('sent', $invoice->fresh()->status);
    }

    public function test_only_staff_can_record_a_manual_payment(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $invoice = Invoice::factory()->create(['user_id' => $buyer->id, 'status' => 'sent']);

        $this->actingAs($buyer)->postJson("/api/admin/invoices/{$invoice->id}/record-manual-payment", [
            'reference' => 'WIRE-123',
            'method' => 'bank_transfer',
        ])->assertStatus(403);

        $staff = User::factory()->create(['role' => 'staff']);
        $response = $this->actingAs($staff)->postJson("/api/admin/invoices/{$invoice->id}/record-manual-payment", [
            'reference' => 'WIRE-123',
            'method' => 'bank_transfer',
            'note' => 'Confirmed by finance team',
        ]);

        $response->assertStatus(200);
        $this->assertSame('paid', $invoice->fresh()->status);
        $this->assertDatabaseHas('audit_logs', ['action' => 'invoice.manual_payment_recorded', 'entity_id' => $invoice->id]);
    }
}
