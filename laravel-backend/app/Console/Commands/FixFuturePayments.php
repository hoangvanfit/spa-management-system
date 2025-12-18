<?php

namespace App\Console\Commands;

use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Console\Command;

class FixFuturePayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:fix-future {--delete : Xóa các payments có ngày tương lai thay vì cập nhật}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sửa hoặc xóa các payments có ngày thanh toán trong tương lai';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Sử dụng ngày 14 của tháng hiện tại làm mốc
        $maxDate = Carbon::now();
        if ($maxDate->day > 14) {
            $maxDate = Carbon::create($maxDate->year, $maxDate->month, 14);
        } else {
            $maxDate = Carbon::today();
        }
        
        $this->info('Đang tìm các payments có ngày tương lai (sau ' . $maxDate->format('d/m/Y') . ')...');

        // Tìm tất cả payments có created_at sau ngày 14
        $futurePayments = Payment::whereDate('created_at', '>', $maxDate->format('Y-m-d'))->get();

        if ($futurePayments->isEmpty()) {
            $this->info('Không tìm thấy payments nào có ngày tương lai.');
            return 0;
        }

        $this->warn('Tìm thấy ' . $futurePayments->count() . ' payment(s) có ngày tương lai.');

        if ($this->option('delete')) {
            // Xóa các payments có ngày tương lai
            $deleted = 0;
            foreach ($futurePayments as $payment) {
                try {
                    // Xóa các bản ghi liên quan trước
                    \App\Models\PaymentProducts::where('payment_id', $payment->id)->delete();
                    $payment->delete();
                    $deleted++;
                } catch (\Exception $e) {
                    $this->error('Lỗi khi xóa payment ' . $payment->id . ': ' . $e->getMessage());
                }
            }
            $this->info('Đã xóa ' . $deleted . ' payment(s).');
        } else {
            // Cập nhật ngày của các payments về ngày hôm nay hoặc ngày gần nhất trong quá khứ
            $updated = 0;
            foreach ($futurePayments as $payment) {
                try {
                    // Cập nhật created_at về ngày hôm nay với giờ ngẫu nhiên
                    $randomTime = Carbon::today()->setTime(rand(8, 17), rand(0, 59), 0);
                    $payment->update([
                        'created_at' => $randomTime,
                        'updated_at' => $randomTime,
                    ]);
                    $updated++;
                } catch (\Exception $e) {
                    $this->error('Lỗi khi cập nhật payment ' . $payment->id . ': ' . $e->getMessage());
                }
            }
            $this->info('Đã cập nhật ' . $updated . ' payment(s) về ngày hôm nay.');
        }

        return 0;
    }
}
