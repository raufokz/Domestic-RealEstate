<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Additive extension of the existing listing schema.
 *
 * Deliberately NOT a rewrite. `properties` already carries slug, pricing,
 * beds/baths, full address, geo, soft deletes, ownership (realtor_id /
 * created_by) and 17 indexes; `property_images` already has ordering and a
 * cover flag; amenities are already normalised into amenities +
 * amenity_property. Renaming those to a different convention would break the
 * live Laravel API, the 337-page frontend that reads the current shape, and
 * the rows already in the table.
 *
 * This migration only fills the genuine gaps, and every column is nullable so
 * existing rows stay valid without a backfill.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Struck-through "was" price, for showing a reduction.
            $table->decimal('original_price', 12, 2)->nullable()->after('price');
            // Half baths are counted separately from full baths in US listings.
            $table->unsignedTinyInteger('half_bathrooms')->nullable()->after('bathrooms');
            $table->decimal('property_taxes_annual', 10, 2)->nullable()->after('hoa_fees');
            // Unit / suite line.
            $table->string('address_line2')->nullable()->after('address');
            // Staff-checked listing. Distinct from `premium`, which is a paid placement.
            $table->boolean('is_verified')->default(false)->after('premium');
            $table->timestamp('verified_at')->nullable()->after('is_verified');
            $table->foreignId('verified_by')->nullable()->after('verified_at')
                ->constrained('users')->nullOnDelete();

            $table->index('is_verified');
        });

        /*
         * Widen the two enums rather than replacing them.
         *  - status gains under_contract and archived (the requested
         *    UNDER_CONTRACT / ARCHIVED states) while keeping every value the
         *    existing rows and queries already use.
         *  - price_type gains off_market for pocket listings.
         * Raw SQL because Doctrine DBAL cannot alter MySQL enums in place.
         */
        DB::statement(
            "ALTER TABLE properties MODIFY COLUMN status
             ENUM('draft','active','pending','under_contract','sold','expired','withdrawn','archived')
             NOT NULL DEFAULT 'draft'"
        );
        DB::statement(
            "ALTER TABLE properties MODIFY COLUMN price_type
             ENUM('sale','rent','lease','off_market') NOT NULL DEFAULT 'sale'"
        );

        Schema::table('property_images', function (Blueprint $table) {
            // Storage provider handle (S3 key / Cloudinary public_id), needed to
            // delete the remote object when the row goes away.
            $table->string('public_id')->nullable()->after('path');
            $table->enum('media_type', ['image', 'floor_plan', 'video'])
                ->default('image')->after('public_id');
            $table->string('caption')->nullable()->after('media_type');

            // Gallery reads are always "this property, in display order".
            $table->index(['property_id', 'media_type', 'sort_order'], 'idx_media_property_type_order');
        });
    }

    public function down(): void
    {
        Schema::table('property_images', function (Blueprint $table) {
            $table->dropIndex('idx_media_property_type_order');
            $table->dropColumn(['public_id', 'media_type', 'caption']);
        });

        DB::statement(
            "ALTER TABLE properties MODIFY COLUMN price_type
             ENUM('sale','rent','lease') NOT NULL DEFAULT 'sale'"
        );
        DB::statement(
            "ALTER TABLE properties MODIFY COLUMN status
             ENUM('draft','active','pending','sold','expired','withdrawn') NOT NULL DEFAULT 'draft'"
        );

        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex(['is_verified']);
            $table->dropConstrainedForeignId('verified_by');
            $table->dropColumn([
                'original_price',
                'half_bathrooms',
                'property_taxes_annual',
                'address_line2',
                'is_verified',
                'verified_at',
            ]);
        });
    }
};
