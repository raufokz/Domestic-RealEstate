<?php
// Add blog columns to page_views
require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/vendor/laravel/framework/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
\$kernel->bootstrap();

DB::statement('ALTER TABLE page_views ADD COLUMN blog_id BIGINT UNSIGNED NULL, ADD COLUMN ref_source VARCHAR(255) NULL DEFAULT "direct"');
echo "SUCCESS: Columns added to page_views\n";