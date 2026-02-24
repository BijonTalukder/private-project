import { useState } from "react";
import { Button, Table, message, Popconfirm, Space, Card, Tag, Tooltip, Spin, Switch, Input } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    UserOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
    useGetAllInvoicesQuery,
    useCreateInvoiceMutation,
    useUpdateInvoiceMutation,
    useDeleteInvoiceMutation,
    useToggleInvoiceStatusMutation,
    type Invoice,
} from "../../api/services/invoice/invoiceApi";
import { useGetAllClientsQuery } from "../../api/services/client/clientApi";
import { useGetAllPaymentsQuery } from "../../api/services/payment-info/paymentInfoApi";
import { useGetAllCurrenciesQuery } from "../../api/services/currency/currencyInfoApi";
import { useGetAllBanksQuery } from "../../api/services/bank-info/bankInfoApi";
import { useGetAllFinishGoodsQuery } from "../../api/services/finish-goods/finishGoodsApi";
import { useGetAllPriceListsQuery } from "../../api/services/supplier-purchase-price/SupplierpurchasepricelistApi";
import InvoiceFormModal from "./modal/InvoiceFormModal";

const InvoiceManagement = () => {
    // ── RTK Query ──────────────────────────────────────────────────────────────
    const { data: invoices = [], isLoading, refetch } = useGetAllInvoicesQuery();
    const { data: clients = [], isLoading: clientsLoading } = useGetAllClientsQuery();
    const { data: currencies = [], isLoading: currenciesLoading } = useGetAllCurrenciesQuery();
    const { data: payments = [], isLoading: paymentsLoading } = useGetAllPaymentsQuery();
    const { data: banks = [], isLoading: banksLoading } = useGetAllBanksQuery();
    const { data: finishGoods = [], isLoading: finishGoodsLoading } = useGetAllFinishGoodsQuery();
    const { data: priceLists = [], isLoading: priceListsLoading } = useGetAllPriceListsQuery();

    const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
    const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
    const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
    const [toggleStatus] = useToggleInvoiceStatusMutation();

    // ── Local state ────────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [searchText, setSearchText] = useState("");

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const handleCreate = async (values: any) => {
        try {
            await createInvoice(values).unwrap();
            message.success("Invoice created successfully!");
            setIsModalOpen(false);
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to create invoice");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingInvoice) return;
        try {
            await updateInvoice({ id: editingInvoice._id, data: values }).unwrap();
            message.success("Invoice updated successfully!");
            setIsModalOpen(false);
            setEditingInvoice(null);
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update invoice");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteInvoice(id).unwrap();
            message.success("Invoice deleted successfully!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to delete invoice");
        }
    };

    const handleToggle = async (record: Invoice) => {
        try {
            await toggleStatus(record._id).unwrap();
            message.success("Status updated!");
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update status");
        }
    };

    const openCreate = () => {
        setEditingInvoice(null);
        setIsModalOpen(true);
    };

    const openEdit = (record: Invoice) => {
        setEditingInvoice(record);
        setIsModalOpen(true);
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns: ColumnsType<Invoice> = [
        {
            title: "Invoice ID",
            dataIndex: "invoiceId",
            key: "invoiceId",
            width: 120,
            render: (text) => (
                <Tag color="purple" style={{ fontFamily: "monospace", fontSize: "12px", padding: "4px 10px", fontWeight: "500" }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: "Invoice No",
            dataIndex: "invoiceNo",
            key: "invoiceNo",
            render: (text) => (
                <Space>
                    <FileTextOutlined style={{ color: "#667eea", fontSize: "16px" }} />
                    <span style={{ fontWeight: "500", fontSize: "14px", color: "#2D3748" }}>{text}</span>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const s = value.toString().toLowerCase();
                return (
                    record.invoiceNo.toLowerCase().includes(s) ||
                    record.invoiceId.toLowerCase().includes(s) ||
                    record.client.name.toLowerCase().includes(s)
                );
            },
        },
        {
            title: "Client",
            key: "client",
            render: (_, record) => (
                <Space>
                    <UserOutlined style={{ color: "#667eea" }} />
                    <span style={{ color: "#2D3748" }}>{record.client.name}</span>
                </Space>
            ),
        },
        {
            title: "Currency",
            key: "currency",
            render: (_, record) => <Tag color="blue">{record.currency.name}</Tag>,
        },
        {
            title: "Total Qty",
            dataIndex: "totalQty",
            key: "totalQty",
            align: "right",
            render: (qty) => <span style={{ fontFamily: "monospace", color: "#2D3748", fontWeight: "500" }}>{qty}</span>,
        },
        {
            title: "Total Amount",
            dataIndex: "totalAmount",
            key: "totalAmount",
            align: "right",
            render: (amount) => (
                <Space>
                    <DollarOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontWeight: "700", fontSize: "15px", color: "#667eea", fontFamily: "monospace" }}>
                        {Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                </Space>
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
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(record)}
                            style={{ color: "#667eea", borderRadius: "6px" }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Invoice"
                        description="This will delete the invoice and all its items. Continue?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: "6px" }} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ── Loading ────────────────────────────────────────────────────────────────
    if (
        isLoading ||
        clientsLoading ||
        currenciesLoading ||
        paymentsLoading ||
        banksLoading ||
        finishGoodsLoading ||
        priceListsLoading
    ) {
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
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0" }}>
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
                            Invoice Management
                        </h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>
                            Total {invoices.length} invoices
                        </p>
                    </div>
                    <Space>
                        <Input
                            placeholder="Search by invoice no, ID, client..."
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
                                style={{ height: "40px", borderRadius: "6px", borderColor: "#667eea", color: "#667eea" }}
                            />
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreate}
                            style={{
                                height: "40px",
                                borderRadius: "6px",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                                fontWeight: "500",
                            }}
                        >
                            Create Invoice
                        </Button>
                    </Space>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="_id"
                    loading={isDeleting}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} invoices` }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ padding: "20px", background: "#F7FAFC", borderRadius: "8px" }}>
                                <h4 style={{ margin: "0 0 15px", fontSize: "15px", fontWeight: "600", color: "#2D3748" }}>
                                    Invoice Details
                                </h4>

                                {/* Header Info */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, 1fr)",
                                        gap: "15px",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <div style={{ padding: "12px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "5px" }}>Payment Method</div>
                                        <div style={{ fontWeight: "500", color: "#2D3748" }}>{record.payment.name}</div>
                                    </div>
                                    <div style={{ padding: "12px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "5px" }}>Bank</div>
                                        <div style={{ fontWeight: "500", color: "#2D3748" }}>{record.bank.name}</div>
                                    </div>
                                    <div style={{ padding: "12px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "5px" }}>Commission</div>
                                        <div style={{ fontWeight: "600", color: "#667eea", fontFamily: "monospace" }}>
                                            ${record.totalCommissionAmount.toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ padding: "12px", background: "#fff", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "5px" }}>Created</div>
                                        <div style={{ fontWeight: "500", color: "#2D3748" }}>
                                            {dayjs(record.createdAt).format("DD MMM YYYY")}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <h5 style={{ margin: "15px 0 10px", fontSize: "13px", fontWeight: "600", color: "#2D3748" }}>
                                    Line Items ({record.items.length})
                                </h5>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: "#E2E8F0", textAlign: "left" }}>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748" }}>Finish Good</th>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748" }}>Supplier</th>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748", textAlign: "right" }}>Qty</th>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748", textAlign: "right" }}>
                                                    Unit Price
                                                </th>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748", textAlign: "right" }}>
                                                    Commission
                                                </th>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748", textAlign: "right" }}>Price</th>
                                                <th style={{ padding: "10px", fontWeight: "600", color: "#2D3748", textAlign: "right" }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {record.items.map((item, idx) => (
                                                <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                                                    <td style={{ padding: "10px", color: "#2D3748" }}>{item.finishGoods.articleNo}</td>
                                                    <td style={{ padding: "10px", color: "#2D3748" }}>
                                                        {item.priceList.supplierId.supplierName}
                                                    </td>
                                                    <td style={{ padding: "10px", textAlign: "right", fontFamily: "monospace", color: "#2D3748" }}>
                                                        {item.invoiceQty}
                                                    </td>
                                                    <td style={{ padding: "10px", textAlign: "right", fontFamily: "monospace", color: "#2D3748" }}>
                                                        ${item.unitPrice.toFixed(2)}
                                                    </td>
                                                    <td style={{ padding: "10px", textAlign: "right", fontFamily: "monospace", color: "#2D3748" }}>
                                                        ${item.commission.toFixed(2)}
                                                    </td>
                                                    <td style={{ padding: "10px", textAlign: "right", fontFamily: "monospace", color: "#2D3748" }}>
                                                        ${item.price.toFixed(2)}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "right",
                                                            fontFamily: "monospace",
                                                            fontWeight: "600",
                                                            color: "#667eea",
                                                        }}
                                                    >
                                                        ${item.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ),
                    }}
                />
            </Card>

            {/* Modal */}
            <InvoiceFormModal
                open={isModalOpen}
                editingInvoice={editingInvoice}
                clients={clients}
                currencies={currencies}
                payments={payments}
                banks={banks}
                finishGoods={finishGoods}
                priceLists={priceLists}
                isCreating={isCreating}
                isUpdating={isUpdating}
                onSubmit={editingInvoice ? handleUpdate : handleCreate}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingInvoice(null);
                }}
            />
        </div>
    );
};

export default InvoiceManagement;