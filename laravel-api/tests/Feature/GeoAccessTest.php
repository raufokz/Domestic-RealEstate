<?php

namespace Tests\Feature;

use App\Models\GeoAccessLog;
use App\Models\GeoWhitelistEntry;
use App\Models\User;
use App\Services\Geo\GeoIpLookupService;
use App\Services\Geo\IpReputationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeoAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['geo.internal_secret' => 'test-secret']);
    }

    private function mockGeoIntel(?string $country, ?int $asn = null): void
    {
        $this->mock(GeoIpLookupService::class, function ($mock) use ($country, $asn) {
            $mock->shouldReceive('lookup')->andReturn([
                'country_code' => $country,
                'country_name' => $country,
                'city' => null,
                'asn' => $asn,
                'isp' => null,
            ]);
        });
    }

    private function mockReputation(bool $isTor = false, bool $isDatacenter = false): void
    {
        $this->mock(IpReputationService::class, function ($mock) use ($isTor, $isDatacenter) {
            $mock->shouldReceive('check')->andReturn(['is_tor' => $isTor, 'is_datacenter' => $isDatacenter]);
        });
    }

    public function test_blocked_country_is_denied_with_403(): void
    {
        $this->mockGeoIntel('PK');
        $this->mockReputation();

        $response = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.6'])
            ->getJson('/api/properties');

        $response->assertStatus(403);
        $this->assertDatabaseHas('geo_access_logs', [
            'ip_address' => '203.0.113.6',
            'reason' => 'country_blocked',
        ]);
    }

    public function test_allowed_country_passes_through(): void
    {
        $this->mockGeoIntel('US');
        $this->mockReputation();

        $response = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.7'])
            ->getJson('/api/properties');

        $response->assertStatus(200);
    }

    public function test_whitelisted_ip_bypasses_blocked_country(): void
    {
        GeoWhitelistEntry::create([
            'value' => '203.0.113.5',
            'is_cidr' => false,
            'status' => 'active',
        ]);
        $this->mockGeoIntel('PK');
        $this->mockReputation();

        $response = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.5'])
            ->getJson('/api/properties');

        $response->assertStatus(200);
    }

    public function test_tor_exit_node_is_denied_regardless_of_country(): void
    {
        $this->mockGeoIntel('US');
        $this->mockReputation(isTor: true);

        $response = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.8'])
            ->getJson('/api/properties');

        $response->assertStatus(403);
        $this->assertDatabaseHas('geo_access_logs', [
            'ip_address' => '203.0.113.8',
            'reason' => 'tor_exit_node',
        ]);
    }

    public function test_admin_routes_stay_reachable_regardless_of_geo(): void
    {
        $this->mockGeoIntel('PK');
        $this->mockReputation();
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.9'])
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(200);
    }

    public function test_internal_geo_check_endpoint_requires_secret(): void
    {
        $this->postJson('/api/geo/check', ['ip' => '203.0.113.10'])
            ->assertStatus(401);

        $this->postJson('/api/geo/check', ['ip' => '203.0.113.10'], ['X-Geo-Internal-Secret' => 'wrong'])
            ->assertStatus(401);
    }

    public function test_internal_geo_check_endpoint_returns_decision_with_valid_secret(): void
    {
        $this->mockGeoIntel('PK');
        $this->mockReputation();

        $response = $this->postJson('/api/geo/check', ['ip' => '203.0.113.11'], ['X-Geo-Internal-Secret' => 'test-secret']);

        $response->assertStatus(200)
            ->assertJsonPath('data.allowed', false)
            ->assertJsonPath('data.reason', 'country_blocked');
    }
}
