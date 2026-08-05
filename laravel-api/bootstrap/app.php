<?php

use App\Exceptions\FeatureUnavailableException;
use App\Http\Middleware\EnforceGeoAccess;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\TrackPageView;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            TrackPageView::class,
        ]);

        $middleware->api(append: [
            EnforceGeoAccess::class,
        ]);

        $middleware->alias([
            'auth' => \App\Http\Middleware\Authenticate::class,
            'geo.access' => EnforceGeoAccess::class,
            // 'role' stays on the existing EnsureRole (checks users.role +
            // account-active status) — routes/api.php:374 already depends
            // on that exact behavior. 'permission' is new, backed by real
            // Spatie roles/permissions (see RolePermissionSeeder).
            'role' => EnsureRole::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (FeatureUnavailableException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $e->render();
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            $first = collect($e->errors())->flatten()->first() ?? 'Please check the form and try again.';

            return response()->json([
                'success' => false,
                'code' => 'validation_error',
                'message' => is_string($first) ? $first : 'Please check the form and try again.',
                'reason' => 'some fields are missing or invalid',
                'fix' => 'Fix the highlighted fields and submit again.',
                'errors' => $e->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'code' => 'unauthenticated',
                    'message' => 'Please sign in again to continue.',
                    'reason' => 'your session expired or you are not logged in',
                    'fix' => 'Log in at /admin/login or your portal login page.',
                    'action_url' => '/admin/login',
                    'action_label' => 'Sign in',
                ], 401);
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            if ($e instanceof FeatureUnavailableException || $e instanceof ValidationException || $e instanceof AuthenticationException) {
                return null;
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
            $raw = $e->getMessage();

            $friendly = match (true) {
                $status === 403 => 'You do not have permission to do this.',
                $status === 404 => 'We could not find what you asked for.',
                $status === 429 => 'Too many requests. Please wait a moment and try again.',
                $status >= 500 => 'Something went wrong on our side. Please try again, or contact info@domesticrealestate.us if it keeps happening.',
                default => ($raw !== '' ? $raw : 'Something went wrong. Please try again.'),
            };

            return response()->json([
                'success' => false,
                'code' => 'server_error',
                'message' => $friendly,
                'reason' => $status >= 500 ? 'an unexpected server error occurred' : 'the request could not be completed',
                'fix' => $status >= 500
                    ? 'Refresh the page and try again. If the problem continues, email info@domesticrealestate.us.'
                    : null,
                'debug_message' => config('app.debug') ? $raw : null,
            ], $status >= 400 ? $status : 500);
        });
    })->create();
