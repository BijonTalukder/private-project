import { useState } from "react";
import { Button, Table, message, Popconfirm, Space, Card, Tag, Tooltip, Spin, Switch, Input } from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined, UserOutlined,
    EyeOutlined, PrinterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
    useGetAllInvoicesQuery, useCreateInvoiceMutation, useUpdateInvoiceMutation,
    useDeleteInvoiceMutation, useToggleInvoiceStatusMutation, type Invoice,
} from "../../api/services/invoice/invoiceApi";
import { useGetAllClientsQuery } from "../../api/services/client/clientApi";
import { useGetAllPaymentsQuery } from "../../api/services/payment-info/paymentInfoApi";
import { useGetAllCurrenciesQuery } from "../../api/services/currency/currencyInfoApi";
import { useGetAllBanksQuery } from "../../api/services/bank-info/bankInfoApi";
import { useGetAllFinishGoodsQuery } from "../../api/services/finish-goods/finishGoodsApi";
import { useGetAllPriceListsQuery } from "../../api/services/supplier-purchase-price/SupplierpurchasepricelistApi";
import InvoiceFormModal from "./modal/InvoiceFormModal";
import InvoiceViewModal from "./list/InvoiceViewModal";
import { getCurrencyConfig } from "../../utils/currencyUtils";
import InvoicePrintModal from "./print-invoice/InvoicePrintModal";

const InvoiceManagement = () => {
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
    const [searchText, setSearchText] = useState("");

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

    const handleView = (record: Invoice) => {
        setViewingInvoice(record);
    };

    const handlePrint = (record: Invoice) => {
        setPrintingInvoice(record);
    };

    const openCreate = () => {
        setEditingInvoice(null);
        setIsModalOpen(true);
    };

    const openEdit = (record: Invoice) => {
        setEditingInvoice(record);
        setIsModalOpen(true);
    };

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
                return record.invoiceNo.toLowerCase().includes(s) || record.invoiceId.toLowerCase().includes(s) || record.client.name.toLowerCase().includes(s);
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
            render: (_, record) => {
                const currencyConfig = getCurrencyConfig(record.currency.name);
                return (
                    <Tag color="blue" style={{ fontSize: "12px", padding: "4px 8px" }}>
                        <Space size={4}>
                            <span>{currencyConfig.symbol}</span>
                            {/* <span>{currencyConfig.code}</span> */}
                        </Space>
                    </Tag>
                );
            },
            responsive: ['lg'] as any,
        },
        {
            title: "Total Qty",
            dataIndex: "totalQty",
            key: "totalQty",
            align: "right",
            render: (qty) => <span style={{ fontFamily: "monospace", color: "#2D3748", fontWeight: "500" }}>{qty}</span>,
            responsive: ['md'] as any,
        },
        {
            title: "Amount",
            key: "totalAmount",
            align: "right",
            render: (_, record) => {
                const currencyConfig = getCurrencyConfig(record.currency.name);
                return (
                    <Space>
                        {/* <span style={{ fontSize: "16px" }}>{currencyConfig.icon}</span> */}
                        <span style={{ fontWeight: "700", fontSize: "15px", color: "#667eea", fontFamily: "monospace" }}>
                            {currencyConfig.symbol}{Number(record.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                    </Space>
                );
            },
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
            width: 150,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View">
                        <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} style={{ color: "#667eea", borderRadius: "6px" }} />
                    </Tooltip>
                    <Tooltip title="Print">
                        <Button type="text" size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(record)} style={{ color: "#667eea", borderRadius: "6px" }} />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} style={{ color: "#667eea", borderRadius: "6px" }} />
                    </Tooltip>
                    <Popconfirm title="Delete Invoice" description="This will delete the invoice and all its items. Continue?" onConfirm={() => handleDelete(record._id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                        <Tooltip title="Delete"><Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: "6px" }} /></Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (isLoading || clientsLoading || currenciesLoading || paymentsLoading || banksLoading || finishGoodsLoading || priceListsLoading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div className="invoice-container" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "30px" }}>
                <Card style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0" }}>
                    <div className="invoice-header">
                        <div className="header-title">
                            <h2>Invoice Management</h2>
                            <p>Total {invoices.length} invoices</p>
                        </div>
                        <Space className="header-actions">
                            <Input placeholder="Search..." prefix={<SearchOutlined style={{ color: "#667eea" }} />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear className="search-input" />
                            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} className="action-btn refresh-btn" /></Tooltip>
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="action-btn create-btn"><span className="btn-label">Create</span></Button>
                        </Space>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={invoices}
                        rowKey="_id"
                        loading={isDeleting}
                        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} invoices` }}
                        scroll={{ x: 1100 }}
                        expandable={{
                            expandedRowRender: (record) => {
                                const currencyConfig = getCurrencyConfig(record.currency.name);
                                return (
                                    <div className="expanded-section">
                                        <h4>Invoice Details</h4>
                                        <div className="info-grid">
                                            <div className="info-card">
                                                <div className="info-label">Payment Method</div>
                                                <div className="info-value">{record.payment.name}</div>
                                            </div>
                                            <div className="info-card">
                                                <div className="info-label">Bank</div>
                                                <div className="info-value">{record.bank.name}</div>
                                            </div>
                                            <div className="info-card">
                                                <div className="info-label">Commission</div>
                                                <div className="info-value amount">{currencyConfig.symbol}{record.totalCommissionAmount.toFixed(2)}</div>
                                            </div>
                                            <div className="info-card">
                                                <div className="info-label">Created</div>
                                                <div className="info-value">{dayjs(record.createdAt).format("DD MMM YYYY")}</div>
                                            </div>
                                        </div>

                                        <h5>Line Items ({record.items.length})</h5>
                                        <div className="items-table-wrapper">
                                            <table className="items-table">
                                                <thead>
                                                    <tr>
                                                        <th>Finish Good</th>
                                                        <th>Supplier</th>
                                                        <th>Qty</th>
                                                        <th>Unit Price</th>
                                                        <th>Commission</th>
                                                        <th>Price</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {record.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>{item.finishGoods.articleNo}</td>
                                                            <td>{item.priceList.supplierId.supplierName}</td>
                                                            <td>{item.invoiceQty}</td>
                                                            <td>{currencyConfig.symbol}{item.unitPrice.toFixed(2)}</td>
                                                            <td>{currencyConfig.symbol}{item.commission.toFixed(2)}</td>
                                                            <td>{currencyConfig.symbol}{item.price.toFixed(2)}</td>
                                                            <td className="amount-cell">{currencyConfig.symbol}{item.amount.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            },
                        }}
                    />
                </Card>

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
                    onCancel={() => { setIsModalOpen(false); setEditingInvoice(null); }}
                />

                <InvoiceViewModal
                    invoice={viewingInvoice}
                    open={!!viewingInvoice}
                    onClose={() => setViewingInvoice(null)}
                />

                <InvoicePrintModal
                    invoice={printingInvoice}
                    open={!!printingInvoice}
                    onClose={() => setPrintingInvoice(null)}
                />
            </div>

            <style>{`
                .invoice-container { padding: 30px; }
                .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #E2E8F0; }
                .header-title h2 { margin: 0; font-size: 20px; font-weight: 600; color: #2D3748; }
                .header-title p { margin: 5px 0 0; font-size: 13px; color: #718096; }
                .header-actions { gap: 10px; }
                .search-input { width: 320px; height: 40px; border-radius: 6px; }
                .action-btn { height: 40px; border-radius: 6px; }
                .refresh-btn { border-color: #667eea; color: #667eea; }
                .create-btn { background: linear-gradient(to right, #667eea, #764ba2); border: none; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); font-weight: 500; }
                .expanded-section { padding: 20px; background: #F7FAFC; border-radius: 8px; }
                .expanded-section h4 { margin: 0 0 15px; font-size: 15px; font-weight: 600; color: #2D3748; }
                .expanded-section h5 { margin: 15px 0 10px; font-size: 13px; font-weight: 600; color: #2D3748; }
                .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
                .info-card { padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #E2E8F0; }
                .info-label { font-size: 12px; color: #718096; margin-bottom: 5px; }
                .info-value { font-weight: 500; color: #2D3748; }
                .info-value.amount { font-weight: 600; color: #667eea; font-family: monospace; }
                .items-table-wrapper { overflow-x: auto; }
                .items-table { width: 100%; font-size: 13px; border-collapse: collapse; }
                .items-table thead tr { background: #E2E8F0; text-align: left; }
                .items-table th { padding: 10px; font-weight: 600; color: #2D3748; }
                .items-table td { padding: 10px; color: #2D3748; border-top: 1px solid #E2E8F0; }
                .items-table tbody tr:nth-child(even) { background: #F9FAFB; }
                .items-table td:nth-child(n+3) { text-align: right; font-family: monospace; }
                .items-table .amount-cell { font-weight: 600; color: #667eea; }

                @media (max-width: 768px) {
                    .invoice-container { padding: 15px !important; }
                    .invoice-header { flex-direction: column; align-items: flex-start !important; gap: 12px; }
                    .header-title h2 { font-size: 18px !important; }
                    .header-title p { font-size: 12px !important; }
                    .header-actions { width: 100%; flex-wrap: wrap; }
                    .search-input { width: 100% !important; order: 3; }
                    .action-btn { flex: 1; }
                    .btn-label { font-size: 13px; }
                    .refresh-btn .btn-label { display: none; }
                    .info-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
                    .info-card { padding: 10px !important; }
                    .info-label { font-size: 11px !important; }
                    .info-value { font-size: 13px; }
                    .items-table { font-size: 11px; }
                    .items-table th, .items-table td { padding: 6px 4px; font-size: 11px; }
                }

                @media (max-width: 400px) {
                    .create-btn .btn-label { display: none; }
                    .info-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </>
    );
};

export default InvoiceManagement;