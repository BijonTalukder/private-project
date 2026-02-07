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
    CheckCircleOutlined,
    CloseCircleOutlined,
    TeamOutlined,
    MobileOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useCreateClientMutation, useDeleteClientMutation, useGetAllClientsQuery, useToggleClientStatusMutation, useUpdateClientMutation, type Client } from "../../api/services/client/clientApi";


const ClientManagement = () => {
    // RTK Query hooks
    const { data: clients = [], isLoading, refetch } = useGetAllClientsQuery();
    const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
    const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
    const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();
    const [toggleStatus] = useToggleClientStatusMutation();

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // CRUD operations
    const handleCreate = async (values: any) => {
        try {
            await createClient(values).unwrap();
            message.success("Client created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create client");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingClient) return;

        try {
            await updateClient({
                id: editingClient._id,
                data: values
            }).unwrap();
            message.success("Client updated successfully!");
            setIsModalOpen(false);
            setEditingClient(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update client");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteClient(id).unwrap();
            message.success("Client deleted successfully!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete client");
        }
    };

    const handleToggleStatus = async (client: Client) => {
        try {
            await toggleStatus(client._id).unwrap();
            message.success(`Client ${!client.isActive ? 'activated' : 'deactivated'} successfully!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update status");
        }
    };

    // Modal handlers
    const openCreateModal = () => {
        setEditingClient(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        form.setFieldsValue({
            name: client.name,
            address: client.address,
            contactNo: client.contactNo,
            personalContactNo: client.personalContactNo,
            email: client.email,
            isActive: client.isActive
        });
        setIsModalOpen(true);
    };

    // Table columns
    const columns: ColumnsType<Client> = [
        {
            title: "Client ID",
            dataIndex: "clientId",
            key: "clientId",
            width: 120,
            render: (text: string) => (
                <Tag
                    color="purple"
                    style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        padding: "4px 10px",
                        fontWeight: "500"
                    }}
                >
                    {text}
                </Tag>
            )
        },
        {
            title: "Client Name",
            dataIndex: "name",
            key: "name",
            render: (text: string) => (
                <Space>
                    <TeamOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                    <span style={{ fontWeight: "500", fontSize: "14px" }}>
                        {text}
                    </span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const search = value.toString().toLowerCase();
                return (
                    record.name.toLowerCase().includes(search) ||
                    record.clientId.toLowerCase().includes(search) ||
                    record.contactNo.toLowerCase().includes(search) ||
                    record.email.toLowerCase().includes(search)
                );
            }
        },
        {
            title: "Contact No",
            dataIndex: "contactNo",
            key: "contactNo",
            width: 150,
            render: (text: string) => (
                <Space>
                    <PhoneOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontFamily: "monospace", fontSize: "13px" }}>
                        {text}
                    </span>
                </Space>
            )
        },
        {
            title: "Personal Contact",
            dataIndex: "personalContactNo",
            key: "personalContactNo",
            width: 150,
            render: (text: string) => (
                <Space>
                    <MobileOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontFamily: "monospace", fontSize: "13px" }}>
                        {text}
                    </span>
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
            render: (isActive: boolean, record: Client) => (
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
            render: (_, record: Client) => (
                <Space size="small">
                    <Tooltip title="Edit Client">
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
                        title="Delete Client"
                        description="Are you sure you want to delete this client?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete Client">
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
                            Client Management
                        </h2>
                        <p style={{
                            margin: "5px 0 0",
                            fontSize: "13px",
                            color: "#718096"
                        }}>
                            Total {clients.length} clients
                        </p>
                    </div>
                    <Space>
                        <Input
                            placeholder="Search by name, ID, phone, email..."
                            prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{
                                width: "320px",
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
                            Add Client
                        </Button>
                    </Space>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={clients}
                    rowKey="_id"
                    loading={isDeleting}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} clients`
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
                                    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                                    gap: "15px"
                                }}>
                                    {/* Address */}
                                    <div style={{
                                        padding: "15px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <EnvironmentOutlined style={{
                                                color: "#667eea",
                                                fontSize: "16px"
                                            }} />
                                            <span style={{
                                                fontWeight: "500",
                                                color: "#2D3748",
                                                fontSize: "14px"
                                            }}>
                                                Full Address
                                            </span>
                                        </Space>
                                        <div style={{
                                            color: "#718096",
                                            fontSize: "13px",
                                            marginTop: "8px",
                                            lineHeight: "1.6"
                                        }}>
                                            {record.address}
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div style={{
                                        padding: "15px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "12px" }}>
                                            <PhoneOutlined style={{
                                                color: "#667eea",
                                                fontSize: "16px"
                                            }} />
                                            <span style={{
                                                fontWeight: "500",
                                                color: "#2D3748",
                                                fontSize: "14px"
                                            }}>
                                                Contact Numbers
                                            </span>
                                        </Space>
                                        <div style={{ marginTop: "8px" }}>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: "8px"
                                            }}>
                                                <span style={{ color: "#718096", fontSize: "13px" }}>
                                                    Office:
                                                </span>
                                                <span style={{
                                                    color: "#2D3748",
                                                    fontFamily: "monospace",
                                                    fontSize: "13px",
                                                    fontWeight: "500"
                                                }}>
                                                    {record.contactNo}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between"
                                            }}>
                                                <span style={{ color: "#718096", fontSize: "13px" }}>
                                                    Personal:
                                                </span>
                                                <span style={{
                                                    color: "#2D3748",
                                                    fontFamily: "monospace",
                                                    fontSize: "13px",
                                                    fontWeight: "500"
                                                }}>
                                                    {record.personalContactNo}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Created Info */}
                                    <div style={{
                                        padding: "15px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <UserOutlined style={{
                                                color: "#667eea",
                                                fontSize: "16px"
                                            }} />
                                            <span style={{
                                                fontWeight: "500",
                                                color: "#2D3748",
                                                fontSize: "14px"
                                            }}>
                                                Account Information
                                            </span>
                                        </Space>
                                        <div style={{ marginTop: "8px" }}>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: "8px"
                                            }}>
                                                <span style={{ color: "#718096", fontSize: "13px" }}>
                                                    Client ID:
                                                </span>
                                                <Tag color="purple" style={{ fontFamily: "monospace" }}>
                                                    {record.clientId}
                                                </Tag>
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: "8px"
                                            }}>
                                                <span style={{ color: "#718096", fontSize: "13px" }}>
                                                    Status:
                                                </span>
                                                <Tag color={record.isActive ? "green" : "default"}>
                                                    {record.isActive ? "Active" : "Inactive"}
                                                </Tag>
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between"
                                            }}>
                                                <span style={{ color: "#718096", fontSize: "13px" }}>
                                                    Created:
                                                </span>
                                                <span style={{
                                                    color: "#2D3748",
                                                    fontSize: "13px"
                                                }}>
                                                    {new Date(record.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
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
                        <TeamOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingClient ? "Edit Client" : "Add New Client"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
                style={{ top: 30 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingClient ? handleUpdate : handleCreate}
                    style={{ marginTop: "20px" }}
                >
                    {/* Client Name */}
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Client Name</span>}
                        name="name"
                        rules={[
                            { required: true, message: "Please enter client name" },
                            { min: 2, message: "Name must be at least 2 characters" }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: "#667eea" }} />}
                            placeholder="Enter client name"
                            style={{
                                height: "42px",
                                borderRadius: "6px"
                            }}
                        />
                    </Form.Item>

                    {/* Address */}
                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[
                            { required: true, message: "Please enter address" }
                        ]}
                    >
                        <Input.TextArea placeholder="Address" />
                    </Form.Item>

                    {/* Contact Numbers */}
                    <div style={{
                        background: "#F7FAFC",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px"
                    }}>
                        <h4 style={{
                            margin: "0 0 15px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#2D3748"
                        }}>
                            Contact Information
                        </h4>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "15px"
                        }}>
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Contact No</span>}
                                name="contactNo"
                                rules={[
                                    { required: true, message: "Please enter contact number" },
                                    { pattern: /^[0-9+\-\s()]+$/, message: "Invalid phone number" }
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    prefix={<PhoneOutlined style={{ color: "#667eea" }} />}
                                    placeholder="Office phone"
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Personal Contact</span>}
                                name="personalContactNo"
                                rules={[
                                    { required: true, message: "Please enter personal contact" },
                                    { pattern: /^[0-9+\-\s()]+$/, message: "Invalid phone number" }
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    prefix={<MobileOutlined style={{ color: "#667eea" }} />}
                                    placeholder="Personal phone"
                                    style={{ height: "42px", borderRadius: "6px" }}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Email */}
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
                            placeholder="client@example.com"
                            style={{
                                height: "42px",
                                borderRadius: "6px"
                            }}
                        />
                    </Form.Item>

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
                                setEditingClient(null);
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
                            {editingClient ? "Update Client" : "Add Client"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ClientManagement;