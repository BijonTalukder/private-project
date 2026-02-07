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
    Spin
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FolderOutlined,
    FileOutlined,
    SearchOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
    useCreateMenuWithChildrenMutation,
    useDeleteMenuMutation,
    useGetAllMenuQuery,
    useUpdateMenuMutation,
    type CreateMenuWithChildrenDto,
    type MenuItem,
    type UpdateMenuDto
} from "../../api/services/menu/menuApi";

const MenuManagementWithRTK = () => {
    // RTK Query hooks
    const { data: menuData = [], isLoading, refetch } = useGetAllMenuQuery();
    const [createMenu, { isLoading: isCreating }] = useCreateMenuWithChildrenMutation();
    const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation();
    const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmenuModalOpen, setIsSubmenuModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    const [editingSubmenu, setEditingSubmenu] = useState<MenuItem | null>(null);
    const [parentMenuForSubmenu, setParentMenuForSubmenu] = useState<string | null>(null);
    const [form] = Form.useForm();
    const [submenuForm] = Form.useForm();
    const [searchText, setSearchText] = useState("");

    // Create menu handler
    const handleCreate = async (values: CreateMenuWithChildrenDto) => {
        try {
            await createMenu(values).unwrap();
            message.success("Menu created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create menu");
        }
    };

    // Update menu handler
    const handleUpdate = async (values: UpdateMenuDto) => {
        if (!editingMenu) return;

        try {
            await updateMenu({
                id: editingMenu._id,
                data: values
            }).unwrap();

            message.success("Menu updated successfully!");
            setIsModalOpen(false);
            setEditingMenu(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update menu");
        }
    };

    // Delete menu handler
    const handleDelete = async (id: string) => {
        try {
            await deleteMenu(id).unwrap();
            message.success("Menu deleted successfully!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete menu");
        }
    };

    // Submenu handlers
    const handleCreateSubmenu = async (values: { name: string; key: string }) => {
        if (!parentMenuForSubmenu) return;

        try {
            // Create a single submenu by sending parent ID
            await createMenu({
                name: values.name,
                key: values.key,
                parent: parentMenuForSubmenu
            } as any).unwrap();

            message.success("Submenu created successfully!");
            setIsSubmenuModalOpen(false);
            setParentMenuForSubmenu(null);
            submenuForm.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create submenu");
        }
    };

    const handleUpdateSubmenu = async (values: { name: string; key: string }) => {
        if (!editingSubmenu) return;

        try {
            await updateMenu({
                id: editingSubmenu._id,
                data: values
            }).unwrap();

            message.success("Submenu updated successfully!");
            setIsSubmenuModalOpen(false);
            setEditingSubmenu(null);
            submenuForm.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update submenu");
        }
    };

    const handleDeleteSubmenu = async (id: string) => {
        try {
            await deleteMenu(id).unwrap();
            message.success("Submenu deleted successfully!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete submenu");
        }
    };

    // Modal handlers
    const openCreateModal = () => {
        setEditingMenu(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (menu: MenuItem) => {
        setEditingMenu(menu);
        form.setFieldsValue({
            name: menu.name,
            key: menu.key
        });
        setIsModalOpen(true);
    };

    const openCreateSubmenuModal = (parentId: string) => {
        setEditingSubmenu(null);
        setParentMenuForSubmenu(parentId);
        submenuForm.resetFields();
        setIsSubmenuModalOpen(true);
    };

    const openEditSubmenuModal = (submenu: MenuItem) => {
        setEditingSubmenu(submenu);
        setParentMenuForSubmenu(null);
        submenuForm.setFieldsValue({
            name: submenu.name,
            key: submenu.key
        });
        setIsSubmenuModalOpen(true);
    };

    // Table columns
    const columns: ColumnsType<MenuItem> = [
        {
            title: "Menu Name",
            dataIndex: "name",
            key: "name",
            render: (text: string, record: MenuItem) => (
                <Space>
                    {record.children && record.children.length > 0 ? (
                        <FolderOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                    ) : (
                        <FileOutlined style={{ color: "#718096", fontSize: "16px" }} />
                    )}
                    <span style={{ fontWeight: "500", fontSize: "14px" }}>{text}</span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const search = value.toString().toLowerCase();
                return (
                    record.name.toLowerCase().includes(search) ||
                    record.key.toLowerCase().includes(search)
                );
            }
        },
        {
            title: "Key",
            dataIndex: "key",
            key: "key",
            render: (text: string) => (
                <Tag
                    color="blue"
                    style={{
                        fontFamily: "monospace",
                        fontSize: "13px",
                        padding: "4px 10px",
                        borderRadius: "4px"
                    }}
                >
                    {text}
                </Tag>
            )
        },
        {
            title: "Submenus",
            key: "children",
            align: "center",
            render: (_: any, record: MenuItem) => (
                <Tag
                    color={record.children?.length ? "green" : "default"}
                    style={{ fontSize: "13px" }}
                >
                    {record.children?.length || 0}
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
            render: (_: any, record: MenuItem) => (
                <Space size="small">
                    <Tooltip title="Edit Menu">
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
                        title="Delete Menu"
                        description={
                            <div>
                                <p>Are you sure you want to delete this menu?</p>
                                {record.children && record.children.length > 0 && (
                                    <p style={{ color: "#f5222d", margin: "5px 0 0" }}>
                                        ⚠️ All {record.children.length} submenus will also be deleted!
                                    </p>
                                )}
                            </div>
                        }
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{
                            danger: true,
                            style: { borderRadius: "6px" }
                        }}
                        cancelButtonProps={{
                            style: { borderRadius: "6px" }
                        }}
                    >
                        <Tooltip title="Delete Menu">
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

    // Table data with keys
    const tableData = menuData.map((menu: MenuItem) => ({
        ...menu,
        key: menu.key
    }));

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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}>
            {/* Main Content */}
            <div style={{ padding: "30px" }}>
                <Card
                    style={{
                        borderRadius: "12px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        border: "1px solid #e0e0e0"
                    }}
                >
                    {/* Card Header */}
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
                                All Menus
                            </h2>
                            <p style={{
                                margin: "5px 0 0",
                                fontSize: "13px",
                                color: "#718096"
                            }}>
                                Total {menuData.length} parent menus
                            </p>
                        </div>
                        <Space>
                            <Input
                                placeholder="Search by name or key..."
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
                                Create Menu
                            </Button>
                        </Space>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={tableData}
                        loading={isDeleting}
                        expandable={{
                            expandedRowRender: (record) => (
                                <div style={{
                                    padding: "20px",
                                    background: "#F7FAFC",
                                    borderRadius: "8px",
                                    marginLeft: "40px"
                                }}>
                                    {/* Add Submenu Button */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "15px"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <FolderOutlined style={{
                                                fontSize: "18px",
                                                color: "#667eea",
                                                marginRight: "8px"
                                            }} />
                                            <span style={{
                                                fontWeight: "600",
                                                fontSize: "15px",
                                                color: "#2D3748"
                                            }}>
                                                Submenus ({record.children?.length || 0})
                                            </span>
                                        </div>
                                        <Button
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                            onClick={() => openCreateSubmenuModal(record._id)}
                                            style={{
                                                borderRadius: "6px",
                                                borderColor: "#667eea",
                                                color: "#667eea"
                                            }}
                                        >
                                            Add Submenu
                                        </Button>
                                    </div>

                                    {record.children && record.children.length > 0 ? (
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                                            gap: "12px"
                                        }}>
                                            {record.children.map((child) => (
                                                <div
                                                    key={child._id}
                                                    style={{
                                                        padding: "12px 15px",
                                                        background: "#fff",
                                                        borderRadius: "6px",
                                                        border: "1px solid #E2E8F0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        transition: "all 0.3s"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = "#667eea";
                                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = "#E2E8F0";
                                                        e.currentTarget.style.boxShadow = "none";
                                                    }}
                                                >
                                                    <Space>
                                                        <FileOutlined style={{
                                                            color: "#667eea",
                                                            fontSize: "14px"
                                                        }} />
                                                        <div>
                                                            <div style={{
                                                                fontWeight: "500",
                                                                fontSize: "14px",
                                                                color: "#2D3748"
                                                            }}>
                                                                {child.name}
                                                            </div>
                                                            <Tag
                                                                color="blue"
                                                                style={{
                                                                    fontFamily: "monospace",
                                                                    fontSize: "11px",
                                                                    marginTop: "4px"
                                                                }}
                                                            >
                                                                {child.key}
                                                            </Tag>
                                                        </div>
                                                    </Space>
                                                    <Space size="small">
                                                        <Tooltip title="Edit Submenu">
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<EditOutlined />}
                                                                onClick={() => openEditSubmenuModal(child)}
                                                                style={{
                                                                    color: "#667eea"
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Popconfirm
                                                            title="Delete Submenu"
                                                            description="Are you sure you want to delete this submenu?"
                                                            onConfirm={() => handleDeleteSubmenu(child._id)}
                                                            okText="Delete"
                                                            cancelText="Cancel"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Tooltip title="Delete Submenu">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                />
                                                            </Tooltip>
                                                        </Popconfirm>
                                                    </Space>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            textAlign: "center",
                                            padding: "30px",
                                            color: "#718096"
                                        }}>
                                            <FileOutlined style={{
                                                fontSize: "36px",
                                                marginBottom: "10px",
                                                opacity: 0.5
                                            }} />
                                            <p style={{ margin: "8px 0 0" }}>No submenus available</p>
                                            <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                                                Click "Add Submenu" to create one
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ),
                            rowExpandable: (record) => true
                        }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} menus`,
                            style: { marginTop: "20px" }
                        }}
                        style={{ borderRadius: "6px" }}
                    />
                </Card>
            </div>

            {/* Create/Edit Parent Menu Modal */}
            <Modal
                title={
                    <div style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2D3748",
                        padding: "10px 0"
                    }}>
                        {editingMenu ? "Edit Menu" : "Create New Menu"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingMenu(null);
                    form.resetFields();
                }}
                footer={null}
                width={650}
                style={{ top: 50 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingMenu ? handleUpdate : handleCreate}
                    style={{ marginTop: "20px" }}
                >
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Menu Name</span>}
                        name="name"
                        rules={[{ required: true, message: "Please enter menu name" }]}
                    >
                        <Input
                            placeholder="e.g., Order Management"
                            style={{
                                height: "42px",
                                borderRadius: "6px",
                                fontSize: "14px"
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Menu Key</span>}
                        name="key"
                        rules={[
                            { required: true, message: "Please enter menu key" },
                            {
                                pattern: /^[a-zA-Z0-9._-]+$/,
                                message: "Key can only contain letters, numbers, dots, dashes, and underscores"
                            }
                        ]}
                        extra={
                            <span style={{ fontSize: "12px", color: "#718096" }}>
                                Format: lowercase, no spaces (e.g., order, products, settings)
                            </span>
                        }
                    >
                        <Input
                            placeholder="e.g., order"
                            style={{
                                height: "42px",
                                borderRadius: "6px",
                                fontFamily: "monospace",
                                fontSize: "14px"
                            }}
                        />
                    </Form.Item>

                    {!editingMenu && (
                        <div style={{
                            background: "#F7FAFC",
                            padding: "20px",
                            borderRadius: "8px",
                            marginTop: "20px"
                        }}>
                            <Form.List name="children">
                                {(fields, { add, remove }) => (
                                    <>
                                        <div style={{
                                            marginBottom: "15px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <span style={{
                                                fontWeight: "600",
                                                color: "#2D3748",
                                                fontSize: "15px"
                                            }}>
                                                Submenus (Optional)
                                            </span>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                icon={<PlusOutlined />}
                                                style={{
                                                    borderRadius: "6px",
                                                    borderColor: "#667eea",
                                                    color: "#667eea",
                                                    height: "36px"
                                                }}
                                            >
                                                Add Submenu
                                            </Button>
                                        </div>

                                        {fields.length === 0 && (
                                            <div style={{
                                                textAlign: "center",
                                                padding: "30px",
                                                color: "#718096"
                                            }}>
                                                <FileOutlined style={{
                                                    fontSize: "36px",
                                                    marginBottom: "10px",
                                                    opacity: 0.4
                                                }} />
                                                <p style={{ margin: 0 }}>
                                                    No submenus added yet
                                                </p>
                                            </div>
                                        )}

                                        {fields.map(({ key, name, ...restField }) => (
                                            <div
                                                key={key}
                                                style={{
                                                    padding: "15px",
                                                    background: "#fff",
                                                    borderRadius: "6px",
                                                    marginBottom: "12px",
                                                    border: "1px solid #E2E8F0",
                                                    position: "relative"
                                                }}
                                            >
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'name']}
                                                    rules={[{ required: true, message: 'Submenu name is required' }]}
                                                    style={{ marginBottom: "10px" }}
                                                >
                                                    <Input
                                                        placeholder="Submenu name (e.g., Create Order)"
                                                        style={{
                                                            height: "40px",
                                                            borderRadius: "6px"
                                                        }}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'key']}
                                                    rules={[
                                                        { required: true, message: 'Submenu key is required' },
                                                        {
                                                            pattern: /^[a-zA-Z0-9._-]+$/,
                                                            message: "Invalid key format"
                                                        }
                                                    ]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Input
                                                        placeholder="Submenu key (e.g., order.create)"
                                                        style={{
                                                            height: "40px",
                                                            borderRadius: "6px",
                                                            fontFamily: "monospace"
                                                        }}
                                                    />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(name)}
                                                    style={{
                                                        position: "absolute",
                                                        top: "10px",
                                                        right: "10px",
                                                        borderRadius: "6px"
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                )}
                            </Form.List>
                        </div>
                    )}

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
                                setEditingMenu(null);
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
                            {editingMenu ? "Update Menu" : "Create Menu"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Create/Edit Submenu Modal */}
            <Modal
                title={
                    <div style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2D3748",
                        padding: "10px 0"
                    }}>
                        {editingSubmenu ? "Edit Submenu" : "Create New Submenu"}
                    </div>
                }
                open={isSubmenuModalOpen}
                onCancel={() => {
                    setIsSubmenuModalOpen(false);
                    setEditingSubmenu(null);
                    setParentMenuForSubmenu(null);
                    submenuForm.resetFields();
                }}
                footer={null}
                width={500}
                style={{ top: 80 }}
            >
                <Form
                    form={submenuForm}
                    layout="vertical"
                    onFinish={editingSubmenu ? handleUpdateSubmenu : handleCreateSubmenu}
                    style={{ marginTop: "20px" }}
                >
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Submenu Name</span>}
                        name="name"
                        rules={[{ required: true, message: "Please enter submenu name" }]}
                    >
                        <Input
                            placeholder="e.g., Create Order"
                            style={{
                                height: "42px",
                                borderRadius: "6px",
                                fontSize: "14px"
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Submenu Key</span>}
                        name="key"
                        rules={[
                            { required: true, message: "Please enter submenu key" },
                            {
                                pattern: /^[a-zA-Z0-9._-]+$/,
                                message: "Key can only contain letters, numbers, dots, dashes, and underscores"
                            }
                        ]}
                        extra={
                            <span style={{ fontSize: "12px", color: "#718096" }}>
                                Format: parent.child (e.g., order.create, products.add)
                            </span>
                        }
                    >
                        <Input
                            placeholder="e.g., order.create"
                            style={{
                                height: "42px",
                                borderRadius: "6px",
                                fontFamily: "monospace",
                                fontSize: "14px"
                            }}
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
                                setIsSubmenuModalOpen(false);
                                setEditingSubmenu(null);
                                setParentMenuForSubmenu(null);
                                submenuForm.resetFields();
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
                            {editingSubmenu ? "Update Submenu" : "Create Submenu"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuManagementWithRTK;