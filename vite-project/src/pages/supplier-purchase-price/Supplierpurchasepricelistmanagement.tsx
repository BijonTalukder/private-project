import { useState } from "react";
import {
    Button, Table, Modal, Form, Input, InputNumber, DatePicker,
    message, Popconfirm, Space, Card, Tag, Tooltip, Spin, Switch, Select
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, UserOutlined,
    ShoppingCartOutlined, CalendarOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCreatePriceListMutation, useDeletePriceListMutation, useGetAllPriceListsQuery, useTogglePriceListStatusMutation, useUpdatePriceListMutation, type SupplierPurchasePriceList } from "../../api/services/supplier-purchase-price/SupplierpurchasepricelistApi";
import { useGetAllSuppliersQuery } from "../../api/services/supplier/supplierApi";
import { useGetAllPurchaseItemsQuery } from "../../api/services/purchase-item/purchaseItemApi";
import { useGetAllCurrenciesQuery } from "../../api/services/currency/currencyInfoApi";
import { getCurrencyConfig } from "../../utils/currencyUtils";

const SupplierPurchasePriceListManagement = () => {
    const { data: priceLists = [], isLoading, refetch } = useGetAllPriceListsQuery();
    const { data: suppliers = [], isLoading: suppliersLoading } = useGetAllSuppliersQuery();
    const { data: purchaseItems = [], isLoading: itemsLoading } = useGetAllPurchaseItemsQuery();
    const { data: currencies = [], isLoading: currenciesLoading } = useGetAllCurrenciesQuery();

    const [createPriceList, { isLoading: isCreating }] = useCreatePriceListMutation();
    const [updatePriceList, { isLoading: isUpdating }] = useUpdatePriceListMutation();
    const [deletePriceList, { isLoading: isDeleting }] = useDeletePriceListMutation();
    const [toggleStatus] = useTogglePriceListStatusMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SupplierPurchasePriceList | null>(null);
    const [searchText, setSearchText] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState<string>("");
    const [selectedCurrencyId, setSelectedCurrencyId] = useState<string | undefined>("");
    const [form] = Form.useForm();

    // ✅ Get current currency config for dynamic icon
    const currencyConfig = selectedCurrency ? getCurrencyConfig(selectedCurrency) : null;

    const isExpired = (closeDate: string | null) => closeDate ? dayjs(closeDate).isBefore(dayjs()) : false;

    const getStatusBadge = (record: SupplierPurchasePriceList) => {
        if (!record.isActive) return <Tag color="default">Inactive</Tag>;
        if (isExpired(record.closeDate)) return <Tag color="red">Expired</Tag>;
        return <Tag color="success">Active</Tag>;
    };

    const handleCreate = async (values: any) => {
        try {
            const payload = {
                ...values,
                closeDate: values.closeDate ? values.closeDate.toISOString() : null,
                currencyId: selectedCurrencyId
            };
            await createPriceList(payload).unwrap();
            message.success("Price list entry created successfully!");
            setIsModalOpen(false);
            setSelectedCurrency(""); // ✅ Reset currency
            setSelectedCurrencyId("")
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to create price list entry");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;
        try {
            const payload = {
                ...values,
                closeDate: values.closeDate ? values.closeDate.toISOString() : null,
            };
            await updatePriceList({ id: editingItem._id, data: payload }).unwrap();
            message.success("Price list entry updated successfully!");
            setIsModalOpen(false);
            setEditingItem(null);
            setSelectedCurrency(""); // ✅ Reset currency
            setSelectedCurrencyId("")
            form.resetFields();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update price list entry");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deletePriceList(id).unwrap();
            message.success("Price list entry deleted successfully!");
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to delete");
        }
    };

    const handleToggleStatus = async (record: SupplierPurchasePriceList) => {
        try {
            await toggleStatus(record._id).unwrap();
            message.success(`Status updated!`);
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to update status");
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setSelectedCurrency(""); // ✅ Reset currency
        setSelectedCurrencyId("")
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record: SupplierPurchasePriceList) => {
        setEditingItem(record);
        setSelectedCurrency(record.currencyId?.name || ""); // ✅ Set currency from record
        setSelectedCurrencyId(record.currencyId?._id || "")
        form.setFieldsValue({
            supplierId: record.supplierId._id,
            purchaseItemInfoId: record.purchaseItemInfoId._id,
            currencyId: record.currencyId._id,
            purchaseRate: record.purchaseRate,
            commission: record.commission,
            isActive: record.isActive,
            closeDate: record.closeDate ? dayjs(record.closeDate) : null,
        });
        setIsModalOpen(true);
    };

    // ✅ Handle currency change
    const handleCurrencyChange = (value: string) => {
        const selected = currencies.find(c => c._id === value);
        setSelectedCurrency(selected?.name || "");
        setSelectedCurrencyId(selected?._id || "")
    };

    const columns: ColumnsType<SupplierPurchasePriceList> = [
        {
            title: "Price List ID",
            dataIndex: "priceListId",
            key: "priceListId",
            width: 130,
            render: (text) => (
                <Tag color="purple" style={{ fontFamily: "monospace", fontSize: "12px", padding: "4px 10px", fontWeight: "500" }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: "Supplier",
            key: "supplier",
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Space>
                        <UserOutlined style={{ color: "#667eea" }} />
                        <span style={{ fontWeight: "500", color: "#2D3748" }}>{record.supplierId.supplierName}</span>
                    </Space>
                    <Tag color="blue" style={{ fontFamily: "monospace", fontSize: "11px" }}>{record.supplierId.supplierId}</Tag>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const s = value.toString().toLowerCase();
                return (
                    record.supplierId.supplierName.toLowerCase().includes(s) ||
                    record.supplierId.supplierId.toLowerCase().includes(s) ||
                    record.purchaseItemInfoId.articleNo.toLowerCase().includes(s) ||
                    record.priceListId.toLowerCase().includes(s)
                );
            },
        },
        {
            title: "Purchase Item",
            key: "purchaseItem",
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Space>
                        <ShoppingCartOutlined style={{ color: "#667eea" }} />
                        <span style={{ fontWeight: "500", color: "#2D3748" }}>{record?.purchaseItemInfoId?.articleNo}</span>
                    </Space>
                    <Space size={4}>
                        <Tag color="cyan" style={{ fontSize: "11px" }}>{record.purchaseItemInfoId?.colorId?.name}</Tag>
                        <Tag color="orange" style={{ fontSize: "11px" }}>{record.purchaseItemInfoId?.gsmId?.name}</Tag>
                        <Tag color="geekblue" style={{ fontSize: "11px" }}>{record.purchaseItemInfoId?.unitId?.name}</Tag>
                    </Space>
                </Space>
            ),
        },
        {
            title: "Purchase Rate",
            key: "purchaseRate",
            align: "right",
            width: 160,
            render: (_, record) => {
                const currencyConfig = getCurrencyConfig(record.currencyId?.name);
                return (
                    <Space>

                        <span style={{ fontWeight: "600", fontSize: "15px", color: "#2D3748", fontFamily: "monospace" }}>
                            {currencyConfig.symbol}{Number(record.purchaseRate).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                    </Space>
                );
            },
        },
        // {
        //     title: "Commission",
        //     dataIndex: "commission",
        //     key: "commission",
        //     align: "right",
        //     width: 120,
        //     render: (commission, record) => {
        //         const currencyConfig = getCurrencyConfig(record.currencyId?.name);
        //         return (
        //             <span style={{ fontFamily: "monospace", color: "#667eea", fontWeight: "500" }}>
        //                 {currencyConfig.symbol}{Number(commission || 0).toFixed(2)}
        //             </span>
        //         );
        //     },
        // },
        {
            title: "Close Date",
            dataIndex: "closeDate",
            key: "closeDate",
            width: 130,
            render: (closeDate) =>
                closeDate ? (
                    <Space>
                        <CalendarOutlined style={{ color: isExpired(closeDate) ? "#ff4d4f" : "#667eea" }} />
                        <span style={{ fontSize: "13px", color: isExpired(closeDate) ? "#ff4d4f" : "#2D3748", fontWeight: isExpired(closeDate) ? "500" : "normal" }}>
                            {dayjs(closeDate).format("DD MMM YYYY")}
                        </span>
                    </Space>
                ) : (
                    <span style={{ color: "#718096", fontSize: "13px" }}>—</span>
                ),
        },
        {
            title: "Status",
            key: "status",
            align: "center",
            width: 110,
            render: (_, record) => (
                <Space direction="vertical" size={4} style={{ alignItems: "center" }}>
                    <Switch
                        checked={record.isActive}
                        onChange={() => handleToggleStatus(record)}
                        checkedChildren={<CheckCircleOutlined />}
                        unCheckedChildren={<CloseCircleOutlined />}
                        style={{ backgroundColor: record.isActive ? "#52c41a" : "#d9d9d9" }}
                    />
                    {getStatusBadge(record)}
                </Space>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 110,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} style={{ color: "#667eea", borderRadius: "6px" }} />
                    </Tooltip>
                    <Popconfirm title="Delete Entry" description="Are you sure you want to delete this price list entry?" onConfirm={() => handleDelete(record._id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: "6px" }} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (isLoading || suppliersLoading || itemsLoading || currenciesLoading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "30px" }}>
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "15px", borderBottom: "2px solid #E2E8F0" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#2D3748" }}>Supplier Purchase Price List</h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>Total {priceLists.length} price list entries</p>
                    </div>
                    <Space>
                        <Input placeholder="Search..." prefix={<SearchOutlined style={{ color: "#667eea" }} />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ width: "320px", height: "40px", borderRadius: "6px" }} />
                        <Tooltip title="Refresh">
                            <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ height: "40px", borderRadius: "6px", borderColor: "#667eea", color: "#667eea" }} />
                        </Tooltip>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ height: "40px", borderRadius: "6px", background: "linear-gradient(to right, #667eea, #764ba2)", border: "none", boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)", fontWeight: "500" }}>
                            Add Price Entry
                        </Button>
                    </Space>
                </div>

                <Table columns={columns} dataSource={priceLists} rowKey="_id" loading={isDeleting} rowClassName={(record) => isExpired(record.closeDate) ? "expired-row" : ""} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} entries` }} />
            </Card>

            <Modal
                title={
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}>
                        <DollarOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingItem ? "Edit Price List Entry" : "Add New Price List Entry"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingItem(null); setSelectedCurrency(""); form.resetFields(); }}
                footer={null}
                width={620}
                style={{ top: 30 }}
            >
                <Form form={form} layout="vertical" onFinish={editingItem ? handleUpdate : handleCreate} style={{ marginTop: "20px" }}>
                    <div style={{ background: "#F7FAFC", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                        <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600", color: "#2D3748" }}>Reference Information</h4>

                        <Form.Item label={<span style={{ fontWeight: "500" }}>Supplier</span>} name="supplierId" rules={[{ required: true, message: "Please select supplier" }]}>
                            <Select placeholder="Select supplier" style={{ height: "42px" }} showSearch optionFilterProp="children">
                                {suppliers.map((s) => (
                                    <Select.Option key={s._id} value={s._id}>{s.supplierName} — {s.supplierId}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label={<span style={{ fontWeight: "500" }}>Purchase Item Info</span>} name="purchaseItemInfoId" rules={[{ required: true, message: "Please select purchase item" }]}>
                            <Select placeholder="Select purchase item" style={{ height: "42px" }} showSearch optionFilterProp="children">
                                {purchaseItems.map((item) => (
                                    <Select.Option key={item._id} value={item._id}>
                                        {item.articleNo} — {item.colorId.name} / {item.gsmId.name} / {item.unitId.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label={<span style={{ fontWeight: "500" }}>Currency</span>} name="currencyId" rules={[{ required: true, message: "Please select currency" }]} style={{ marginBottom: 0 }}>
                            <Select placeholder="Select currency" style={{ height: "42px" }} showSearch optionFilterProp="children" onChange={handleCurrencyChange}>
                                {currencies.map((c) => {
                                    const config = getCurrencyConfig(c.name);
                                    return (
                                        <Select.Option key={c._id} value={c._id}>
                                            <Space>
                                                <span>{config.icon}</span>
                                                <span>{c.name}</span>
                                                <span style={{ color: "#999" }}>({config.symbol})</span>
                                            </Space>
                                        </Select.Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </div>

                    {/* ✅ Dynamic Currency Preview */}
                    {currencyConfig && (
                        <div style={{ padding: "12px", background: "#F0F7FF", border: "1px solid #BAE7FF", borderRadius: "6px", marginBottom: "20px" }}>
                            <Space>
                                <span style={{ fontSize: "24px" }}>{currencyConfig.icon}</span>
                                <div>
                                    <div style={{ fontWeight: "600", color: "#2D3748" }}>Selected Currency: {currencyConfig.name}</div>
                                    <div style={{ fontSize: "12px", color: "#667eea" }}>
                                        All amounts will be displayed with symbol: <strong>{currencyConfig.symbol}</strong>
                                    </div>
                                </div>
                            </Space>
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                        <Form.Item label={
                            <span style={{ fontWeight: "500" }}>
                                Purchase Rate {currencyConfig && <span style={{ color: "#667eea" }}>({currencyConfig.symbol})</span>}
                            </span>
                        } name="purchaseRate" rules={[{ required: true, message: "Please enter purchase rate" }, { type: "number", min: 0, message: "Rate must be 0 or more" }]}>
                            <InputNumber
                                placeholder="0.00"
                                min={0}
                                precision={2}
                                prefix={currencyConfig ? <span style={{ color: "#667eea" }}>{currencyConfig.icon}</span> : <DollarOutlined style={{ color: "#667eea" }} />}
                                style={{ width: "100%", height: "42px" }}
                            />
                        </Form.Item>

                        {/* <Form.Item label={
                            <span style={{ fontWeight: "500" }}>
                                Commission {currencyConfig && <span style={{ color: "#667eea" }}>({currencyConfig.symbol})</span>}
                            </span>
                        } name="commission" initialValue={0}>
                            <InputNumber
                                placeholder="0.00"
                                min={0}
                                precision={2}
                                prefix={currencyConfig ? <span style={{ color: "#667eea" }}>{currencyConfig.icon}</span> : <DollarOutlined style={{ color: "#667eea" }} />}
                                style={{ width: "100%", height: "42px" }}
                            />
                        </Form.Item> */}
                    </div>

                    <Form.Item label={<span style={{ fontWeight: "500" }}>Close Date (optional)</span>} name="closeDate">
                        <DatePicker placeholder="Select close date" style={{ width: "100%", height: "42px", borderRadius: "6px" }} format="DD MMM YYYY" />
                    </Form.Item>

                    <Form.Item label={<span style={{ fontWeight: "500" }}>Status</span>} name="isActive" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

                    <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <Button onClick={() => { setIsModalOpen(false); setEditingItem(null); setSelectedCurrency(""); form.resetFields(); }} style={{ height: "42px", borderRadius: "6px", minWidth: "100px" }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={isCreating || isUpdating} style={{ height: "42px", borderRadius: "6px", background: "linear-gradient(to right, #667eea, #764ba2)", border: "none", fontWeight: "500", minWidth: "120px" }}>
                            {editingItem ? "Update Entry" : "Add Entry"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default SupplierPurchasePriceListManagement;