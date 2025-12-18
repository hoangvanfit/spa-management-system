import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Col,
    Row,
    Card,
    Select,
    Switch,
    Spin,
    Upload,
    InputNumber,
    notification,
    Image,
    Space,
    Divider,
} from "antd";
import { PlusOutlined, UploadOutlined, PictureOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import useServiceCategoriesActions from "../hooks/useServiceCategories";
import { useSelector } from "react-redux";
import debounce from "lodash/debounce";
import { URL_IMAGE } from "../../../config/appConfig";
import endpoints from "../../../config/appConfig";
import axiosInstance from "../../../config/axiosInstance";

const { Option } = Select;
function timeStringToMinutes(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
}
function ServiceModalEdit({
    isModalOpen,
    handleOk,
    handleCancel,
    service,
    handleSubmitEdit,
    error,
}) {
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        setError,
    } = useForm();
    const {
        getServiceCategories,
        searchServiceCategories,
        getServiceCategoriesById,
    } = useServiceCategoriesActions();
    const serviceCategories = useSelector((state) => state.serviceCategories);
    const [api, contextHolder] = notification.useNotification();
    const [datacate, setdatacate] = useState([]);

    const [fileList, setFileList] = useState([]);
    const [availableImages, setAvailableImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);

    useEffect(() => {
        if (service) {
            // Reset fileList
            const initialFileList = [];
            
            // Load ảnh chính (image_url) - ảnh đầu tiên
            if (service?.image_url && service.image_url !== "default.jpg") {
                const imageUrl = `${URL_IMAGE}/services/special/${service.image_url}`;
                initialFileList.push({
                    uid: `main-${service.id}`,
                    name: service.image_url,
                    status: 'done',
                    url: imageUrl,
                    thumbUrl: imageUrl, // Cần thumbUrl để hiển thị ảnh trong Upload
                    isExisting: true,
                    isMain: true,
                });
            }
            
            // Load các ảnh phụ (serviceImages)
            if (service?.serviceImages && service.serviceImages.length > 0) {
                service.serviceImages.forEach((image, index) => {
                    const imageUrl = `${URL_IMAGE}/services/${image.image_url}`;
                    initialFileList.push({
                        uid: `existing-${image.id}`,
                        name: image.image_url,
                        status: 'done',
                        url: imageUrl,
                        thumbUrl: imageUrl, // Cần thumbUrl để hiển thị ảnh trong Upload
                        isExisting: true,
                        isMain: false,
                        imageId: image.id,
                    });
                });
            }
            
            setFileList(initialFileList);
            setValue("image_url", initialFileList);
            setValue("name", service?.name || "");
            setValue("price", service?.price || "");
            setValue("description", service?.description || "");
            setValue("duration", timeStringToMinutes(service?.duration) || "");
            setValue("status", service?.status === 1 ? true : false);
            setValue(
                "service_category_id",
                service?.service_category_id?.id || ""
            );
            setValue("priority", service?.priority || 0);
            // Get service categories from API
            getServiceCategories(100);
            getServiceCategoriesById(service?.service_category_id?.id);
        } else {
            // Reset khi không có service
            setFileList([]);
            setValue("image_url", []);
        }
    }, [service]);
    useEffect(() => {
        if (error) {
         

            Object.keys(error).forEach((key) => {
                if (
                    [
                        "name",
                        "price",
                        "duration",
                        "service_category_id",
                        "priority",
                    ].includes(key)
                ) {
                    
                    setError(key, {
                        type: "manual",
                        message: error[key][0],
                    });
                } else {
                    api.error({
                        message: "Có lỗi xảy ra",
                        description: error[key][0],
                        duration: 3,
                    });
                }
            });
        }
    }, [error]);

    useEffect(() => {
        if (serviceCategories?.ServiceCategories && service) {
            const data = [
                ...serviceCategories.ServiceCategories.data,
                service.service_category_id,
            ].map((item) => {
                return {
                    id: item?.id,
                    name: item?.name,
                };
            });
            // check trung lap
            const unique = data.filter(
                (v, i, a) => a.findIndex((t) => t.id === v.id) === i
            );

            setdatacate(unique);
        }
    }, [serviceCategories?.ServiceCategories, service]);

    const debouncedSearch = debounce((value) => {
        searchServiceCategories({ search: value, page: 1 });
    }, 500); // 300ms debounce

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

        // Thêm ảnh vào fileList
        const newFile = {
            uid: `existing-${Date.now()}-${Math.random()}`,
            name: image.name,
            status: "done",
            url: image.url,
            thumbUrl: image.url,
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

    const onSubmit = (data) => {
        data.status = data.status ? 1 : 0;
        const payload = {
            id: service.id,
            ...data,
        };

        handleSubmitEdit(payload);
    };

    const handleModalCancel = () => {
        setFileList([]);
        reset();
        handleCancel();
    };

    return (
        <Modal
            title="Chỉnh sửa danh mục"
            open={isModalOpen}
            onCancel={handleModalCancel}
            footer={null}
            width={1400}
        >
            {contextHolder}
            <Row gutter={16}>
                <Col span={15}>
                    <Card title="Thông tin chi tiết">
                        <Form
                            layout="vertical"
                            onFinish={handleSubmit(onSubmit)}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Tên dịch vụ">
                                        <Controller
                                            name="name"
                                            control={control}
                                            rules={{
                                                required:
                                                    "Vui lòng nhập tên dịch vụ",
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Tên dịch vụ"
                                                    status={
                                                        errors.name
                                                            ? "error"
                                                            : ""
                                                    }
                                                />
                                            )}
                                        />
                                        {errors.name && (
                                            <span style={{ color: "red" }}>
                                                {errors.name.message}
                                            </span>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Giá">
                                        <Controller
                                            name="price"
                                            control={control}
                                            rules={{
                                                required:
                                                    "Vui lòng nhập giá dịch vụ",
                                            }}
                                            render={({ field }) => (
                                                // <Input
                                                //     {...field}
                                                //     type="number"
                                                //     placeholder="Giá dịch vụ"

                                                // />
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
                                                    status={
                                                        errors.price
                                                            ? "error"
                                                            : ""
                                                    }
                                                />
                                            )}
                                        />
                                        {errors.price && (
                                            <span style={{ color: "red" }}>
                                                {errors.price.message}
                                            </span>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Thời gian (phút)">
                                        <Controller
                                            name="duration"
                                            rules={{
                                                required:
                                                    "Vui lòng nhập thời gian dịch vụ",
                                            }}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="Thời gian (phút)"
                                                />
                                            )}
                                        />
                                        {errors.duration && (
                                            <span style={{ color: "red" }}>
                                                {errors.duration.message}
                                            </span>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Loại dịch vụ">
                                        <Controller
                                            name="service_category_id"
                                            control={control}
                                            rules={{
                                                required:
                                                    "Vui lòng chọn loại dịch vụ",
                                            }}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    placeholder="Chọn loại dịch vụ"
                                                    showSearch
                                                    defaultActiveFirstOption={
                                                        false
                                                    }
                                                    optionFilterProp="children"
                                                    onSearch={debouncedSearch}
                                                    filterOption={false}
                                                    onChange={(value) =>
                                                        field.onChange(value)
                                                    }
                                                    notFoundContent={
                                                        serviceCategories.loading ? (
                                                            <Spin size="small" />
                                                        ) : null
                                                    }
                                                >
                                                    {datacate.map(
                                                        (category) => (
                                                            <Option
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.id
                                                                }
                                                            >
                                                                {category.name}
                                                            </Option>
                                                        )
                                                    )}
                                                </Select>
                                            )}
                                        />
                                        {errors.service_category_id && (
                                            <span style={{ color: "red" }}>
                                                {
                                                    errors.service_category_id
                                                        .message
                                                }
                                            </span>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Trạng thái">
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <Switch
                                                    {...field}
                                                    checked={field.value}
                                                    checkedChildren="Hoạt động"
                                                    unCheckedChildren="Ngừng hoạt động"
                                                />
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Mức độ ưu tiên">
                                        <Controller
                                            name="priority"
                                            control={control}
                                            rules={{
                                                required:
                                                    "Vui lòng nhập mức độ ưu tiên",
                                                valueAsNumber: true,
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                min={0}
                                                    {...field}
                                                    type="number"
                                                    placeholder="mức độ ưu tiên"
                                                />
                                            )}
                                        />
                                        {errors.priority && (
                                            <span style={{ color: "red" }}>
                                                {errors.priority.message}
                                            </span>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item label="Mô tả">
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <Input.TextArea
                                                    {...field}
                                                    placeholder="Mô tả dịch vụ"
                                                    rows={4}
                                                />
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Lưu
                                </Button>
                            </Form.Item>
                        </Form>
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
                                defaultValue={[]}
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
                                        maxCount={10}
                                        multiple
                                        accept="image/*"
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
                        </Form.Item>
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
}

export default ServiceModalEdit;
