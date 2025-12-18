import React from "react";
import { Card, Row, Col, Button, QRCode, Space, Typography, Divider } from "antd";
import {
    EnvironmentOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    CheckCircleOutlined,
    MessageOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/iconlogo.png";
import styles from "./ZaloProfile.module.scss";

const { Title, Text, Paragraph } = Typography;

const ZaloProfile = () => {
    // Thông tin spa
    const spaInfo = {
        name: "MAY BEAUTY SPA",
        shortName: "may beauty spa",
        category: "Mỹ phẩm & Làm đẹp",
        address: "8A1 Nguyễn Cảnh Chân, P. Nguyễn Cư Trinh, Q. 1, Thành phố Hồ Chí Minh",
        phone: "1900633563",
        openingHours: "Mở cửa lúc 10:00",
        website: "https://maybeautyspa.com",
        description:
            "MAY BEAUTY SPA là chuỗi spa thiên nhiên chăm sóc da chuyên nghiệp từ 100% hoa tươi, trái cây & thảo mộc. Chúng tôi cam kết mang đến cho khách hàng những dịch vụ làm đẹp chất lượng cao với đội ngũ chuyên nghiệp và không gian thư giãn hiện đại.",
    };

    const handleMessageClick = () => {
        window.open(`https://zalo.me/${spaInfo.phone}`, "_blank");
    };

    // Tạo QR code với URL của trang hiện tại
    const qrCodeValue = window.location.href;

    return (
        <div className={styles.zaloProfileContainer}>
            <div className={styles.header}>
                <div className={styles.logoSection}>
                    <Text className={styles.zaloLogo}>Zalo</Text>
                </div>
                <div className={styles.languageSelector}>
                    <select className={styles.languageSelect}>
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>

            <div className={styles.content}>
                <Card className={styles.profileCard}>
                    {/* Header Profile */}
                    <div className={styles.profileHeader}>
                        <div className={styles.profileLeft}>
                            <div className={styles.avatarContainer}>
                                <div className={styles.avatar}>
                                    <img src={logo} alt={spaInfo.name} className={styles.avatarImage} />
                                </div>
                                <Text className={styles.shortName}>{spaInfo.shortName}</Text>
                            </div>
                        </div>
                        <div className={styles.profileRight}>
                            <div className={styles.nameSection}>
                                <Title level={2} className={styles.spaName}>
                                    {spaInfo.name}
                                </Title>
                                <CheckCircleOutlined className={styles.verifiedIcon} />
                            </div>
                            <Text className={styles.category}>{spaInfo.category}</Text>
                            <Button
                                type="primary"
                                icon={<MessageOutlined />}
                                size="large"
                                className={styles.messageButton}
                                onClick={handleMessageClick}
                            >
                                Nhắn tin
                            </Button>
                        </div>
                        <div className={styles.qrCodeSection}>
                            <QRCode
                                value={qrCodeValue}
                                size={120}
                                iconSize={40}
                                errorLevel="M"
                                className={styles.qrCode}
                            />
                            <Text className={styles.qrCodeText}>
                                Mở Zalo, bấm quét QR để quét và xem trên điện thoại
                            </Text>
                        </div>
                    </div>

                    <Divider />

                    {/* Detailed Information */}
                    <div className={styles.detailedInfo}>
                        <Title level={4} className={styles.sectionTitle}>
                            Thông tin chi tiết
                        </Title>

                        <Space direction="vertical" size="middle" className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <EnvironmentOutlined className={styles.infoIcon} />
                                <Text className={styles.infoText}>{spaInfo.address}</Text>
                            </div>

                            <div className={styles.infoItem}>
                                <PhoneOutlined className={styles.infoIcon} />
                                <Text className={styles.infoText}>{spaInfo.phone}</Text>
                            </div>

                            <div className={styles.infoItem}>
                                <ClockCircleOutlined className={styles.infoIcon} />
                                <Text className={styles.infoText}>
                                    Đã đóng cửa • {spaInfo.openingHours}
                                </Text>
                            </div>

                            <div className={styles.infoItem}>
                                <HomeOutlined className={styles.infoIcon} />
                                <a
                                    href={spaInfo.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.websiteLink}
                                >
                                    {spaInfo.website}
                                </a>
                            </div>
                        </Space>
                    </div>

                    <Divider />

                    {/* Business Description */}
                    <div className={styles.description}>
                        <Paragraph className={styles.descriptionText}>{spaInfo.description}</Paragraph>
                    </div>
                </Card>
            </div>

            <div className={styles.footer}>
                <Text className={styles.copyright}>
                    © Copyright 2021 Zalo Group. All right Reserved.
                </Text>
            </div>
        </div>
    );
};

export default ZaloProfile;

