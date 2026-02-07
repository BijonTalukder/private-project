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
    Tabs
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BgColorsOutlined,
    ColumnWidthOutlined,
    BorderOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useCreateColorMutation, useDeleteColorMutation, useGetAllColorsQuery, useToggleColorStatusMutation, useUpdateColorMutation } from "../../api/services/color/colorApi";
import { useCreateWidthMutation, useDeleteWidthMutation, useGetAllWidthsQuery, useToggleWidthStatusMutation, useUpdateWidthMutation } from "../../api/services/width/widthApi";
import { useCreateUnitMutation, useDeleteUnitMutation, useGetAllUnitsQuery, useToggleUnitStatusMutation, useUpdateUnitMutation } from "../../api/services/unit/unitApi";
import { useCreateGSMMutation, useDeleteGSMMutation, useGetAllGSMsQuery, useToggleGSMStatusMutation, useUpdateGSMMutation } from "../../api/services/gsm/gsmApi";

const ProductAttributes = () => {
    // RTK Query hooks - Color
    const { data: colors = [], isLoading: colorsLoading, refetch: refetchColors } = useGetAllColorsQuery();
    const [createColor, { isLoading: isCreatingColor }] = useCreateColorMutation();
    const [updateColor, { isLoading: isUpdatingColor }] = useUpdateColorMutation();
    const [deleteColor, { isLoading: isDeletingColor }] = useDeleteColorMutation();
    const [toggleColorStatus] = useToggleColorStatusMutation();

    // RTK Query hooks - Width
    const { data: widths = [], isLoading: widthsLoading, refetch: refetchWidths } = useGetAllWidthsQuery();
    const [createWidth, { isLoading: isCreatingWidth }] = useCreateWidthMutation();
    const [updateWidth, { isLoading: isUpdatingWidth }] = useUpdateWidthMutation();
    const [deleteWidth, { isLoading: isDeletingWidth }] = useDeleteWidthMutation();
    const [toggleWidthStatus] = useToggleWidthStatusMutation();

    // RTK Query hooks - Unit
    const { data: units = [], isLoading: unitsLoading, refetch: refetchUnits } = useGetAllUnitsQuery();
    const [createUnit, { isLoading: isCreatingUnit }] = useCreateUnitMutation();
    const [updateUnit, { isLoading: isUpdatingUnit }] = useUpdateUnitMutation();
    const [deleteUnit, { isLoading: isDeletingUnit }] = useDeleteUnitMutation();
    const [toggleUnitStatus] = useToggleUnitStatusMutation();

    // RTK Query hooks - GSM
    const { data: gsms = [], isLoading: gsmsLoading, refetch: refetchGSMs } = useGetAllGSMsQuery();
    const [createGSM, { isLoading: isCreatingGSM }] = useCreateGSMMutation();
    const [updateGSM, { isLoading: isUpdatingGSM }] = useUpdateGSMMutation();
    const [deleteGSM, { isLoading: isDeletingGSM }] = useDeleteGSMMutation();
    const [toggleGSMStatus] = useToggleGSMStatusMutation();

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("colors");
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // Generic handlers
    const handleCreate = async (values: any) => {
        try {
            if (activeTab === "colors") {
                await createColor(values).unwrap();
            } else if (activeTab === "widths") {
                await createWidth(values).unwrap();
            } else if (activeTab === "units") {
                await createUnit(values).unwrap();
            } else if (activeTab === "gsm") {
                await createGSM(values).unwrap();
            }
            message.success(`${getTabName()} created successfully!`);
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || `Failed to create ${getTabName()}`);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;

        try {
            if (activeTab === "colors") {
                await updateColor({ id: editingItem._id, data: values }).unwrap();
            } else if (activeTab === "widths") {
                await updateWidth({ id: editingItem._id, data: values }).unwrap();
            } else if (activeTab === "units") {
                await updateUnit({ id: editingItem._id, data: values }).unwrap();
            } else if (activeTab === "gsm") {
                await updateGSM({ id: editingItem._id, data: values }).unwrap();
            }
            message.success(`${getTabName()} updated successfully!`);
            setIsModalOpen(false);
            setEditingItem(null);
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || `Failed to update ${getTabName()}`);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (activeTab === "colors") {
                await deleteColor(id).unwrap();
            } else if (activeTab === "widths") {
                await deleteWidth(id).unwrap();
            } else if (activeTab === "units") {
                await deleteUnit(id).unwrap();
            } else if (activeTab === "gsm") {
                await deleteGSM(id).unwrap();
            }
            message.success(`${getTabName()} deleted successfully!`);
        } catch (error: any) {
            message.error(error?.data?.message || `Failed to delete ${getTabName()}`);
        }
    };

    const handleToggleStatus = async (item: any) => {
        try {
            if (activeTab === "colors") {
                await toggleColorStatus(item._id).unwrap();
            } else if (activeTab === "widths") {
                await toggleWidthStatus(item._id).unwrap();
            } else if (activeTab === "units") {
                await toggleUnitStatus(item._id).unwrap();
            } else if (activeTab === "gsm") {
                await toggleGSMStatus(item._id).unwrap();
            }
            message.success(`${getTabName()} status updated!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update status");
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        if (activeTab === "colors") {
            form.setFieldsValue({ name: item.name, type: item.type });
        } else {
            form.setFieldsValue({ name: item.name });
        }
        setIsModalOpen(true);
    };

    const getTabName = () => {
        const names: any = {
            colors: "Color",
            widths: "Width",
            units: "Unit",
            gsm: "GSM"
        };
        return names[activeTab] || "";
    };

    const getIdPrefix = () => {
        const prefixes: any = {
            colors: "COL",
            widths: "WID",
            units: "UNT",
            gsm: "GSM"
        };
        return prefixes[activeTab] || "";
    };

    // Common table columns
    const getColumns = (): ColumnsType<any> => [
        {
            title: "ID",
            dataIndex: activeTab === "colors" ? "colorId" :
                activeTab === "widths" ? "widthId" :
                    activeTab === "units" ? "unitId" : "gsmId",
            key: "id",
            width: 120,
            render: (text: string) => (
                <Tag
                    color="blue"
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
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text: string) => (
                <span style={{ fontWeight: "500", fontSize: "14px" }}>
                    {text}
                </span>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const search = value.toString().toLowerCase();
                return record.name.toLowerCase().includes(search);
            }
        },
        ...(activeTab === "colors" ? [{
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (text: string) => (
                <Tag color="cyan">{text}</Tag>
            )
        }] : []),
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center" as const,
            width: 100,
            render: (isActive: boolean, record: any) => (
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
            align: "center" as const,
            render: (_, record: any) => (
                <Space size="small">
                    <Tooltip title={`Edit ${getTabName()}`}>
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
                        title={`Delete ${getTabName()}`}
                        description={`Are you sure you want to delete this ${getTabName().toLowerCase()}?`}
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title={`Delete ${getTabName()}`}>
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

    const getCurrentData = () => {
        if (activeTab === "colors") return colors;
        if (activeTab === "widths") return widths;
        if (activeTab === "units") return units;
        if (activeTab === "gsm") return gsms;
        return [];
    };

    const getCurrentLoading = () => {
        if (activeTab === "colors") return colorsLoading || isDeletingColor;
        if (activeTab === "widths") return widthsLoading || isDeletingWidth;
        if (activeTab === "units") return unitsLoading || isDeletingUnit;
        if (activeTab === "gsm") return gsmsLoading || isDeletingGSM;
        return false;
    };

    const handleRefresh = () => {
        if (activeTab === "colors") refetchColors();
        else if (activeTab === "widths") refetchWidths();
        else if (activeTab === "units") refetchUnits();
        else if (activeTab === "gsm") refetchGSMs();
    };

    const isCreating = isCreatingColor || isCreatingWidth || isCreatingUnit || isCreatingGSM;
    const isUpdating = isUpdatingColor || isUpdatingWidth || isUpdatingUnit || isUpdatingGSM;

    if (colorsLoading && widthsLoading && unitsLoading && gsmsLoading) {
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
                            Product Attributes
                        </h2>
                        <p style={{
                            margin: "5px 0 0",
                            fontSize: "13px",
                            color: "#718096"
                        }}>
                            Manage colors, widths, units, and GSM
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key);
                        setSearchText("");
                    }}
                    items={[
                        {
                            key: 'colors',
                            label: (
                                <span>
                                    <BgColorsOutlined /> Colors
                                </span>
                            ),
                            children: null
                        },
                        {
                            key: 'widths',
                            label: (
                                <span>
                                    <ColumnWidthOutlined /> Widths
                                </span>
                            ),
                            children: null
                        },
                        {
                            key: 'units',
                            label: (
                                <span>
                                    <BorderOutlined /> Units
                                </span>
                            ),
                            children: null
                        },
                        {
                            key: 'gsm',
                            label: (
                                <span>
                                    <FileTextOutlined /> GSM
                                </span>
                            ),
                            children: null
                        }
                    ]}
                />

                {/* Action Bar */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    marginTop: "20px"
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#718096"
                    }}>
                        Total {getCurrentData().length} {getTabName()}s
                    </p>
                    <Space>
                        <Input
                            placeholder={`Search ${getTabName().toLowerCase()}s...`}
                            prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{
                                width: "250px",
                                height: "40px",
                                borderRadius: "6px"
                            }}
                        />
                        <Tooltip title="Refresh">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
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
                            Add {getTabName()}
                        </Button>
                    </Space>
                </div>

                {/* Table */}
                <Table
                    columns={getColumns()}
                    dataSource={getCurrentData()}
                    rowKey="_id"
                    loading={getCurrentLoading()}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} ${getTabName().toLowerCase()}s`
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
                        {editingItem ? `Edit ${getTabName()}` : `Add New ${getTabName()}`}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingItem ? handleUpdate : handleCreate}
                    style={{ marginTop: "20px" }}
                >
                    <Form.Item
                        label={<span style={{ fontWeight: "500" }}>{getTabName()} Name</span>}
                        name="name"
                        rules={[
                            { required: true, message: `Please enter ${getTabName().toLowerCase()} name` },
                            { min: 1, message: "Name must be at least 1 character" }
                        ]}
                    >
                        <Input
                            placeholder={
                                activeTab === "colors" ? "e.g., Red, Blue, Green" :
                                    activeTab === "widths" ? 'e.g., 36", 44", 60"' :
                                        activeTab === "units" ? "e.g., Meter, Yard, Piece, KG" :
                                            "e.g., 100 GSM, 150 GSM, 200 GSM"
                            }
                            style={{
                                height: "42px",
                                borderRadius: "6px"
                            }}
                        />
                    </Form.Item>

                    {activeTab === "colors" && (
                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Type</span>}
                            name="type"
                            rules={[
                                { required: true, message: "Please enter color type" },
                                { min: 2, message: "Type must be at least 2 characters" }
                            ]}
                        >
                            <Input
                                placeholder="e.g., Solid, Gradient, Pattern"
                                style={{
                                    height: "42px",
                                    borderRadius: "6px"
                                }}
                            />
                        </Form.Item>
                    )}

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
                            {editingItem ? `Update ${getTabName()}` : `Add ${getTabName()}`}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductAttributes;