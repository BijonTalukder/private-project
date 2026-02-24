import { useState } from "react";
import { Button, Modal, Form, Input, message, Space, Card, Spin, Select } from "antd";
import { PlusOutlined, ReloadOutlined, FolderOutlined } from "@ant-design/icons";
import RecursiveMenuTree from "./RecursiveMenuTree";
import {
    useGetAllMenusQuery,
    useCreateMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
    type MenuItem,
    type CreateMenuDto,
    type UpdateMenuDto,
} from "../../api/services/menu/menuApi";

export const ROUTE_KEYS = [
    "menu",
    "admin",
    "supplier",
    "client",
    "purchaseitem",
    "finish-goods",
    "supplier-purchase-price",
    "setting.attribute",
    "currency-info",
    "payment-info",
    "bank-info",
    "invoice-management",
    "invoice-list",
    "invoice-approved",
    "delivery-challan",

];

const MenuManagement = () => {
    // ── RTK Query ──────────────────────────────────────────────────────────────
    const { data: menuData = [], isLoading, refetch } = useGetAllMenusQuery();
    const [createMenu, { isLoading: isCreating }] = useCreateMenuMutation();
    const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation();
    const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();

    // ── Local State ────────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    const [parentMenuId, setParentMenuId] = useState<string | null>(null);
    const [form] = Form.useForm();

    // ── Check if menu has children ─────────────────────────────────────────────
    const menuHasChildren = (menuId: string): boolean => {
        const findMenu = (items: MenuItem[]): MenuItem | null => {
            for (const item of items) {
                if (item._id === menuId) return item;
                if (item.children) {
                    const found = findMenu(item.children);
                    if (found) return found;
                }
            }
            return null;
        };
        const menu = findMenu(menuData);
        return !!(menu?.children && menu.children.length > 0);
    };

    // ── CRUD Handlers ──────────────────────────────────────────────────────────
    const handleCreate = async (values: CreateMenuDto) => {
        try {
            // If creating parent menu without key, set a placeholder
            const payload = {
                ...values,
                parent: parentMenuId,
                // If no key provided (parent menu), use name as key
                key: values.key || values.name.toLowerCase().replace(/\s+/g, '-'),
            };

            await createMenu(payload).unwrap();
            message.success(
                parentMenuId
                    ? "Submenu created successfully!"
                    : "Menu created successfully!"
            );
            setIsModalOpen(false);
            setParentMenuId(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create menu");
        }
    };

    const handleUpdate = async (values: UpdateMenuDto) => {
        if (!editingMenu) return;
        try {
            // Check if this menu has children
            const hasChildren = menuHasChildren(editingMenu._id);

            const payload = {
                ...values,
                // If menu has children and no key, use name as key
                key: values.key || (hasChildren ? values.name?.toLowerCase().replace(/\s+/g, '-') : editingMenu.key),
            };

            await updateMenu({ id: editingMenu._id, data: payload }).unwrap();
            message.success("Menu updated successfully!");
            setIsModalOpen(false);
            setEditingMenu(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update menu");
        }
    };

    const handleDelete = async (id: string, hasChildren: boolean, childCount: number) => {
        try {
            const result = await deleteMenu(id).unwrap();
            message.success(
                hasChildren
                    ? `Menu and ${result.deletedCount - 1} descendant(s) deleted successfully!`
                    : "Menu deleted successfully!"
            );
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete menu");
        }
    };

    // ── Modal Handlers ─────────────────────────────────────────────────────────
    const openCreateRootModal = () => {
        setEditingMenu(null);
        setParentMenuId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openCreateChildModal = (parentId: string | null) => {
        setEditingMenu(null);
        setParentMenuId(parentId);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (menu: MenuItem) => {
        setEditingMenu(menu);
        setParentMenuId(null);
        form.setFieldsValue({
            name: menu.name,
            key: menu.key,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMenu(null);
        setParentMenuId(null);
        form.resetFields();
    };

    // ── Count total menus recursively ──────────────────────────────────────────
    const countAllMenus = (items: MenuItem[]): number => {
        return items.reduce((count, item) => {
            return count + 1 + (item.children ? countAllMenus(item.children) : 0);
        }, 0);
    };

    const totalMenuCount = countAllMenus(menuData);

    // ── Check if editing menu has children ─────────────────────────────────────
    const editingMenuHasChildren = editingMenu ? menuHasChildren(editingMenu._id) : false;

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
            <Card
                style={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    border: "1px solid #e0e0e0",
                }}
            >
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
                        <Space>
                            <FolderOutlined style={{ fontSize: "24px", color: "#667eea" }} />
                            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#2D3748" }}>
                                Menu Management
                            </h2>
                        </Space>
                        <p style={{ margin: "5px 0 0 32px", fontSize: "13px", color: "#718096" }}>
                            {menuData.length} root menu(s), {totalMenuCount} total menu(s)
                        </p>
                    </div>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => refetch()}
                            style={{
                                height: "40px",
                                borderRadius: "6px",
                                borderColor: "#667eea",
                                color: "#667eea",
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreateRootModal}
                            style={{
                                height: "40px",
                                borderRadius: "6px",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                                fontWeight: "500",
                            }}
                        >
                            Create Root Menu
                        </Button>
                    </Space>
                </div>

                {/* Recursive Tree */}
                <RecursiveMenuTree
                    menuData={menuData}
                    onAddChild={openCreateChildModal}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}>
                        <FolderOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingMenu
                            ? "Edit Menu"
                            : parentMenuId
                                ? "Create Submenu"
                                : "Create Root Menu"}
                    </div>
                }
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                width={500}
                style={{ top: 50 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingMenu ? handleUpdate : handleCreate}
                    style={{ marginTop: "20px" }}
                >
                    {/* Menu Name */}
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Menu Name</span>}
                        name="name"
                        rules={[{ required: true, message: "Please enter menu name" }]}
                    >
                        <Input
                            placeholder="e.g., Sales Management, Invoice, Invoice List"
                            style={{ height: "42px", borderRadius: "6px" }}
                        />
                    </Form.Item>

                    {/* Menu Key - CONDITIONAL */}
                    <Form.Item
                        label={
                            <Space>
                                <span style={{ fontWeight: "500" }}>Route Key</span>
                                {!editingMenuHasChildren && !parentMenuId && (
                                    <span style={{ fontSize: "11px", color: "#f5222d" }}>
                                        (Required for leaf nodes)
                                    </span>
                                )}
                                {(editingMenuHasChildren || (!editingMenu && !parentMenuId)) && (
                                    <span style={{ fontSize: "11px", color: "#52c41a" }}>
                                        (Optional for parent menus)
                                    </span>
                                )}
                            </Space>
                        }
                        name="key"
                        rules={[

                            {
                                required: !!(parentMenuId || (editingMenu && !editingMenuHasChildren)),
                                message: "Please select route key for leaf menu"
                            }
                        ]}
                        extra={
                            <span style={{ fontSize: "12px", color: "#718096" }}>
                                {editingMenuHasChildren || (!editingMenu && !parentMenuId)
                                    ? "Key is optional for parent menus that have children"
                                    : "Key is required for menus without children (leaf nodes)"}
                            </span>
                        }
                    >
                        <Select
                            placeholder="Select route key (optional for parents)"
                            showSearch
                            optionFilterProp="label"
                            style={{ height: "42px" }}
                            allowClear
                        >
                            {ROUTE_KEYS.map((key) => (
                                <Select.Option key={key} value={key} label={key}>
                                    {key}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Info Box */}
                    {parentMenuId && (
                        <div
                            style={{
                                background: "#F0F5FF",
                                padding: "12px 15px",
                                borderRadius: "6px",
                                border: "1px solid #ADC6FF",
                                marginBottom: "20px",
                            }}
                        >
                            <Space>
                                <FolderOutlined style={{ color: "#597EF7" }} />
                                <span style={{ fontSize: "13px", color: "#597EF7" }}>
                                    Creating as submenu - Route key is required
                                </span>
                            </Space>
                        </div>
                    )}

                    {editingMenuHasChildren && (
                        <div
                            style={{
                                background: "#F6FFED",
                                padding: "12px 15px",
                                borderRadius: "6px",
                                border: "1px solid #B7EB8F",
                                marginBottom: "20px",
                            }}
                        >
                            <Space>
                                <FolderOutlined style={{ color: "#52c41a" }} />
                                <span style={{ fontSize: "13px", color: "#52c41a" }}>
                                    This menu has children - Route key is optional
                                </span>
                            </Space>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div
                        style={{
                            marginTop: "25px",
                            paddingTop: "20px",
                            borderTop: "1px solid #E2E8F0",
                            display: "flex",
                            gap: "10px",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button onClick={closeModal} style={{ height: "42px", borderRadius: "6px", minWidth: "100px" }}>
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
                            {editingMenu ? "Update Menu" : "Create Menu"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuManagement;