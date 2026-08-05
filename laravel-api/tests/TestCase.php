<?php

namespace Tests;

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Every test using RefreshDatabase gets real Spatie roles/permissions
     * seeded automatically — production always has these (via
     * DatabaseSeeder -> RolePermissionSeeder), and UserObserver requires
     * the role rows to exist before it can sync a saved User onto one.
     * Deliberately NOT the full DatabaseSeeder here: that seeds a large
     * amount of demo content (properties, blog posts, testimonials) that
     * would slow down and change assumptions for every unrelated test.
     */
    protected $seed = true;
    protected $seeder = RolePermissionSeeder::class;
}
