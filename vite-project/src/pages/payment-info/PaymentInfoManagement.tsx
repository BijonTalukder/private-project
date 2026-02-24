import { useState } from "react";
import {
    Button, Table, Modal, Form, Input,
    message, Popconfirm, Space, Card,
    Tag, Tooltip, Spin, Switch
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined, ReloadOutlined,
    CheckCircleOutlined, CloseCircleOutlined,
    CreditCardOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useCreatePaymentMutation, useDeletePaymentMutation, useGetAllPaymentsQuery, useTogglePaymentStatusMutation, useUpdatePaymentMutation, type PaymentInfo } from "../../api/services/payment-info/paymentInfoApi";


// Type color mapping
const typeColorMap: Record<string, string> = {
    Cash: "green",
    Online: "blue",
    Card: "purple",
    Mobile: "orange",
    Bank: "geekblue",
};

const PaymentInfoManagement = () => {
    // ── RTK Query ──────────────────────────────────────────────────────────────
    const { data: payments = [], isLoading, refetch } = useGetAllPaymentsQuery();
    const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();
    const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation();
    const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();
    const [toggleStatus] = useTogglePaymentStatusMutation();

    // ── Local state ────────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PaymentInfo | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const handleCreate = async (values: any) => {
        try {
            await createPayment(values).unwrap();
            message.success("Payment method created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to create payment method");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;
        try {
            await updatePayment({ id: editingItem._id, data: values }).unwrap();
            message.success("Payment method updated successfully!");
            setIsModalOpen(false);
            setEditingItem(null);
            form.resetFields();
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update payment method");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deletePayment(id).unwrap();
            message.success("Payment method deleted successfully!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to delete payment method");
        }
    };

    const handleToggle = async (record: PaymentInfo) => {
        try {
            await toggleStatus(record._id).unwrap();
            message.success("Status updated!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update status");
        }
    };

    const openCreate = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEdit = (record: PaymentInfo) => {
        setEditingItem(record);
        form.setFieldsValue({ name: record.name, type: record.type, isActive: record.isActive });
        setIsModalOpen(true);
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns: ColumnsType<PaymentInfo> = [
        {
            title: "Payment ID",
            dataIndex: "paymentId",
            key: "paymentId",
            width: 130,
            render: (text) => (
                <Tag
                    color="purple"
                    style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        padding: "4px 10px",
                        fontWeight: "500",
                    }}
                >
                    {text}
                </Tag>
            ),
        },
        {
            title: "Payment Method",
            dataIndex: "name",
            key: "name",
            render: (text) => (
                <Space>
                    <CreditCardOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                    <span style={{ fontWeight: "500", fontSize: "14px", color: "#2D3748" }}>
                        {text}
                    </span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const s = value.toString().toLowerCase();
                return (
                    record.name.toLowerCase().includes(s) ||
                    record.type.toLowerCase().includes(s) ||
                    record.paymentId.toLowerCase().includes(s)
                );
            },
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 140,
            render: (type) => (
                <Tag color={typeColorMap[type] ?? "default"}>{type}</Tag>
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
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (
                <span style={{ color: "#718096", fontSize: "13px" }}>
                    {new Date(date).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                    })}
                </span>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 110,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(record)}
                            style={{ color: "#667eea", borderRadius: "6px" }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Payment Method"
                        description="Are you sure you want to delete this payment method?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                style={{ borderRadius: "6px" }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "30px",
        }}>
            <Card style={{
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                border: "1px solid #e0e0e0",
            }}>
                {/* ── Header ── */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    paddingBottom: "15px",
                    borderBottom: "2px solid #E2E8F0",
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#2D3748" }}>
                            Payment Info Management
                        </h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>
                            Total {payments.length} payment methods
                        </p>
                    </div>
                    <Space>
                        <Input
                            placeholder="Search by name, type, ID..."
                            prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{ width: "280px", height: "40px", borderRadius: "6px" }}
                        />
                        <Tooltip title="Refresh">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => refetch()}
                                style={{ height: "40px", borderRadius: "6px", borderColor: "#667eea", color: "#667eea" }}
                            />
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreate}
                            style={{
                                height: "40px",
                                borderRadius: "6px",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                                fontWeight: "500",
                            }}
                        >
                            Add Payment Method
                        </Button>
                    </Space>
                </div>

                {/* ── Table ── */}
                <Table
                    columns={columns}
                    dataSource={payments}
                    rowKey="_id"
                    loading={isDeleting}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} payment methods`,
                    }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ padding: "20px", background: "#F7FAFC", borderRadius: "8px" }}>
                                <h4 style={{ margin: "0 0 15px", fontSize: "15px", fontWeight: "600", color: "#2D3748" }}>
                                    Detailed Information
                                </h4>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                                    gap: "15px",
                                }}>
                                    {/* Payment Details */}
                                    <div style={{ padding: "15px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <CreditCardOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Payment Method Details
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                ID: <Tag color="purple">{record.paymentId}</Tag>
                                            </div>
                                            <div style={{ marginBottom: "6px" }}>
                                                Name: <strong style={{ color: "#2D3748" }}>{record.name}</strong>
                                            </div>
                                            <div style={{ marginBottom: "6px" }}>
                                                Type: <Tag color={typeColorMap[record.type] ?? "default"}>{record.type}</Tag>
                                            </div>
                                            <div>
                                                Status: <Tag color={record.isActive ? "success" : "default"}>{record.isActive ? "Active" : "Inactive"}</Tag>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div style={{ padding: "15px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Record Info
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                Created: {new Date(record.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                            </div>
                                            <div>
                                                Updated: {new Date(record.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ),
                    }}
                />
            </Card>

            {/* ── Modal ── */}
            <Modal
                title={
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}>
                        <CreditCardOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingItem ? "Edit Payment Method" : "Add New Payment Method"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }}
                footer={null}
                width={500}
                style={{ top: 30 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingItem ? handleUpdate : handleCreate}
                    style={{ marginTop: "20px" }}
                >
                    {/* Name */}
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Payment Method Name</span>}
                        name="name"
                        rules={[
                            { required: true, message: "Please enter payment method name" },
                            { min: 2, message: "Name must be at least 2 characters" },
                        ]}
                    >
                        <Input
                            placeholder="e.g., Cash, Bank Transfer, Credit Card, Mobile Banking"
                            prefix={<CreditCardOutlined style={{ color: "#667eea" }} />}
                            style={{ height: "42px", borderRadius: "6px" }}
                        />
                    </Form.Item>

                    {/* Type */}
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Type</span>}
                        name="type"
                        rules={[
                            { required: true, message: "Please enter payment type" },
                            { min: 2, message: "Type must be at least 2 characters" },
                        ]}
                    >
                        <Input
                            placeholder="e.g., Cash, Online, Card, Mobile, Bank"
                            style={{ height: "42px", borderRadius: "6px" }}
                        />
                    </Form.Item>

                    {/* Status */}
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Status</span>}
                        name="isActive"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

                    {/* Buttons */}
                    <div style={{
                        marginTop: "25px",
                        paddingTop: "20px",
                        borderTop: "1px solid #E2E8F0",
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                    }}>
                        <Button
                            onClick={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }}
                            style={{ height: "42px", borderRadius: "6px", minWidth: "100px" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isCreating || isUpdating}
                            style={{
                                height: "42px",
                                borderRadius: "6px",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                fontWeight: "500",
                                minWidth: "100px",
                            }}
                        >
                            {editingItem ? "Update Payment" : "Add Payment"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default PaymentInfoManagement;