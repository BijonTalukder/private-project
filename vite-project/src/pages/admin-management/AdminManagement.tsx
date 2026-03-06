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
    const { data: admins = [], isLoading: adminsLoading, refetch: refetchAdmins } = useGetAllAdminsQuery();
    const { data: roles = [], isLoading: rolesLoading, refetch: refetchRoles } = useGetAllRolesQuery();
    const { data: menus = [], isLoading: menusLoading } = useGetAllMenusQuery();

    const [createAdmin, { isLoading: isCreatingAdmin }] = useCreateAdminMutation();
    const [updateAdmin, { isLoading: isUpdatingAdmin }] = useUpdateAdminMutation();
    const [deleteAdmin, { isLoading: isDeletingAdmin }] = useDeleteAdminMutation();
    const [toggleAdminStatus] = useToggleAdminStatusMutation();

    const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [searchText, setSearchText] = useState("");
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<Record<string, Permission>>({});

    const [form] = Form.useForm();
    const [roleForm] = Form.useForm();

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
            await updateAdmin({ id: editingAdmin._id, data: values }).unwrap();
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

    const handleCreateRole = async (values: any) => {
        try {
            const permissions = Object.values(selectedRolePermissions);
            await createRole({ name: values.name, permissions }).unwrap();
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
            await updateRole({ id: editingRole._id, data: { name: values.name, permissions } }).unwrap();
            message.success("Role updated successfully!");
            setIsRoleModalOpen(false);
            setEditingRole(null);
            roleForm.resetFields();
            setSelectedRolePermissions({});
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update role");
        }
    };

    const openCreateAdminModal = () => {
        setEditingAdmin(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditAdminModal = (admin: Admin) => {
        setEditingAdmin(admin);
        form.setFieldsValue({ email: admin.email, role: admin.role._id, isActive: admin.isActive });
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
        roleForm.setFieldsValue({ name: role.name });
        const permissionsMap: Record<string, Permission> = {};
        role.permissions.forEach(perm => { permissionsMap[perm.menuId] = perm; });
        setSelectedRolePermissions(permissionsMap);
        setIsRoleModalOpen(true);
    };

    const handlePermissionChange = (menuId: string, menuName: string, menuKey: string, permission: keyof Omit<Permission, 'menuId' | 'menuName' | 'menuKey'>, checked: boolean) => {
        setSelectedRolePermissions(prev => {
            const current = prev[menuId] || { menuId, menuName, menuKey, create: false, read: false, update: false, delete: false };
            return { ...prev, [menuId]: { ...current, [permission]: checked } };
        });
    };

    const adminColumns: ColumnsType<Admin> = [
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (text: string) => (
                <Space className="email-cell">
                    <MailOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontWeight: "500" }}>{text}</span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const search = value.toString().toLowerCase();
                return record.email.toLowerCase().includes(search) || record.role.name.toLowerCase().includes(search);
            }
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role: Role) => (
                <Tag color="purple" icon={<SafetyOutlined />} className="role-tag">
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
                    style={{ backgroundColor: isActive ? "#52c41a" : "#d9d9d9" }}
                />
            )
        },
        {
            title: "Permissions",
            key: "permissions",
            render: (_, record: Admin) => <Tag color="blue">{record?.role?.permissions.length} menus</Tag>,
            responsive: ['md'] as any,
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => (
                <span className="date-cell">
                    {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
            ),
            responsive: ['lg'] as any,
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record: Admin) => (
                <Space size="small">
                    <Tooltip title="Edit"><Button type="text" icon={<EditOutlined />} onClick={() => openEditAdminModal(record)} style={{ color: "#667eea", borderRadius: "6px" }} /></Tooltip>
                    <Popconfirm title="Delete Admin" description="Are you sure?" onConfirm={() => handleDeleteAdmin(record._id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                        <Tooltip title="Delete"><Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: "6px" }} /></Tooltip>
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
            render: (_, record: Role) => <Tag color="green" style={{ fontSize: "13px" }}>{record.permissions.length} menus</Tag>
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => <span className="date-cell">{new Date(date).toLocaleDateString()}</span>,
            responsive: ['md'] as any,
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (_, record: Role) => (
                <Tooltip title="Edit"><Button type="text" icon={<EditOutlined />} onClick={() => openEditRoleModal(record)} style={{ color: "#667eea" }} /></Tooltip>
            )
        }
    ];

    if (adminsLoading || rolesLoading || menusLoading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div className="admin-container" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "30px" }}>
                <Card style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                    <Tabs
                        defaultActiveKey="admins"
                        items={[
                            {
                                key: 'admins',
                                label: <span><UserOutlined /> <span className="tab-label">Admin Users</span></span>,
                                children: (
                                    <>
                                        <div className="section-header">
                                            <div className="header-title">
                                                <h2>Admin Users</h2>
                                                <p>Total {admins.length} administrators</p>
                                            </div>
                                            <Space className="header-actions">
                                                <Input placeholder="Search..." prefix={<SearchOutlined style={{ color: "#667eea" }} />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear className="search-input" />
                                                <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetchAdmins()} className="action-btn refresh-btn" /></Tooltip>
                                                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateAdminModal} className="action-btn create-btn"><span className="btn-label">Create</span></Button>
                                            </Space>
                                        </div>
                                        <Table
                                            columns={adminColumns}
                                            dataSource={admins}
                                            rowKey="_id"
                                            loading={isDeletingAdmin}
                                            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} admins` }}
                                            expandable={{
                                                expandedRowRender: (record) => (
                                                    <div className="expanded-content">
                                                        <h4>Menu Permissions</h4>
                                                        <div className="permissions-grid">
                                                            {record.role.permissions.map((perm) => (
                                                                <div key={perm.menuId} className="permission-card">
                                                                    <div className="permission-name">{perm.menuName}</div>
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
                                label: <span><SafetyOutlined /> <span className="tab-label">Roles</span></span>,
                                children: (
                                    <>
                                        <div className="section-header">
                                            <div className="header-title">
                                                <h2>Roles & Permissions</h2>
                                                <p>Manage roles and menu permissions</p>
                                            </div>
                                            <Space className="header-actions">
                                                <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetchRoles()} className="action-btn refresh-btn" /></Tooltip>
                                                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateRoleModal} className="action-btn create-btn"><span className="btn-label">Create</span></Button>
                                            </Space>
                                        </div>
                                        <Table
                                            columns={roleColumns}
                                            dataSource={roles}
                                            rowKey="_id"
                                            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} roles` }}
                                            expandable={{
                                                expandedRowRender: (record) => (
                                                    <div className="expanded-content">
                                                        <h4>Configured Permissions</h4>
                                                        <Table dataSource={record.permissions} rowKey="menuId" pagination={false} size="small" columns={[
                                                            { title: "Menu", dataIndex: "menuName", key: "menuName" },
                                                            {
                                                                title: "Permissions", key: "permissions", render: (_, perm) => (
                                                                    <Space size="small">
                                                                        {perm.create && <Tag color="green">Create</Tag>}
                                                                        {perm.read && <Tag color="blue">Read</Tag>}
                                                                        {perm.update && <Tag color="orange">Update</Tag>}
                                                                        {perm.delete && <Tag color="red">Delete</Tag>}
                                                                    </Space>
                                                                )
                                                            }
                                                        ]} />
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

                {/* Admin Modal */}
                <Modal title={<div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}><UserOutlined style={{ marginRight: "8px", color: "#667eea" }} />{editingAdmin ? "Edit Admin" : "Create Admin"}</div>} open={isModalOpen} onCancel={() => { setIsModalOpen(false); setEditingAdmin(null); form.resetFields(); }} footer={null} width={500}>
                    <Form form={form} layout="vertical" onFinish={editingAdmin ? handleUpdateAdmin : handleCreateAdmin} style={{ marginTop: "20px" }}>
                        <Form.Item label={<span style={{ fontWeight: "500" }}>Email</span>} name="email" rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Please enter valid email" }]}>
                            <Input prefix={<MailOutlined style={{ color: "#667eea" }} />} placeholder="admin@example.com" disabled={!!editingAdmin} style={{ height: "42px", borderRadius: "6px" }} />
                        </Form.Item>
                        {!editingAdmin && (
                            <Form.Item label={<span style={{ fontWeight: "500" }}>Password</span>} name="password" rules={[{ required: true, message: "Please enter password" }, { min: 6, message: "Password must be at least 6 characters" }]}>
                                <Input.Password prefix={<LockOutlined style={{ color: "#667eea" }} />} placeholder="Enter password" style={{ height: "42px", borderRadius: "6px" }} />
                            </Form.Item>
                        )}
                        <Form.Item label={<span style={{ fontWeight: "500" }}>Role</span>} name="role" rules={[{ required: true, message: "Please select role" }]}>
                            <Select placeholder="Select role" style={{ height: "42px" }}>
                                {roles.map(role => <Select.Option key={role._id} value={role._id}>{role.name}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item label={<span style={{ fontWeight: "500" }}>Status</span>} name="isActive" valuePropName="checked" initialValue={true}>
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <Button onClick={() => { setIsModalOpen(false); setEditingAdmin(null); form.resetFields(); }} style={{ height: "42px", borderRadius: "6px" }}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isCreatingAdmin || isUpdatingAdmin} style={{ height: "42px", borderRadius: "6px", background: "linear-gradient(to right, #667eea, #764ba2)", border: "none", fontWeight: "500" }}>{editingAdmin ? "Update" : "Create"}</Button>
                        </div>
                    </Form>
                </Modal>

                {/* Role Modal */}
                <Modal title={<div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}><SafetyOutlined style={{ marginRight: "8px", color: "#667eea" }} />{editingRole ? "Edit Role" : "Create Role"}</div>} open={isRoleModalOpen} onCancel={() => { setIsRoleModalOpen(false); setEditingRole(null); roleForm.resetFields(); setSelectedRolePermissions({}); }} footer={null} width={800} style={{ top: 20 }}>
                    <Form form={roleForm} layout="vertical" onFinish={editingRole ? handleUpdateRole : handleCreateRole} style={{ marginTop: "20px" }}>
                        <Form.Item label={<span style={{ fontWeight: "500" }}>Role Name</span>} name="name" rules={[{ required: true, message: "Please enter role name" }]}>
                            <Input placeholder="e.g., Super Admin, Manager" style={{ height: "42px", borderRadius: "6px" }} />
                        </Form.Item>
                        <div className="permissions-section">
                            <h4>Menu Permissions</h4>
                            <div className="permissions-list">
                                {menus.map((menu: MenuItem) => {
                                    const menuPerm = selectedRolePermissions[menu._id];
                                    return (
                                        <div key={menu._id} className="permission-item">
                                            <div className="permission-header">
                                                {menu.name}
                                                <Tag color="blue" style={{ marginLeft: "8px", fontSize: "11px" }}>{menu.key}</Tag>
                                            </div>
                                            <Space size="large" className="permission-checkboxes">
                                                <Checkbox checked={menuPerm?.create || false} onChange={(e) => handlePermissionChange(menu._id, menu.name, menu.key, 'create', e.target.checked)}><Tag color="green">Create</Tag></Checkbox>
                                                <Checkbox checked={menuPerm?.read || false} onChange={(e) => handlePermissionChange(menu._id, menu.name, menu.key, 'read', e.target.checked)}><Tag color="blue">Read</Tag></Checkbox>
                                                <Checkbox checked={menuPerm?.update || false} onChange={(e) => handlePermissionChange(menu._id, menu.name, menu.key, 'update', e.target.checked)}><Tag color="orange">Update</Tag></Checkbox>
                                                <Checkbox checked={menuPerm?.delete || false} onChange={(e) => handlePermissionChange(menu._id, menu.name, menu.key, 'delete', e.target.checked)}><Tag color="red">Delete</Tag></Checkbox>
                                            </Space>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <Button onClick={() => { setIsRoleModalOpen(false); setEditingRole(null); roleForm.resetFields(); setSelectedRolePermissions({}); }} style={{ height: "42px", borderRadius: "6px" }}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isCreatingRole || isUpdatingRole} style={{ height: "42px", borderRadius: "6px", background: "linear-gradient(to right, #667eea, #764ba2)", border: "none", fontWeight: "500" }}>{editingRole ? "Update" : "Create"}</Button>
                        </div>
                    </Form>
                </Modal>
            </div>

            {/* Responsive CSS */}
            <style>{`
                .admin-container { padding: 30px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #E2E8F0; }
                .header-title h2 { margin: 0; font-size: 20px; font-weight: 600; color: #2D3748; }
                .header-title p { margin: 5px 0 0; font-size: 13px; color: #718096; }
                .header-actions { gap: 10px; }
                .search-input { width: 300px; height: 40px; border-radius: 6px; }
                .action-btn { height: 40px; border-radius: 6px; }
                .refresh-btn { border-color: #667eea; color: #667eea; }
                .create-btn { background: linear-gradient(to right, #667eea, #764ba2); border: none; font-weight: 500; }
                .expanded-content { padding: 20px; background: #F7FAFC; border-radius: 8px; }
                .expanded-content h4 { margin-bottom: 15px; color: #2D3748; }
                .permissions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
                .permission-card { padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #E2E8F0; }
                .permission-name { font-weight: 500; margin-bottom: 8px; color: #2D3748; }
                .permissions-section { background: #F7FAFC; padding: 20px; border-radius: 8px; margin-top: 20px; }
                .permissions-section h4 { margin: 0 0 15px; font-size: 15px; font-weight: 600; color: #2D3748; }
                .permissions-list { max-height: 400px; overflow-y: auto; }
                .permission-item { padding: 15px; background: #fff; border-radius: 6px; margin-bottom: 12px; border: 1px solid #E2E8F0; }
                .permission-header { font-weight: 500; margin-bottom: 10px; color: #2D3748; font-size: 14px; }
                .permission-checkboxes { gap: 20px; }
                .date-cell { color: #718096; font-size: 13px; }
                .role-tag { font-size: 13px; padding: 4px 12px; border-radius: 4px; }

                @media (max-width: 768px) {
                    .admin-container { padding: 15px !important; }
                    .section-header { flex-direction: column; align-items: flex-start !important; gap: 12px; }
                    .header-title h2 { font-size: 18px !important; }
                    .header-title p { font-size: 12px !important; }
                    .header-actions { width: 100%; flex-wrap: wrap; }
                    .search-input { width: 100% !important; order: 3; }
                    .action-btn { flex: 1; }
                    .btn-label { font-size: 13px; }
                    .refresh-btn .btn-label { display: none; }
                    .tab-label { display: none; }
                    .permissions-grid { grid-template-columns: 1fr !important; }
                    .permission-checkboxes { flex-wrap: wrap; gap: 8px !important; }
                    .email-cell { flex-direction: column; align-items: flex-start; gap: 4px; }
                    .email-cell span { word-break: break-all; }
                }
                
                @media (max-width: 400px) {
                    .create-btn .btn-label { display: none; }
                    .permission-checkboxes { flex-direction: column; align-items: flex-start; }
                }
            `}</style>
        </>
    );
};

export default AdminManagement;