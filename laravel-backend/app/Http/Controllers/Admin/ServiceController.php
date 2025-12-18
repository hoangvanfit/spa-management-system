<?php

namespace App\Http\Controllers\Admin;

use App\Filters\Admin\ServiceFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Services\ServiceProductsRequest;
use App\Http\Requests\Admin\Services\ServiceProductsUpdateRequest;
use App\Http\Requests\Admin\Services\ServiceRequest;
use App\Http\Requests\Admin\Services\ServiceUpdateRequest;
use App\Http\Resources\Admin\Services\ServiceCollection;
use App\Http\Resources\Admin\Services\ServiceResource;
use App\Models\ProductService;
use App\Models\Service;
use App\Models\ServiceImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Kra8\Snowflake\Snowflake;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $filter = new ServiceFilter();
            $queryResult = $filter->transform($request);
            $queryItems = $queryResult['filter'];
            $sorts = $queryResult['sorts'];
            $perPage = $request->query('per_page', 5);
            if ($perPage < 1 || $perPage > 100) {
                $perPage = 5;
            }

            $selectedColumns = ['id', 'name', 'price', 'service_category_id', 'status', 'duration'];
            $query = Service::select($selectedColumns)->where($queryItems);

            if ($request['search']) {
                $value = $request['search'];
                $query->whereHas('serviceCategory', function (Builder $query) use ($value) {
                    $query->where('name', 'like', '%' . $value . '%');
                })
                    ->orWhere('name', 'like', '%' . $value . '%')
                    ->orWhere('id', 'like', '%' . $value . '%')
                ;
            }
            if ($sorts) {
                $query = $query->orderBy($sorts[0], $sorts[1]);
            }
            if (count($query->paginate($perPage)) == 0) {
                return response()->json([
                    "status" => true,
                    "message" => "Không tìm thấy dữ liệu tương ứng"
                ], 200);
            }
            return new ServiceCollection($query->paginate($perPage)->appends($request->query()));
        } catch (\Throwable $th) {
            $response = [
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi trong quá trình.',
            ];
            return response()->json($response, 500);
        }
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(ServiceRequest $request)
    {
        try {
            $validateData = $request->validated();
            $mainImageName = "default.jpg";

            // Xử lý ảnh chính: ưu tiên ảnh có sẵn (existing_images đầu tiên) hoặc ảnh upload đầu tiên
            if ($request->has('existing_images') && is_array($request->input('existing_images')) && count($request->input('existing_images')) > 0) {
                // Nếu có ảnh có sẵn, dùng ảnh đầu tiên làm ảnh chính
                $mainImageName = $request->input('existing_images')[0];
                // Kiểm tra file có tồn tại không
                $imagePath = storage_path('app/public/uploads/services/special/' . $mainImageName);
                if (!file_exists($imagePath)) {
                    // Nếu không có trong special, kiểm tra trong services
                    $imagePath = storage_path('app/public/uploads/services/' . $mainImageName);
                    if (file_exists($imagePath)) {
                        // Copy từ services sang special
                        $targetPath = storage_path('app/public/uploads/services/special/' . $mainImageName);
                        $targetDir = dirname($targetPath);
                        if (!is_dir($targetDir)) {
                            mkdir($targetDir, 0755, true);
                        }
                        copy($imagePath, $targetPath);
                    }
                }
            } elseif ($request->hasFile('image_url') && count($request->file('image_url')) > 0) {
                // Nếu không có ảnh có sẵn, dùng ảnh upload đầu tiên
                $file = $request->file('image_url')[0];
                $mainImageName = time() . '_0_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('public/uploads/services/special', $mainImageName);
            }

            $service = Service::create([
                'id' => $validateData['id'],
                'name' => $validateData['name'],
                'service_category_id' => $validateData['service_category_id'] ?? null,
                'price' => $validateData['price'],
                'description' => $validateData['description'] ?? 'Mô tả cho dịch vụ',
                'image_url' => $mainImageName,
                'duration' => $validateData['duration'],
                'priority' => $validateData['priority'],
                'created_by' => auth('api')->user()->id
            ]);
            // Xử lý ảnh phụ mới upload
            if ($request->file('image_url')) {
                foreach ($request->file('image_url') as $index => $file) {
                    if ($index > 0) {
                        $fileName = time() . '_' . $index . '_' . $file->getClientOriginalName();
                        $filePath = $file->storeAs('public/uploads/services', $fileName);
                        ServiceImage::create([
                            'id' => app(Snowflake::class)->next(),
                            'service_id' => $validateData['id'],
                            'image_url' => $fileName,
                            'created_by' => auth('api')->user()->id
                        ]);
                    }
                }
            }
            
            // Xử lý ảnh có sẵn từ storage (existing_images)
            // Bỏ qua ảnh đầu tiên vì đã dùng làm ảnh chính
            if ($request->has('existing_images') && is_array($request->input('existing_images'))) {
                $existingImageNames = $request->input('existing_images');
                
                // Bỏ qua ảnh đầu tiên (đã dùng làm ảnh chính)
                $additionalImages = array_slice($existingImageNames, 1);
                
                foreach ($additionalImages as $imageName) {
                    // Kiểm tra file có tồn tại trong thư mục special không
                    $sourcePath = storage_path('app/public/uploads/services/special/' . $imageName);
                    $targetPath = storage_path('app/public/uploads/services/' . $imageName);
                    
                    // Nếu file có trong special, copy sang services
                    if (file_exists($sourcePath) && !file_exists($targetPath)) {
                        $targetDir = dirname($targetPath);
                        if (!is_dir($targetDir)) {
                            mkdir($targetDir, 0755, true);
                        }
                        copy($sourcePath, $targetPath);
                    }
                    
                    // Tạo record trong database
                    ServiceImage::create([
                        'id' => app(Snowflake::class)->next(),
                        'service_id' => $validateData['id'],
                        'image_url' => $imageName,
                        'created_by' => auth('api')->user()->id
                    ]);
                }
            }


            $response = [
                'status' => 'success',
                'message' => 'Thêm mới dịch vụ thành công.',
                'data' => new ServiceResource(resource: $service)
            ];
            return response()->json($response);
        } catch (\Throwable $th) {
            $response = [
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi trong quá trình.',
            ];
            return response()->json($response, 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id, Request $request)
    {
        try {
            $query = Service::with('serviceImages')->find($id);

            if (!$query) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy dữ liệu',
                ], 404);
            }

            // Đảm bảo serviceImages được load
            $query->load('serviceImages');

            // Merge vào request để ServiceResource load serviceImages
            $request->merge(['products' => 'true']);

            $arr = [
                'status' => 'success',
                'message' => 'Chi tiết dịch vụ: ' . $query->name,
                'data' => new ServiceResource($query)
            ];
            return response()->json($arr);
        } catch (\Throwable $th) {
            \Log::error('Error in ServiceController::show', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);
            $arr = [
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi trong quá trình cập nhật.',
            ];
            return response()->json($arr, 500);
        }
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(ServiceUpdateRequest $request, string $id)
    {
        try {
            $validateData = $request->validated();
            $service = Service::find($id);
            if (!$service) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy dữ liệu',
                ], 404);
            }

            if (isset($validateData['image_url'][0])) {
                $file = $request->file('image_url')[0];
                $fileName = time() . '_0_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('public/uploads/services/special', $fileName);
                if ($service->image_url) {
                    Storage::delete('public/uploads/services/special/' . $service->image_url);
                }
                $service->update([
                    'image_url' => $fileName ?? $service->image_url,
                    'updated_by' => auth('api')->user()->id
                ]);
            }

            $service->update([
                'name' => $validateData['name'],
                'service_category_id' => $validateData['service_category_id'] ?? $service->service_category_id,
                'price' => $validateData['price'],
                'description' => $validateData['description'] ?? 'Mô tả cho dịch vụ',
                'duration' => $validateData['duration'],
                'priority' => $validateData['priority'],
                'updated_by' => auth('api')->user()->id,
                'status' => $validateData['status']
            ]);

            if ($request->hasFile('image_url')) {
                $oldImages = ServiceImage::where('service_id', $id)->get();
                foreach ($oldImages as $image) {
                    Storage::delete('public/uploads/services/' . $image->image_url);
                }
                $oldImages = ServiceImage::where('service_id', $id)->delete();
                foreach ($request->file('image_url') as $index => $file) {
                    if ($index > 0) {
                        $fileName = time() . '_' . $index . '_' . $file->getClientOriginalName();
                        $filePath = $file->storeAs('public/uploads/services', $fileName);
                        ServiceImage::create(
                            [
                                'id' => app(Snowflake::class)->next(),
                                'service_id' => $id,
                                'image_url' => $fileName,
                                'created_by' => auth('api')->user()->id
                            ]
                        );
                    }
                }
            }
            
            // Xử lý ảnh có sẵn từ storage (existing_images)
            if ($request->has('existing_images') && is_array($request->input('existing_images'))) {
                $existingImageNames = $request->input('existing_images');
                
                // Xóa ảnh phụ cũ nếu chưa xóa (trường hợp không có ảnh mới upload)
                if (!$request->hasFile('image_url')) {
                    $oldImages = ServiceImage::where('service_id', $id)->get();
                    foreach ($oldImages as $image) {
                        Storage::delete('public/uploads/services/' . $image->image_url);
                    }
                    ServiceImage::where('service_id', $id)->delete();
                }
                
                // Thêm các ảnh có sẵn
                foreach ($existingImageNames as $imageName) {
                    // Kiểm tra file có tồn tại trong thư mục special không
                    $sourcePath = storage_path('app/public/uploads/services/special/' . $imageName);
                    $targetPath = storage_path('app/public/uploads/services/' . $imageName);
                    
                    // Nếu file có trong special, copy sang services
                    if (file_exists($sourcePath) && !file_exists($targetPath)) {
                        $targetDir = dirname($targetPath);
                        if (!is_dir($targetDir)) {
                            mkdir($targetDir, 0755, true);
                        }
                        copy($sourcePath, $targetPath);
                    }
                    
                    // Tạo record trong database
                    ServiceImage::create([
                        'id' => app(Snowflake::class)->next(),
                        'service_id' => $id,
                        'image_url' => $imageName,
                        'created_by' => auth('api')->user()->id
                    ]);
                }
            }

            $response = [
                'status' => 'success',
                'message' => 'Cập nhật dịch vụ thành công.',
                'data' => new ServiceResource($service)
            ];
            return response()->json($response);

        } catch (\Throwable $th) {
            $response = [
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi trong quá trình.',
            ];
            return response()->json($response, 500);
        }


    }


    public function serviceProducts(string $id, ServiceProductsRequest $request)
    {
        try {
            $validateData = $request->validated();
            $service = Service::find($id);
            if (!$service) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy dữ liệu',
                ], 404);
            }
            foreach ($validateData['products'] as $product) {
                $existingProduct = ProductService::where('service_id', $id)
                    ->where('product_id', $product['product_id'])
                    ->first();

                if ($existingProduct) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Sản phẩm đã có trong dịch vụ.',
                    ], 404);
                }

                ProductService::create([
                    'id' => app(Snowflake::class)->next(),
                    'product_id' => $product['product_id'],
                    'quantity_used' => $product['quantity_used'],
                    'service_id' => $id
                ]);


            }
            $service->update([
                'updated_by' => auth('api')->user()->id
            ]);
            $response = [
                'status' => 'success',
                'message' => 'Thêm sản phẩm dịch vụ thành công.',
                'data' => new ServiceResource($service)
            ];
            return response()->json($response);
        } catch (\Throwable $th) {
            $response = [
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi trong quá trình.',
            ];
            return response()->json($response, 500);
        }

    }

    public function serviceUpdateProducts(string $id, ServiceProductsRequest $request)
    {
        $validateData = $request->validated();
        $service = Service::find($id);
        if (!$service) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy dữ liệu',
            ], 404);
        }

        ProductService::where('service_id', $id)->delete();

        foreach ($validateData['products'] as $productData) {
            $productService = ProductService::where('service_id', $id)
                ->where('product_id', $productData['product_id'])
                ->first();

            if ($productService) {
                $productService->update(['quantity_used' => $productData['quantity_used']]);
            } else {
                ProductService::create([
                    'id' => app(Snowflake::class)->next(),
                    'product_id' => $productData['product_id'],
                    'quantity_used' => $productData['quantity_used'],
                    'service_id' => $id
                ]);
            }
        }
        $service->update([
            'updated_by' => auth('api')->user()->id
        ]);
        $response = [
            'status' => 'success',
            'message' => 'Cập nhật sản phẩm dịch vụ thành công.',
            'data' => new ServiceResource($service)
        ];
        return response()->json($response);

    }

    /**
     * List available images in storage
     */
    public function listAvailableImages()
    {
        try {
            $specialPath = storage_path('app/public/uploads/services/special');
            $servicesPath = storage_path('app/public/uploads/services');
            
            $images = [];
            
            // Lấy ảnh từ thư mục special
            if (is_dir($specialPath)) {
                $files = array_diff(scandir($specialPath), ['.', '..']);
                foreach ($files as $file) {
                    $filePath = $specialPath . '/' . $file;
                    if (is_file($filePath) && in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                        $images[] = [
                            'name' => $file,
                            'path' => 'special',
                            'url' => url('storage/uploads/services/special/' . $file),
                            'size' => filesize($filePath),
                        ];
                    }
                }
            }
            
            // Lấy ảnh từ thư mục services (ảnh phụ)
            if (is_dir($servicesPath)) {
                $files = array_diff(scandir($servicesPath), ['.', '..']);
                foreach ($files as $file) {
                    $filePath = $servicesPath . '/' . $file;
                    if (is_file($filePath) && in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                        $images[] = [
                            'name' => $file,
                            'path' => 'services',
                            'url' => url('storage/uploads/services/' . $file),
                            'size' => filesize($filePath),
                        ];
                    }
                }
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $images
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi khi lấy danh sách ảnh.',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $service = Service::find($id);

            if (!$service) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy dữ liệu',
                ], 404);
            }

            if ($service->image_url) {
                Storage::delete('public/uploads/services/special/' . $service->image_url);
            }

            $serviceImages = ServiceImage::where('service_id', $id)->get();
            foreach ($serviceImages as $serviceImage) {
                Storage::delete('public/uploads/services/' . $serviceImage->image_url);
                $serviceImage->delete();
            }

            $service->delete();

            $serviceProducts = ProductService::where('service_id', $id)->delete();

            $response = [
                'status' => 'success',
                'message' => 'Xóa dịch vụ thành công.'
            ];
            return response()->json($response);

        } catch (\Throwable $th) {
            $response = [
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi trong quá trình.',
            ];
            return response()->json($response, 500);
        }

    }
}
