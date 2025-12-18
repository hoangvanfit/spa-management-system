import React, { useEffect, useState } from "react";
import {
    Button,
    Col,
    DatePicker,
    Dropdown,
    Row,
    Space,
    Table,
    Tag,
} from "antd";
import { DownOutlined } from "@ant-design/icons";

import StatisticsSection from "../../modules/home/compoment/StatisticsSection";
import TableSection from "../../modules/home/compoment/TableSection";
import useStatisticsAction from "../../modules/home/hooks/useStatisticsAction";
import { useSelector } from "react-redux";
import useDate from "../../modules/home/hooks/useDate";
import usepaymentActions from "../../modules/payments/hooks/usepaymentAction";
import useBootstrapUtils from "../../modules/home/hooks/useBootstrapUtils";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
const Dashboard = () => {
     
    useEffect(() => {
        document.title = "May Beauty Spa - Quản lý";
    }, []);
    const navigate = useNavigate();
    const [transactionData, setTransactionData] = useState([]);
    const [transactionColumns, setTransactionColumns] = useState([
        {
            title: "#",
            key: "id",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Mã hóa đơn",
            dataIndex: "id",
            key: "id",
        },

        {
            title: "Tổng tiền",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (text) => parseInt(text).toLocaleString() + " VNĐ",
        },
        {
            title: "Phương thức thanh toán",
            dataIndex: "payment_type",
            key: "payment_type",
            render: (text) => (text == 0 ? "Tiền mặt" : "Chuyển khoản"),
        },
        {
            title: "Ngày thanh toán",
            dataIndex: "created_at",
            key: "created_at",
        },
        {
            title: "Trạng thái",
            key: "status",
            dataIndex: "status",
            render: (status) =>
                status == 1 ? (
                    <Tag color="green">Đã thanh toán</Tag>
                ) : (
                    <Tag color="red">Chưa thanh toán</Tag>
                ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: "2",
                                label: (
                                    <Button
                                        onClick={() => {
                                            navigate(`/admin/thanhtoan`);
                                        }}
                                        block
                                    >
                                        Chi tiết
                                    </Button>
                                ),
                            },
                        ],
                    }}
                    trigger={["click"]}
                >
                    <Button type="primary">
                        <Space>
                            Hành động
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            ),
        },
    ]);
    // Đã xóa appointmentColumns vì chức năng tư vấn chưa hoàn thành
    const [staffAppoimentsColumns, setStaffAppoimentsColumns] = useState([
        {
            title: "#",
            key: "index",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Nhân viên",
            dataIndex: "full_name",
            key: "full_name",
            render: (text) => text || "Không tìm thấy",
        },
        {
            title: "Số lần Dịch vụ",
            dataIndex: "total",
            key: "total",
            render: (text) => text || "Không tìm thấy",
        },
    ]);

    useBootstrapUtils();

    const [monthlyRevenues, setMonthlyRevenues] = useState({});
    const [weeklyRevenues, setWeeklyRevenues] = useState({});
    const [dailyRevenues, setDailyRevenues] = useState({});
    const [revenueAppointment, setRevenueAppointment] = useState({});
    const [staffAppoiments, setStaffAppoiments] = useState([]);
    const {
        formattedDate,
        day,
        month,
        year,
        weekDay,
        isoWeek,
        weekOfMonth,
        setDate,
        formatDate2,
    } = useDate();

    const {
        getMonthlyRevenues,
        getWeeklyRevenues,
        getDailyRevenues,
        getRevenueAppointment,
        getStaffAppoiments,
    } = useStatisticsAction();
    const { getpayment } = usepaymentActions();
    const statistical = useSelector((state) => state.statistical);
    const payment = useSelector((state) => state.payments);

    useEffect(() => {
        getMonthlyRevenues({
            month: month,
            year: year,
        });
        getWeeklyRevenues({
            week: isoWeek,
            year: year,
        });
        getDailyRevenues({
            day: formatDate2,
        });
        getRevenueAppointment({
            day: formatDate2,
        });
        getpayment(100);
        getStaffAppoiments({
            day: formatDate2,
        });
    }, [day, month, year, isoWeek, formatDate2]);

    useEffect(() => {
        if (statistical.monthlyRevenues) {
            setMonthlyRevenues(statistical.monthlyRevenues.data);
        }
        if (statistical.weeklyRevenues) {
            setWeeklyRevenues(statistical.weeklyRevenues.data);
        }
        if (statistical.dailyRevenues) {
            setDailyRevenues(statistical.dailyRevenues.data);
        }
        if (statistical.revenueAppointment?.data) {
            setRevenueAppointment(statistical.revenueAppointment.data);
        } else {
            setRevenueAppointment([]);
        }
        if (statistical.staffAppoiments) {
            setStaffAppoiments(statistical.staffAppoiments.data);
        }

        
    }, [statistical]);

    useEffect(() => {
        if (payment.Payments && payment.Payments.data) {
            setTransactionData(
                payment.Payments?.data.map((item) => ({
                    ...item,
                    key: item.id,
                }))
            );
        } else {
            setTransactionData([]);
        }
    }, [payment]);


    return (
        <div style={{ padding: 20 }}>
            <Row className="mb-3" gutter={16}>
                <Col xxl={6} xl={6} lg={6} md={6} sm={24} xs={24}>
                    <DatePicker
                        value={dayjs(formattedDate, "DD/MM/YYYY")}
                        className="w-100"
                        format="DD/MM/YYYY"
                        onChange={(date, dateString) => {
                            if (date) {
                                setDate(new Date(date.toDate())); // Chuyển đổi từ dayjs sang Date object
                            }
                        }}
                    />
                </Col>
            </Row>
            <StatisticsSection
                date={formattedDate}
                monthlyRevenues={monthlyRevenues}
                weeklyRevenues={weeklyRevenues}
                dailyRevenues={dailyRevenues}
                revenueAppointment={revenueAppointment}
            />
            <TableSection
                staffAppoiments={staffAppoiments}
                transactionData={transactionData}
                transactionColumns={transactionColumns}
                staffAppoimentsColumns={staffAppoimentsColumns}
            />
        </div>
    );

   
};

export default Dashboard;
