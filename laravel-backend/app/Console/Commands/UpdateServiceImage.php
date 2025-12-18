<?php

namespace App\Console\Commands;

use App\Models\Service;
use App\Models\ServiceImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Kra8\Snowflake\Snowflake;

class UpdateServiceImage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'service:update-image {service_name} {main_image} {additional_images?*}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update service image_url and add additional images';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $serviceName = $this->argument('service_name');
        $mainImage = $this->argument('main_image');
        $additionalImages = $this->argument('additional_images') ?? [];

        // Tìm dịch vụ (tìm kiếm linh hoạt)
        $service = Service::where('name', 'like', '%' . $serviceName . '%')
            ->orWhere('name', 'like', '%' . $this->removeVietnameseAccents($serviceName) . '%')
            ->first();

        if (!$service) {
            $this->error("Không tìm thấy dịch vụ: {$serviceName}");
            $this->info("\nGợi ý: Hãy kiểm tra lại tên dịch vụ hoặc dùng lệnh:");
            $this->info("php artisan service:list - để xem danh sách dịch vụ");
            return 1;
        }

        $this->info("Tìm thấy dịch vụ: {$service->name} (ID: {$service->id})");

        // Kiểm tra file ảnh chính có tồn tại không
        $mainImagePath = $this->findImagePath('special', $mainImage);
        if (!$mainImagePath) {
            $this->error("Không tìm thấy file ảnh chính: {$mainImage}");
            $this->info("Đã kiểm tra tại:");
            $this->info("  - " . storage_path('app/public/uploads/services/special/' . $mainImage));
            $this->info("  - " . public_path('storage/uploads/services/special/' . $mainImage));
            return 1;
        }

        $this->info("Tìm thấy ảnh chính tại: {$mainImagePath}");

        DB::beginTransaction();
        try {
            // Cập nhật ảnh chính
            $service->image_url = $mainImage;
            $service->save();
            $this->info("✓ Đã cập nhật ảnh chính: {$mainImage}");

            // Xóa các ảnh phụ cũ (nếu có)
            $deletedCount = ServiceImage::where('service_id', $service->id)->count();
            ServiceImage::where('service_id', $service->id)->delete();
            if ($deletedCount > 0) {
                $this->info("✓ Đã xóa {$deletedCount} ảnh phụ cũ");
            }

            // Thêm các ảnh phụ mới
            $addedCount = 0;
            foreach ($additionalImages as $index => $imageName) {
                $imagePath = $this->findImagePath('special', $imageName);
                if (!$imagePath) {
                    $this->warn("⚠ Không tìm thấy file ảnh phụ: {$imageName}, bỏ qua...");
                    continue;
                }

                // Copy ảnh từ special sang services (nếu cần)
                $targetPath = storage_path('app/public/uploads/services/' . $imageName);
                $targetDir = dirname($targetPath);
                
                if (!is_dir($targetDir)) {
                    mkdir($targetDir, 0755, true);
                }
                
                if (!file_exists($targetPath)) {
                    copy($imagePath, $targetPath);
                    $this->info("  → Đã copy ảnh phụ vào thư mục services");
                }

                ServiceImage::create([
                    'id' => app(Snowflake::class)->next(),
                    'service_id' => $service->id,
                    'image_url' => $imageName,
                    'created_by' => $service->created_by ?? null,
                ]);
                $this->info("✓ Đã thêm ảnh phụ " . ($addedCount + 1) . ": {$imageName}");
                $addedCount++;
            }

            DB::commit();
            $this->info("\n✅ Hoàn thành! Đã cập nhật ảnh cho dịch vụ: {$service->name}");
            $this->info("   - Ảnh chính: {$mainImage}");
            if ($addedCount > 0) {
                $this->info("   - Ảnh phụ: {$addedCount} ảnh");
            }
            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Lỗi: " . $e->getMessage());
            $this->error("Trace: " . $e->getTraceAsString());
            return 1;
        }
    }

    /**
     * Tìm đường dẫn file ảnh
     */
    private function findImagePath($folder, $filename)
    {
        $paths = [
            storage_path("app/public/uploads/services/{$folder}/{$filename}"),
            public_path("storage/uploads/services/{$folder}/{$filename}"),
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Loại bỏ dấu tiếng Việt để tìm kiếm dễ hơn
     */
    private function removeVietnameseAccents($str)
    {
        $accents = [
            'à', 'á', 'ạ', 'ả', 'ã', 'â', 'ầ', 'ấ', 'ậ', 'ẩ', 'ẫ', 'ă', 'ằ', 'ắ', 'ặ', 'ẳ', 'ẵ',
            'è', 'é', 'ẹ', 'ẻ', 'ẽ', 'ê', 'ề', 'ế', 'ệ', 'ể', 'ễ',
            'ì', 'í', 'ị', 'ỉ', 'ĩ',
            'ò', 'ó', 'ọ', 'ỏ', 'õ', 'ô', 'ồ', 'ố', 'ộ', 'ổ', 'ỗ', 'ơ', 'ờ', 'ớ', 'ợ', 'ở', 'ỡ',
            'ù', 'ú', 'ụ', 'ủ', 'ũ', 'ư', 'ừ', 'ứ', 'ự', 'ử', 'ữ',
            'ỳ', 'ý', 'ỵ', 'ỷ', 'ỹ',
            'đ',
            'À', 'Á', 'Ạ', 'Ả', 'Ã', 'Â', 'Ầ', 'Ấ', 'Ậ', 'Ẩ', 'Ẫ', 'Ă', 'Ằ', 'Ắ', 'Ặ', 'Ẳ', 'Ẵ',
            'È', 'É', 'Ẹ', 'Ẻ', 'Ẽ', 'Ê', 'Ề', 'Ế', 'Ệ', 'Ể', 'Ễ',
            'Ì', 'Í', 'Ị', 'Ỉ', 'Ĩ',
            'Ò', 'Ó', 'Ọ', 'Ỏ', 'Õ', 'Ô', 'Ồ', 'Ố', 'Ộ', 'Ổ', 'Ỗ', 'Ơ', 'Ờ', 'Ớ', 'Ợ', 'Ở', 'Ỡ',
            'Ù', 'Ú', 'Ụ', 'Ủ', 'Ũ', 'Ư', 'Ừ', 'Ứ', 'Ự', 'Ử', 'Ữ',
            'Ỳ', 'Ý', 'Ỵ', 'Ỷ', 'Ỹ',
            'Đ'
        ];

        $noAccents = [
            'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
            'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e',
            'i', 'i', 'i', 'i', 'i',
            'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o',
            'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u',
            'y', 'y', 'y', 'y', 'y',
            'd',
            'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A',
            'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E',
            'I', 'I', 'I', 'I', 'I',
            'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O',
            'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U',
            'Y', 'Y', 'Y', 'Y', 'Y',
            'D'
        ];

        return str_replace($accents, $noAccents, $str);
    }
}

