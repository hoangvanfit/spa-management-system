<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Kra8\Snowflake\Snowflake;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo tài khoản customer@gmail.com với password admin123456
        // Lưu ý: Customer model tự động hash password trong boot method khi creating
        $customer = Customer::where('email', 'customer@gmail.com')->first();
        if (!$customer) {
            Customer::create([
                'id' => app(Snowflake::class)->next(),
                'full_name' => "Customer Test",
                'password' => 'admin123456', // Model sẽ tự hash
                'email' => "customer@gmail.com",
                'phone' => "0123456789",
                'address' => "Việt Nam",
                'date_of_birth' => "2000-01-01",
                'note' => "",
                'gender' => 1,
                'status' => true,
                'created_by' => null,
                'updated_by' => null
            ]);
        } else {
            // Cập nhật password nếu tài khoản đã tồn tại
            // Khi update, cần hash thủ công vì boot method chỉ chạy khi creating
            $customer->password = Hash::make('admin123456');
            $customer->status = true;
            $customer->save();
        }

        // Giữ lại tài khoản test cũ (nếu cần)
        $testCustomer = Customer::where('email', 'voduyphuong13@gmail.com')->first();
        if (!$testCustomer) {
            Customer::create([
                'id' => app(Snowflake::class)->next(),
                'full_name' => "Test Customer",
                'password' => 'password', // Model sẽ tự hash
                'email' => "voduyphuong13@gmail.com",
                'phone' => "0388925209",
                'address' => "An Giang",
                'date_of_birth' => "2004-01-06",
                'note' => "",
                'gender' => 0,
                'status' => true,
                'created_by' => null,
                'updated_by' => null
            ]);
        }
    }
}
