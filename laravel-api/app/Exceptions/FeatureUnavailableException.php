<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * Throw when a product feature cannot run because a dependency is missing/broken.
 * Always returns plain-language copy the UI can show in toasts.
 */
class FeatureUnavailableException extends Exception
{
    public function __construct(
        public readonly string $feature,
        public readonly string $reason,
        public readonly ?string $fix = null,
        public readonly ?string $actionUrl = null,
        public readonly string $codeKey = 'feature_unavailable',
        int $httpStatus = 503,
    ) {
        parent::__construct($this->buildMessage(), $httpStatus);
    }

    public function buildMessage(): string
    {
        $msg = "{$this->feature} is not working because {$this->reason}.";
        if ($this->fix) {
            $msg .= " {$this->fix}";
        }

        return $msg;
    }

    public function toArray(): array
    {
        return [
            'success' => false,
            'code' => $this->codeKey,
            'feature' => $this->feature,
            'message' => $this->buildMessage(),
            'reason' => $this->reason,
            'fix' => $this->fix,
            'action_url' => $this->actionUrl,
            'action_label' => $this->actionUrl ? 'Open settings' : null,
        ];
    }

    public function render(): JsonResponse
    {
        return response()->json($this->toArray(), $this->getCode() ?: 503);
    }
}
