import React, { useState, useRef } from "react";
import { Carousel } from "antd";
import ConsultingFrom from "./ConsultingFrom";
import styles from "../Styles/SliderHome.module.scss";

import baner1 from "../../../assets/images/baner1home.png";
import baner2 from "../../../assets/images/baner2.png";

const bannerData = [
    {
        image: baner1,
        text: "TRẢI NGHIỆM DỊCH VỤ\nSPA CAO CÂP\nTẠI MAY BEAUTY SPA",
    },
    {
        image: baner2,
        text: "CHĂM SÓC SỨC KHỎE\nVÀ SĂC ĐẸP TỰ NHIÊN\nVỚI CÔNG NGHỆ HIỆN ĐẠI",
    },
    {
        image: baner1,
        text: "TRẢI NGHIỆM DỊCH VỤ\nSPA CAO CÂP\nTẠI MAY BEAUTY SPA",
    },
];

const SliderHome = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef(null);

    const handleChange = (current) => {
        setCurrentSlide(current);
    };

    return (
        <div className={styles.sliderContainer}>
            <Carousel
                ref={carouselRef}
                autoplay
                dotPosition="bottom"
                afterChange={handleChange}
                className={styles.carousel}
            >
                {bannerData.map((banner, index) => (
                    <div key={index} className={styles.slide}>
                        <div className={styles.imageWrapper}>
                            <img
                                src={banner.image}
                                alt={`banner ${index + 1}`}
                                className={styles.bannerImage}
                            />
                            <div className={styles.overlay}></div>
                        </div>
                        <div
                            className={`${styles.textOverlay} ${
                                currentSlide === index ? styles.textActive : ""
                            }`}
                            key={`text-${index}-${currentSlide}`}
                        >
                            <div className={styles.textContent}>
                                {banner.text.split("\n").map((line, i) => (
                                    <p
                                        key={i}
                                        className={styles.textLine}
                                        style={{
                                            animationDelay: `${i * 0.2 + 0.1}s`,
                                        }}
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </Carousel>
            <ConsultingFrom />
        </div>
    );
};

export default SliderHome;
