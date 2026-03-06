import { useState, useMemo } from "react";
import { Button, Table, Space, Card, Tag, Tooltip, Spin, message, DatePicker } from "antd";
import {
    EyeOutlined,
    PrinterOutlined,
    ReloadOutlined,
    FileTextOutlined,
    UserOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import InvoiceViewModal from "./InvoiceViewModal";
import { useGetAllInvoicesQuery, type Invoice } from "../../../api/services/invoice/invoiceApi";
import { getCurrencyConfig } from "../../../utils/currencyUtils";
import InvoicePrintModal from "../print-invoice/InvoicePrintModal";

const { RangePicker } = DatePicker;

const ApprovedInvoiceListPage = () => {
    const { data: invoices = [], isLoading, refetch } = useGetAllInvoicesQuery();
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
    const approvedInvoices = useMemo(() => {
        let result = invoices.filter((inv) => inv.isActive === true);
        if (dateRange && dateRange.length === 2) {
            const [startDate, endDate] = dateRange;
            result = result.filter((inv) => {
                const invoiceDate = dayjs(inv.createdAt);
                return invoiceDate.isAfter(startDate.startOf("day")) && invoiceDate.isBefore(endDate.endOf("day"));
            });
        }
        return result;
    }, [invoices, dateRange]);

    const handleView = (invoice: Invoice) => setViewingInvoice(invoice);

    const handlePrint = (invoice: Invoice) => {
        // const printWindow = window.open("", "_blank");
        // if (!printWindow) {
        //     message.error("Please allow popups to print");
        //     return;
        // }
        setPrintingInvoice(invoice);

        // const itemsHtml = invoice.items
        //     .map((item, idx) => `
        //     <tr>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${idx + 1}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px;">${item.finishGoods.articleNo}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px;">${item.priceList.supplierId.supplierName}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.invoiceQty}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.commission.toFixed(2)}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.price.toFixed(2)}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">$${item.amount.toFixed(2)}</td>
        //     </tr>
        // `).join("");

        // printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice - ${invoice.invoiceNo}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; }body { font-family: 'Arial', sans-serif; padding: 40px; color: #2d3748; }.invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }.invoice-header h1 { color: #667eea; font-size: 32px; margin-bottom: 5px; }.invoice-header .approved-badge { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; margin-top: 10px; }.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }.info-section { background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }.info-section h3 { color: #667eea; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }.info-row { margin: 8px 0; font-size: 14px; }.info-row strong { display: inline-block; min-width: 120px; color: #4a5568; }table { width: 100%; border-collapse: collapse; margin: 20px 0; }th { background: #667eea; color: white; padding: 12px; text-align: left; font-size: 13px; }td { border: 1px solid #e2e8f0; padding: 10px; font-size: 13px; }tbody tr:nth-child(even) { background: #f7fafc; }.totals { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 8px; margin-top: 30px; }.totals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; }.total-item { padding: 15px; }.total-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; }.total-value { font-size: 28px; font-weight: bold; }.footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #718096; font-size: 12px; }@media print { body { padding: 20px; }.invoice-header h1 { font-size: 28px; }}</style></head><body><div class="invoice-header"><h1>APPROVED INVOICE</h1><div class="approved-badge">✓ APPROVED</div></div><div class="info-grid"><div class="info-section"><h3>Invoice Information</h3><div class="info-row"><strong>Invoice No:</strong> ${invoice.invoiceNo}</div><div class="info-row"><strong>Invoice ID:</strong> ${invoice.invoiceId}</div><div class="info-row"><strong>Date:</strong> ${dayjs(invoice.createdAt).format("DD MMMM YYYY")}</div><div class="info-row"><strong>Currency:</strong> ${invoice.currency.name}</div></div><div class="info-section"><h3>Client Information</h3><div class="info-row"><strong>Name:</strong> ${invoice.client.name}</div><div class="info-row"><strong>Contact:</strong> ${invoice.client.contactNo}</div><div class="info-row"><strong>Email:</strong> ${invoice.client.email}</div></div></div><div class="info-grid"><div class="info-section"><h3>Payment Details</h3><div class="info-row"><strong>Method:</strong> ${invoice.payment.name}</div><div class="info-row"><strong>Type:</strong> ${invoice.payment.type}</div></div><div class="info-section"><h3>Bank Details</h3><div class="info-row"><strong>Bank:</strong> ${invoice.bank.name}</div><div class="info-row"><strong>Branch:</strong> ${invoice.bank.branchName}</div><div class="info-row"><strong>Account:</strong> ${invoice.bank.accountName}</div></div></div><h2 style="color: #667eea; margin: 30px 0 15px; font-size: 18px;">Line Items</h2><table><thead><tr><th style="text-align: center; width: 40px;">#</th><th>Finish Good</th><th>Supplier</th><th style="text-align: right;">Quantity</th><th style="text-align: right;">Unit Price</th><th style="text-align: right;">Commission</th><th style="text-align: right;">Price</th><th style="text-align: right;">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="totals"><div class="totals-grid"><div class="total-item"><div class="total-label">Total Quantity</div><div class="total-value">${invoice.totalQty}</div></div><div class="total-item"><div class="total-label">Total Commission</div><div class="total-value">$${invoice.totalCommissionAmount.toFixed(2)}</div></div><div class="total-item"><div class="total-label">Total Amount</div><div class="total-value">$${invoice.totalAmount.toFixed(2)}</div></div></div></div><div class="footer"><p>This is an approved invoice. Generated on ${dayjs().format("DD MMMM YYYY, hh:mm A")}</p></div></body></html>`);

        // printWindow.document.close();
        // printWindow.focus();
        // setTimeout(() => printWindow.print(), 250);
    };

    const summary = useMemo(() => ({
        totalInvoices: approvedInvoices.length,
        totalQuantity: approvedInvoices.reduce((sum, inv) => sum + inv.totalQty, 0),
        totalAmount: approvedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        totalCommission: approvedInvoices.reduce((sum, inv) => sum + inv.totalCommissionAmount, 0),
    }), [approvedInvoices]);

    const columns: ColumnsType<Invoice> = [
        {
            title: "Invoice ID",
            dataIndex: "invoiceId",
            key: "invoiceId",
            width: 120,
            render: (text) => <Tag color="purple" style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px" }}>{text}</Tag>,
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
                <Space>
                    <CalendarOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontSize: "13px", color: "#718096" }}>{dayjs(date).format("DD MMM YYYY")}</span>
                </Space>
            ),
            responsive: ['md'] as any,
        },
        {
            title: "Currency",
            key: "currency",
            width: 100,
            render: (_, record) => <Tag color="blue">{record.currency.name}</Tag>,
            responsive: ['lg'] as any,
        },
        {
            title: "Payment",
            key: "payment",
            render: (_, record) => <span style={{ fontSize: "13px", color: "#2D3748" }}>{record.payment.name}</span>,
            responsive: ['lg'] as any,
        },
        {
            title: "Total Qty",
            dataIndex: "totalQty",
            key: "totalQty",
            align: "right",
            width: 100,
            render: (qty) => <span style={{ fontFamily: "monospace", fontWeight: "500", color: "#2D3748" }}>{qty}</span>,
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
            title: "Actions",
            key: "actions",
            width: 100,
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} style={{ color: "#667eea" }} /></Tooltip>
                    <Tooltip title="Print"><Button type="text" size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(record)} style={{ color: "#667eea" }} /></Tooltip>
                </Space>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div className="approved-container" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "30px" }}>
                <Card style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                    <div className="section-header">
                        <div className="header-title">
                            <Space>
                                <CheckCircleOutlined style={{ fontSize: "24px", color: "#667eea" }} />
                                <h2>Approved Invoices</h2>
                            </Space>
                            <p>Showing {approvedInvoices.length} approved invoices</p>
                        </div>
                        <Space className="header-actions">
                            <RangePicker placeholder={["From", "To"]} format="DD MMM YYYY" onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)} className="date-picker" />
                            <Button icon={<ReloadOutlined />} onClick={() => refetch()} className="action-btn"><span className="btn-label">Refresh</span></Button>
                        </Space>
                    </div>

                    {/* <div className="summary-cards">
                        <div className="summary-card card-purple">
                            <div className="summary-label">Total Invoices</div>
                            <div className="summary-value">{summary.totalInvoices}</div>
                        </div>
                        <div className="summary-card card-blue">
                            <div className="summary-label">Total Quantity</div>
                            <div className="summary-value">{summary.totalQuantity}</div>
                        </div>
                        <div className="summary-card card-orange">
                            <div className="summary-label">Total Commission</div>
                            <div className="summary-value">${summary.totalCommission.toFixed(2)}</div>
                        </div>
                        <div className="summary-card card-green">
                            <div className="summary-label">Total Amount</div>
                            <div className="summary-value">${summary.totalAmount.toFixed(2)}</div>
                        </div>
                    </div> */}

                    <Table columns={columns} dataSource={approvedInvoices} rowKey="_id" pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `Total ${total} approved invoices` }} scroll={{ x: 1100 }} />
                </Card>

                <InvoiceViewModal invoice={viewingInvoice} open={!!viewingInvoice} onClose={() => setViewingInvoice(null)} />
                <InvoicePrintModal
                    invoice={printingInvoice}
                    open={!!printingInvoice}
                    onClose={() => setPrintingInvoice(null)}
                />
            </div>

            <style>{`
                .approved-container { padding: 30px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #E2E8F0; }
                .header-title h2 { margin: 0; font-size: 20px; font-weight: 600; color: #2D3748; }
                .header-title p { margin: 5px 0 0 32px; font-size: 13px; color: #718096; }
                .header-actions { gap: 10px; }
                .date-picker { height: 40px; }
                .action-btn { height: 40px; border-radius: 6px; border-color: #667eea; color: #667eea; }
                .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
                .summary-card { padding: 20px; border-radius: 8px; color: #fff; }
                .summary-label { font-size: 12px; opacity: 0.9; margin-bottom: 5px; }
                .summary-value { font-size: 28px; font-weight: 700; font-family: monospace; }
                .card-purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .card-blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
                .card-orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
                .card-green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }

                @media (max-width: 768px) {
                    .approved-container { padding: 15px !important; }
                    .section-header { flex-direction: column; align-items: flex-start !important; gap: 12px; }
                    .header-title h2 { font-size: 18px !important; }
                    .header-title p { margin: 4px 0 0 0 !important; font-size: 12px !important; }
                    .header-actions { width: 100%; flex-direction: column; }
                    .date-picker { width: 100% !important; }
                    .action-btn { width: 100%; }
                    .btn-label { font-size: 13px; }
                    .summary-cards { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
                    .summary-card { padding: 15px !important; }
                    .summary-label { font-size: 11px !important; }
                    .summary-value { font-size: 22px !important; }
                }

                @media (max-width: 400px) {
                    .summary-cards { grid-template-columns: 1fr !important; }
                    .summary-value { font-size: 24px !important; }
                }
            `}</style>
        </>
    );
};

export default ApprovedInvoiceListPage;