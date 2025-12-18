import React, { useState, useEffect } from "react";
import {
    Button,
    Form,
    Input,
    Row,
    Col,
    Card,
    Select,
    Upload,
    Spin,
    notification,
    InputNumber,
    Image,
    Space,
} from "antd";
import { PlusOutlined, UploadOutlined, PictureOutlined } from "@ant-design/icons";
import useServiceCategoriesActions from "../../modules/services/hooks/useServiceCategories";
import useServicesActions from "../../modules/services/hooks/useServices";
import { useSelector } from "react-redux";
import debounce from "lodash/debounce";
import { Controller, useForm } from "react-hook-form";
import { generateSnowflakeId } from "../../utils";
import endpoints from "../../config/appConfig";
import axiosInstance from "../../config/axiosInstance";
const ServicesAdd = () => {
    useEffect(() => {
        document.title = "Thêm dịch vụ";
    }, []);
    const [api, contextHolder] = notification.useNotification();
    const { getServiceCategories, searchServiceCategories } =
        useServiceCategoriesActions();
    const { addservices } = useServicesActions();
    const ServiceCategories = useSelector((state) => state.serviceCategories);
    const [searchquery, setSearchQuery] = useState({
        page: 1,
        search: "",
        per_page: 50,
    });
    const [fileList, setFileList] = useState([]);
    const [availableImages, setAvailableImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    
    const {
        control,
        handleSubmit,
        setError,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        getServiceCategories(50);
    }, []);

    const servicesCategories = ServiceCategories.ServiceCategories.data.map(
        (category) => ({
            id: category.id,
            name: category.name,
        })
    );

    const OnSearchServiceCategories = debounce((value) => {
        setSearchQuery({
            ...searchquery,
            search: value,
        });
    }, 300);
    useEffect(() => {
        if (searchquery.search !== "") {
            searchServiceCategories(searchquery);
        } else {
            getServiceCategories(50);
        }
    }, [searchquery]);
    const handleLoadAvailableImages = async () => {
        setLoadingImages(true);
        setShowImageSelector(true);
        try {
            const response = await axiosInstance.get(endpoints.services.listAvailableImages);
            if (response.data.status === "success") {
                setAvailableImages(response.data.data);
            } else {
                api.error({
                    message: "Không thể tải danh sách ảnh",
                    description: response.data.message,
                });
            }
        } catch (error) {
            api.error({
                message: "Lỗi khi tải danh sách ảnh",
                description: error.message,
            });
        } finally {
            setLoadingImages(false);
        }
    };

    const handleSelectExistingImage = (image) => {
        // Kiểm tra xem ảnh đã có trong fileList chưa
        const exists = fileList.some(
            (file) => file.name === image.name || file.url === image.url
        );

        if (exists) {
            api.warning({
                message: "Ảnh đã được thêm",
                description: `Ảnh "${image.name}" đã có trong danh sách`,
            });
            return;
        }

        if (fileList.length >= 10) {
            api.warning({
                message: "Đã đạt giới hạn",
                description: "Chỉ có thể thêm tối đa 10 ảnh",
            });
            return;
        }

        // Thêm ảnh vào fileList với đầy đủ thông tin
        const newFile = {
            uid: `existing-${Date.now()}-${Math.random()}`,
            name: image.name,
            status: "done",
            url: image.url,
            thumbUrl: image.url, // Đảm bảo có thumbUrl
            response: image.url, // Thêm response để đảm bảo
            percent: 100, // Đảm bảo percent = 100 để hiển thị
            isExisting: true,
            isFromStorage: true,
        };

        const updatedFileList = [...fileList, newFile];
        setFileList(updatedFileList);
        setValue("image_url", updatedFileList);

        api.success({
            message: "Đã thêm ảnh",
            description: `Đã thêm ảnh "${image.name}" vào danh sách`,
        });
    };

    const onSubmit = async (data) => {
        try {
            data.id = generateSnowflakeId();

            const formData = new FormData();
            
            // Thêm id trước tiên (bắt buộc)
            formData.append("id", data.id);
            
            // Thêm các trường dữ liệu khác (trừ image_url)
            for (let key in data) {
                if (key !== "image_url" && key !== "id") {
                    formData.append(key, data[key]);
                }
            }
            
            // Xử lý ảnh: chỉ gửi ảnh mới (có originFileObj)
            if (data.image_url && data.image_url.length > 0) {
                const newImages = data.image_url.filter(file => file.originFileObj);
                newImages.forEach((file) => {
                    formData.append("image_url[]", file.originFileObj);
                });
                
                // Gửi danh sách ảnh có sẵn (từ storage)
                const existingImages = data.image_url.filter(file => file.isFromStorage && !file.originFileObj);
                if (existingImages.length > 0) {
                    existingImages.forEach((file) => {
                        formData.append("existing_images[]", file.name);
                    });
                }
            }

            const res = await addservices(formData);

            if (res.payload.status === 422) {
                Object.keys(res.payload.errors).forEach((key) => {
                    if (
                        [
                            "name",
                            "service_category_id",
                            "duration",
                            "price",
                            "priority",
                            "description",
                            "image_url",
                        ].includes(key)
                    ) {
                        setError(key, {
                            type: "manual",
                            message: res.payload.errors[key][0],
                        });
                    } else {
                        api.error({
                            message: "Có lỗi xảy ra",
                            description: res.payload.errors[key][0],
                            duration: 2,
                        });
                    }
                });
            } else if (res.payload.status === "success") {
                api.success({
                    message: "Thêm dịch vụ thành công",
                    description: "Bạn đã thêm dịch vụ thành công",
                    duration: 2,
                });
                reset();
                setFileList([]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            {contextHolder}
            <Row gutter={16}>
                <Col span={15}>
                    <Card title="Thông tin chi tiết">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{
                                        required: "Vui lòng nhập tên dịch vụ",
                                    }}
                                    render={({ field }) => (
                                        <Form.Item
                                            label="Tên dịch vụ"
                                            validateStatus={
                                                errors.name && "error"
                                            }
                                            help={errors.name?.message}
                                        >
                                            <Input
                                                {...field}
                                                placeholder="Tên dịch vụ"
                                            />
                                        </Form.Item>
                                    )}
                                />
                                {errors.service_name && (
                                    <p style={{ color: "red" }}>
                                        {errors.service_name.message}
                                    </p>
                                )}
                            </Col>
                            <Col span={12}>
                                <Controller
                                    name="service_category_id"
                                    control={control}
                                    rules={{
                                        required: "Vui lòng chọn loại dịch vụ",
                                    }}
                                    render={({ field }) => (
                                        <Form.Item
                                            label="Loại dịch vụ"
                                            validateStatus={
                                                errors.service_category_id &&
                                                "error"
                                            }
                                            help={
                                                errors.service_category_id
                                                    ?.message
                                            }
                                        >
                                            <Select
                                                {...field}
                                                placeholder="Chọn loại dịch vụ"
                                                showSearch
                                                optionFilterProp="children"
                                                onSearch={
                                                    OnSearchServiceCategories
                                                }
                                                filterOption={false}
                                                notFoundContent={
                                                    ServiceCategories.loading ? (
                                                        <Spin size="small" />
                                                    ) : null
                                                }
                                            >
                                                {servicesCategories.map(
                                                    (category) => (
                                                        <Select.Option
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </Select.Option>
                                                    )
                                                )}
                                            </Select>
                                        </Form.Item>
                                    )}
                                />
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col span={6}>
                                <Controller
                                    name="duration"
                                    control={control}
                                    rules={{
                                        required:
                                            "Vui lòng nhập thời gian dịch vụ",
                                    }}
                                    render={({ field }) => (
                                        <Form.Item
                                            label="Thời gian (phút)"
                                            validateStatus={
                                                errors.duration && "error"
                                            }
                                            help={errors.duration?.message}
                                        >
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="Thời gian (phút)"
                                            />
                                        </Form.Item>
                                    )}
                                />
                            </Col>
                            <Col span={6}>
                                <Controller
                                    name="price"
                                    control={control}
                                    rules={{
                                        required: "Vui lòng nhập giá dịch vụ",
                                    }}
                                    render={({ field }) => (
                                        <Form.Item
                                            label="Giá"
                                            validateStatus={
                                                errors.price && "error"
                                            }
                                            help={errors.price?.message}
                                        >
                                            {/* <InputNumber
                                                {...field}
                                                type="number"
                                                formatter={(value) =>
                                                    `${value}`.replace(
                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                        ","
                                                    )
                                                }
                                                placeholder="Giá dịch vụ"
                                            /> */}
                                            <InputNumber
                                                style={{ width: "100%" }}
                                                {...field}
                                                formatter={(value) =>
                                                    `${value}`.replace(
                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                        ","
                                                    )
                                                }
                                                parser={(value) =>
                                                    value?.replace(
                                                        /\$\s?|(,*)/g,
                                                        ""
                                                    )
                                                }
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                }}
                                            />
                                        </Form.Item>
                                    )}
                                />
                            </Col>
                            <Col span={12}>
                                <Controller
                                    name="priority"
                                    control={control}
                                    rules={{
                                        required: "Vui lòng nhập mức ưu tiên",
                                    }}
                                    render={({ field }) => (
                                        <Form.Item
                                            label="Mức ưu tiên"
                                            validateStatus={
                                                errors.priority && "error"
                                            }
                                            help={errors.priority?.message}
                                        >
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="Mức ưu tiên (1, 2, 3...)"
                                            />
                                        </Form.Item>
                                    )}
                                />
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <Form.Item label="Mô tả">
                                            <Input.TextArea
                                                {...field}
                                                placeholder="Mô tả dịch vụ"
                                                rows={4}
                                            />
                                        </Form.Item>
                                    )}
                                />
                            </Col>
                        </Row>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Thêm dịch vụ
                            </Button>
                        </Form.Item>
                    </Card>
                </Col>
                <Col span={9}>
                    <Card title="Hình ảnh sản phẩm">
                        <Form.Item label="Hình ảnh sản phẩm" required>
                            <span
                                style={{ display: "block", marginBottom: 10 }}
                            >
                                1. ảnh đầu tiên sẽ là ảnh chính
                            </span>
                            <span
                                style={{ display: "block", marginBottom: 10 }}
                            >
                                2. tối đa 10 ảnh
                            </span>
                            <Button
                                type="dashed"
                                icon={<PictureOutlined />}
                                onClick={handleLoadAvailableImages}
                                loading={loadingImages}
                                block
                                style={{ marginBottom: 10 }}
                            >
                                Chọn ảnh có sẵn
                            </Button>
                            {showImageSelector && availableImages.length > 0 && (
                                <div
                                    style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "4px",
                                        padding: "10px",
                                        marginBottom: 10,
                                    }}
                                >
                                    <div style={{ marginBottom: 8, fontWeight: "bold" }}>
                                        Ảnh có sẵn ({availableImages.length}):
                                    </div>
                                    <Space wrap>
                                        {availableImages.map((img) => (
                                            <div
                                                key={img.name}
                                                style={{
                                                    position: "relative",
                                                    cursor: "pointer",
                                                    border: "2px solid transparent",
                                                    borderRadius: "4px",
                                                    padding: "2px",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = "#1890ff";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = "transparent";
                                                }}
                                                onClick={() => handleSelectExistingImage(img)}
                                            >
                                                <Image
                                                    src={img.url}
                                                    alt={img.name}
                                                    width={60}
                                                    height={60}
                                                    style={{
                                                        objectFit: "cover",
                                                        borderRadius: "4px",
                                                    }}
                                                    preview={false}
                                                />
                                                <div
                                                    style={{
                                                        fontSize: "10px",
                                                        textAlign: "center",
                                                        marginTop: 4,
                                                        maxWidth: 60,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                    title={img.name}
                                                >
                                                    {img.name.length > 15
                                                        ? img.name.substring(0, 15) + "..."
                                                        : img.name}
                                                </div>
                                            </div>
                                        ))}
                                    </Space>
                                    <Button
                                        size="small"
                                        onClick={() => setShowImageSelector(false)}
                                        style={{ marginTop: 8, width: "100%" }}
                                    >
                                        Đóng
                                    </Button>
                                </div>
                            )}
                            <Controller
                                name="image_url"
                                control={control}
                                rules={{
                                    required: "Vui lòng chọn ảnh sản phẩm!",
                                }}
                                render={({ field }) => (
                                    <Upload
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={(info) => {
                                            let newFileList = [...info.fileList];
                                            
                                            // Xử lý từng file để đảm bảo có đầy đủ thông tin
                                            newFileList = newFileList.map((file) => {
                                                // File mới upload - tạo thumbUrl ngay lập tức
                                                if (file.originFileObj) {
                                                    // Tạo thumbUrl từ file object
                                                    const thumbUrl = file.thumbUrl || URL.createObjectURL(file.originFileObj);
                                                    return {
                                                        ...file,
                                                        uid: file.uid || `file-${Date.now()}-${Math.random()}`,
                                                        name: file.name || file.originFileObj.name,
                                                        status: 'done', // Đặt status là 'done' để hiển thị ngay
                                                        url: thumbUrl,
                                                        thumbUrl: thumbUrl, // Quan trọng: phải có thumbUrl để hiển thị
                                                        percent: 100,
                                                    };
                                                }
                                                
                                                // File đang upload (có thể chưa có originFileObj)
                                                if (file.status === 'uploading' || file.status === 'done') {
                                                    // Nếu chưa có thumbUrl và có file object, tạo ngay
                                                    if (!file.thumbUrl && file.originFileObj) {
                                                        const thumbUrl = URL.createObjectURL(file.originFileObj);
                                                        return {
                                                            ...file,
                                                            thumbUrl: thumbUrl,
                                                            url: thumbUrl,
                                                        };
                                                    }
                                                }
                                                
                                                // File có sẵn từ storage
                                                if (file.isFromStorage || file.isExisting) {
                                                    return {
                                                        ...file,
                                                        status: 'done',
                                                        percent: 100,
                                                        thumbUrl: file.thumbUrl || file.url,
                                                        url: file.url || file.thumbUrl,
                                                        response: file.response || file.url || file.thumbUrl,
                                                    };
                                                }
                                                
                                                // File khác - đảm bảo có đầy đủ thông tin
                                                const result = {
                                                    ...file,
                                                    status: file.status || 'done',
                                                    percent: file.percent || 100,
                                                };
                                                
                                                // Đảm bảo có thumbUrl hoặc url
                                                if (!result.thumbUrl && !result.url && file.originFileObj) {
                                                    const thumbUrl = URL.createObjectURL(file.originFileObj);
                                                    result.thumbUrl = thumbUrl;
                                                    result.url = thumbUrl;
                                                } else {
                                                    result.thumbUrl = result.thumbUrl || result.url;
                                                    result.url = result.url || result.thumbUrl;
                                                }
                                                
                                                return result;
                                            });
                                            
                                            setFileList(newFileList);
                                            field.onChange(newFileList);
                                        }}
                                        beforeUpload={() => false}
                                        name="image_url"
                                        maxCount={10}
                                        multiple
                                        accept="image/*"
                                        showUploadList={{
                                            showPreviewIcon: true,
                                            showRemoveIcon: true,
                                        }}
                                        onRemove={(file) => {
                                            // Xử lý xóa file
                                            const newFileList = fileList.filter(item => item.uid !== file.uid);
                                            setFileList(newFileList);
                                            field.onChange(newFileList);
                                        }}
                                        onPreview={(file) => {
                                            // Xử lý preview ảnh
                                            if (file.url || file.thumbUrl) {
                                                window.open(file.url || file.thumbUrl, '_blank');
                                            }
                                        }}
                                    >
                                        {fileList.length < 10 && (
                                            <div>
                                                <UploadOutlined />
                                                <div style={{ marginTop: 8 }}>
                                                    Tải ảnh lên
                                                </div>
                                            </div>
                                        )}
                                    </Upload>
                                )}
                            />
                            {errors.image_url && (
                                <p style={{ color: "red" }}>
                                    {errors.image_url.message}
                                </p>
                            )}
                        </Form.Item>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
};

export default ServicesAdd;
