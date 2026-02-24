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

const { RangePicker } = DatePicker;

const ApprovedInvoiceListPage = () => {
    // ── RTK Query ──────────────────────────────────────────────────────────────
    const { data: invoices = [], isLoading, refetch } = useGetAllInvoicesQuery();

    // ── Local State ────────────────────────────────────────────────────────────
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    // ── Filtered Data (Only Approved) ─────────────────────────────────────────
    const approvedInvoices = useMemo(() => {
        // Filter only approved invoices
        let result = invoices.filter((inv) => inv.isActive === true);

        // Apply date range filter if set
        if (dateRange && dateRange.length === 2) {
            const [startDate, endDate] = dateRange;
            result = result.filter((inv) => {
                const invoiceDate = dayjs(inv.createdAt);
                return (
                    invoiceDate.isAfter(startDate.startOf("day")) &&
                    invoiceDate.isBefore(endDate.endOf("day"))
                );
            });
        }

        return result;
    }, [invoices, dateRange]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleView = (invoice: Invoice) => {
        setViewingInvoice(invoice);
    };

    const handlePrint = (invoice: Invoice) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            message.error("Please allow popups to print");
            return;
        }

        const itemsHtml = invoice.items
            .map(
                (item, idx) => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.finishGoods.articleNo}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.priceList.supplierId.supplierName}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.invoiceQty}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.commission.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.price.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">$${item.amount.toFixed(2)}</td>
            </tr>
        `
            )
            .join("");

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${invoice.invoiceNo}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Arial', sans-serif; padding: 40px; color: #2d3748; }
                    .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
                    .invoice-header h1 { color: #667eea; font-size: 32px; margin-bottom: 5px; }
                    .invoice-header .approved-badge { 
                        display: inline-block; 
                        background: #52c41a; 
                        color: white; 
                        padding: 5px 15px; 
                        border-radius: 20px; 
                        font-size: 14px; 
                        margin-top: 10px;
                    }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .info-section { background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
                    .info-section h3 { color: #667eea; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
                    .info-row { margin: 8px 0; font-size: 14px; }
                    .info-row strong { display: inline-block; min-width: 120px; color: #4a5568; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #667eea; color: white; padding: 12px; text-align: left; font-size: 13px; }
                    td { border: 1px solid #e2e8f0; padding: 10px; font-size: 13px; }
                    tbody tr:nth-child(even) { background: #f7fafc; }
                    .totals { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 8px; margin-top: 30px; }
                    .totals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; }
                    .total-item { padding: 15px; }
                    .total-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; }
                    .total-value { font-size: 28px; font-weight: bold; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #718096; font-size: 12px; }
                    @media print { 
                        body { padding: 20px; }
                        .invoice-header h1 { font-size: 28px; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <h1>APPROVED INVOICE</h1>
                    <div class="approved-badge">✓ APPROVED</div>
                </div>
                
                <div class="info-grid">
                    <div class="info-section">
                        <h3>Invoice Information</h3>
                        <div class="info-row"><strong>Invoice No:</strong> ${invoice.invoiceNo}</div>
                        <div class="info-row"><strong>Invoice ID:</strong> ${invoice.invoiceId}</div>
                        <div class="info-row"><strong>Date:</strong> ${dayjs(invoice.createdAt).format("DD MMMM YYYY")}</div>
                        <div class="info-row"><strong>Currency:</strong> ${invoice.currency.name}</div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Client Information</h3>
                        <div class="info-row"><strong>Name:</strong> ${invoice.client.name}</div>
                        <div class="info-row"><strong>Contact:</strong> ${invoice.client.contactNo}</div>
                        <div class="info-row"><strong>Email:</strong> ${invoice.client.email}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-section">
                        <h3>Payment Details</h3>
                        <div class="info-row"><strong>Method:</strong> ${invoice.payment.name}</div>
                        <div class="info-row"><strong>Type:</strong> ${invoice.payment.type}</div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Bank Details</h3>
                        <div class="info-row"><strong>Bank:</strong> ${invoice.bank.name}</div>
                        <div class="info-row"><strong>Branch:</strong> ${invoice.bank.branchName}</div>
                        <div class="info-row"><strong>Account:</strong> ${invoice.bank.accountName}</div>
                    </div>
                </div>

                <h2 style="color: #667eea; margin: 30px 0 15px; font-size: 18px;">Line Items</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: center; width: 40px;">#</th>
                            <th>Finish Good</th>
                            <th>Supplier</th>
                            <th style="text-align: right;">Quantity</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Commission</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="totals-grid">
                        <div class="total-item">
                            <div class="total-label">Total Quantity</div>
                            <div class="total-value">${invoice.totalQty}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">Total Commission</div>
                            <div class="total-value">$${invoice.totalCommissionAmount.toFixed(2)}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">Total Amount</div>
                            <div class="total-value">$${invoice.totalAmount.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>This is an approved invoice. Generated on ${dayjs().format("DD MMMM YYYY, hh:mm A")}</p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    // ── Calculate Summary ──────────────────────────────────────────────────────
    const summary = useMemo(() => {
        return {
            totalInvoices: approvedInvoices.length,
            totalQuantity: approvedInvoices.reduce((sum, inv) => sum + inv.totalQty, 0),
            totalAmount: approvedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
            totalCommission: approvedInvoices.reduce((sum, inv) => sum + inv.totalCommissionAmount, 0),
        };
    }, [approvedInvoices]);

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
                <Space>
                    <CalendarOutlined style={{ color: "#667eea" }} />
                    <span style={{ fontSize: "13px", color: "#718096" }}>
                        {dayjs(date).format("DD MMM YYYY")}
                    </span>
                </Space>
            ),
        },
        {
            title: "Currency",
            key: "currency",
            width: 100,
            render: (_, record) => <Tag color="blue">{record.currency.name}</Tag>,
        },
        {
            title: "Payment",
            key: "payment",
            render: (_, record) => (
                <span style={{ fontSize: "13px", color: "#2D3748" }}>{record.payment.name}</span>
            ),
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
            title: "Total Amount",
            dataIndex: "totalAmount",
            key: "totalAmount",
            align: "right",
            width: 150,
            render: (amount) => (
                <Space>
                    <DollarOutlined style={{ color: "#52c41a" }} />
                    <span style={{ fontWeight: "700", fontSize: "15px", color: "#52c41a", fontFamily: "monospace" }}>
                        {Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                </Space>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                            style={{ color: "#667eea" }}
                        />
                    </Tooltip>
                    <Tooltip title="Print Invoice">
                        <Button
                            type="text"
                            size="small"
                            icon={<PrinterOutlined />}
                            onClick={() => handlePrint(record)}
                            style={{ color: "#52c41a" }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
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
                background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
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
                        <Space>
                            <CheckCircleOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
                            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#2D3748" }}>
                                Approved Invoices
                            </h2>
                        </Space>
                        <p style={{ margin: "5px 0 0 32px", fontSize: "13px", color: "#718096" }}>
                            Showing {approvedInvoices.length} approved invoices
                        </p>
                    </div>
                    <Space>
                        <RangePicker
                            placeholder={["From Date", "To Date"]}
                            format="DD MMM YYYY"
                            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                            style={{ height: "40px" }}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => refetch()}
                            style={{
                                height: "40px",
                                borderRadius: "6px",
                                borderColor: "#52c41a",
                                color: "#52c41a",
                            }}
                        >
                            Refresh
                        </Button>
                    </Space>
                </div>

                {/* Summary Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "15px",
                        marginBottom: "20px",
                    }}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            padding: "20px",
                            borderRadius: "8px",
                            color: "#fff",
                        }}
                    >
                        <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "5px" }}>Total Invoices</div>
                        <div style={{ fontSize: "28px", fontWeight: "700", fontFamily: "monospace" }}>
                            {summary.totalInvoices}
                        </div>
                    </div>
                    <div
                        style={{
                            background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                            padding: "20px",
                            borderRadius: "8px",
                            color: "#fff",
                        }}
                    >
                        <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "5px" }}>Total Quantity</div>
                        <div style={{ fontSize: "28px", fontWeight: "700", fontFamily: "monospace" }}>
                            {summary.totalQuantity}
                        </div>
                    </div>
                    <div
                        style={{
                            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            padding: "20px",
                            borderRadius: "8px",
                            color: "#fff",
                        }}
                    >
                        <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "5px" }}>Total Commission</div>
                        <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "monospace" }}>
                            ${summary.totalCommission.toFixed(2)}
                        </div>
                    </div>
                    <div
                        style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            padding: "20px",
                            borderRadius: "8px",
                            color: "#fff",
                        }}
                    >
                        <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "5px" }}>Total Amount</div>
                        <div style={{ fontSize: "28px", fontWeight: "700", fontFamily: "monospace" }}>
                            ${summary.totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={approvedInvoices}
                    rowKey="_id"
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} approved invoices`,
                    }}
                    scroll={{ x: 1100 }}
                />
            </Card>

            {/* View Modal */}
            <InvoiceViewModal invoice={viewingInvoice} open={!!viewingInvoice} onClose={() => setViewingInvoice(null)} />
        </div>
    );
};

export default ApprovedInvoiceListPage;