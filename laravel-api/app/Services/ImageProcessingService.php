<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

/**
 * Resizes uploaded images to a sane max dimension and stores both the
 * original format and a WebP variant, so every upload path (media library,
 * blog featured/gallery images, property photos) gets compression + WebP
 * without each controller re-implementing it.
 */
class ImageProcessingService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = ImageManager::gd();
    }

    public function isProcessableImage(UploadedFile $file): bool
    {
        $mime = $file->getMimeType() ?: '';
        return str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml' && $mime !== 'image/gif';
    }

    /**
     * @return array{path:string,webp_path:string,width:int,height:int,size:int,webp_size:int}
     */
    public function process(
        UploadedFile $file,
        string $disk,
        string $directory,
        int $maxDimension = 2000,
        int $quality = 82
    ): array {
        $image = $this->manager->read($file->getRealPath());
        $image->scaleDown(width: $maxDimension, height: $maxDimension);

        $width = $image->width();
        $height = $image->height();

        $basename = pathinfo($file->hashName(), PATHINFO_FILENAME);
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $extension = in_array($extension, ['jpg', 'jpeg', 'png']) ? $extension : 'jpg';

        $dir = trim($directory, '/');
        $originalPath = "{$dir}/{$basename}.{$extension}";
        $webpPath = "{$dir}/{$basename}.webp";

        $encodedOriginal = $extension === 'png' ? $image->toPng() : $image->toJpeg(quality: $quality);
        $encodedWebp = $image->toWebp($quality);

        Storage::disk($disk)->put($originalPath, $encodedOriginal->toString());
        Storage::disk($disk)->put($webpPath, $encodedWebp->toString());

        return [
            'path' => $originalPath,
            'webp_path' => $webpPath,
            'width' => $width,
            'height' => $height,
            'size' => $encodedOriginal->size(),
            'webp_size' => $encodedWebp->size(),
        ];
    }
}
