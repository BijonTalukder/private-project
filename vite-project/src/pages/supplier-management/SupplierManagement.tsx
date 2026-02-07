import { useState } from "react";
import {
    Button,
    Table,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Space,
    Card,
    Tag,
    Tooltip,
    Spin,
    Switch
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    IdcardOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ShopOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useCreateSupplierMutation, useDeleteSupplierMutation, useGetAllSuppliersQuery, useToggleSupplierStatusMutation, useUpdateSupplierMutation, type Supplier } from "../../api/services/supplier/supplierApi";


const SupplierManagement = () => {
    // RTK Query hooks
    const { data: suppliers = [], isLoading, refetch } = useGetAllSuppliersQuery();
    const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
    const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
    const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();
    const [toggleStatus] = useToggleSupplierStatusMutation();

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // CRUD operations
    const handleCreate = async (values: any) => {
        try {
            await createSupplier(values).unwrap();
            message.success("Supplier created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create supplier");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingSupplier) return;

        try {
            await updateSupplier({
                id: editingSupplier._id,
                data: values
            }).unwrap();
            message.success("Supplier updated successfully!");
            setIsModalOpen(false);
            setEditingSupplier(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update supplier");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSupplier(id).unwrap();
            message.success("Supplier deleted successfully!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete supplier");
        }
    };

    const handleToggleStatus = async (supplier: Supplier) => {
        try {
            await toggleStatus(supplier._id).unwrap();
            message.success(`Supplier ${!supplier.isActive ? 'activated' : 'deactivated'} successfully!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update status");
        }
    };

    // Modal handlers
    const openCreateModal = () => {
        setEditingSupplier(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        form.setFieldsValue({
            supplierName: supplier.supplierName,
            supplierCode: supplier.supplierCode,
            contactPerson: supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            gstNumber: supplier.gstNumber,
            tinNumber: supplier.tinNumber,
            licenseNumber: supplier.licenseNumber,
            isActive: supplier.isActive
        });
        setIsModalOpen(true);
    };

    // Table columns
    const columns: ColumnsType<Supplier> = [
        {
            title: "Supplier ID",
            dataIndex: "supplierId",
            key: "supplierId",
            width: 120,
            render: (text: string) => (
                <Tag
                    color="blue"
                    style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        padding: "4px 10px"
                    }}
                >
                    {text}
                </Tag>
            )
        },
        {
            title: "Supplier Name",
            dataIndex: "supplierName",
            key: "supplierName",
            render: (text: string, record: Supplier) => (
                <Space>
                    <ShopOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                    <div>
                        <div style={{ fontWeight: "500", fontSize: "14px" }}>
                            {text}
                        </div>
                        {record.supplierCode && (
                            <div style={{ fontSize: "12px", color: "#718096" }}>
                                Code: {record.supplierCode}
                            </div>
                        )}
                    </div>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const search = value.toString().toLowerCase();
                return (
                    record.supplierName.toLowerCase().includes(search) ||
                    record.supplierCode?.toLowerCase().includes(search) ||
                    record.contactPerson.toLowerCase().includes(search) ||
                    record.phone.toLowerCase().includes(search)
                );
            }
        },
        {
            title: "Contact Person",
            dataIndex: "contactPerson",
            key: "contactPerson",
            render: (text: string) => (
                <Space>
                    <UserOutlined style={{ color: "#667eea" }} />
                    <span>{text}</span>
                </Space>
            )
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            render: (text: string) => (
                <Space>
                    <PhoneOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontFamily: "monospace" }}>{text}</span>
                </Space>
            )
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (text: string) => (
                <Space>
                    <MailOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontSize: "13px" }}>{text}</span>
                </Space>
            )
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            width: 100,
            render: (isActive: boolean, record: Supplier) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleStatus(record)}
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<CloseCircleOutlined />}
                    style={{
                        backgroundColor: isActive ? "#52c41a" : "#d9d9d9"
                    }}
                />
            )
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record: Supplier) => (
                <Space size="small">
                    <Tooltip title="Edit Supplier">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                            style={{
                                color: "#667eea",
                                borderRadius: "6px"
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Supplier"
                        description="Are you sure you want to delete this supplier?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete Supplier">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                style={{ borderRadius: "6px" }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Loading state
    if (isLoading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "30px"
        }}>
            <Card
                style={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    border: "1px solid #e0e0e0"
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    paddingBottom: "15px",
                    borderBottom: "2px solid #E2E8F0"
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#2D3748"
                        }}>
                            Supplier Management
                        </h2>
                        <p style={{
                            margin: "5px 0 0",
                            fontSize: "13px",
                            color: "#718096"
                        }}>
                            Total {suppliers.length} suppliers
                        </p>
                    </div>
                    <Space>
                        <Input
                            placeholder="Search by name, code, contact..."
                            prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{
                                width: "300px",
                                height: "40px",
                                borderRadius: "6px"
                            }}
                        />
                        <Tooltip title="Refresh">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => refetch()}
                                style={{
                                    height: "40px",
                                    borderRadius: "6px",
                                    borderColor: "#667eea",
                                    color: "#667eea"
                                }}
                            />
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreateModal}
                            style={{
                                height: "40px",
                                borderRadius: "6px",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                                fontWeight: "500"
                            }}
                        >
                            Add Supplier
                        </Button>
                    </Space>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={suppliers}
                    rowKey="_id"
                    loading={isDeleting}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} suppliers`
                    }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{
                                padding: "20px",
                                background: "#F7FAFC",
                                borderRadius: "8px"
                            }}>
                                <h4 style={{
                                    margin: "0 0 15px",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    color: "#2D3748"
                                }}>
                                    Detailed Information
                                </h4>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                    gap: "15px"
                                }}>
                                    {/* Address */}
                                    <div style={{
                                        padding: "12px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <EnvironmentOutlined style={{ color: "#667eea" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748" }}>
                                                Address
                                            </span>
                                        </Space>
                                        <div style={{ color: "#718096", fontSize: "13px" }}>
                                            {record.address || "Not provided"}
                                        </div>
                                    </div>

                                    {/* GST Number */}
                                    {record.gstNumber && (
                                        <div style={{
                                            padding: "12px",
                                            background: "#fff",
                                            borderRadius: "6px",
                                            border: "1px solid #E2E8F0"
                                        }}>
                                            <Space style={{ marginBottom: "8px" }}>
                                                <IdcardOutlined style={{ color: "#667eea" }} />
                                                <span style={{ fontWeight: "500", color: "#2D3748" }}>
                                                    GST Number
                                                </span>
                                            </Space>
                                            <div style={{
                                                color: "#718096",
                                                fontSize: "13px",
                                                fontFamily: "monospace"
                                            }}>
                                                {record.gstNumber}
                                            </div>
                                        </div>
                                    )}

                                    {/* TIN Number */}
                                    {record.tinNumber && (
                                        <div style={{
                                            padding: "12px",
                                            background: "#fff",
                                            borderRadius: "6px",
                                            border: "1px solid #E2E8F0"
                                        }}>
                                            <Space style={{ marginBottom: "8px" }}>
                                                <IdcardOutlined style={{ color: "#667eea" }} />
                                                <span style={{ fontWeight: "500", color: "#2D3748" }}>
                                                    TIN Number
                                                </span>
                                            </Space>
                                            <div style={{
                                                color: "#718096",
                                                fontSize: "13px",
                                                fontFamily: "monospace"
                                            }}>
                                                {record.tinNumber}
                                            </div>
                                        </div>
                                    )}

                                    {/* License Number */}
                                    {record.licenseNumber && (
                                        <div style={{
                                            padding: "12px",
                                            background: "#fff",
                                            borderRadius: "6px",
                                            border: "1px solid #E2E8F0"
                                        }}>
                                            <Space style={{ marginBottom: "8px" }}>
                                                <IdcardOutlined style={{ color: "#667eea" }} />
                                                <span style={{ fontWeight: "500", color: "#2D3748" }}>
                                                    License Number
                                                </span>
                                            </Space>
                                            <div style={{
                                                color: "#718096",
                                                fontSize: "13px",
                                                fontFamily: "monospace"
                                            }}>
                                                {record.licenseNumber}
                                            </div>
                                        </div>
                                    )}

                                    {/* Created Date */}
                                    <div style={{
                                        padding: "12px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <span style={{ fontWeight: "500", color: "#2D3748" }}>
                                                Created Date
                                            </span>
                                        </Space>
                                        <div style={{ color: "#718096", fontSize: "13px" }}>
                                            {new Date(record.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={
                    <div style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2D3748",
                        padding: "10px 0"
                    }}>
                        <ShopOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingSupplier(null);
                    form.resetFields();
                }}
                footer={null}
                width={700}
                style={{ top: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingSupplier ? handleUpdate : handleCreate}
                    style={{ marginTop: "20px" }}
                >
                    {/* Basic Information */}
                    <div style={{
                        background: "#F7FAFC",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px"
                    }}>
                        <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600" }}>
                            Basic Information
                        </h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Supplier Name</span>}
                                name="supplierName"
                                rules={[{ required: true, message: "Please enter supplier name" }]}
                            >
                                <Input
                                    prefix={<ShopOutlined style={{ color: "#667eea" }} />}
                                    placeholder="e.g., MSA, Nakul"
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Supplier Code</span>}
                                name="supplierCode"
                            >
                                <Input
                                    placeholder="e.g., SUP-001 (Optional)"
                                    style={{
                                        height: "42px",
                                        borderRadius: "6px",
                                        fontFamily: "monospace"
                                    }}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div style={{
                        background: "#F7FAFC",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px"
                    }}>
                        <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600" }}>
                            Contact Information
                        </h4>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Contact Person</span>}
                            name="contactPerson"
                            rules={[{ required: true, message: "Please enter contact person name" }]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: "#667eea" }} />}
                                placeholder="Contact person name"
                                style={{ height: "42px", borderRadius: "6px" }}
                            />
                        </Form.Item>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Phone</span>}
                                name="phone"
                                rules={[
                                    { required: true, message: "Please enter phone number" },
                                    { pattern: /^[0-9+\-\s()]+$/, message: "Invalid phone number" }
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined style={{ color: "#667eea" }} />}
                                    placeholder="+880 1XXXXXXXXX"
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Email</span>}
                                name="email"
                                rules={[
                                    { required: true, message: "Please enter email" },
                                    { type: "email", message: "Invalid email format" }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined style={{ color: "#667eea" }} />}
                                    placeholder="supplier@example.com"
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Address</span>}
                            name="address"
                        >
                            <Input.TextArea
                                placeholder="Full address"
                                rows={3}
                                style={{ borderRadius: "6px" }}
                            />
                        </Form.Item>
                    </div>

                    {/* Tax & License Information */}
                    <div style={{
                        background: "#F7FAFC",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px"
                    }}>
                        <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600" }}>
                            Tax & License Information (Optional)
                        </h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>GST Number</span>}
                                name="gstNumber"
                            >
                                <Input
                                    prefix={<IdcardOutlined style={{ color: "#667eea" }} />}
                                    placeholder="GST registration number"
                                    style={{
                                        height: "42px",
                                        borderRadius: "6px",
                                        fontFamily: "monospace"
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>TIN Number</span>}
                                name="tinNumber"
                            >
                                <Input
                                    prefix={<IdcardOutlined style={{ color: "#667eea" }} />}
                                    placeholder="TIN number"
                                    style={{
                                        height: "42px",
                                        borderRadius: "6px",
                                        fontFamily: "monospace"
                                    }}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>License Number</span>}
                            name="licenseNumber"
                        >
                            <Input
                                prefix={<IdcardOutlined style={{ color: "#667eea" }} />}
                                placeholder="Business license number"
                                style={{
                                    height: "42px",
                                    borderRadius: "6px",
                                    fontFamily: "monospace"
                                }}
                            />
                        </Form.Item>
                    </div>

                    {/* Status */}
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Status</span>}
                        name="isActive"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                        />
                    </Form.Item>

                    {/* Footer Buttons */}
                    <div style={{
                        marginTop: "25px",
                        paddingTop: "20px",
                        borderTop: "1px solid #E2E8F0",
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end"
                    }}>
                        <Button
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingSupplier(null);
                                form.resetFields();
                            }}
                            style={{
                                height: "42px",
                                borderRadius: "6px",
                                minWidth: "100px"
                            }}
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
                                minWidth: "100px"
                            }}
                        >
                            {editingSupplier ? "Update Supplier" : "Add Supplier"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default SupplierManagement;