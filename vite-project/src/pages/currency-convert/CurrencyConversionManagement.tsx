import { useState } from "react";
import {
    Button, Table, Modal, Form, InputNumber, DatePicker, Select,
    message, Popconfirm, Space, Card, Tag, Tooltip, Spin, Switch, Input
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    CheckCircleOutlined, CloseCircleOutlined, SwapOutlined, DollarOutlined,
    CalendarOutlined, ArrowRightOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { getCurrencyConfig } from "../../utils/currencyUtils";
import { useCreateConversionMutation, useDeleteConversionMutation, useGetAllConversionsQuery, useToggleConversionStatusMutation, useUpdateConversionMutation } from "../../api/services/currency-convert/currencyConversionApi";
import { useGetAllCurrenciesQuery } from "../../api/services/currency/currencyInfoApi";



interface CurrencyConversion {
    _id: string;
    conversionId: string;
    fromCurrency: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    };
    fromCurrencyId: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    }
    toCurrency: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    };
    toCurrencyId: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    }
    exchangeRate: number;
    effectiveDate: Date | null;
    isActive: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const CurrencyConversionManagement = () => {
    const { data: conversions = [], isLoading, refetch } = useGetAllConversionsQuery();
    const { data: currencies = [], isLoading: currenciesLoading } = useGetAllCurrenciesQuery();

    const [createConversion, { isLoading: isCreating }] = useCreateConversionMutation();
    const [updateConversion, { isLoading: isUpdating }] = useUpdateConversionMutation();
    const [deleteConversion, { isLoading: isDeleting }] = useDeleteConversionMutation();
    const [toggleStatus] = useToggleConversionStatusMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CurrencyConversion | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const handleCreate = async (values: any) => {

        console.log(values)
        try {
            const payload = {
                ...values,
                effectiveDate: values.effectiveDate ? values.effectiveDate.toISOString() : null,
            };

            await createConversion(payload).unwrap();
            message.success("Conversion rate created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to create conversion rate");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;
        try {
            const payload = {
                ...values,
                effectiveDate: values.effectiveDate ? values.effectiveDate.toISOString() : null,
            };
            await updateConversion({ id: editingItem._id, data: payload }).unwrap();
            message.success("Conversion rate updated successfully!");
            setIsModalOpen(false);
            setEditingItem(null);
            form.resetFields();
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update conversion rate");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteConversion(id).unwrap();
            message.success("Conversion rate deleted successfully!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to delete");
        }
    };

    const handleToggle = async (record: CurrencyConversion) => {
        try {
            await toggleStatus(record._id).unwrap();
            message.success("Status updated!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update status");
        }
    };

    const openCreate = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEdit = (record: CurrencyConversion) => {
        setEditingItem(record);
        form.setFieldsValue({
            fromCurrencyId: record.fromCurrencyId._id,
            toCurrencyId: record.toCurrencyId._id,
            exchangeRate: record.exchangeRate,
            effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : null,
            isActive: record.isActive,
            notes: record.notes,
        });
        setIsModalOpen(true);
    };

    const columns: ColumnsType<any> = [
        {
            title: "Conversion ID",
            dataIndex: "conversionId",
            key: "conversionId",
            width: 130,
            render: (text) => (
                <Tag color="purple" style={{ fontFamily: "monospace", fontSize: "12px", padding: "4px 10px", fontWeight: "500" }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: "From Currency",
            key: "fromCurrency",
            render: (_, record) => {
                const config = getCurrencyConfig(record?.fromCurrencyId?.name);
                return (
                    <Space>
                        {/* <span style={{ fontSize: "18px" }}>{config.icon}</span> */}
                        <span style={{ fontWeight: "500", color: "#2D3748" }}>{record?.fromCurrencyId?.name}</span>
                        <Tag color="blue">{config.symbol}</Tag>
                    </Space>
                );
            },
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const s = value.toString().toLowerCase();
                return (
                    record.fromCurrency.name.toLowerCase().includes(s) ||
                    record.toCurrency.name.toLowerCase().includes(s) ||
                    record.conversionId.toLowerCase().includes(s)
                );
            },
        },
        {
            title: "",
            key: "arrow",
            width: 50,
            align: "center",
            render: () => <ArrowRightOutlined style={{ color: "#667eea", fontSize: "16px" }} />,
        },
        {
            title: "To Currency",
            key: "toCurrency",
            render: (_, record) => {
                const config = getCurrencyConfig(record?.toCurrencyId?.name);
                return (
                    <Space>
                        {/* <span style={{ fontSize: "18px" }}>{config.icon}</span> */}
                        <span style={{ fontWeight: "500", color: "#2D3748" }}>{record?.toCurrencyId?.name}</span>
                        <Tag color="green">{config.symbol}</Tag>
                    </Space>
                );
            },
        },
        {
            title: "Exchange Rate",
            dataIndex: "exchangeRate",
            key: "exchangeRate",
            align: "right",
            width: 150,
            render: (rate, record) => {
                const fromConfig = getCurrencyConfig(record?.fromCurrencyId?.name);
                const toConfig = getCurrencyConfig(record?.toCurrencyId?.name);
                return (
                    <div>
                        <div style={{ fontFamily: "monospace", fontWeight: "600", fontSize: "15px", color: "#667eea" }}>
                            {rate.toFixed(4)}
                        </div>
                        <div style={{ fontSize: "11px", color: "#718096", marginTop: "2px" }}>
                            1 {fromConfig.symbol} = {rate.toFixed(2)} {toConfig.symbol}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Effective Date",
            dataIndex: "effectiveDate",
            key: "effectiveDate",
            width: 130,
            render: (date) => (
                date ? (
                    <Space>
                        <CalendarOutlined style={{ color: "#667eea" }} />
                        <span style={{ fontSize: "13px", color: "#2D3748" }}>
                            {dayjs(date).format("DD MMM YYYY")}
                        </span>
                    </Space>
                ) : (
                    <span style={{ color: "#718096", fontSize: "13px" }}>—</span>
                )
            ),
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            width: 100,
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggle(record)}
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<CloseCircleOutlined />}
                    style={{ backgroundColor: isActive ? "#52c41a" : "#d9d9d9" }}
                />
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
                        <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} style={{ color: "#667eea", borderRadius: "6px" }} />
                    </Tooltip>
                    <Popconfirm title="Delete Conversion" description="Are you sure you want to delete this conversion rate?" onConfirm={() => handleDelete(record._id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: "6px" }} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (isLoading || currenciesLoading) {
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
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#2D3748" }}>Currency Conversion Rates</h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>Total {conversions.length} conversion rates</p>
                    </div>
                    <Space>
                        <Input placeholder="Search..." prefix={<SearchOutlined style={{ color: "#667eea" }} />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ width: "320px", height: "40px", borderRadius: "6px" }} />
                        <Tooltip title="Refresh">
                            <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ height: "40px", borderRadius: "6px", borderColor: "#667eea", color: "#667eea" }} />
                        </Tooltip>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ height: "40px", borderRadius: "6px", background: "linear-gradient(to right, #667eea, #764ba2)", border: "none", boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)", fontWeight: "500" }}>
                            Add Conversion
                        </Button>
                    </Space>
                </div>

                <Table columns={columns} dataSource={conversions} rowKey="_id" loading={isDeleting} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} rates` }} />
            </Card>

            <Modal
                title={
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}>
                        <SwapOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        {editingItem ? "Edit Conversion Rate" : "Add New Conversion Rate"}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }}
                footer={null}
                width={600}
                style={{ top: 30 }}
            >
                <Form form={form} layout="vertical" onFinish={editingItem ? handleUpdate : handleCreate} style={{ marginTop: "20px" }}>
                    <div style={{ background: "#F7FAFC", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                        <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600", color: "#2D3748" }}>Currency Pair</h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "15px", alignItems: "end" }}>
                            <Form.Item label={<span style={{ fontWeight: "500" }}>From Currency</span>} name="fromCurrencyId" rules={[{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                                <Select placeholder="Select currency" style={{ height: "42px" }} showSearch optionFilterProp="children">
                                    {currencies.map((c: any) => {
                                        const config = getCurrencyConfig(c.name);
                                        return (
                                            <Select.Option key={c._id} value={c._id}>
                                                <Space>
                                                    <span>{config.icon}</span>
                                                    <span>{c.name}</span>
                                                </Space>
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>

                            <ArrowRightOutlined style={{ fontSize: "24px", color: "#667eea", marginBottom: "8px" }} />

                            <Form.Item label={<span style={{ fontWeight: "500" }}>To Currency</span>} name="toCurrencyId" rules={[{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                                <Select placeholder="Select currency" style={{ height: "42px" }} showSearch optionFilterProp="children">
                                    {currencies.map((c: any) => {
                                        const config = getCurrencyConfig(c.name);
                                        return (
                                            <Select.Option key={c._id} value={c._id}>
                                                <Space>
                                                    <span>{config.icon}</span>
                                                    <span>{c.name}</span>
                                                </Space>
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                        <Form.Item label={<span style={{ fontWeight: "500" }}>Exchange Rate</span>} name="exchangeRate" rules={[{ required: true, message: "Required" }, { type: "number", min: 0, message: "Must be positive" }]}>
                            <InputNumber placeholder="110.50" min={0} precision={4} prefix={<DollarOutlined style={{ color: "#667eea" }} />} style={{ width: "100%", height: "42px" }} />
                        </Form.Item>

                        <Form.Item label={<span style={{ fontWeight: "500" }}>Effective Date</span>} name="effectiveDate">
                            <DatePicker placeholder="Select date" style={{ width: "100%", height: "42px", borderRadius: "6px" }} format="DD MMM YYYY" />
                        </Form.Item>
                    </div>

                    <Form.Item label={<span style={{ fontWeight: "500" }}>Notes (optional)</span>} name="notes">
                        <Input.TextArea placeholder="e.g., Official bank rate, Market rate, etc." rows={3} style={{ borderRadius: "6px" }} />
                    </Form.Item>

                    <Form.Item label={<span style={{ fontWeight: "500" }}>Status</span>} name="isActive" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

                    <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <Button onClick={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }} style={{ height: "42px", borderRadius: "6px", minWidth: "100px" }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={isCreating || isUpdating} style={{ height: "42px", borderRadius: "6px", background: "linear-gradient(to right, #667eea, #764ba2)", border: "none", fontWeight: "500", minWidth: "120px" }}>
                            {editingItem ? "Update Rate" : "Add Rate"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default CurrencyConversionManagement;