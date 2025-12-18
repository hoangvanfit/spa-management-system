import React, { useEffect } from "react";
import { Row, Col, Button, Form, Input, Divider, notification } from "antd";
import { useForm, Controller } from "react-hook-form";
import style from "../style/Login.module.scss";
import { useNavigate } from "react-router-dom";
import useAuthActions from "../../../../admin/modules/authen/hooks/useAuth";
import { useAuth } from "../../../config/AuthContext";

const Login = () => {
    const [api, contextHolder] = notification.useNotification();
    const { authLoginClient } = useAuthActions();
    const navigate = useNavigate();
    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm();
    const { login } = useAuth();

    const onSubmit = async (data) => {
        try {
            console.log("🔐 Đang thực hiện đăng nhập với email:", data.email);
            const response = await authLoginClient(data.email, data.password);
            console.log("📦 Response từ Redux:", response);
            console.log("📦 Response type:", typeof response);
            console.log("📦 Response keys:", Object.keys(response || {}));

            // Kiểm tra nếu request bị rejected
            if (response.meta?.requestStatus === "rejected") {
                const errorPayload = response.payload;
                console.error("❌ Lỗi đăng nhập:", errorPayload);

                // Xử lý lỗi validation (422)
                if (errorPayload.status === 422 && errorPayload.errors) {
                    Object.keys(errorPayload.errors).forEach((key) => {
                        setError(key, {
                            type: "manual",
                            message: Array.isArray(errorPayload.errors[key])
                                ? errorPayload.errors[key][0]
                                : errorPayload.errors[key],
                        });
                    });
                    api.error({
                        message: "Thông tin đăng nhập không hợp lệ",
                        description: "Vui lòng kiểm tra lại email và mật khẩu",
                    });
                } else {
                    // Xử lý các lỗi khác
                    api.error({
                        message: "Đăng nhập thất bại",
                        description:
                            errorPayload.message ||
                            errorPayload.error ||
                            "Vui lòng kiểm tra lại thông tin đăng nhập",
                    });
                }
                return;
            }

            // Kiểm tra nếu có access_token
            // Redux Toolkit trả về: { type, payload, meta }
            // payload chứa response.data từ API
            const accessToken = 
                response.payload?.access_token || 
                response.access_token ||
                (response.payload && typeof response.payload === 'object' && response.payload.access_token);
            
            console.log("🔑 Access token tìm thấy:", accessToken ? "CÓ ✓" : "KHÔNG ✗");
            if (accessToken) {
                console.log("🔑 Token value:", accessToken.substring(0, 50) + "...");
            }
            
            // Kiểm tra token trong localStorage (đã được lưu bởi Redux slice)
            const storedToken = localStorage.getItem("tokenClient");
            console.log("💾 Token trong localStorage:", storedToken ? "CÓ ✓" : "KHÔNG ✗");
            
            // Sử dụng token từ response hoặc từ localStorage
            const finalToken = accessToken || storedToken;
            
            if (finalToken) {
                console.log("✅ Đăng nhập thành công!");
                api.success({
                    message: "Đăng nhập thành công",
                    description: "Chào mừng bạn trở lại",
                    duration: 3,
                });

                // Đảm bảo token được lưu (nếu chưa có)
                if (!storedToken && accessToken) {
                    localStorage.setItem("tokenClient", accessToken);
                    console.log("💾 Đã lưu token vào localStorage");
                }

                setTimeout(() => {
                    login(finalToken);
                    console.log("✅ Đang chuyển đến trang chủ...");
                    navigate("/");
                }, 1500);
            } else {
                // Trường hợp không có token
                console.error("❌ Không nhận được access_token!");
                console.error("Full response structure:", {
                    hasPayload: !!response.payload,
                    payloadKeys: response.payload ? Object.keys(response.payload) : [],
                    responseKeys: Object.keys(response || {}),
                    fullResponse: response
                });
                api.error({
                    message: "Đăng nhập thất bại",
                    description:
                        response.payload?.message ||
                        response.message ||
                        "Không nhận được token từ server. Vui lòng kiểm tra lại thông tin đăng nhập.",
                });
            }
        } catch (error) {
            console.error("❌ Lỗi không mong đợi khi đăng nhập:", error);
            api.error({
                message: "Đã có lỗi xảy ra",
                description:
                    error.message ||
                    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.",
            });
        }
    };

    return (
        <Row justify="center" align="middle" className={style.container}>
            {contextHolder}
            <Col
                xs={22}
                sm={16}
                md={12}
                lg={8}
                xl={6}
                className={style.boxForm}
            >
                <h2>Đăng nhập</h2>
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    <Form.Item label="Email">
                        <Controller
                            name="email"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: "Vui lòng nhập email",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Email không hợp lệ",
                                },
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="Nhập email"
                                    status={errors.email ? "error" : ""}
                                />
                            )}
                        />
                        {errors.email && (
                            <p className={style.errorMessage}>
                                {errors.email.message}
                            </p>
                        )}
                    </Form.Item>
                    <Form.Item label="Mật khẩu">
                        <Controller
                            name="password"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: "Vui lòng nhập mật khẩu",
                                minLength: {
                                    value: 6,
                                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                                },
                            }}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    placeholder="Mật khẩu"
                                    status={errors.password ? "error" : ""}
                                />
                            )}
                        />
                        {errors.password && (
                            <p className={style.errorMessage}>
                                {errors.password.message}
                            </p>
                        )}
                    </Form.Item>
                    <Form.Item>
                        <a onClick={() => navigate("/quenmatkhau")}>
                            Quên mật khẩu?
                        </a>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            ĐĂNG NHẬP
                        </Button>
                    </Form.Item>
                </Form>
                <Divider />
                <p>
                    Bạn chưa có tài khoản?{" "}
                    <a onClick={() => navigate("/dangky")}>Đăng ký ngay</a>
                </p>
                <p>Hoặc</p>
                <Button disabled block className={style.btnLoginGoogle}>
                    ĐĂNG NHẬP VỚI GOOGLE
                </Button>
            </Col>
        </Row>
    );
};

export default Login;
