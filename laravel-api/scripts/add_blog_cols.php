<?php
// Standalone script to add blog columns to page_views
// Requires Laravel to be bootstrapped

$app = require __DIR__.'/../../../vendor/laravel/framework/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$status = $kernel->bootstrap();

if ($status === true) {
    DB::statement('ALTER TABLE page_views ADD COLUMN blog_id BIGINT UNSIGNED NULL, ADD COLUMN ref_source VARCHAR(255) NULL DEFAULT "direct"');
    echo "SUCCESS: Columns added to page_views\n";
} else {
    echo "FAILED: Could not bootstrap Laravel\n";
}