import { useState, useMemo } from "react";
import { Button, Table, Space, Card, Tag, Tooltip, Spin, message } from "antd";
import {
    EditOutlined,
    EyeOutlined,
    PrinterOutlined,
    ReloadOutlined,
    FileTextOutlined,
    UserOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useGetAllInvoicesQuery, useUpdateInvoiceMutation, type Invoice } from "../../../api/services/invoice/invoiceApi";
import { useGetAllClientsQuery } from "../../../api/services/client/clientApi";
import { useGetAllCurrenciesQuery } from "../../../api/services/currency/currencyInfoApi";
import { useGetAllPaymentsQuery } from "../../../api/services/payment-info/paymentInfoApi";
import { useGetAllBanksQuery } from "../../../api/services/bank-info/bankInfoApi";
import { useGetAllFinishGoodsQuery } from "../../../api/services/finish-goods/finishGoodsApi";
import { useGetAllPriceListsQuery } from "../../../api/services/supplier-purchase-price/SupplierpurchasepricelistApi";
import type { InvoiceFilters } from "./InvoiceListFilters";
import InvoiceListFilters from "./InvoiceListFilters";
import InvoiceFormModal from "../modal/InvoiceFormModal";
import InvoiceViewModal from "./InvoiceViewModal";
import InvoicePrintModal from "../print-invoice/InvoicePrintModal";
import { getCurrencyConfig } from "../../../utils/currencyUtils";
import { useGetAllSuppliersQuery } from "../../../api/services/supplier/supplierApi";

const InvoiceListPage = () => {
    // ── RTK Query ──────────────────────────────────────────────────────────────
    const { data: invoices = [], isLoading, refetch } = useGetAllInvoicesQuery();
    const { data: clients = [], isLoading: clientsLoading } = useGetAllClientsQuery();
    const { data: currencies = [] } = useGetAllCurrenciesQuery();
    const { data: payments = [] } = useGetAllPaymentsQuery();
    const { data: banks = [] } = useGetAllBanksQuery();
    const { data: finishGoods = [] } = useGetAllFinishGoodsQuery();
    const { data: priceLists = [] } = useGetAllPriceListsQuery();
    const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
    const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
    const { data: suppliers = [] } = useGetAllSuppliersQuery();

    // ── Local State ────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<InvoiceFilters>({});
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

    // ── Filtered Data ──────────────────────────────────────────────────────────
    const filteredInvoices = useMemo(() => {
        let result = [...invoices];

        // Filter by status (approved/unapproved)
        if (filters.status) {
            if (filters.status === "approved") {
                result = result.filter((inv) => inv.isActive === true);
            } else if (filters.status === "unapproved") {
                result = result.filter((inv) => inv.isActive === false);
            }
        }

        // Filter by date range
        if (filters.dateRange && filters.dateRange.length === 2) {
            const [startDate, endDate] = filters.dateRange;
            result = result.filter((inv) => {
                const invoiceDate = dayjs(inv.createdAt);
                return (
                    invoiceDate.isAfter(startDate.startOf("day")) &&
                    invoiceDate.isBefore(endDate.endOf("day"))
                );
            });
        }

        // Filter by client
        if (filters.clientId) {
            result = result.filter((inv) => inv.clientId === filters.clientId);
        }

        return result;
    }, [invoices, filters]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleFilterChange = (newFilters: InvoiceFilters) => {
        setFilters(newFilters);
    };

    const handleResetFilters = () => {
        setFilters({});
    };

    const handleView = (invoice: Invoice) => {
        setViewingInvoice(invoice);
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
    };

    const handlePrint = (invoice: Invoice) => {
        setPrintingInvoice(invoice)
        // Create print window with invoice data
        // const printWindow = window.open("", "_blank");
        // if (!printWindow) {
        //     message.error("Please allow popups to print");
        //     return;
        // }

        // const itemsHtml = invoice.items
        //     .map(
        //         (item, idx) => `
        //     <tr>
        //         <td style="border: 1px solid #ddd; padding: 8px;">${idx + 1}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px;">${item.finishGoods.articleNo}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px;">${item.priceList.supplierId.supplierName}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.invoiceQty}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.commission.toFixed(2)}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.price.toFixed(2)}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">$${item.amount.toFixed(2)}</td>
        //     </tr>
        // `
        //     )
        //     .join("");

        // printWindow.document.write(`
        //     <!DOCTYPE html>
        //     <html>
        //     <head>
        //         <title>Invoice - ${invoice.invoiceNo}</title>
        //         <style>
        //             body { font-family: Arial, sans-serif; padding: 40px; }
        //             h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        //             .header { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        //             .section { background: #f7fafc; padding: 15px; border-radius: 8px; }
        //             .section-title { font-weight: bold; color: #2d3748; margin-bottom: 10px; }
        //             table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        //             th { background: #667eea; color: white; padding: 10px; text-align: left; }
        //             .totals { background: #667eea; color: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
        //             .totals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        //             @media print { body { padding: 20px; } }
        //         </style>
        //     </head>
        //     <body>
        //         <h1>INVOICE</h1>

        //         <div class="header">
        //             <div class="section">
        //                 <div class="section-title">Invoice Information</div>
        //                 <div><strong>Invoice No:</strong> ${invoice.invoiceNo}</div>
        //                 <div><strong>Invoice ID:</strong> ${invoice.invoiceId}</div>
        //                 <div><strong>Date:</strong> ${dayjs(invoice.createdAt).format("DD MMM YYYY")}</div>
        //                 <div><strong>Status:</strong> ${invoice.isActive ? "Approved" : "Unapproved"}</div>
        //             </div>

        //             <div class="section">
        //                 <div class="section-title">Client Information</div>
        //                 <div><strong>Name:</strong> ${invoice.client.name}</div>
        //                 <div><strong>Contact:</strong> ${invoice.client.contactNo}</div>
        //                 <div><strong>Email:</strong> ${invoice.client.email}</div>
        //             </div>
        //         </div>

        //         <div class="header">
        //             <div class="section">
        //                 <div class="section-title">Payment Details</div>
        //                 <div><strong>Currency:</strong> ${invoice.currency.name}</div>
        //                 <div><strong>Payment Method:</strong> ${invoice.payment.name}</div>
        //             </div>

        //             <div class="section">
        //                 <div class="section-title">Bank Details</div>
        //                 <div><strong>Bank:</strong> ${invoice.bank.name}</div>
        //                 <div><strong>Branch:</strong> ${invoice.bank.branchName}</div>
        //                 <div><strong>Account:</strong> ${invoice.bank.accountName}</div>
        //             </div>
        //         </div>

        //         <h2>Line Items</h2>
        //         <table>
        //             <thead>
        //                 <tr>
        //                     <th style="border: 1px solid #ddd; padding: 10px;">#</th>
        //                     <th style="border: 1px solid #ddd; padding: 10px;">Finish Good</th>
        //                     <th style="border: 1px solid #ddd; padding: 10px;">Supplier</th>
        //                     <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Qty</th>
        //                     <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Unit Price</th>
        //                     <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Commission</th>
        //                     <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
        //                     <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Amount</th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 ${itemsHtml}
        //             </tbody>
        //         </table>

        //         <div class="totals">
        //             <div class="totals-grid">
        //                 <div>
        //                     <div style="font-size: 12px; opacity: 0.9;">Total Quantity</div>
        //                     <div style="font-size: 24px; font-weight: bold;">${invoice.totalQty}</div>
        //                 </div>
        //                 <div>
        //                     <div style="font-size: 12px; opacity: 0.9;">Total Commission</div>
        //                     <div style="font-size: 24px; font-weight: bold;">$${invoice.totalCommissionAmount.toFixed(2)}</div>
        //                 </div>
        //                 <div>
        //                     <div style="font-size: 12px; opacity: 0.9;">Total Amount</div>
        //                     <div style="font-size: 28px; font-weight: bold;">$${invoice.totalAmount.toFixed(2)}</div>
        //                 </div>
        //             </div>
        //         </div>
        //     </body>
        //     </html>
        // `);

        // printWindow.document.close();
        // printWindow.focus();
        // setTimeout(() => {
        //     printWindow.print();
        // }, 250);
    };

    const handleUpdate = async (values: any) => {
        if (!editingInvoice) return;
        try {
            await updateInvoice({ id: editingInvoice._id, data: values }).unwrap();
            message.success("Invoice updated successfully!");
            setEditingInvoice(null);
        } catch (err: any) {
            message.error(err?.data?.message || "Failed to update invoice");
        }
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns: ColumnsType<Invoice> = [
        {
            title: "Invoice ID",
            dataIndex: "invoiceId",
            key: "invoiceId",
            width: 120,
            render: (text) => (
                <Tag color="purple" style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px" }}>
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
                    <FileTextOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontWeight: "500", color: "#2D3748" }}>{text}</span>
                </Space>
            ),
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
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (
                <span style={{ fontSize: "13px", color: "#718096" }}>
                    {dayjs(date).format("DD MMM YYYY")}
                </span>
            ),
        },
        {
            title: "Currency",
            key: "currency",
            width: 100,
            render: (_, record) => <Tag color="blue">{record.currency.name}</Tag>,
        },
        {
            title: "Total Qty",
            dataIndex: "totalQty",
            key: "totalQty",
            align: "right",
            width: 100,
            render: (qty) => <span style={{ fontFamily: "monospace", fontWeight: "500" }}>{qty}</span>,
        },
        {
            title: "Amount",
            dataIndex: "totalAmount",
            key: "totalAmount",
            align: "right",
            width: 150,
            render: (_, record) => {

                const currencyConfig = getCurrencyConfig(record.currency.name);

                return <Space>

                    {/* <DollarOutlined style={{ color: "#667eea" }} /> */}
                    <span style={{ fontWeight: "700", fontSize: "15px", color: "#667eea", fontFamily: "monospace" }}>
                        {currencyConfig.symbol}  {Number(record.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                </Space>


            }

            ,
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            width: 110,
            render: (isActive) =>
                isActive ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Approved
                    </Tag>
                ) : (
                    <Tag icon={<CloseCircleOutlined />} color="default">
                        Unapproved
                    </Tag>
                ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 140,
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                            style={{ color: "#667eea" }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            style={{ color: "#667eea" }}
                        />
                    </Tooltip>
                    <Tooltip title="Print">
                        <Button
                            type="text"
                            size="small"
                            icon={<PrinterOutlined />}
                            onClick={() => handlePrint(record)}
                            style={{ color: "#667eea" }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoading || clientsLoading) {
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
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
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
                            Invoice List
                        </h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#718096" }}>
                            Showing {filteredInvoices.length} of {invoices.length} invoices
                        </p>
                    </div>
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
                </div>

                {/* Filters */}
                <InvoiceListFilters
                    clients={clients}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={filteredInvoices}
                    rowKey="_id"
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} invoices`,
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* View Modal */}
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

            {/* Edit Modal */}
            {editingInvoice && (
                <InvoiceFormModal
                    open={!!editingInvoice}
                    editingInvoice={editingInvoice}
                    clients={clients}
                    currencies={currencies}
                    payments={payments}
                    banks={banks}
                    finishGoods={finishGoods}
                    // priceLists={priceLists}
                    suppliers={suppliers}
                    isCreating={false}
                    isUpdating={isUpdating}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingInvoice(null)}
                />
            )}
        </div>
    );
};

export default InvoiceListPage;