<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\AppointmentService;
use App\Models\AppointmentStaff;
// use App\Models\Consulation; // Đã xóa vì chức năng tư vấn chưa hoàn thành
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Service;
use App\Models\Shift;
use App\Models\TreatmentHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Kra8\Snowflake\Snowflake;

class StatisticsDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $snowflake = app(Snowflake::class);
        
        // Lấy dữ liệu hiện có
        $customers = Customer::all();
        $services = Service::all();
        $shifts = Shift::all();
        $staff = User::where('role', '!=', 0)->get(); // Lấy nhân viên (không phải admin)
        $admin = User::where('role', 0)->first(); // Lấy admin đầu tiên
        
        if ($customers->isEmpty() || $services->isEmpty() || $staff->isEmpty() || !$admin) {
            $this->command->error('Thiếu dữ liệu cần thiết. Vui lòng chạy các seeder khác trước.');
            $this->command->error('Cần: Khách hàng, Dịch vụ, Nhân viên, và Admin.');
            return;
        }
        
        // Lưu ý: Đã xóa tất cả các chức năng liên quan đến consultations vì chức năng này chưa hoàn thành

        $this->command->info('Bắt đầu tạo dữ liệu thống kê...');
        $this->command->info('Số khách hàng: ' . $customers->count());
        $this->command->info('Số dịch vụ: ' . $services->count());
        $this->command->info('Số nhân viên: ' . $staff->count());

        // Sử dụng ngày hiện tại thực tế
        $today = Carbon::today();
        $this->command->info('Ngày hôm nay: ' . $today->format('d/m/Y'));
        
        // Đảm bảo tạo dữ liệu cho ngày 14 của tháng hiện tại (theo yêu cầu)
        $targetDate = Carbon::create($today->year, $today->month, 14);
        if ($targetDate->gt($today)) {
            $targetDate = $today->copy();
        }
        
        // Tạo dữ liệu cho ngày 14 (hoặc ngày hiện tại nếu chưa đến ngày 14)
        $this->command->info('Tạo dữ liệu cho ngày: ' . $targetDate->format('d/m/Y'));
        $this->createAppointmentsForDate($targetDate, $customers, $services, $shifts, $staff, $admin, $snowflake, 15);
        // Đã xóa tạo consultations vì chức năng này chưa hoàn thành

        // Tạo dữ liệu cho các ngày từ đầu tháng đến ngày 14 (hoặc ngày hiện tại)
        $startOfMonth = $today->copy()->startOfMonth();
        $endDate = min(14, $today->day);
        
        for ($i = 1; $i <= $endDate; $i++) {
            $date = $startOfMonth->copy()->addDays($i - 1);
            
            // Bỏ qua ngày đã tạo ở trên
            if ($date->format('Y-m-d') === $targetDate->format('Y-m-d')) {
                continue;
            }
            
            $this->createAppointmentsForDate($date, $customers, $services, $shifts, $staff, $admin, $snowflake, rand(5, 12));
            // Đã xóa tạo consultations vì chức năng này chưa hoàn thành
        }

        // Tạo thêm dữ liệu cho tuần này để đảm bảo có đủ dữ liệu
        $startOfWeek = $today->copy()->startOfWeek();
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            // Chỉ tạo nếu ngày này chưa được tạo và không vượt quá ngày hiện tại
            if ($date->lte($today) && $date->day <= 14) {
                // Kiểm tra xem đã có dữ liệu chưa (tránh trùng lặp)
                $existingAppointments = Appointment::whereDate('appointment_date', $date->format('Y-m-d'))->count();
                if ($existingAppointments < 3) {
                    $this->createAppointmentsForDate($date, $customers, $services, $shifts, $staff, $admin, $snowflake, rand(3, 6));
                    // Đã xóa tạo consultations vì chức năng này chưa hoàn thành
                }
            }
        }

        $this->command->info('Hoàn thành tạo dữ liệu thống kê!');
    }

    private function createAppointmentsForDate($date, $customers, $services, $shifts, $staff, $admin, $snowflake, $count)
    {
        $created = 0;
        for ($i = 0; $i < $count; $i++) {
            DB::beginTransaction();
            try {
                // Chọn ngẫu nhiên
                $customer = $customers->random();
                $shift = $shifts->where('shift_date', $date->format('Y-m-d'))->first();
                
                // Nếu không có shift cho ngày này, tạo một shift mới
                if (!$shift) {
                    $shift = Shift::create([
                        'id' => $snowflake->next(),
                        'shift_date' => $date->format('Y-m-d'),
                        'start_time' => '08:00:00',
                        'end_time' => '12:00:00',
                        'max_customers' => 10,
                        'status' => true,
                        'created_by' => $admin->id,
                        'updated_by' => $admin->id,
                    ]);
                    // Thêm vào collection để tránh tạo lại
                    $shifts->push($shift);
                }

                // Chọn 1-2 dịch vụ ngẫu nhiên
                $selectedServices = $services->random(min(2, $services->count()));
                $serviceTotal = 0;
                $servicesData = [];
                
                foreach ($selectedServices as $service) {
                    $quantity = rand(1, 2);
                    $servicesData[] = [
                        'service_id' => $service->id,
                        'quantity' => $quantity,
                        'price' => $service->price
                    ];
                    $serviceTotal += $service->price * $quantity;
                }

                // Chọn 1-2 nhân viên
                $selectedStaff = $staff->random(min(2, $staff->count()));

                // Phân bổ status: 50% hoàn thành, 25% đang thực hiện, 20% đã đặt, 5% hủy
                $statusRand = rand(1, 100);
                if ($statusRand <= 50) {
                    $appointmentStatus = 3; // Đã hoàn thành
                } elseif ($statusRand <= 75) {
                    $appointmentStatus = 2; // Đang thực hiện
                } elseif ($statusRand <= 95) {
                    $appointmentStatus = 1; // Đã đặt
                } else {
                    $appointmentStatus = 0; // Đã hủy
                }

                // Tạo appointment với status ngẫu nhiên
                $appointment = Appointment::create([
                    'id' => $snowflake->next(),
                    'shift_id' => $shift->id,
                    'customer_id' => $customer->id,
                    'start_time' => sprintf('%02d:00:00', rand(8, 17)),
                    'note' => 'Dữ liệu mẫu cho thống kê - ' . $date->format('d/m/Y'),
                    'appointment_date' => $date->format('Y-m-d'),
                    'status' => $appointmentStatus,
                    'created_by' => $admin->id,
                    'updated_by' => $admin->id,
                    'created_at' => $date->copy()->setTime(rand(8, 17), rand(0, 59), 0),
                    'updated_at' => $date->copy()->setTime(rand(8, 17), rand(0, 59), 0),
                ]);

                // Thêm nhân viên vào appointment
                foreach ($selectedStaff as $staffMember) {
                    AppointmentStaff::create([
                        'id' => $snowflake->next(),
                        'appointment_id' => $appointment->id,
                        'staff_id' => $staffMember->id,
                        'created_at' => $appointment->created_at,
                        'updated_at' => $appointment->updated_at,
                    ]);
                }

                // Thêm dịch vụ vào appointment
                foreach ($servicesData as $serviceData) {
                    AppointmentService::create([
                        'id' => $snowflake->next(),
                        'appointment_id' => $appointment->id,
                        'service_id' => $serviceData['service_id'],
                        'quantity' => $serviceData['quantity'],
                        'price' => $serviceData['price'],
                    ]);
                }

                // Chỉ tạo payment nếu appointment không bị hủy
                if ($appointmentStatus != 0) {
                    // Tạo payment với các loại thanh toán khác nhau
                    // Đảm bảo có cả tiền mặt và chuyển khoản (50/50)
                    $paymentType = ($i % 2 == 0) ? 0 : 1; // 0 = Tiền mặt, 1 = Chuyển khoản
                    
                    // Phân bổ payment status: 80% completed, 20% pending
                    $paymentStatus = ($i % 5 == 0) ? 0 : 1; // 0 = Pending, 1 = Completed

                    // Thêm một chút biến động vào giá để dữ liệu thực tế hơn
                    $finalAmount = $serviceTotal + rand(-50000, 50000);
                    if ($finalAmount < 0) $finalAmount = $serviceTotal;

                    Payment::create([
                        'id' => $snowflake->next(),
                        'appointment_id' => $appointment->id,
                        'service_total' => $serviceTotal,
                        'product_total' => 0,
                        'subtotal' => $serviceTotal,
                        'reduce' => 0,
                        'total_amount' => $finalAmount,
                        'payment_type' => $paymentType,
                        'status' => $paymentStatus,
                        'created_by' => $admin->id,
                        'created_at' => $appointment->created_at,
                        'updated_at' => $appointment->updated_at,
                    ]);
                }

                // Chỉ tạo treatment history nếu appointment đã hoàn thành
                if ($appointmentStatus == 3) {
                    TreatmentHistory::create([
                        'id' => $snowflake->next(),
                        'appointment_id' => $appointment->id,
                        'customer_id' => $customer->id,
                        'staff_id' => $selectedStaff->first()->id,
                        'image_before' => 'Ảnh trước',
                        'image_after' => 'Ảnh sau',
                        'feedback' => 'Nhận xét của khách hàng',
                        'note' => 'Ghi chú cho lịch hẹn: ' . $appointment->id,
                        'status' => true,
                        'created_by' => $admin->id,
                        'updated_by' => $admin->id,
                        'created_at' => $appointment->created_at,
                        'updated_at' => $appointment->updated_at,
                    ]);
                }

                DB::commit();
                $created++;
            } catch (\Exception $e) {
                DB::rollBack();
                $this->command->error('Lỗi khi tạo appointment cho ngày ' . $date->format('Y-m-d') . ': ' . $e->getMessage());
            }
        }
        if ($created > 0) {
            $this->command->info('Đã tạo ' . $created . ' appointment(s) cho ngày ' . $date->format('d/m/Y'));
        }
    }

    // Đã xóa hàm createConsultationsForDate vì chức năng tư vấn chưa hoàn thành
}
