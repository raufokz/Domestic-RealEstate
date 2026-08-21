<?php

/**
 * READ-ONLY audit of Laravel's migration ledger against the real schema.
 *
 *   php scripts/migration-ledger-audit.php
 *
 * Why this is needed: the `migrations` table can drift out of sync with the
 * database — schema changes get applied by hand, restored from a dump, or
 * deployed in a way that never records the row. Laravel then believes those
 * migrations are pending and `php artisan migrate` dies on the first object
 * that already exists, blocking every genuinely new migration behind it.
 *
 * This script CHANGES NOTHING. For each pending migration it reads the file,
 * works out which table/column it would create, and reports whether that thing
 * is already in the database:
 *
 *   ALREADY APPLIED  -> safe to record in the ledger without running
 *   NEEDS RUNNING    -> a real pending change
 *   UNKNOWN          -> could not be determined; inspect by hand
 *
 * Run it, read the output, and only then decide what to do.
 */

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$dir = __DIR__.'/../database/migrations';
$files = collect(glob($dir.'/*.php'))
    ->map(fn ($p) => basename($p, '.php'))
    ->sort()
    ->values();

$recorded = DB::table('migrations')->pluck('migration')->all();
$pending = $files->reject(fn ($f) => in_array($f, $recorded, true))->values();

if ($pending->isEmpty()) {
    echo "Ledger is in sync — nothing pending.\n";
    exit(0);
}

echo "Pending migrations: {$pending->count()}\n";
echo str_repeat('-', 78)."\n";

$applied = [];
$needed = [];
$unknown = [];

$columnPattern =
    "/\\\$table->(?:string|text|integer|bigInteger|unsignedBigInteger|unsignedInteger|"
    ."unsignedSmallInteger|unsignedTinyInteger|tinyInteger|smallInteger|boolean|decimal|float|"
    ."double|date|dateTime|timestamp|json|jsonb|enum|foreignId|uuid|char|longText|mediumText)"
    ."\(\s*'([^']+)'/";

foreach ($pending as $name) {
    $src = file_get_contents("$dir/$name.php");
    $verdict = 'unknown';
    $detail = 'raw SQL / data migration — cannot infer';

    if (preg_match("/Schema::create\(\s*'([^']+)'/", $src, $m)) {
        $table = $m[1];
        $exists = Schema::hasTable($table);
        $verdict = $exists ? 'applied' : 'needed';
        $detail = "table `$table` ".($exists ? 'exists' : 'missing');
    } elseif (preg_match("/Schema::table\(\s*'([^']+)'/", $src, $m)) {
        $table = $m[1];
        if (!Schema::hasTable($table)) {
            $verdict = 'unknown';
            $detail = "target table `$table` does not exist";
        } else {
            preg_match_all($columnPattern, $src, $cols);
            $wanted = array_values(array_unique($cols[1] ?? []));
            if ($wanted === []) {
                $verdict = 'unknown';
                $detail = 'no column definitions parsed (enum change / raw SQL?)';
            } else {
                $missing = array_values(array_filter(
                    $wanted,
                    fn ($c) => !Schema::hasColumn($table, $c)
                ));
                $verdict = $missing === [] ? 'applied' : 'needed';
                $detail = $missing === []
                    ? 'all '.count($wanted).' column(s) present on `'.$table.'`'
                    : "missing on `$table`: ".implode(', ', $missing);
            }
        }
    }

    // A plain switch: assigning an array literal of references to a variable
    // and appending to it does NOT write back to the originals in PHP.
    switch ($verdict) {
        case 'applied':
            $applied[] = [$name, $detail];
            break;
        case 'needed':
            $needed[] = [$name, $detail];
            break;
        default:
            $unknown[] = [$name, $detail];
            break;
    }
}

$print = function (string $title, array $rows) {
    if ($rows === []) {
        return;
    }
    echo "\n$title (".count($rows).")\n";
    foreach ($rows as [$name, $detail]) {
        printf("  %-62s %s\n", $name, $detail);
    }
};

$print('ALREADY APPLIED — safe to record without running', $applied);
$print('NEEDS RUNNING — a real change', $needed);
$print('UNKNOWN — inspect by hand', $unknown);

echo "\n".str_repeat('-', 78)."\n";
printf("applied=%d  needed=%d  unknown=%d\n", count($applied), count($needed), count($unknown));
echo "\nNothing was modified. Take a database dump before acting on this.\n";
