<?php

namespace App\Console\Commands;

use App\Models\Service;
use Illuminate\Console\Command;

class ListServices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'service:list {--search=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all services';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $search = $this->option('search');
        
        $query = Service::query();
        
        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }
        
        $services = $query->orderBy('name')->get();
        
        if ($services->isEmpty()) {
            $this->info("Không tìm thấy dịch vụ nào.");
            return 0;
        }
        
        $this->info("Danh sách dịch vụ:\n");
        
        $headers = ['ID', 'Tên dịch vụ', 'Ảnh hiện tại', 'Giá', 'Trạng thái'];
        $rows = [];
        
        foreach ($services as $service) {
            $rows[] = [
                $service->id,
                $service->name,
                $service->image_url ?: 'Chưa có',
                number_format($service->price) . ' VNĐ',
                $service->status ? 'Hoạt động' : 'Ngừng hoạt động',
            ];
        }
        
        $this->table($headers, $rows);
        
        return 0;
    }
}

