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
    Switch,
    Select,
    Checkbox
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ShoppingCartOutlined,
    BgColorsOutlined,
    BorderOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useCreatePurchaseItemMutation, useDeletePurchaseItemMutation, useGetAllPurchaseItemsQuery, useTogglePurchaseItemStatusMutation, useToggleSameAsFinishGoodMutation, useUpdatePurchaseItemMutation, type PurchaseItemInfo } from "../../api/services/purchase-item/purchaseItemApi";
import { useGetActiveColorsQuery } from "../../api/services/color/colorApi";
import { useGetActiveUnitsQuery } from "../../api/services/unit/unitApi";
import { useGetActiveGSMsQuery } from "../../api/services/gsm/gsmApi";


const PurchaseItemInfoManagement = () => {
    // RTK Query hooks
    const { data: purchaseItems = [], isLoading, refetch } = useGetAllPurchaseItemsQuery();
    const { data: colors = [], isLoading: colorsLoading } = useGetActiveColorsQuery();
    const { data: units = [], isLoading: unitsLoading } = useGetActiveUnitsQuery();
    const { data: gsms = [], isLoading: gsmsLoading } = useGetActiveGSMsQuery();

    const [createItem, { isLoading: isCreating }] = useCreatePurchaseItemMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdatePurchaseItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeletePurchaseItemMutation();
    const [toggleStatus] = useTogglePurchaseItemStatusMutation();
    const [toggleFinishGood] = useToggleSameAsFinishGoodMutation();

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PurchaseItemInfo | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // CRUD operations
    const handleCreate = async (values: any) => {
        try {
            await createItem(values).unwrap();
            message.success("Purchase item created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create purchase item");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;

        try {
            await updateItem({
                id: editingItem._id,
                data: values
            }).unwrap();
            message.success("Purchase item updated successfully!");
            setIsModalOpen(false);
            setEditingItem(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update purchase item");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteItem(id).unwrap();
            message.success("Purchase item deleted successfully!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete purchase item");
        }
    };

    const handleToggleStatus = async (item: PurchaseItemInfo) => {
        try {
            await toggleStatus(item._id).unwrap();
            message.success(`Purchase item ${!item.isActive ? 'activated' : 'deactivated'}!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update status");
        }
    };

    const handleToggleFinishGood = async (item: PurchaseItemInfo) => {
        try {
            await toggleFinishGood(item._id).unwrap();
            message.success(`Finish good flag updated!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update finish good flag");
        }
    };

    // Modal handlers
    const openCreateModal = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (item: PurchaseItemInfo) => {
        setEditingItem(item);
        form.setFieldsValue({
            articleNo: item.articleNo,
            colorId: item.colorId._id,
            unitId: item.unitId._id,
            gsmId: item.gsmId._id,
            isSameAsFinishGood: item.isSameAsFinishGood,
            isActive: item.isActive
        });
        setIsModalOpen(true);
    };

    // Table columns
    const columns: ColumnsType<PurchaseItemInfo> = [
        {
            title: "Purchase Item ID",
            dataIndex: "purchaseItemId",
            key: "purchaseItemId",
            width: 140,
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
            title: "Article No",
            dataIndex: "articleNo",
            key: "articleNo",
            render: (text: string) => (
                <Space>
                    <ShoppingCartOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontWeight: "500", fontSize: "14px" }}>
                        {text}
                    </span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const search = value.toString().toLowerCase();
                return (
                    record.articleNo.toLowerCase().includes(search) ||
                    record.purchaseItemId.toLowerCase().includes(search) ||
                    record.colorId.name.toLowerCase().includes(search)
                );
            }
        },
        {
            title: "Color",
            key: "color",
            render: (_, record) => (
                <Space>
                    <BgColorsOutlined style={{ color: "#667eea" }} />
                    <span>{record.colorId.name}</span>
                    <Tag color="cyan" style={{ fontSize: "11px" }}>
                        {record.colorId.type}
                    </Tag>
                </Space>
            )
        },
        {
            title: "Unit",
            key: "unit",
            render: (_, record) => (
                <Space>
                    <BorderOutlined style={{ color: "#667eea" }} />
                    <span>{record.unitId.name}</span>
                </Space>
            )
        },
        {
            title: "GSM",
            key: "gsm",
            render: (_, record) => (
                <Space>
                    <FileTextOutlined style={{ color: "#667eea" }} />
                    <span>{record.gsmId.name}</span>
                </Space>
            )
        },
        {
            title: "Finish Good",
            dataIndex: "isSameAsFinishGood",
            key: "isSameAsFinishGood",
            align: "center",
            width: 120,
            render: (isSameAsFinishGood: boolean, record: PurchaseItemInfo) => (
                <Switch
                    checked={isSameAsFinishGood}
                    onChange={() => handleToggleFinishGood(record)}
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                    style={{
                        backgroundColor: isSameAsFinishGood ? "#52c41a" : "#d9d9d9"
                    }}
                />
            )
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            width: 100,
            render: (isActive: boolean, record: PurchaseItemInfo) => (
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
            render: (_, record: PurchaseItemInfo) => (
                <Space size="small">
                    <Tooltip title="Edit Item">
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
                        title="Delete Purchase Item"
                        description="Are you sure you want to delete this item?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete Item">
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
    if (isLoading || colorsLoading || unitsLoading || gsmsLoading) {
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
                            Purchase Item Info Management
                        </h2>
                        <p style={{
                            margin: "5px 0 0",
                            fontSize: "13px",
                            color: "#718096"
                        }}>
                            Total {purchaseItems.length} purchase items
                        </p>
                    </div>
                    <Space>
                        <Input
                            placeholder="Search by article no, ID, color..."
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
                            Add Purchase Item
                        </Button>
                    </Space>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={purchaseItems}
                    rowKey="_id"
                    loading={isDeleting}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`
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
                                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                                    gap: "15px"
                                }}>
                                    {/* Color Details */}
                                    <div style={{
                                        padding: "12px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <div style={{ fontWeight: "500", marginBottom: "8px" }}>
                                            Color Information
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#718096" }}>
                                            <div>ID: <Tag color="blue">{record.colorId.colorId}</Tag></div>
                                            <div>Name: {record.colorId.name}</div>
                                            <div>Type: {record.colorId.type}</div>
                                        </div>
                                    </div>

                                    {/* Unit Details */}
                                    <div style={{
                                        padding: "12px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <div style={{ fontWeight: "500", marginBottom: "8px" }}>
                                            Unit Information
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#718096" }}>
                                            <div>ID: <Tag color="blue">{record.unitId.unitId}</Tag></div>
                                            <div>Name: {record.unitId.name}</div>
                                        </div>
                                    </div>

                                    {/* GSM Details */}
                                    <div style={{
                                        padding: "12px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <div style={{ fontWeight: "500", marginBottom: "8px" }}>
                                            GSM Information
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#718096" }}>
                                            <div>ID: <Tag color="blue">{record.gsmId.gsmId}</Tag></div>
                                            <div>Name: {record.gsmId.name}</div>
                                        </div>
                                    </div>

                                    {/* Item Details */}
                                    <div style={{
                                        padding: "12px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <div style={{ fontWeight: "500", marginBottom: "8px" }}>
                                            Item Details
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#718096" }}>
                                            <div>Same as Finish Good:
                                                <Tag color={record.isSameAsFinishGood ? "green" : "default"}>
                                                    {record.isSameAsFinishGood ? "Yes" : "No"}
                                                </Tag>
                                            </div>
                                            <div>Status:
                                                <Tag color={record.isActive ? "green" : "default"}>
                                                    {record.isActive ? "Active" : "Inactive"}
                                                </Tag>
                                            </div>
                                            <div>Created: {new Date(record.createdAt).toLocaleDateString()}</div>
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
                        <ShoppingCartOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingItem ? "Edit Purchase Item" : "Add New Purchase Item"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingItem ? handleUpdate : handleCreate}
                    style={{ marginTop: "20px" }}
                >
                    {/* Article No */}
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Article Number</span>}
                        name="articleNo"
                        rules={[
                            { required: true, message: "Please enter article number" },
                            { min: 3, message: "Article number must be at least 3 characters" }
                        ]}
                    >
                        <Input
                            placeholder="e.g., ART-2024-001"
                            style={{
                                height: "42px",
                                borderRadius: "6px"
                            }}
                        />
                    </Form.Item>

                    {/* Attributes Section */}
                    <div style={{
                        background: "#F7FAFC",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px"
                    }}>
                        <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600" }}>
                            Product Attributes
                        </h4>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "15px"
                        }}>
                            {/* Color */}
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Color</span>}
                                name="colorId"
                                rules={[{ required: true, message: "Please select color" }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    placeholder="Select color"
                                    style={{ height: "42px" }}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {colors.map(color => (
                                        <Select.Option key={color._id} value={color._id}>
                                            {color.name} ({color.type})
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* Unit */}
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Unit</span>}
                                name="unitId"
                                rules={[{ required: true, message: "Please select unit" }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    placeholder="Select unit"
                                    style={{ height: "42px" }}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {units.map(unit => (
                                        <Select.Option key={unit._id} value={unit._id}>
                                            {unit.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>GSM</span>}
                            name="gsmId"
                            rules={[{ required: true, message: "Please select GSM" }]}
                            style={{ marginTop: "15px", marginBottom: 0 }}
                        >
                            <Select
                                placeholder="Select GSM"
                                style={{ height: "42px" }}
                                showSearch
                                optionFilterProp="children"
                            >
                                {gsms.map(gsm => (
                                    <Select.Option key={gsm._id} value={gsm._id}>
                                        {gsm.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Flags */}
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Options</span>}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Form.Item
                                name="isSameAsFinishGood"
                                valuePropName="checked"
                                initialValue={false}
                                style={{ marginBottom: 0 }}
                            >
                                <Checkbox>Same as Finish Good</Checkbox>
                            </Form.Item>

                            <Form.Item
                                name="isActive"
                                valuePropName="checked"
                                initialValue={true}
                                style={{ marginBottom: 0 }}
                            >
                                <Checkbox>Active Status</Checkbox>
                            </Form.Item>
                        </Space>
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
                                setEditingItem(null);
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
                            {editingItem ? "Update Item" : "Add Item"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default PurchaseItemInfoManagement;