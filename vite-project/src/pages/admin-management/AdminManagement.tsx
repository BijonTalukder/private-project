import { useState, useEffect } from "react";
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
    Select,
    Switch,
    Tabs,
    Checkbox
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    SearchOutlined,
    ReloadOutlined,
    LockOutlined,
    MailOutlined,
    SafetyOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
    useGetAllAdminsQuery,

    useCreateAdminMutation,
    useUpdateAdminMutation,
    useDeleteAdminMutation,
    useToggleAdminStatusMutation,

    type Admin,
    type Role,
    type Permission
} from "../../api/services/admin/adminApi";
import { useGetAllMenusQuery, type MenuItem } from "../../api/services/menu/menuApi";
import { useCreateRoleMutation, useGetAllRolesQuery, useUpdateRoleMutation } from "../../api/services/role/roleApi";

const AdminManagement = () => {
    // RTK Query hooks
    const { data: admins = [], isLoading: adminsLoading, refetch: refetchAdmins } = useGetAllAdminsQuery();
    const { data: roles = [], isLoading: rolesLoading, refetch: refetchRoles } = useGetAllRolesQuery();
    const { data: menus = [], isLoading: menusLoading } = useGetAllMenusQuery();

    const [createAdmin, { isLoading: isCreatingAdmin }] = useCreateAdminMutation();
    const [updateAdmin, { isLoading: isUpdatingAdmin }] = useUpdateAdminMutation();
    const [deleteAdmin, { isLoading: isDeletingAdmin }] = useDeleteAdminMutation();
    const [toggleAdminStatus] = useToggleAdminStatusMutation();

    const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [searchText, setSearchText] = useState("");
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<Record<string, Permission>>({});

    const [form] = Form.useForm();
    const [roleForm] = Form.useForm();

    // Admin CRUD operations
    const handleCreateAdmin = async (values: any) => {
        try {
            await createAdmin(values).unwrap();
            message.success("Admin created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create admin");
        }
    };

    const handleUpdateAdmin = async (values: any) => {
        if (!editingAdmin) return;

        try {
            await updateAdmin({
                id: editingAdmin._id,
                data: values
            }).unwrap();
            message.success("Admin updated successfully!");
            setIsModalOpen(false);
            setEditingAdmin(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update admin");
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        try {
            await deleteAdmin(id).unwrap();
            message.success("Admin deleted successfully!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete admin");
        }
    };

    const handleToggleStatus = async (admin: Admin) => {
        try {
            await toggleAdminStatus(admin._id).unwrap();
            message.success(`Admin ${!admin.isActive ? 'activated' : 'deactivated'} successfully!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update status");
        }
    };

    // Role CRUD operations
    const handleCreateRole = async (values: any) => {
        try {
            const permissions = Object.values(selectedRolePermissions);

            await createRole({
                name: values.name,
                permissions
            }).unwrap();

            message.success("Role created successfully!");
            setIsRoleModalOpen(false);
            roleForm.resetFields();
            setSelectedRolePermissions({});
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create role");
        }
    };

    const handleUpdateRole = async (values: any) => {
        if (!editingRole) return;

        try {
            const permissions = Object.values(selectedRolePermissions);

            await updateRole({
                id: editingRole._id,
                data: {
                    name: values.name,
                    permissions
                }
            }).unwrap();

            message.success("Role updated successfully!");
            setIsRoleModalOpen(false);
            setEditingRole(null);
            roleForm.resetFields();
            setSelectedRolePermissions({});
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update role");
        }
    };

    // Modal handlers
    const openCreateAdminModal = () => {
        setEditingAdmin(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditAdminModal = (admin: Admin) => {
        setEditingAdmin(admin);
        form.setFieldsValue({
            email: admin.email,
            role: admin.role._id,
            isActive: admin.isActive
        });
        setIsModalOpen(true);
    };

    const openCreateRoleModal = () => {
        setEditingRole(null);
        roleForm.resetFields();
        setSelectedRolePermissions({});
        setIsRoleModalOpen(true);
    };

    const openEditRoleModal = (role: Role) => {
        setEditingRole(role);
        roleForm.setFieldsValue({
            name: role.name
        });

        // Set existing permissions
        const permissionsMap: Record<string, Permission> = {};
        role.permissions.forEach(perm => {
            permissionsMap[perm.menuId] = perm;
        });
        setSelectedRolePermissions(permissionsMap);
        setIsRoleModalOpen(true);
    };

    // Permission handlers
    const handlePermissionChange = (
        menuId: string,
        menuName: string,
        menuKey: string,
        permission: keyof Omit<Permission, 'menuId' | 'menuName' | 'menuKey'>,
        checked: boolean
    ) => {
        setSelectedRolePermissions(prev => {
            const current = prev[menuId] || {
                menuId,
                menuName,
                menuKey,
                create: false,
                read: false,
                update: false,
                delete: false
            };

            return {
                ...prev,
                [menuId]: {
                    ...current,
                    [permission]: checked
                }
            };
        });
    };

    // Table columns
    const adminColumns: ColumnsType<Admin> = [
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (text: string) => (
                <Space>
                    <MailOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontWeight: "500" }}>{text}</span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const search = value.toString().toLowerCase();
                return (
                    record.email.toLowerCase().includes(search) ||
                    record.role.name.toLowerCase().includes(search)
                );
            }
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role: Role) => (
                <Tag
                    color="purple"
                    icon={<SafetyOutlined />}
                    style={{
                        fontSize: "13px",
                        padding: "4px 12px",
                        borderRadius: "4px"
                    }}
                >
                    {role?.name}
                </Tag>
            )
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            render: (isActive: boolean, record: Admin) => (
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
            title: "Permissions",
            key: "permissions",
            render: (_, record: Admin) => (
                <Tag color="blue">
                    {record?.role?.permissions.length} menus
                </Tag>
            )
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => (
                <span style={{ color: "#718096", fontSize: "13px" }}>
                    {new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            )
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record: Admin) => (
                <Space size="small">
                    <Tooltip title="Edit Admin">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditAdminModal(record)}
                            style={{
                                color: "#667eea",
                                borderRadius: "6px"
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Admin"
                        description="Are you sure you want to delete this admin?"
                        onConfirm={() => handleDeleteAdmin(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete Admin">
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

    const roleColumns: ColumnsType<Role> = [
        {
            title: "Role Name",
            dataIndex: "name",
            key: "name",
            render: (text: string) => (
                <Space>
                    <SafetyOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                    <span style={{ fontWeight: "500", fontSize: "14px" }}>{text}</span>
                </Space>
            )
        },
        {
            title: "Permissions",
            key: "permissions",
            render: (_, record: Role) => (
                <Tag color="green" style={{ fontSize: "13px" }}>
                    {record.permissions.length} menus configured
                </Tag>
            )
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => (
                <span style={{ color: "#718096", fontSize: "13px" }}>
                    {new Date(date).toLocaleDateString()}
                </span>
            )
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (_, record: Role) => (
                <Space size="small">
                    <Tooltip title="Edit Role">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditRoleModal(record)}
                            style={{ color: "#667eea" }}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    // Loading state
    if (adminsLoading || rolesLoading || menusLoading) {
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
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }}
            >
                <Tabs
                    defaultActiveKey="admins"
                    items={[
                        {
                            key: 'admins',
                            label: (
                                <span>
                                    <UserOutlined /> Admin Users
                                </span>
                            ),
                            children: (
                                <>
                                    {/* Admin Management Header */}
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
                                                Admin Users
                                            </h2>
                                            <p style={{
                                                margin: "5px 0 0",
                                                fontSize: "13px",
                                                color: "#718096"
                                            }}>
                                                Total {admins.length} administrators
                                            </p>
                                        </div>
                                        <Space>
                                            <Input
                                                placeholder="Search by email or role..."
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
                                                    onClick={() => refetchAdmins()}
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
                                                onClick={openCreateAdminModal}
                                                style={{
                                                    height: "40px",
                                                    borderRadius: "6px",
                                                    background: "linear-gradient(to right, #667eea, #764ba2)",
                                                    border: "none",
                                                    fontWeight: "500"
                                                }}
                                            >
                                                Create Admin
                                            </Button>
                                        </Space>
                                    </div>

                                    {/* Admin Table */}
                                    <Table
                                        columns={adminColumns}
                                        dataSource={admins}
                                        rowKey="_id"
                                        loading={isDeletingAdmin}
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            showTotal: (total) => `Total ${total} admins`
                                        }}
                                        expandable={{
                                            expandedRowRender: (record) => (
                                                <div style={{
                                                    padding: "20px",
                                                    background: "#F7FAFC",
                                                    borderRadius: "8px"
                                                }}>
                                                    <h4 style={{ marginBottom: "15px", color: "#2D3748" }}>
                                                        Menu Permissions
                                                    </h4>
                                                    <div style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                                        gap: "12px"
                                                    }}>
                                                        {record.role.permissions.map((perm) => (
                                                            <div
                                                                key={perm.menuId}
                                                                style={{
                                                                    padding: "12px",
                                                                    background: "#fff",
                                                                    borderRadius: "6px",
                                                                    border: "1px solid #E2E8F0"
                                                                }}
                                                            >
                                                                <div style={{
                                                                    fontWeight: "500",
                                                                    marginBottom: "8px",
                                                                    color: "#2D3748"
                                                                }}>
                                                                    {perm.menuName}
                                                                </div>
                                                                <Space size="small" wrap>
                                                                    {perm.create && <Tag color="green">Create</Tag>}
                                                                    {perm.read && <Tag color="blue">Read</Tag>}
                                                                    {perm.update && <Tag color="orange">Update</Tag>}
                                                                    {perm.delete && <Tag color="red">Delete</Tag>}
                                                                </Space>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        }}
                                    />
                                </>
                            )
                        },
                        {
                            key: 'roles',
                            label: (
                                <span>
                                    <SafetyOutlined /> Roles & Permissions
                                </span>
                            ),
                            children: (
                                <>
                                    {/* Role Management Header */}
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
                                                Roles & Permissions
                                            </h2>
                                            <p style={{
                                                margin: "5px 0 0",
                                                fontSize: "13px",
                                                color: "#718096"
                                            }}>
                                                Manage roles and menu permissions
                                            </p>
                                        </div>
                                        <Space>
                                            <Tooltip title="Refresh">
                                                <Button
                                                    icon={<ReloadOutlined />}
                                                    onClick={() => refetchRoles()}
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
                                                onClick={openCreateRoleModal}
                                                style={{
                                                    height: "40px",
                                                    borderRadius: "6px",
                                                    background: "linear-gradient(to right, #667eea, #764ba2)",
                                                    border: "none",
                                                    fontWeight: "500"
                                                }}
                                            >
                                                Create Role
                                            </Button>
                                        </Space>
                                    </div>

                                    {/* Role Table */}
                                    <Table
                                        columns={roleColumns}
                                        dataSource={roles}
                                        rowKey="_id"
                                        pagination={{
                                            pageSize: 10,
                                            showTotal: (total) => `Total ${total} roles`
                                        }}
                                        expandable={{
                                            expandedRowRender: (record) => (
                                                <div style={{
                                                    padding: "20px",
                                                    background: "#F7FAFC",
                                                    borderRadius: "8px"
                                                }}>
                                                    <h4 style={{ marginBottom: "15px", color: "#2D3748" }}>
                                                        Configured Permissions
                                                    </h4>
                                                    <Table
                                                        dataSource={record.permissions}
                                                        rowKey="menuId"
                                                        pagination={false}
                                                        size="small"
                                                        columns={[
                                                            {
                                                                title: "Menu",
                                                                dataIndex: "menuName",
                                                                key: "menuName"
                                                            },
                                                            {
                                                                title: "Permissions",
                                                                key: "permissions",
                                                                render: (_, perm) => (
                                                                    <Space size="small">
                                                                        {perm.create && <Tag color="green">Create</Tag>}
                                                                        {perm.read && <Tag color="blue">Read</Tag>}
                                                                        {perm.update && <Tag color="orange">Update</Tag>}
                                                                        {perm.delete && <Tag color="red">Delete</Tag>}
                                                                    </Space>
                                                                )
                                                            }
                                                        ]}
                                                    />
                                                </div>
                                            )
                                        }}
                                    />
                                </>
                            )
                        }
                    ]}
                />
            </Card>

            {/* Create/Edit Admin Modal */}
            <Modal
                title={
                    <div style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2D3748",
                        padding: "10px 0"
                    }}>
                        <UserOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingAdmin ? "Edit Admin" : "Create New Admin"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingAdmin(null);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
                    style={{ marginTop: "20px" }}
                >
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Email</span>}
                        name="email"
                        rules={[
                            { required: true, message: "Please enter email" },
                            { type: "email", message: "Please enter valid email" }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: "#667eea" }} />}
                            placeholder="admin@example.com"
                            disabled={!!editingAdmin}
                            style={{
                                height: "42px",
                                borderRadius: "6px"
                            }}
                        />
                    </Form.Item>

                    {!editingAdmin && (
                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Password</span>}
                            name="password"
                            rules={[
                                { required: true, message: "Please enter password" },
                                { min: 6, message: "Password must be at least 6 characters" }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: "#667eea" }} />}
                                placeholder="Enter password"
                                style={{
                                    height: "42px",
                                    borderRadius: "6px"
                                }}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Role</span>}
                        name="role"
                        rules={[{ required: true, message: "Please select role" }]}
                    >
                        <Select
                            placeholder="Select role"
                            style={{ height: "42px" }}
                        >
                            {roles.map(role => (
                                <Select.Option key={role._id} value={role._id}>
                                    {role.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

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
                                setEditingAdmin(null);
                                form.resetFields();
                            }}
                            style={{
                                height: "42px",
                                borderRadius: "6px"
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isCreatingAdmin || isUpdatingAdmin}
                            style={{
                                height: "42px",
                                borderRadius: "6px",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                fontWeight: "500"
                            }}
                        >
                            {editingAdmin ? "Update Admin" : "Create Admin"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Create/Edit Role Modal */}
            <Modal
                title={
                    <div style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2D3748",
                        padding: "10px 0"
                    }}>
                        <SafetyOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingRole ? "Edit Role" : "Create New Role"}
                    </div>
                }
                open={isRoleModalOpen}
                onCancel={() => {
                    setIsRoleModalOpen(false);
                    setEditingRole(null);
                    roleForm.resetFields();
                    setSelectedRolePermissions({});
                }}
                footer={null}
                width={800}
                style={{ top: 20 }}
            >
                <Form
                    form={roleForm}
                    layout="vertical"
                    onFinish={editingRole ? handleUpdateRole : handleCreateRole}
                    style={{ marginTop: "20px" }}
                >
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Role Name</span>}
                        name="name"
                        rules={[{ required: true, message: "Please enter role name" }]}
                    >
                        <Input
                            placeholder="e.g., Super Admin, Manager, Editor"
                            style={{
                                height: "42px",
                                borderRadius: "6px"
                            }}
                        />
                    </Form.Item>

                    <div style={{
                        background: "#F7FAFC",
                        padding: "20px",
                        borderRadius: "8px",
                        marginTop: "20px"
                    }}>
                        <h4 style={{
                            margin: "0 0 15px",
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#2D3748"
                        }}>
                            Menu Permissions
                        </h4>

                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                            {menus.map((menu: MenuItem) => {
                                const menuPerm = selectedRolePermissions[menu._id];

                                return (
                                    <div
                                        key={menu._id}
                                        style={{
                                            padding: "15px",
                                            background: "#fff",
                                            borderRadius: "6px",
                                            marginBottom: "12px",
                                            border: "1px solid #E2E8F0"
                                        }}
                                    >
                                        <div style={{
                                            fontWeight: "500",
                                            marginBottom: "10px",
                                            color: "#2D3748",
                                            fontSize: "14px"
                                        }}>
                                            {menu.name}
                                            <Tag
                                                color="blue"
                                                style={{
                                                    marginLeft: "8px",
                                                    fontSize: "11px"
                                                }}
                                            >
                                                {menu.key}
                                            </Tag>
                                        </div>

                                        <Space size="large">
                                            <Checkbox
                                                checked={menuPerm?.create || false}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        menu._id,
                                                        menu.name,
                                                        menu.key,
                                                        'create',
                                                        e.target.checked
                                                    )
                                                }
                                            >
                                                <Tag color="green">Create</Tag>
                                            </Checkbox>

                                            <Checkbox
                                                checked={menuPerm?.read || false}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        menu._id,
                                                        menu.name,
                                                        menu.key,
                                                        'read',
                                                        e.target.checked
                                                    )
                                                }
                                            >
                                                <Tag color="blue">Read</Tag>
                                            </Checkbox>

                                            <Checkbox
                                                checked={menuPerm?.update || false}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        menu._id,
                                                        menu.name,
                                                        menu.key,
                                                        'update',
                                                        e.target.checked
                                                    )
                                                }
                                            >
                                                <Tag color="orange">Update</Tag>
                                            </Checkbox>

                                            <Checkbox
                                                checked={menuPerm?.delete || false}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        menu._id,
                                                        menu.name,
                                                        menu.key,
                                                        'delete',
                                                        e.target.checked
                                                    )
                                                }
                                            >
                                                <Tag color="red">Delete</Tag>
                                            </Checkbox>
                                        </Space>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

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
                                setIsRoleModalOpen(false);
                                setEditingRole(null);
                                roleForm.resetFields();
                                setSelectedRolePermissions({});
                            }}
                            style={{
                                height: "42px",
                                borderRadius: "6px"
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isCreatingRole || isUpdatingRole}
                            style={{
                                height: "42px",
                                borderRadius: "6px",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                fontWeight: "500"
                            }}
                        >
                            {editingRole ? "Update Role" : "Create Role"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminManagement;