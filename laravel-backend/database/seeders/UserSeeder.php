<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Kra8\Snowflake\Snowflake;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $snowflake = app(Snowflake::class);
        
        // Lấy position đầu tiên hoặc tạo mới nếu chưa có
        $position = Position::first();
        if (!$position) {
            $position = Position::create([
                'id' => $snowflake->next(),
                'name' => 'Nhân viên',
                'description' => 'Chức vụ mặc định',
                'status' => true,
            ]);
        }

        // Tạo tài khoản Admin
        $admin = User::where('email', 'admin@gmail.com')->first();
        if (!$admin) {
            User::create([
                'id' => $snowflake->next(),
                'position_id' => $position->id,
                'full_name' => 'Quản trị viên',
                'password' => Hash::make('admin123456'),
                'email' => 'admin@gmail.com',
                'phone' => '0123456789',
                'address' => 'Việt Nam',
                'date_of_birth' => '1990-01-01',
                'gender' => 1,
                'role' => 0, // Admin
                'status' => true,
                'note' => 'Tài khoản quản trị viên',
            ]);
            $this->command->info('Đã tạo tài khoản Admin: admin@gmail.com / admin123456');
        } else {
            // Cập nhật password nếu tài khoản đã tồn tại
            $admin->password = Hash::make('admin123456');
            $admin->role = 0;
            $admin->status = true;
            $admin->save();
            $this->command->info('Đã cập nhật tài khoản Admin: admin@gmail.com / admin123456');
        }

        // Tạo tài khoản Staff
        $staff = User::where('email', 'staff@gmail.com')->first();
        if (!$staff) {
            User::create([
                'id' => $snowflake->next(),
                'position_id' => $position->id,
                'full_name' => 'Nhân viên Test',
                'password' => Hash::make('admin123456'),
                'email' => 'staff@gmail.com',
                'phone' => '0987654321',
                'address' => 'Việt Nam',
                'date_of_birth' => '1995-01-01',
                'gender' => 1,
                'role' => 1, // Staff
                'status' => true,
                'note' => 'Tài khoản nhân viên',
            ]);
            $this->command->info('Đã tạo tài khoản Staff: staff@gmail.com / admin123456');
        } else {
            // Cập nhật password nếu tài khoản đã tồn tại
            $staff->password = Hash::make('admin123456');
            $staff->role = 1;
            $staff->status = true;
            $staff->save();
            $this->command->info('Đã cập nhật tài khoản Staff: staff@gmail.com / admin123456');
        }
    }
}

