import { useState } from "react";
import { Button, Table, message, Popconfirm, Space, Card, Tag, Tooltip, Spin, Switch, Input } from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TruckOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import DeliveryChallanFormModal from "./DeliveryChallanFormModal";
import { useCreateChallanMutation, useDeleteChallanMutation, useGetAllChallansQuery, useToggleChallanStatusMutation, type DeliveryChallan } from "../../api/services/delivery-challan/deliverychallanaApi";


const DeliveryChallanManagement = () => {
    // ── RTK Query ──────────────────────────────────────────────────────────────
    const { data: challans = [], isLoading, refetch } = useGetAllChallansQuery();
    const [createChallan, { isLoading: isCreating }] = useCreateChallanMutation();
    const [deleteChallan, { isLoading: isDeleting }] = useDeleteChallanMutation();
    const [toggleStatus] = useToggleChallanStatusMutation();

    // ── Local State ────────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    // ── CRUD Handlers ──────────────────────────────────────────────────────────
    const handleCreate = async (values: any) => {
        try {
            await createChallan(values).unwrap();
            message.success("Delivery challan created successfully!");
            setIsModalOpen(false);
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to create challan");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteChallan(id).unwrap();
            message.success("Delivery challan deleted successfully!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to delete challan");
        }
    };

    const handleToggle = async (record: DeliveryChallan) => {
        try {
            await toggleStatus(record._id).unwrap();
            message.success("Status updated!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update status");
        }
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns: ColumnsType<DeliveryChallan> = [
        {
            title: "Challan ID",
            dataIndex: "challanId",
            key: "challanId",
            width: 120,
            render: (text) => (
                <Tag color="purple" style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px" }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: "Challan No",
            dataIndex: "challanNo",
            key: "challanNo",
            render: (text) => (
                <Space>
                    <TruckOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontWeight: "500", color: "#2D3748" }}>{text}</span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const s = value.toString().toLowerCase();
                return (
                    record.challanNo.toLowerCase().includes(s) ||
                    record.challanId.toLowerCase().includes(s) ||
                    record.invoice.invoiceNo.toLowerCase().includes(s) ||
                    record.client.name.toLowerCase().includes(s)
                );
            },
        },
        {
            title: "Invoice",
            key: "invoice",
            render: (_, record) => (
                <Space>
                    <FileTextOutlined style={{ color: "#667eea" }} />
                    <span style={{ color: "#2D3748" }}>{record.invoice.invoiceNo}</span>
                </Space>
            ),
        },
        {
            title: "Client",
            key: "client",
            render: (_, record) => (
                <Space>
                    <UserOutlined style={{ color: "#667eea" }} />
                    <span style={{ color: "#2D3748" }}>{record.client.name}</span>
                </Space>
            ),
        },
        {
            title: "Challan Date",
            dataIndex: "challanDate",
            key: "challanDate",
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontSize: "13px", color: "#718096" }}>
                        {dayjs(date).format("DD MMM YYYY")}
                    </span>
                </Space>
            ),
        },
        {
            title: "Delivery Qty",
            dataIndex: "totalDeliveryQty",
            key: "totalDeliveryQty",
            align: "right",
            render: (qty) => (
                <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#52c41a", fontSize: "14px" }}>
                    {qty}
                </span>
            ),
        },
        {
            title: "Items",
            key: "items",
            align: "center",
            width: 80,
            render: (_, record) => (
                <Tag color="blue" style={{ fontSize: "12px" }}>
                    {record.items.length}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            width: 100,
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggle(record)}
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<CloseCircleOutlined />}
                    style={{ backgroundColor: isActive ? "#52c41a" : "#d9d9d9" }}
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 80,
            align: "center",
            render: (_, record) => (
                <Popconfirm
                    title="Delete Challan"
                    description="This will delete the challan and all its items. Continue?"
                    onConfirm={() => handleDelete(record._id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    <Tooltip title="Delete">
                        <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: "6px" }} />
                    </Tooltip>
                </Popconfirm>
            ),
        },
    ];

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "30px",
            }}
        >
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        paddingBottom: "15px",
                        borderBottom: "2px solid #E2E8F0",
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#2D3748" }}>
                            Delivery Challan Management
                        </h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>
                            Total {challans.length} challans
                        </p>
                    </div>
                    <Space>
                        <Input
                            placeholder="Search by challan no, invoice, client..."
                            prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{ width: "350px", height: "40px", borderRadius: "6px" }}
                        />
                        <Tooltip title="Refresh">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => refetch()}
                                style={{
                                    height: "40px",
                                    borderRadius: "6px",
                                    borderColor: "#667eea",
                                    color: "#667eea",
                                }}
                            />
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                height: "40px",
                                borderRadius: "6px",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                                fontWeight: "500",
                            }}
                        >
                            Create Challan
                        </Button>
                    </Space>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={challans}
                    rowKey="_id"
                    loading={isDeleting}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} challans`,
                    }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ padding: "20px", background: "#F7FAFC", borderRadius: "8px" }}>
                                <h4 style={{ margin: "0 0 15px", fontSize: "15px", fontWeight: "600", color: "#2D3748" }}>
                                    Challan Details
                                </h4>

                                {/* Header Info */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: "15px",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "12px",
                                            background: "#fff",
                                            borderRadius: "6px",
                                            border: "1px solid #E2E8F0",
                                        }}
                                    >
                                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "5px" }}>
                                            Invoice
                                        </div>
                                        <div style={{ fontWeight: "500", color: "#2D3748" }}>
                                            {record.invoice.invoiceNo}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "12px",
                                            background: "#fff",
                                            borderRadius: "6px",
                                            border: "1px solid #E2E8F0",
                                        }}
                                    >
                                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "5px" }}>
                                            Client
                                        </div>
                                        <div style={{ fontWeight: "500", color: "#2D3748" }}>{record.client.name}</div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "12px",
                                            background: "#fff",
                                            borderRadius: "6px",
                                            border: "1px solid #E2E8F0",
                                        }}
                                    >
                                        {/* <div style={{ fontSize: "12px", color: "#718096", marginBottom: "5px" }}>
                                            Remarks
                                        </div>
                                        <div style={{ fontWeight: "500", color: "#2D3748" }}>
                                            {record.remarks || "—"}
                                        </div> */}
                                    </div>
                                </div>

                                {/* Items Table */}
                                <h5 style={{ margin: "15px 0 10px", fontSize: "13px", fontWeight: "600", color: "#2D3748" }}>
                                    Delivery Items ({record.items.length})
                                </h5>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: "#E2E8F0", textAlign: "left" }}>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748" }}>
                                                    #
                                                </th>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748" }}>
                                                    Invoice Qty
                                                </th>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748" }}>
                                                    Previous Delivery
                                                </th>
                                                <th
                                                    style={{
                                                        padding: "10px",
                                                        fontWeight: "600",
                                                        color: "#2D3748",
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    Delivery Qty
                                                </th>
                                                <th
                                                    style={{
                                                        padding: "10px",
                                                        fontWeight: "600",
                                                        color: "#2D3748",
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    Remaining
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {record.items.map((item, idx) => (
                                                <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                                                    <td style={{ padding: "10px", color: "#2D3748" }}>{idx + 1}</td>
                                                    <td
                                                        style={{
                                                            padding: "10px",
                                                            fontFamily: "monospace",
                                                            color: "#2D3748",
                                                        }}
                                                    >
                                                        {item.invoiceQty}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "10px",
                                                            fontFamily: "monospace",
                                                            color: "#f5222d",
                                                        }}
                                                    >
                                                        {item.previousDeliveryQty}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "right",
                                                            fontFamily: "monospace",
                                                            fontWeight: "600",
                                                            color: "#52c41a",
                                                        }}
                                                    >
                                                        {item.deliveryQty}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "right",
                                                            fontFamily: "monospace",
                                                            color: "#667eea",
                                                        }}
                                                    >
                                                        {item.remainingQty}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ),
                    }}
                />
            </Card>

            {/* Create Modal */}
            <DeliveryChallanFormModal
                open={isModalOpen}
                isCreating={isCreating}
                onSubmit={handleCreate}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default DeliveryChallanManagement;