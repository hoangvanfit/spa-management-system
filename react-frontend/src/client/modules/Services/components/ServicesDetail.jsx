import React, { useEffect, useState } from "react";
import { Row, Col, List, Empty, Image, Button, Result, Divider } from "antd";
import style from "../style/ServicesDetail.module.scss";
import { useNavigate } from "react-router-dom";
import { FrownOutlined } from "@ant-design/icons";
import { URL_IMAGE } from "../../../../admin/config/appConfig";
const ServicesDetail = ({ listservices }) => {
    const [cateService, setCateService] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (listservices?.service) {
            setCateService(listservices.service);
        } else {
            setCateService([]);
        }
    }, [listservices]);

    return (
        <div>
            <Row justify="center">
                <Col
                    className={style.boxTitleServicesDetailTop}
                    xl={18}
                    lg={16}
                    md={18}
                    sm={22}
                    xs={24}
                >
                    <Divider orientation="left">
                        <h2>Dịch vụ tại May Beauty Spa</h2> 
                    </Divider>
                </Col>
            </Row>
            <div className={style.boxServicesDetail}>
                <List
                    grid={{
                        gutter: 16,
                        column: 4,
                        xs: 2,
                        sm: 2,
                        md: 3,
                        lg: 4,
                        xl: 4,
                        xxl: 4,
                    }}
                    pagination={{
                        pageSize: 8,
                        position: "bottom",
                        align: "center",
                    }}
                    dataSource={cateService}
                    locale={{
                        emptyText: (
                            <Result
                            icon={<FrownOutlined/>}
                            title="Không Tìm thấy dịch vụ"
                            extra={<p>
                                Hãy thử tải lại trang hoặc liên hệ với chúng tôi để được hỗ trợ
                            </p>}
                          />
                        ),
                    }}
                    renderItem={(item) => (
                        <List.Item>
                            <div className={style.boxServicesItemDetail}>
                                <div className={style.boxServicesDetailItemTop}>
                                    <Image
                                        src={
                                            item.image_url && 
                                            item.image_url !== "default.jpg" && 
                                            item.image_url !== null &&
                                            item.image_url !== undefined &&
                                            item.image_url.trim() !== ""
                                                ? `${URL_IMAGE}/services/special/${encodeURIComponent(item.image_url)}`
                                                : "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"
                                        }
                                        alt={item.name || "Dịch vụ"}
                                        preview={false}
                                        className={style.image}
                                        fallback="https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg"
                                        onError={(e) => {
                                            console.error('Image load error:', {
                                                image_url: item.image_url,
                                                full_url: `${URL_IMAGE}/services/special/${item.image_url}`,
                                                error: e
                                            });
                                            if (e.target.src !== "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg") {
                                                e.target.src = "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg";
                                            }
                                        }}
                                        onLoad={() => {
                                            console.log('Image loaded successfully:', {
                                                image_url: item.image_url,
                                                full_url: `${URL_IMAGE}/services/special/${item.image_url}`
                                            });
                                        }}
                                    />
                                </div>
                                <div className={style.boxServicesItemMiddle}>
                                    <p>{item.title}</p>
                                </div>
                                <div className={style.boxServicesItemBottom}>
                                    <p>{item.name}</p>
                                </div>
                                <div className={style.boxServicesItemPrice}>
                                    <p>
                                        Giá:{" "}
                                        {item.price
                                            ? `${parseInt(
                                                  item.price
                                              ).toLocaleString()} VNĐ`
                                            : "Liên hệ"}
                                    </p>
                                </div>
                                <Row justify="center" gutter={[8, 8]}>
                                    <Col
                                        xxl={24}
                                        xl={24}
                                        lg={24}
                                        md={24}
                                        sm={24}
                                        xs={24}
                                    >
                                        <Button
                                            block
                                            onClick={() =>
                                                navigate(`/dichvu/${item.id}`)
                                            }
                                            danger
                                            variant="outlined"
                                            className={style.btnServicesDetail}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </Col>
                                    <Col
                                        xxl={24}
                                        xl={24}
                                        lg={24}
                                        md={24}
                                        sm={24}
                                        xs={24}
                                    >
                                        <Button
                                            block
                                            onClick={() =>
                                                navigate(
                                                    `/datlichhen?dichvu=${item.id}`
                                                )
                                            }
                                            type="primary"
                                            className={style.btnServicesDetail}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Đặt lịch
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </List.Item>
                    )}
                />
            </div>  
        </div>
    );
};

export default ServicesDetail;
