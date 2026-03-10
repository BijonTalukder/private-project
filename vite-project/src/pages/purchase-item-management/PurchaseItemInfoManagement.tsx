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
    Checkbox,
    Progress,
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
    FileTextOutlined,
    MinusCircleOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
    useCreatePurchaseItemMutation,
    useDeletePurchaseItemMutation,
    useGetAllPurchaseItemsQuery,
    useTogglePurchaseItemStatusMutation,
    useToggleSameAsFinishGoodMutation,
    useUpdatePurchaseItemMutation,
    type PurchaseItemInfo,
    type CreatePurchaseItemInfoDto,
} from "../../api/services/purchase-item/purchaseItemApi";
import { useGetActiveColorsQuery } from "../../api/services/color/colorApi";
import { useGetActiveUnitsQuery } from "../../api/services/unit/unitApi";
import { useGetActiveGSMsQuery } from "../../api/services/gsm/gsmApi";
import { useGetAllWidthsQuery } from "../../api/services/width/widthApi";

// ── Blank row template ─────────────────────────────────────────────────────────
const blankRow = (): CreatePurchaseItemInfoDto & { isActive: boolean } => ({
    articleNo: "",
    colorId: "" as string,
    unitId: "" as string,
    gsmId: "" as string,
    widthId: "" as string,
    isSameAsFinishGood: false,
    isActive: true,
});


const PurchaseItemInfoManagement = () => {
    // RTK Query hooks
    const { data: purchaseItems = [], isLoading, refetch } = useGetAllPurchaseItemsQuery();
    const { data: colors = [], isLoading: colorsLoading } = useGetActiveColorsQuery();
    const { data: units = [], isLoading: unitsLoading } = useGetActiveUnitsQuery();
    const { data: gsms = [], isLoading: gsmsLoading } = useGetActiveGSMsQuery();
    const { data: widths = [] } = useGetAllWidthsQuery();

    const [createItem] = useCreatePurchaseItemMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdatePurchaseItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeletePurchaseItemMutation();
    const [toggleStatus] = useTogglePurchaseItemStatusMutation();
    const [toggleFinishGood] = useToggleSameAsFinishGoodMutation();

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PurchaseItemInfo | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // Bulk-save progress state
    const [isBulkSaving, setIsBulkSaving] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0); // 0-100

    // Multi-row state (create mode only)
    const [rows, setRows] = useState([blankRow()]);
    const addRow = () => setRows((prev) => [...prev, blankRow()]);

    // ── Copy row: insert a clone right after index i ──────────────────────────
    const copyRow = (i: number) =>
        setRows((prev) => {
            const copy = { ...prev[i] };
            const next = [...prev];
            next.splice(i + 1, 0, copy);
            return next;
        });

    const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));
    const updateRow = (i: number, field: string, value: any) =>
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /**
     * One-by-one create:
     * Each row is sent as a separate POST /create request sequentially.
     * - No batch timeout / cancel risk — each request completes in <500ms
     * - Backend generateNextId is always reading the latest inserted record
     *   so IDs are always unique and sequential
     */
    const handleCreate = async () => {
        const invalid = rows.find(
            (r) => !r.articleNo?.trim() || !r.colorId || !r.unitId || !r.gsmId || !r.widthId
        );
        if (invalid) {
            message.error("Please complete all fields in every row");
            return;
        }

        setIsBulkSaving(true);
        setBulkProgress(0);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < rows.length; i++) {
            try {
                await createItem(rows[i]).unwrap();
                successCount++;
            } catch (err: any) {
                failCount++;
                message.warning(
                    `Row ${i + 1} (${rows[i].articleNo || "?"}): ${err?.data?.message ?? "Failed"}`
                );
            }
            // Update progress after each item
            setBulkProgress(Math.round(((i + 1) / rows.length) * 100));
        }

        if (successCount > 0) message.success(`${successCount} item(s) created successfully!`);
        if (failCount > 0) message.error(`${failCount} item(s) failed.`);

        setIsBulkSaving(false);
        setBulkProgress(0);

        if (successCount > 0) {
            refetch();
            setIsModalOpen(false);
            setRows([blankRow()]);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;
        try {
            await updateItem({ id: editingItem._id, data: values }).unwrap();
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
            message.success(`Purchase item ${!item.isActive ? "activated" : "deactivated"}!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update status");
        }
    };

    const handleToggleFinishGood = async (item: PurchaseItemInfo) => {
        try {
            await toggleFinishGood(item._id).unwrap();
            message.success("Finish good flag updated!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update finish good flag");
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setRows([blankRow()]);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (item: PurchaseItemInfo) => {
        setEditingItem(item);
        form.setFieldsValue({
            articleNo: item.articleNo,
            colorId: item.colorId?._id,
            unitId: item.unitId?._id,
            gsmId: item.gsmId?._id,
            widthId: item.widthId?._id,
            isSameAsFinishGood: item.isSameAsFinishGood,
            isActive: item.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (isBulkSaving) return; // block close while saving
        setIsModalOpen(false);
        setEditingItem(null);
        form.resetFields();
        setRows([blankRow()]);
    };

    // ── Shared select options (built once) ────────────────────────────────────
    const colorOptions = colors.map((c) => (
        <Select.Option key={c._id} value={c._id}>
            {c.name ?? "—"} ({c.type ?? "—"})
        </Select.Option>
    ));
    const unitOptions = units.map((u) => (
        <Select.Option key={u._id} value={u._id}>
            {u.name ?? "—"}
        </Select.Option>
    ));
    const gsmOptions = gsms.map((g) => (
        <Select.Option key={g._id} value={g._id}>
            {g.name ?? "—"}
        </Select.Option>
    ));
    const widthOptions = widths.map((w) => (
        <Select.Option key={w._id} value={w._id}>
            {w.name ?? "—"}
        </Select.Option>
    ));

    // ── Table columns ─────────────────────────────────────────────────────────
    const columns: ColumnsType<PurchaseItemInfo> = [
        {
            title: "Purchase Item ID",
            dataIndex: "purchaseItemId",
            key: "purchaseItemId",
            width: 140,
            render: (text: string) => (
                <Tag
                    color="purple"
                    style={{ fontFamily: "monospace", fontSize: "12px", padding: "4px 10px", fontWeight: "500" }}
                >
                    {text ?? "—"}
                </Tag>
            ),
        },
        {
            title: "Article No",
            dataIndex: "articleNo",
            key: "articleNo",
            render: (text: string) => (
                <Space>
                    <ShoppingCartOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontWeight: "500", fontSize: "14px" }}>{text ?? "—"}</span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const s = value.toString().toLowerCase();
                return (
                    record.articleNo?.toLowerCase().includes(s) ||
                    record.purchaseItemId?.toLowerCase().includes(s) ||
                    record.colorId?.name?.toLowerCase().includes(s)
                );
            },
        },
        {
            title: "Color",
            key: "color",
            render: (_, record) => (
                <Space>
                    <BgColorsOutlined style={{ color: "#667eea" }} />
                    <span>{record.colorId?.name ?? "—"}</span>
                    {record.colorId?.type && (
                        <Tag color="cyan" style={{ fontSize: "11px" }}>
                            {record.colorId.type}
                        </Tag>
                    )}
                </Space>
            ),
        },
        {
            title: "Unit",
            key: "unit",
            render: (_, record) => (
                <Space>
                    <BorderOutlined style={{ color: "#667eea" }} />
                    <span>{record.unitId?.name ?? "—"}</span>
                </Space>
            ),
        },
        {
            title: "GSM",
            key: "gsm",
            render: (_, record) => (
                <Space>
                    <FileTextOutlined style={{ color: "#667eea" }} />
                    <span>{record.gsmId?.name ?? "—"}</span>
                </Space>
            ),
        },
        {
            title: "Width",
            key: "width",
            render: (_, record) => (
                <Space>
                    <FileTextOutlined style={{ color: "#667eea" }} />
                    <span>{record.widthId?.name ?? "—"}</span>
                </Space>
            ),
        },
        {
            title: "Finish Good",
            dataIndex: "isSameAsFinishGood",
            key: "isSameAsFinishGood",
            align: "center",
            width: 120,
            render: (val: boolean) => (
                <Switch
                    checked={val}
                    style={{ backgroundColor: val ? "#52c41a" : "#d9d9d9" }}
                />
            ),
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            width: 100,
            render: (val: boolean, record: PurchaseItemInfo) => (
                <Switch
                    checked={val}
                    onChange={() => handleToggleStatus(record)}
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<CloseCircleOutlined />}
                    style={{ backgroundColor: val ? "#52c41a" : "#d9d9d9" }}
                />
            ),
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
                            style={{ color: "#667eea", borderRadius: "6px" }}
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
                            <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: "6px" }} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (isLoading || colorsLoading || unitsLoading || gsmsLoading) {
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
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#2D3748" }}>
                            Purchase Item Info Management
                        </h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>
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
                                    color: "#667eea",
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
                                boxShadow: "0 2px 8px rgba(102,126,234,0.3)",
                                fontWeight: "500",
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
                        showTotal: (total) => `Total ${total} items`,
                    }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div
                                style={{ padding: "20px", background: "#F7FAFC", borderRadius: "8px" }}
                            >
                                <h4
                                    style={{
                                        margin: "0 0 15px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        color: "#2D3748",
                                    }}
                                >
                                    Detailed Information
                                </h4>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                                        gap: "15px",
                                    }}
                                >
                                    {[
                                        {
                                            label: "Color Information",
                                            rows: [
                                                { k: "ID", v: <Tag color="blue">{record.colorId?.colorId ?? "—"}</Tag> },
                                                { k: "Name", v: record.colorId?.name ?? "—" },
                                                { k: "Type", v: record.colorId?.type ?? "—" },
                                            ],
                                        },
                                        {
                                            label: "Unit Information",
                                            rows: [
                                                { k: "ID", v: <Tag color="blue">{record.unitId?.unitId ?? "—"}</Tag> },
                                                { k: "Name", v: record.unitId?.name ?? "—" },
                                            ],
                                        },
                                        {
                                            label: "GSM Information",
                                            rows: [
                                                { k: "ID", v: <Tag color="blue">{record.gsmId?.gsmId ?? "—"}</Tag> },
                                                { k: "Name", v: record.gsmId?.name ?? "—" },
                                            ],
                                        },
                                        {
                                            label: "Width Information",
                                            rows: [
                                                { k: "ID", v: <Tag color="blue">{record.widthId?.widthId ?? "—"}</Tag> },
                                                { k: "Name", v: record.widthId?.name ?? "—" },
                                            ],
                                        },
                                        {
                                            label: "Item Details",
                                            rows: [
                                                {
                                                    k: "Same as Finish Good",
                                                    v: (
                                                        <Tag color={record.isSameAsFinishGood ? "green" : "default"}>
                                                            {record.isSameAsFinishGood ? "Yes" : "No"}
                                                        </Tag>
                                                    ),
                                                },
                                                {
                                                    k: "Status",
                                                    v: (
                                                        <Tag color={record.isActive ? "green" : "default"}>
                                                            {record.isActive ? "Active" : "Inactive"}
                                                        </Tag>
                                                    ),
                                                },
                                                {
                                                    k: "Created",
                                                    v: record.createdAt
                                                        ? new Date(record.createdAt).toLocaleDateString()
                                                        : "—",
                                                },
                                            ],
                                        },
                                    ].map((block) => (
                                        <div
                                            key={block.label}
                                            style={{
                                                padding: "12px",
                                                background: "#fff",
                                                borderRadius: "6px",
                                                border: "1px solid #E2E8F0",
                                            }}
                                        >
                                            <div style={{ fontWeight: "500", marginBottom: "8px" }}>{block.label}</div>
                                            <div style={{ fontSize: "13px", color: "#718096" }}>
                                                {block.rows.map((r) => (
                                                    <div key={r.k}>
                                                        {r.k}: {r.v}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                    }}
                />
            </Card>

            {/* ── Create / Edit Modal ────────────────────────────────────────── */}
            <Modal
                title={
                    <div
                        style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}
                    >
                        <ShoppingCartOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingItem ? "Edit Purchase Item" : "Add New Purchase Item"}
                    </div>
                }
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                width={editingItem ? 600 : 1100}
                style={{ top: 30 }}
                maskClosable={!isBulkSaving}
                closable={!isBulkSaving}
            >
                {/* ── EDIT MODE ─────────────────────────────────────────────── */}
                {editingItem ? (
                    <Form form={form} layout="vertical" onFinish={handleUpdate} style={{ marginTop: "20px" }}>
                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Article Number</span>}
                            name="articleNo"
                            rules={[
                                { required: true, message: "Please enter article number" },
                                { min: 3, message: "At least 3 characters" },
                            ]}
                        >
                            <Input
                                placeholder="e.g., ART-2024-001"
                                style={{ height: "42px", borderRadius: "6px" }}
                            />
                        </Form.Item>

                        <div
                            style={{
                                background: "#F7FAFC",
                                padding: "15px",
                                borderRadius: "8px",
                                marginBottom: "20px",
                            }}
                        >
                            <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600" }}>
                                Product Attributes
                            </h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <Form.Item
                                    label={<span style={{ fontWeight: "500" }}>Color</span>}
                                    name="colorId"
                                    rules={[{ required: true, message: "Required" }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select
                                        placeholder="Select color"
                                        style={{ height: "42px" }}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {colorOptions}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label={<span style={{ fontWeight: "500" }}>Unit</span>}
                                    name="unitId"
                                    rules={[{ required: true, message: "Required" }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select
                                        placeholder="Select unit"
                                        style={{ height: "42px" }}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {unitOptions}
                                    </Select>
                                </Form.Item>
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "15px",
                                    marginTop: "15px",
                                }}
                            >
                                <Form.Item
                                    label={<span style={{ fontWeight: "500" }}>GSM</span>}
                                    name="gsmId"
                                    rules={[{ required: true, message: "Required" }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select
                                        placeholder="Select GSM"
                                        style={{ height: "42px" }}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {gsmOptions}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label={<span style={{ fontWeight: "500" }}>Width</span>}
                                    name="widthId"
                                    rules={[{ required: true, message: "Required" }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select
                                        placeholder="Select Width"
                                        style={{ height: "42px" }}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {widthOptions}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>

                        <Form.Item label={<span style={{ fontWeight: "500" }}>Options</span>}>
                            <Space direction="vertical">
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
                            <Button
                                onClick={closeModal}
                                style={{ height: "42px", borderRadius: "6px", minWidth: "100px" }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isUpdating}
                                style={{
                                    height: "42px",
                                    borderRadius: "6px",
                                    background: "linear-gradient(to right, #667eea, #764ba2)",
                                    border: "none",
                                    fontWeight: "500",
                                    minWidth: "120px",
                                }}
                            >
                                Update Item
                            </Button>
                        </div>
                    </Form>
                ) : (
                    /* ── CREATE MODE — multi-row spreadsheet-style ────────────── */
                    <div style={{ marginTop: "16px" }}>
                        {/* Column headers — added "Copy" column */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 80px 80px 64px",
                                gap: "8px",
                                padding: "8px 10px",
                                background: "#E2E8F0",
                                borderRadius: "6px",
                                marginBottom: "8px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#2D3748",
                            }}
                        >
                            <div>
                                Article No <span style={{ color: "#E53E3E" }}>*</span>
                            </div>
                            <div>
                                Color <span style={{ color: "#E53E3E" }}>*</span>
                            </div>
                            <div>
                                Unit <span style={{ color: "#E53E3E" }}>*</span>
                            </div>
                            <div>
                                GSM <span style={{ color: "#E53E3E" }}>*</span>
                            </div>
                            <div>
                                Width <span style={{ color: "#E53E3E" }}>*</span>
                            </div>
                            <div>Finish Good</div>
                            <div>Active</div>
                            {/* Copy + Remove */}
                            <div style={{ textAlign: "center" }}>Actions</div>
                        </div>

                        {/* Rows */}
                        <div style={{ maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
                            {rows.map((row, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 80px 80px 64px",
                                        gap: "8px",
                                        marginBottom: "8px",
                                        alignItems: "center",
                                        padding: "8px 10px",
                                        background: "#fff",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <Input
                                        placeholder="Article No"
                                        value={row.articleNo}
                                        onChange={(e) => updateRow(i, "articleNo", e.target.value)}
                                        style={{ height: "36px" }}
                                        disabled={isBulkSaving}
                                    />
                                    <Select
                                        placeholder="Color"
                                        value={row.colorId || undefined}
                                        onChange={(v) => updateRow(i, "colorId", v)}
                                        style={{ width: "100%" }}
                                        showSearch
                                        optionFilterProp="children"
                                        disabled={isBulkSaving}
                                    >
                                        {colorOptions}
                                    </Select>
                                    <Select
                                        placeholder="Unit"
                                        value={row.unitId || undefined}
                                        onChange={(v) => updateRow(i, "unitId", v)}
                                        style={{ width: "100%" }}
                                        showSearch
                                        optionFilterProp="children"
                                        disabled={isBulkSaving}
                                    >
                                        {unitOptions}
                                    </Select>
                                    <Select
                                        placeholder="GSM"
                                        value={row.gsmId || undefined}
                                        onChange={(v) => updateRow(i, "gsmId", v)}
                                        style={{ width: "100%" }}
                                        showSearch
                                        optionFilterProp="children"
                                        disabled={isBulkSaving}
                                    >
                                        {gsmOptions}
                                    </Select>
                                    <Select
                                        placeholder="Width"
                                        value={row.widthId || undefined}
                                        onChange={(v) => updateRow(i, "widthId", v)}
                                        style={{ width: "100%" }}
                                        showSearch
                                        optionFilterProp="children"
                                        disabled={isBulkSaving}
                                    >
                                        {widthOptions}
                                    </Select>

                                    {/* Finish Good toggle */}
                                    <div style={{ textAlign: "center" }}>
                                        <Switch
                                            size="small"
                                            checked={row.isSameAsFinishGood}
                                            onChange={(v) => updateRow(i, "isSameAsFinishGood", v)}
                                            checkedChildren="Yes"
                                            unCheckedChildren="No"
                                            disabled={isBulkSaving}
                                        />
                                    </div>

                                    {/* Active toggle */}
                                    <div style={{ textAlign: "center" }}>
                                        <Switch
                                            size="small"
                                            checked={row.isActive}
                                            onChange={(v) => updateRow(i, "isActive", v)}
                                            checkedChildren="On"
                                            unCheckedChildren="Off"
                                            style={{ backgroundColor: row.isActive ? "#52c41a" : "#d9d9d9" }}
                                            disabled={isBulkSaving}
                                        />
                                    </div>

                                    {/* ── Copy + Remove buttons ─────────────────────── */}
                                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                        <Tooltip title="Duplicate this row">
                                            <Button
                                                type="text"
                                                icon={<CopyOutlined />}
                                                onClick={() => copyRow(i)}
                                                disabled={isBulkSaving}
                                                style={{ color: "#667eea", padding: "0 6px" }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Remove this row">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                disabled={rows.length === 1 || isBulkSaving}
                                                onClick={() => removeRow(i)}
                                                style={{ padding: "0 6px" }}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={addRow}
                            disabled={isBulkSaving}
                            style={{
                                width: "100%",
                                marginTop: "8px",
                                borderColor: "#667eea",
                                color: "#667eea",
                            }}
                        >
                            Add Another Row
                        </Button>

                        {/* Progress bar shown while saving in batches */}
                        {isBulkSaving && (
                            <div style={{ marginTop: "16px" }}>
                                <Progress
                                    percent={bulkProgress}
                                    status="active"
                                    strokeColor={{ from: "#667eea", to: "#764ba2" }}
                                    format={(p) =>
                                        `Saving… ${Math.round((p! / 100) * rows.length)} / ${rows.length} item(s)`
                                    }
                                />
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: "20px",
                                paddingTop: "16px",
                                borderTop: "1px solid #E2E8F0",
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button
                                onClick={closeModal}
                                disabled={isBulkSaving}
                                style={{ height: "42px", borderRadius: "6px", minWidth: "100px" }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                loading={isBulkSaving}
                                onClick={handleCreate}
                                style={{
                                    height: "42px",
                                    borderRadius: "6px",
                                    background: "linear-gradient(to right, #667eea, #764ba2)",
                                    border: "none",
                                    fontWeight: "500",
                                    minWidth: "140px",
                                }}
                            >
                                {isBulkSaving
                                    ? "Saving…"
                                    : `Save ${rows.length > 1 ? `${rows.length} Items` : "Item"}`}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PurchaseItemInfoManagement;