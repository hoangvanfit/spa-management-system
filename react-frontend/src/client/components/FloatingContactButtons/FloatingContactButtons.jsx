import React from "react";
import { PhoneOutlined, MessageOutlined } from "@ant-design/icons";
import styles from "./FloatingContactButtons.module.scss";

const FloatingContactButtons = () => {
    const phoneNumber = "1900633563"; // Số hotline
    const zaloProfileLink = `${window.location.origin}/zaloprofile`; // Link đến trang Zalo Profile
    const messengerLink = "https://m.me/your-page-id"; // Link Messenger - cần thay bằng page ID thực tế

    const handlePhoneClick = () => {
        window.location.href = `tel:${phoneNumber}`;
    };

    const handleZaloClick = () => {
        // Mở trang Zalo Profile trong tab mới
        window.open(zaloProfileLink, "_blank");
    };

    const handleMessengerClick = () => {
        window.open(messengerLink, "_blank");
    };

    return (
        <div className={styles.floatingButtons}>
            {/* Hotline Button - Góc dưới bên trái */}
            <div className={styles.hotlineButton} onClick={handlePhoneClick}>
                <PhoneOutlined className={styles.phoneIcon} />
                <span className={styles.phoneText}>{phoneNumber}</span>
            </div>

            {/* Zalo và Messenger - Góc dưới bên phải */}
            <div className={styles.socialButtons}>
                <div className={styles.messengerButton} onClick={handleMessengerClick}>
                    <MessageOutlined className={styles.socialIcon} />
                </div>
                <div className={styles.zaloButton} onClick={handleZaloClick}>
                    <span className={styles.zaloText}>Zalo</span>
                </div>
            </div>
        </div>
    );
};

export default FloatingContactButtons;

