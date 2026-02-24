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
    BankOutlined, UserOutlined, HomeOutlined,
    EnvironmentOutlined, IdcardOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useCreateBankMutation, useDeleteBankMutation, useGetAllBanksQuery, useToggleBankStatusMutation, useUpdateBankMutation, type BankInfo } from "../../api/services/bank-info/bankInfoApi";


const BankInfoManagement = () => {
    // ── RTK Query ──────────────────────────────────────────────────────────────
    const { data: banks = [], isLoading, refetch } = useGetAllBanksQuery();
    const [createBank, { isLoading: isCreating }] = useCreateBankMutation();
    const [updateBank, { isLoading: isUpdating }] = useUpdateBankMutation();
    const [deleteBank, { isLoading: isDeleting }] = useDeleteBankMutation();
    const [toggleStatus] = useToggleBankStatusMutation();

    // ── Local state ────────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BankInfo | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const handleCreate = async (values: any) => {
        try {
            await createBank(values).unwrap();
            message.success("Bank info created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to create bank info");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;
        try {
            await updateBank({ id: editingItem._id, data: values }).unwrap();
            message.success("Bank info updated successfully!");
            setIsModalOpen(false);
            setEditingItem(null);
            form.resetFields();
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update bank info");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBank(id).unwrap();
            message.success("Bank info deleted successfully!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to delete bank info");
        }
    };

    const handleToggle = async (record: BankInfo) => {
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

    const openEdit = (record: BankInfo) => {
        setEditingItem(record);
        form.setFieldsValue({
            name: record.name,
            accountName: record.accountName,
            branchName: record.branchName,
            districtName: record.districtName,
            code: record.code,
            isActive: record.isActive,
        });
        setIsModalOpen(true);
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns: ColumnsType<BankInfo> = [
        {
            title: "Bank ID",
            dataIndex: "bankId",
            key: "bankId",
            width: 120,
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
            title: "Bank Name",
            dataIndex: "name",
            key: "name",
            render: (text) => (
                <Space>
                    <BankOutlined style={{ color: "#667eea", fontSize: "16px" }} />
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
                    record.accountName.toLowerCase().includes(s) ||
                    record.branchName.toLowerCase().includes(s) ||
                    record.districtName.toLowerCase().includes(s) ||
                    record.code.toLowerCase().includes(s) ||
                    record.bankId.toLowerCase().includes(s)
                );
            },
        },
        {
            title: "Account Name",
            dataIndex: "accountName",
            key: "accountName",
            render: (text) => (
                <Space>
                    <UserOutlined style={{ color: "#667eea" }} />
                    <span style={{ color: "#2D3748" }}>{text}</span>
                </Space>
            ),
        },
        {
            title: "Branch",
            dataIndex: "branchName",
            key: "branchName",
            render: (text) => (
                <Space>
                    <HomeOutlined style={{ color: "#667eea" }} />
                    <span style={{ color: "#2D3748" }}>{text}</span>
                </Space>
            ),
        },
        {
            title: "District",
            dataIndex: "districtName",
            key: "districtName",
            render: (text) => (
                <Tag color="blue">{text}</Tag>
            ),
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            render: (text) => (
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#2D3748" }}>
                    {text}
                </span>
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
                        title="Delete Bank Info"
                        description="Are you sure you want to delete this bank info?"
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
                            Bank Info Management
                        </h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>
                            Total {banks.length} bank accounts
                        </p>
                    </div>
                    <Space>
                        <Input
                            placeholder="Search by name, branch, district, code..."
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
                            Add Bank Info
                        </Button>
                    </Space>
                </div>

                {/* ── Table ── */}
                <Table
                    columns={columns}
                    dataSource={banks}
                    rowKey="_id"
                    loading={isDeleting}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} bank accounts`,
                    }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ padding: "20px", background: "#F7FAFC", borderRadius: "8px" }}>
                                <h4 style={{ margin: "0 0 15px", fontSize: "15px", fontWeight: "600", color: "#2D3748" }}>
                                    Detailed Information
                                </h4>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                    gap: "15px",
                                }}>
                                    {/* Bank Details */}
                                    <div style={{ padding: "15px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <BankOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Bank Details
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                ID: <Tag color="purple">{record.bankId}</Tag>
                                            </div>
                                            <div style={{ marginBottom: "6px" }}>
                                                Name: <strong style={{ color: "#2D3748" }}>{record.name}</strong>
                                            </div>
                                            <div>
                                                Code: <span style={{ fontFamily: "monospace", color: "#2D3748" }}>{record.code}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Info */}
                                    <div style={{ padding: "15px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <UserOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Account Information
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                Account Name:
                                            </div>
                                            <div>
                                                <strong style={{ color: "#2D3748" }}>{record.accountName}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div style={{ padding: "15px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <EnvironmentOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Location Details
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                <HomeOutlined style={{ marginRight: "5px", color: "#667eea" }} />
                                                Branch: <strong style={{ color: "#2D3748" }}>{record.branchName}</strong>
                                            </div>
                                            <div>
                                                District: <Tag color="blue">{record.districtName}</Tag>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Timestamps */}
                                    <div style={{ padding: "15px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <IdcardOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Record Info
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                Status: <Tag color={record.isActive ? "success" : "default"}>{record.isActive ? "Active" : "Inactive"}</Tag>
                                            </div>
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
                        <BankOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingItem ? "Edit Bank Info" : "Add New Bank Info"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }}
                footer={null}
                width={620}
                style={{ top: 30 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingItem ? handleUpdate : handleCreate}
                    style={{ marginTop: "20px" }}
                >
                    {/* Bank Info Section */}
                    <div style={{
                        background: "#F7FAFC",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                    }}>
                        <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600", color: "#2D3748" }}>
                            Bank Information
                        </h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Bank Name</span>}
                                name="name"
                                rules={[
                                    { required: true, message: "Please enter bank name" },
                                    { min: 2, message: "Name must be at least 2 characters" },
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    placeholder="e.g., Sonali Bank, DBBL"
                                    prefix={<BankOutlined style={{ color: "#667eea" }} />}
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Code / Account Number</span>}
                                name="code"
                                rules={[
                                    { required: true, message: "Please enter code" },
                                    { min: 2, message: "Code must be at least 2 characters" },
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    placeholder="e.g., ACC-123456789"
                                    prefix={<IdcardOutlined style={{ color: "#667eea" }} />}
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Account Name</span>}
                            name="accountName"
                            rules={[
                                { required: true, message: "Please enter account name" },
                                { min: 2, message: "Account name must be at least 2 characters" },
                            ]}
                            style={{ marginTop: "15px", marginBottom: 0 }}
                        >
                            <Input
                                placeholder="e.g., ABC Company Ltd"
                                prefix={<UserOutlined style={{ color: "#667eea" }} />}
                                style={{ height: "42px", borderRadius: "6px" }}
                            />
                        </Form.Item>
                    </div>

                    {/* Location Section */}
                    <div style={{
                        background: "#F7FAFC",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                    }}>
                        <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600", color: "#2D3748" }}>
                            Location Information
                        </h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Branch Name</span>}
                                name="branchName"
                                rules={[
                                    { required: true, message: "Please enter branch name" },
                                    { min: 2, message: "Branch name must be at least 2 characters" },
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    placeholder="e.g., Motijheel Branch"
                                    prefix={<HomeOutlined style={{ color: "#667eea" }} />}
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>District Name</span>}
                                name="districtName"
                                rules={[
                                    { required: true, message: "Please enter district name" },
                                    { min: 2, message: "District name must be at least 2 characters" },
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    placeholder="e.g., Dhaka, Chittagong"
                                    prefix={<EnvironmentOutlined style={{ color: "#667eea" }} />}
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>
                        </div>
                    </div>

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
                            {editingItem ? "Update Bank Info" : "Add Bank Info"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default BankInfoManagement;