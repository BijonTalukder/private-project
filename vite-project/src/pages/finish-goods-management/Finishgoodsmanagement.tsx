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
    Select
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CheckSquareOutlined,
    BgColorsOutlined,
    BorderOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useCreateFinishGoodsMutation, useDeleteFinishGoodsMutation, useGetAllFinishGoodsQuery, useToggleFinishGoodsStatusMutation, useUpdateFinishGoodsMutation, type FinishGoods } from "../../api/services/finish-goods/finishGoodsApi";
import { useGetActiveColorsQuery } from "../../api/services/color/colorApi";
import { useGetActiveUnitsQuery } from "../../api/services/unit/unitApi";
import { useGetActiveGSMsQuery } from "../../api/services/gsm/gsmApi";


const FinishGoodsManagement = () => {
    // RTK Query hooks
    const { data: finishGoods = [], isLoading, refetch } = useGetAllFinishGoodsQuery();
    const { data: colors = [], isLoading: colorsLoading } = useGetActiveColorsQuery();
    const { data: units = [], isLoading: unitsLoading } = useGetActiveUnitsQuery();
    const { data: gsms = [], isLoading: gsmsLoading } = useGetActiveGSMsQuery();

    const [createItem, { isLoading: isCreating }] = useCreateFinishGoodsMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateFinishGoodsMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteFinishGoodsMutation();
    const [toggleStatus] = useToggleFinishGoodsStatusMutation();

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FinishGoods | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // CRUD operations
    const handleCreate = async (values: any) => {
        try {
            await createItem(values).unwrap();
            message.success("Finish goods created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create finish goods");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;
        try {
            await updateItem({ id: editingItem._id, data: values }).unwrap();
            message.success("Finish goods updated successfully!");
            setIsModalOpen(false);
            setEditingItem(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update finish goods");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteItem(id).unwrap();
            message.success("Finish goods deleted successfully!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete finish goods");
        }
    };

    const handleToggleStatus = async (item: FinishGoods) => {
        try {
            await toggleStatus(item._id).unwrap();
            message.success(`Finish goods ${!item.isActive ? "activated" : "deactivated"}!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update status");
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (item: FinishGoods) => {
        setEditingItem(item);
        form.setFieldsValue({
            articleNo: item.articleNo,
            colorId: item.colorId._id,
            unitId: item.unitId._id,
            gsmId: item.gsmId._id,
            isActive: item.isActive
        });
        setIsModalOpen(true);
    };

    // Table columns
    const columns: ColumnsType<FinishGoods> = [
        {
            title: "Finish Goods ID",
            dataIndex: "finishGoodsId",
            key: "finishGoodsId",
            width: 150,
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
                    <CheckSquareOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                    <span style={{ fontWeight: "500", fontSize: "14px", color: "#2D3748" }}>
                        {text}
                    </span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const search = value.toString().toLowerCase();
                return (
                    record.articleNo.toLowerCase().includes(search) ||
                    record.finishGoodsId.toLowerCase().includes(search) ||
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
                    <span style={{ color: "#2D3748" }}>{record.colorId.name}</span>
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
                    <span style={{ color: "#2D3748" }}>{record.unitId.name}</span>
                </Space>
            )
        },
        {
            title: "GSM",
            key: "gsm",
            render: (_, record) => (
                <Space>
                    <FileTextOutlined style={{ color: "#667eea" }} />
                    <span style={{ color: "#2D3748" }}>{record.gsmId.name}</span>
                </Space>
            )
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            width: 100,
            render: (isActive: boolean, record: FinishGoods) => (
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
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => (
                <span style={{ color: "#718096", fontSize: "13px" }}>
                    {new Date(date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    })}
                </span>
            )
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record: FinishGoods) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                            style={{ color: "#667eea", borderRadius: "6px" }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Finish Goods"
                        description="Are you sure you want to delete this item?"
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
            )
        }
    ];

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
                            Finish Goods Management
                        </h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>
                            Total {finishGoods.length} finish goods
                        </p>
                    </div>
                    <Space>
                        <Input
                            placeholder="Search by article no, ID, color..."
                            prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{ width: "320px", height: "40px", borderRadius: "6px" }}
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
                            Add Finish Goods
                        </Button>
                    </Space>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={finishGoods}
                    rowKey="_id"
                    loading={isDeleting}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} finish goods`
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
                                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                                    gap: "15px"
                                }}>
                                    {/* Color */}
                                    <div style={{
                                        padding: "15px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <BgColorsOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Color Information
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                ID: <Tag color="blue">{record.colorId.colorId}</Tag>
                                            </div>
                                            <div style={{ marginBottom: "6px" }}>
                                                Name: <strong style={{ color: "#2D3748" }}>{record.colorId.name}</strong>
                                            </div>
                                            <div>
                                                Type: <Tag color="cyan">{record.colorId.type}</Tag>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unit */}
                                    <div style={{
                                        padding: "15px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <BorderOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Unit Information
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                ID: <Tag color="blue">{record.unitId.unitId}</Tag>
                                            </div>
                                            <div>
                                                Name: <strong style={{ color: "#2D3748" }}>{record.unitId.name}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* GSM */}
                                    <div style={{
                                        padding: "15px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <FileTextOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                GSM Information
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                ID: <Tag color="blue">{record.gsmId.gsmId}</Tag>
                                            </div>
                                            <div>
                                                Name: <strong style={{ color: "#2D3748" }}>{record.gsmId.name}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div style={{
                                        padding: "15px",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        border: "1px solid #E2E8F0"
                                    }}>
                                        <Space style={{ marginBottom: "8px" }}>
                                            <CheckSquareOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                                            <span style={{ fontWeight: "500", color: "#2D3748", fontSize: "14px" }}>
                                                Item Details
                                            </span>
                                        </Space>
                                        <div style={{ fontSize: "13px", color: "#718096", marginTop: "10px" }}>
                                            <div style={{ marginBottom: "6px" }}>
                                                Status:
                                                <Tag
                                                    color={record.isActive ? "success" : "default"}
                                                    style={{ marginLeft: "8px" }}
                                                >
                                                    {record.isActive ? "Active" : "Inactive"}
                                                </Tag>
                                            </div>
                                            <div style={{ marginBottom: "6px" }}>
                                                Created:{" "}
                                                {new Date(record.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </div>
                                            <div>
                                                Updated:{" "}
                                                {new Date(record.updatedAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
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
                        <CheckSquareOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingItem ? "Edit Finish Goods" : "Add New Finish Goods"}
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
                style={{ top: 30 }}
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
                            placeholder="e.g., FG-ART-2024-001"
                            style={{ height: "42px", borderRadius: "6px" }}
                        />
                    </Form.Item>

                    {/* Attributes Section */}
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
                            Product Attributes
                        </h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
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
                                    {colors.map((color) => (
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
                                    {units.map((unit) => (
                                        <Select.Option key={unit._id} value={unit._id}>
                                            {unit.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        {/* GSM */}
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
                                {gsms.map((gsm) => (
                                    <Select.Option key={gsm._id} value={gsm._id}>
                                        {gsm.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
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
                                minWidth: "100px"
                            }}
                        >
                            {editingItem ? "Update Finish Goods" : "Add Finish Goods"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default FinishGoodsManagement;