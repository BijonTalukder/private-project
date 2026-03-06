import { Modal, Button, Space, message } from "antd";
import { PrinterOutlined, CloseOutlined, DownloadOutlined } from "@ant-design/icons";
import type { Invoice } from "../../../api/services/invoice/invoiceApi";
import dayjs from "dayjs";
import { getCurrencyConfig } from "../../../utils/currencyUtils";

interface InvoicePrintModalProps {
    invoice: Invoice | null;
    open: boolean;
    onClose: () => void;
}

const InvoicePrintModal = ({ invoice, open, onClose }: InvoicePrintModalProps) => {
    if (!invoice) return null;

    const currencyConfig = getCurrencyConfig(invoice.currency.name);

    // Convert number to words
    const numberToWords = (num: number): string => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        if (num === 0) return 'Zero';

        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        const convert = (n: number): string => {
            if (n === 0) return 'Zero';
            const lakh = Math.floor(n / 100000);
            const thousand = Math.floor((n % 100000) / 1000);
            const remainder = n % 1000;
            let result = '';
            if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
            if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
            if (remainder > 0) result += convertLessThanThousand(remainder);
            return result.trim();
        };

        const integerPart = Math.floor(num);
        const decimalPart = Math.round((num - integerPart) * 100);
        let words = convert(integerPart);
        if (decimalPart > 0) words += ' and ' + convertLessThanThousand(decimalPart) + ' Paisa';
        return words + ' Only';
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            message.error('Please allow popups to print');
            return;
        }

        const itemsHtml = invoice.items.map((item, idx) => `
            <tr>
                <td>${item.finishGoods.articleNo}</td>
                <td>${item.priceList.supplierId.supplierId}</td>
                <td>${dayjs(invoice.createdAt).format("DD.MM.YYYY")}</td>
                <td>${item.finishGoods.articleNo}</td>
                <td>${item.finishGoods.colorId.name}</td>
                <td style="text-align: right;">${item.invoiceQty}</td>
                <td style="text-align: right;">${item.unitPrice.toFixed(2)}</td>
                <td style="text-align: right;">${item.amount.toFixed(2)}</td>
            </tr>
        `).join('');

        // Add empty rows
        const emptyRows = Math.max(0, 3 - invoice.items.length);
        const emptyRowsHtml = Array(emptyRows).fill('').map(() => `
            <tr class="empty-row">
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${invoice.invoiceNo}</title>
                <meta charset="UTF-8">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Times New Roman', Times, serif;
                        padding: 40px;
                        background: white;
                    }

                    .print-controls {
                        text-align: center;
                        margin-bottom: 30px;
                        padding: 20px;
                        background: #f5f5f5;
                        border-radius: 8px;
                    }

                    .print-controls button {
                        margin: 0 10px;
                        padding: 10px 30px;
                        font-size: 16px;
                        cursor: pointer;
                        border: none;
                        border-radius: 6px;
                    }

                    .btn-print {
                        background: linear-gradient(to right, #667eea, #764ba2);
                        color: white;
                    }

                    .btn-download {
                        background: #52c41a;
                        color: white;
                    }

                    .btn-close {
                        background: #d9d9d9;
                        color: #333;
                    }

                    .invoice-container {
                        background: white;
                        border: 2px solid #000;
                        padding: 40px;
                    }

                    .invoice-header {
                        text-align: center;
                        margin-bottom: 30px;
                    }

                    .invoice-header h1 {
                        font-size: 32px;
                        font-weight: bold;
                        text-decoration: underline;
                        letter-spacing: 3px;
                    }

                    .info-table {
                        width: 100%;
                        margin-bottom: 30px;
                    }

                    .info-table td {
                        padding: 4px 0;
                        border: none;
                    }

                    .info-table .label {
                        width: 120px;
                        font-weight: bold;
                    }

                    .info-table .colon {
                        width: 20px;
                    }

                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1px solid #000;
                        margin-bottom: 20px;
                    }

                    .items-table th,
                    .items-table td {
                        border: 1px solid #000;
                        padding: 8px;
                        font-size: 12px;
                    }

                    .items-table th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        text-align: center;
                    }

                    .items-table td {
                        text-align: left;
                    }

                    .items-table .empty-row td {
                        height: 30px;
                    }

                    .total-row {
                        background-color: #f0f0f0;
                    }

                    .total-row .total-label {
                        text-align: right;
                        font-weight: bold;
                        font-size: 14px;
                    }

                    .total-row .total-amount {
                        text-align: right;
                        font-weight: bold;
                        font-size: 14px;
                    }

                    .amount-words {
                        margin: 20px 0;
                    }

                    .amount-words p {
                        margin: 8px 0;
                        font-size: 13px;
                    }

                    .payment-details {
                        margin: 30px 0;
                    }

                    .payment-details h3 {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }

                    .payment-table {
                        width: 100%;
                    }

                    .payment-table td {
                        padding: 4px 0;
                        font-size: 13px;
                    }

                    .payment-label {
                        width: 150px;
                        font-weight: bold;
                    }

                    .payment-colon {
                        width: 20px;
                    }

                    .signature-section {
                        margin-top: 80px;
                    }

                    .signature-section p {
                        font-weight: bold;
                        font-size: 13px;
                    }

                    @media print {
                        body {
                            padding: 20px;
                        }

                        .print-controls {
                            display: none !important;
                        }

                        .invoice-container {
                            border: 2px solid #000;
                            padding: 20px;
                        }

                        .items-table th {
                            background-color: #f0f0f0 !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }

                        .total-row {
                            background-color: #f0f0f0 !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }

                        @page {
                            margin: 0.5cm;
                            size: A4 portrait;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- Print Controls -->
                <div class="print-controls">
                    <button class="btn-print" onclick="window.print()"> Print Invoice</button>
                    <button class="btn-download" onclick="window.print()">Download PDF</button>
                    <button class="btn-close" onclick="window.close()">✖ Close</button>
                </div>

                <!-- Invoice Content -->
                <div class="invoice-container">
                    <!-- Header -->
                    <div class="invoice-header">
                        <h1>BILL</h1>
                    </div>

                    <!-- Consignee Details -->
                    <table class="info-table">
                        <tbody>
                            <tr>
                                <td class="label">Consignee</td>
                                <td class="colon">:</td>
                                <td class="value">${invoice.client.name}</td>
                            </tr>
                            <tr>
                                <td class="label">Address</td>
                                <td class="colon">:</td>
                                <td class="value">${invoice.client.address || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td class="label">Date</td>
                                <td class="colon">:</td>
                                <td class="value">${dayjs(invoice.createdAt).format("DD.MM.YYYY")}</td>
                            </tr>
                            <tr>
                                <td class="label">Bill No</td>
                                <td class="colon">:</td>
                                <td class="value">${invoice.invoiceNo}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Items Table -->
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>PI NO</th>
                                <th>DO NO</th>
                                <th>DELIVERY DATE</th>
                                <th>ARTICLE</th>
                                <th>COLOR</th>
                                <th>QUANTITY</th>
                                <th>UNIT PRICE</th>
                                <th>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            ${emptyRowsHtml}
                            <tr class="total-row">
                                <td colspan="7" class="total-label">TOTAL=</td>
                                <td class="total-amount">${invoice.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Amount in Words -->
                    <div class="amount-words">
                        <p><strong>Total Amount = TK. ${invoice.totalAmount.toLocaleString()}/=</strong> (${numberToWords(invoice.totalAmount)} Taka Only).</p>
                        <p>Payment will be made by local currency.</p>
                    </div>

                    <!-- Payment Details -->
                    <div class="payment-details">
                        <h3>Payment details:</h3>
                        <table class="payment-table">
                            <tbody>
                                <tr>
                                    <td class="payment-label">A/C Name</td>
                                    <td class="payment-colon">:</td>
                                    <td class="payment-value">${invoice.bank.accountName}</td>
                                </tr>
                                <tr>
                                    <td class="payment-label">Current Act No</td>
                                    <td class="payment-colon">:</td>
                                    <td class="payment-value">${invoice.bank.bankId || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td class="payment-label">Branch Name</td>
                                    <td class="payment-colon">:</td>
                                    <td class="payment-value">${invoice.bank.branchName}</td>
                                </tr>
                                <tr>
                                    <td class="payment-label">Bank</td>
                                    <td class="payment-colon">:</td>
                                    <td class="payment-value">${invoice.bank.name}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Signature -->
                    <div class="signature-section">
                        <p>Authorized Signatory</p>
                    </div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
    };

    return (
        <Modal
            title={
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748" }}>
                    <PrinterOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                    Print Invoice
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
            closeIcon={<CloseOutlined />}
        >
            <div style={{ padding: "20px 0" }}>
                <p style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
                    Invoice: <strong>{invoice.invoiceNo}</strong>
                </p>
                <p style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
                    Client: <strong>{invoice.client.name}</strong>
                </p>
                <p style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
                    Amount: <strong>TK. {invoice.totalAmount.toLocaleString()}</strong>
                </p>

                <Space direction="vertical" style={{ width: "100%" }}>
                    <Button
                        type="primary"
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                        size="large"
                        block
                        style={{
                            background: "linear-gradient(to right, #667eea, #764ba2)",
                            border: "none",
                            height: "50px",
                            fontSize: "16px"
                        }}
                    >
                        Open Print Window
                    </Button>

                    <Button
                        onClick={onClose}
                        size="large"
                        block
                        style={{ height: "45px" }}
                    >
                        Cancel
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

export default InvoicePrintModal;