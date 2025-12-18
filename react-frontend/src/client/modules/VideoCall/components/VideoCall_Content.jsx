import React, { useState, useEffect } from "react";
import { Button, Col, Row, Divider, Result, notification, Spin } from "antd";
import { MeetingProvider, MeetingConsumer } from "@videosdk.live/react-sdk";
import MeetingView from "./MeetingView";
import useAuthActions from "../../../../admin/modules/authen/hooks/useAuth";
import { useSelector } from "react-redux";
import styles from "../styles/Videocall.module.scss";
import { VIDEOSDK_TOKEN, validateMeeting } from "../services/API";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const VideoCall_Content = () => {
    const nagigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();
    const { idmeet } = useParams();
    const { authGetmeClient } = useAuthActions();
    const auth = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true); // Trạng thái loading
    const [meetingId, setMeetingId] = useState(null); // ID cuộc gọi

    useEffect(() => {
        authGetmeClient();
    }, [idmeet]);

    useEffect(() => {
        // Kiểm tra consultation và validate meeting
        const checkConsultationAndValidate = async () => {
            if (!VIDEOSDK_TOKEN) {
                api.error({
                    message: "Lỗi cấu hình",
                    description: "Token VideoSDK chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
                    duration: 5,
                });
                setLoading(false);
                return;
            }

            // Kiểm tra consultation trong danh sách của user
            let consultation = null;
            if (auth?.user?.data?.consulations) {
                consultation = auth?.user?.data?.consulations.find(
                    (item) => item.id === idmeet
                );
            }

            // Nếu không tìm thấy consultation, vẫn thử validate meeting (có thể admin tạo)
            if (!consultation) {
                console.warn(
                    "Không tìm thấy consultation với idmeet:",
                    idmeet,
                    "- Vẫn thử validate meeting"
                );
            } else {
                // Kiểm tra status: 0 = pending, 1 = active, 2 = completed
                if (consultation.status === 2) {
                    setMeetingId("ENDED");
                    setLoading(false);
                    api.warning({
                        message: "Cuộc gọi đã kết thúc",
                        description: "Cuộc tư vấn này đã được hoàn thành.",
                        duration: 4,
                    });
                    return;
                }
                if (consultation.status === 0) {
                    api.info({
                        message: "Đang chờ duyệt",
                        description: "Yêu cầu tư vấn của bạn đang chờ được duyệt.",
                        duration: 4,
                    });
                }
            }

            // Validate meeting room với VideoSDK
            try {
                const { meetingId: validatedMeetingId, err } = await validateMeeting({
                    roomId: idmeet,
                    token: VIDEOSDK_TOKEN,
                });

                if (err) {
                    api.error({
                        message:
                            err === "Room not found."
                                ? "Không tìm thấy phòng"
                                : "Lỗi xác thực phòng",
                        description:
                            err === "Room not found."
                                ? "Vui lòng kiểm tra lại mã phòng hoặc liên hệ hỗ trợ."
                                : err,
                        duration: 5,
                    });
                    setLoading(false);
                } else {
                    setMeetingId(validatedMeetingId);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Lỗi khi validate meeting:", error);
                api.error({
                    message: "Lỗi kết nối",
                    description: "Không thể kết nối đến dịch vụ video call. Vui lòng thử lại sau.",
                    duration: 5,
                });
                setLoading(false);
            }
        };

        // Chỉ chạy khi đã có auth data hoặc sau khi đã load auth
        if (auth?.user !== undefined) {
            checkConsultationAndValidate();
        }
    }, [auth, idmeet, api]);

    const onMeetingLeave = () => {
        setMeetingId("ENDED");
    };

    return (
        <div className="container mt-5 mb-5">
            {contextHolder}
            <Divider orientation="left">Cuộc gọi video</Divider>
            <Spin spinning={loading} tip="Đang tải, vui lòng chờ...">
                {/* Nội dung hiển thị khi logic hoàn thành */}
                <Row className={styles.videoCallContainer} gutter={[16, 16]}>
                    <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                        <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                            <div className={styles.videoContainer}>
                                {meetingId === "ENDED" ? (
                                    <Result
                                        status="info"
                                        title="Cuộc gọi đã kết thúc"
                                        className="w-100"
                                        subTitle="Cảm ơn bạn đã tham gia cuộc gọi."
                                        extra={
                                            <Button
                                                type="primary"
                                                onClick={() =>
                                                    window.history.back()
                                                }
                                            >
                                                Quay lại
                                            </Button>
                                        }
                                    />
                                ) : meetingId ? (
                                    <MeetingProvider
                                        config={{
                                            meetingId,
                                            micEnabled: true,
                                            webcamEnabled: true,
                                            name:
                                                auth?.user?.data?.full_name ||
                                                "chưa tìm thấy",
                                        }}
                                        token={VIDEOSDK_TOKEN}
                                    >
                                        <MeetingConsumer>
                                            {() => (
                                                <MeetingView
                                                    meetingId={meetingId}
                                                    onMeetingLeave={
                                                        onMeetingLeave
                                                    }
                                                />
                                            )}
                                        </MeetingConsumer>
                                    </MeetingProvider>
                                ) : (
                                    <Result
                                        status="404"
                                        title="Không tìm thấy cuộc gọi"
                                        className="w-100"
                                        subTitle="Vui lòng kiểm tra lại đường dẫn hoặc mã phòng."
                                        extra={
                                            <Button
                                                type="primary"
                                                onClick={() =>
                                                    nagigate("/thongtincanhan/tuvandatlich")
                                                }
                                            >
                                                Quay lại
                                            </Button>
                                        }
                                    />
                                )}
                            </div>
                        </Col>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default VideoCall_Content;
