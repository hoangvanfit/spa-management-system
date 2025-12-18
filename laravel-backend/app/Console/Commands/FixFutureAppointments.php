<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Console\Command;

class FixFutureAppointments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:fix-future {--delete : Xóa các appointments có ngày tương lai thay vì cập nhật}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sửa hoặc xóa các appointments có ngày trong tương lai';

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
        
        $this->info('Đang tìm các appointments có ngày tương lai (sau ' . $maxDate->format('d/m/Y') . ')...');

        // Tìm tất cả appointments có appointment_date hoặc created_at sau ngày 14
        $futureAppointments = Appointment::where(function($query) use ($maxDate) {
            $query->whereDate('appointment_date', '>', $maxDate->format('Y-m-d'))
                  ->orWhereDate('created_at', '>', $maxDate->format('Y-m-d'));
        })->get();

        if ($futureAppointments->isEmpty()) {
            $this->info('Không tìm thấy appointments nào có ngày tương lai.');
            return 0;
        }

        $this->warn('Tìm thấy ' . $futureAppointments->count() . ' appointment(s) có ngày tương lai.');

        if ($this->option('delete')) {
            // Xóa các appointments có ngày tương lai
            $deleted = 0;
            foreach ($futureAppointments as $appointment) {
                try {
                    // Xóa các bản ghi liên quan
                    \App\Models\AppointmentService::where('appointment_id', $appointment->id)->delete();
                    \App\Models\AppointmentStaff::where('appointment_id', $appointment->id)->delete();
                    \App\Models\Payment::where('appointment_id', $appointment->id)->delete();
                    \App\Models\TreatmentHistory::where('appointment_id', $appointment->id)->delete();
                    $appointment->delete();
                    $deleted++;
                } catch (\Exception $e) {
                    $this->error('Lỗi khi xóa appointment ' . $appointment->id . ': ' . $e->getMessage());
                }
            }
            $this->info('Đã xóa ' . $deleted . ' appointment(s).');
        } else {
            // Cập nhật ngày của các appointments về ngày hôm nay hoặc ngày gần nhất trong quá khứ
            $updated = 0;
            foreach ($futureAppointments as $appointment) {
                try {
                    // Cập nhật appointment_date và created_at về ngày hôm nay với giờ ngẫu nhiên
                    $randomTime = Carbon::today()->setTime(rand(8, 17), rand(0, 59), 0);
                    $appointment->update([
                        'appointment_date' => $today->format('Y-m-d'),
                        'created_at' => $randomTime,
                        'updated_at' => $randomTime,
                    ]);
                    $updated++;
                } catch (\Exception $e) {
                    $this->error('Lỗi khi cập nhật appointment ' . $appointment->id . ': ' . $e->getMessage());
                }
            }
            $this->info('Đã cập nhật ' . $updated . ' appointment(s) về ngày hôm nay.');
        }

        return 0;
    }
}
