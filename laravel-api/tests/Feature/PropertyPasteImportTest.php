<?php

namespace Tests\Feature;

use App\Models\ImportBatch;
use App\Models\Property;
use App\Models\User;
use App\Services\ZillowPasteParser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyPasteImportTest extends TestCase
{
    use RefreshDatabase;

    private const SAMPLE_TEXT = <<<'TXT'
https://www.zillow.com/homedetails/26504-79th-Ave-Glen-Oaks-NY-11004/32102264_zpid/	$1,888,000	3	bds	4	ba	2,314	sqft	House for sale	265-04 79th Avenue, Glen Oaks, NY 11004	LISTING BY: BERKSHIRE HATHAWAY	More	Showcase	Save	Previous photo	Next photo	https://photos.zillowstatic.com/fp/8f2462e69fc9b733e5a04fb67662ae27-p_e.webp	https://photos.zillowstatic.com/fp/0f7824520bf381df441aa54d1e9c61e8-p_e.webp
https://www.zillow.com/homedetails/20-Church-St-Jamaica-NY-11414/32218089_zpid/	$385,000	4	bds	2	ba	2,070	sqft	Active	20 Church St, Jamaica, NY 11414	LISTING BY: ISLAND ADVANTAGE REALTY	More	Waterfront location	Save	Previous photo	Next photo	https://photos.zillowstatic.com/fp/e856471841eddf1d54488f72c59dadcf-p_e.webp
Loading...
TXT;

    private const JSON_ROW = <<<'TXT'
"{"@type":"Event","@context":"http://schema.org","name":"Open House - 2:00 - 3:00 PM","description":"Open House","url":"https://www.zillow.com/homedetails/544-Falcon-Ave-Staten-Island-NY-10306/32334381_zpid/","startDate":"2026-08-08T14:00:00","endDate":"2026-08-08T15:00:00","location":{"@type":"Place","name":"544 Falcon Ave","geo":{"@type":"GeoCoordinates","latitude":40.55949,"longitude":-74.11713},"address":{"@type":"PostalAddress","streetAddress":"544 Falcon Ave","postalCode":"10306","addressLocality":"Staten Island","addressRegion":"NY"}},"image":"https://photos.zillowstatic.com/fp/7da31acc9e5ccb7d9cc3d4eef01ecc14-p_e.jpg","offers":{"price":1900000,"priceCurrency":"$","url":"https://www.zillow.com/homedetails/544-Falcon-Ave-Staten-Island-NY-10306/32334381_zpid/","validFrom":"2026-08-08T14:00:00"},"performer":"Listing by: Tiger Realty"}"	https://www.zillow.com/homedetails/544-Falcon-Ave-Staten-Island-NY-10306/32334381_zpid/	$1,900,000	5	bds	7	ba	3,712	sqft	House for sale	544 Falcon Ave, Staten Island, NY 10306	LISTING BY: TIGER REALTY	https://photos.zillowstatic.com/fp/514cb1d708f193bd5d9ffcb2d94e22f7-p_e.webp
TXT;

    public function test_parser_extracts_each_listing_and_merges_json_row(): void
    {
        $parsed = ZillowPasteParser::parse(self::SAMPLE_TEXT);

        $this->assertCount(2, $parsed);

        $first = $parsed[0];
        $this->assertSame(32102264, $first['zpid']);
        $this->assertSame(1888000.0, $first['price']);
        $this->assertSame(3, $first['bedrooms']);
        $this->assertSame(4.0, $first['bathrooms']);
        $this->assertSame(2314, $first['sqft']);
        $this->assertSame('265-04 79th Avenue', $first['address']);
        $this->assertSame('Glen Oaks', $first['city']);
        $this->assertSame('NY', $first['state']);
        $this->assertSame('11004', $first['zip']);
        $this->assertSame('BERKSHIRE HATHAWAY', $first['listing_broker']);
        $this->assertContains('https://photos.zillowstatic.com/fp/8f2462e69fc9b733e5a04fb67662ae27-p_e.webp', $first['photos']);

        $second = $parsed[1];
        $this->assertSame(32218089, $second['zpid']);
        $this->assertSame(385000.0, $second['price']);
        $this->assertSame('Jamaica', $second['city']);
    }

    public function test_parser_handles_json_event_with_geo_and_open_house(): void
    {
        $parsed = ZillowPasteParser::parse(self::JSON_ROW);

        $this->assertCount(1, $parsed);
        $listing = $parsed[0];

        $this->assertSame(32334381, $listing['zpid']);
        $this->assertSame(1900000.0, $listing['price']);
        $this->assertSame('544 Falcon Ave', $listing['address']);
        $this->assertSame('TIGER REALTY', $listing['listing_broker']);
        $this->assertSame(40.55949, $listing['latitude']);
        $this->assertSame(-74.11713, $listing['longitude']);
        $this->assertSame('2026-08-08 14:00:00', $listing['open_house_date']);
        $this->assertSame('2026-08-08 15:00:00', $listing['open_house_end']);
        // Same photo as .jpg (schema image) + .webp must collapse to one entry.
        $this->assertSame(1, substr_count(json_encode($listing['photos']), '7da31acc9e5ccb7d9cc3d4eef01ecc14'));
    }

    public function test_parser_ignores_loading_and_noise_lines(): void
    {
        $parsed = ZillowPasteParser::parse("Loading...\n\n\t\nrandom noise\nhttps://www.zillow.com/homedetails/20-Church-St-Jamaica-NY-11414/32218089_zpid/\t$385,000\t4\tbds\t2\tba\t2,070\tsqft\tActive\t20 Church St, Jamaica, NY 11414\tLISTING BY: ISLAND ADVANTAGE REALTY");

        $this->assertCount(1, $parsed);
        $this->assertSame(385000.0, $parsed[0]['price']);
    }

    public function test_parse_paste_endpoint_returns_detected_listings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/properties/parse-paste', [
            'text' => self::SAMPLE_TEXT,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.count', 2);
    }

    public function test_parse_paste_requires_text(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/properties/parse-paste', [])
            ->assertStatus(422);
    }

    public function test_buyer_cannot_parse_or_import_paste(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);

        $this->actingAs($buyer)->postJson('/api/properties/parse-paste', ['text' => 'x'])->assertStatus(403);
        $this->actingAs($buyer)->postJson('/api/properties/import-paste', ['listings' => []])->assertStatus(403);
    }

    public function test_import_paste_creates_pending_properties_and_batch(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $listings = ZillowPasteParser::parse(self::SAMPLE_TEXT);

        $response = $this->actingAs($admin)->postJson('/api/properties/import-paste', [
            'listings' => $listings,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('count', 2);

        $this->assertDatabaseHas('properties', ['address' => '265-04 79th Avenue', 'city' => 'Glen Oaks']);
        $this->assertDatabaseHas('properties', ['address' => '20 Church St', 'city' => 'Jamaica']);

        $created = Property::where('city', 'Glen Oaks')->first();
        $this->assertSame('pending', $created->approval_status);
        $this->assertSame('active', $created->status);
        $this->assertSame($admin->id, $created->realtor_id);

        $this->assertSame(1, ImportBatch::where('import_type', 'properties')->count());
    }

    public function test_import_paste_skips_rows_with_missing_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/properties/import-paste', [
            'listings' => [
                ['price' => '100000', 'address' => '1 Main St', 'city' => 'X', 'state' => 'NY', 'zip' => '11000'],
                ['price' => '200000', 'address' => '', 'city' => 'Y', 'state' => 'NY', 'zip' => '11001'],
                ['price' => 'not-a-number', 'address' => '2 Oak St', 'city' => 'Z', 'state' => 'NY', 'zip' => '11002'],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('count', 1)
            ->assertJsonPath('errors', 2);

        $this->assertDatabaseHas('properties', ['address' => '1 Main St']);
        $this->assertDatabaseMissing('properties', ['address' => '2 Oak St']);
    }
}
