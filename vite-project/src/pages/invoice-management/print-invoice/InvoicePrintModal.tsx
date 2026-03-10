import { Modal, Button, Space, message } from "antd";
import { PrinterOutlined, CloseOutlined } from "@ant-design/icons";
import type { Invoice } from "../../../api/services/invoice/invoiceApi";
import dayjs from "dayjs";
import { getCurrencyConfig } from "../../../utils/currencyUtils";
import companyLogo from "../../../assets/company-logo.jpeg";

interface InvoicePrintModalProps {
    invoice: Invoice | null;
    open: boolean;
    onClose: () => void;
}

const COMPANY = {
    name: "ANISHA TEX TRADE CORPORATION",
    logoUrl: companyLogo,
};

const InvoicePrintModal = ({ invoice, open, onClose }: InvoicePrintModalProps) => {
    if (!invoice) return null;

    const currencyConfig = getCurrencyConfig(invoice.currency.name);
    const sym = currencyConfig.symbol;

    // ── Number to words ───────────────────────────────────────────────────────
    const numberToWords = (num: number): string => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const cvt = (n: number): string => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + cvt(n % 100) : '');
        };

        const convert = (n: number): string => {
            if (n === 0) return 'Zero';
            const lakh = Math.floor(n / 100000);
            const thousand = Math.floor((n % 100000) / 1000);
            const remainder = n % 1000;
            let r = '';
            if (lakh) r += cvt(lakh) + ' Lakh ';
            if (thousand) r += cvt(thousand) + ' Thousand ';
            if (remainder) r += cvt(remainder);
            return r.trim();
        };

        const intPart = Math.floor(num);
        const decPart = Math.round((num - intPart) * 100);
        let words = convert(intPart);
        if (decPart > 0) words += ' and ' + cvt(decPart) + ' Paisa';
        return words + ' Only';
    };

    // ── handlePrint is async — converts logo to base64 first ─────────────────
    // Bundled asset URLs (e.g. /assets/logo-abc123.jpeg) don't resolve inside
    // a window.open() context. Embedding as base64 data URI solves this.
    const handlePrint = async () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            message.error('Please allow popups to print');
            return;
        }

        // ✅ Convert logo to inline base64 data URI
        let logoBase64 = '';
        if (COMPANY.logoUrl) {
            try {
                const res = await fetch(COMPANY.logoUrl);
                const blob = await res.blob();
                logoBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => resolve('');
                    reader.readAsDataURL(blob);
                });
            } catch {
                logoBase64 = '';
            }
        }

        const logoHtml = logoBase64
            ? `<img src="${logoBase64}" alt="Logo" style="height:80px; object-fit:contain; display:block; margin:0 auto 6px;" />`
            : `<div style="font-size:24px; font-weight:bold; letter-spacing:2px;">${COMPANY.name}</div>`;

        // ── Build item rows ───────────────────────────────────────────────────
        const itemsHtml = invoice.items.map((item) => {
            const color = item.finishGoods?.colorId?.name ?? '—';
            const unit = item.finishGoods?.unitId?.name ?? '—';
            const gsm = item.finishGoods?.gsmId?.name ?? '—';
            const width = item.finishGoods?.widthId?.name
                ?? (item.finishGoods?.width != null ? String(item.finishGoods.width) : '—');

            return `
            <tr>
                <td>${item.finishGoods?.articleNo ?? '—'}</td>
                <td>${color}</td>
                <td>${gsm}</td>
                <td>${width}</td>
                <td>${unit}</td>
                <td>${item.invoiceQty}</td>
                <td>${sym}${item.unitPrice.toFixed(2)}</td>
                <td>${sym}${item.commission.toFixed(2)}</td>
                <td>${sym}${item.amount.toFixed(2)}</td>
            </tr>`;
        }).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${invoice.invoiceNo}</title>
                <meta charset="UTF-8">
                <style>
                    * { margin:0; padding:0; box-sizing:border-box; }
                    body { font-family:'Times New Roman', Times, serif; padding:30px; background:white; font-size:13px; }

                    .print-controls {
                        text-align:center; margin-bottom:24px; padding:16px;
                        background:#f5f5f5; border-radius:8px;
                    }
                    .print-controls button {
                        margin:0 8px; padding:10px 28px; font-size:15px;
                        cursor:pointer; border:none; border-radius:6px;
                    }
                    .btn-print { background:linear-gradient(to right,#667eea,#764ba2); color:white; }
                    .btn-close { background:#d9d9d9; color:#333; }

                    .invoice-wrapper { border:2px solid #000; }

                    .company-header {
                        text-align:center;
                        padding:20px 40px 16px;
                        border-bottom:2px solid #000;
                    }
                    .company-header .company-name {
                        font-size:20px; font-weight:bold; letter-spacing:1px; margin-top:4px;
                    }

                    .invoice-title {
                        text-align:center; padding:14px 0 10px;
                        font-size:26px; font-weight:bold;
                        text-decoration:underline; letter-spacing:4px;
                        border-bottom:1px solid #ccc;
                    }

                    .info-section { padding:14px 30px; border-bottom:1px solid #ccc; }
                    .info-table { width:100%; border-collapse:collapse; }
                    .info-table td { padding:3px 0; }
                    .info-table .lbl { width:110px; font-weight:bold; }
                    .info-table .col { width:18px; }

                    .items-section { padding:0 30px; }
                    .items-table {
                        width:100%; border-collapse:collapse;
                        border:1px solid #000; margin:14px 0;
                    }
                    .items-table th,
                    .items-table td {
                        border:1px solid #000; padding:7px 8px;
                        font-size:12px; text-align:center;
                    }
                    .items-table th { background:#e8e8e8; font-weight:bold; }
                    .total-row td { background:#e8e8e8; font-weight:bold; font-size:13px; }

                    .amount-words {
                        padding:10px 30px; border-top:1px solid #ccc;
                        font-size:13px; line-height:1.8;
                    }

                    .payment-section { padding:12px 30px; border-top:1px solid #ccc; }
                    .payment-section h3 { font-size:13px; font-weight:bold; margin-bottom:8px; }
                    .pay-table { width:100%; border-collapse:collapse; }
                    .pay-table td { padding:3px 0; font-size:13px; }
                    .pay-lbl { width:160px; font-weight:bold; }
                    .pay-col { width:18px; }

                    .signature-section {
                        padding:60px 30px 24px; border-top:1px solid #ccc;
                        text-align:right; font-weight:bold; font-size:13px;
                    }

                    @media print {
                        body { padding:10px; }
                        .print-controls { display:none !important; }
                        .items-table th,
                        .total-row { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
                        @page { margin:0.5cm; size:A4 portrait; }
                    }
                </style>
            </head>
            <body>
                <div class="print-controls">
                    <button class="btn-print" onclick="window.print()">🖨 Print Invoice</button>
                    <button class="btn-close"  onclick="window.close()">✖ Close</button>
                </div>

                <div class="invoice-wrapper">

                    <!-- ✅ Logo centered inside top border -->
                    <div class="company-header">
                        ${logoHtml}
                        <div class="company-name">${COMPANY.name}</div>
                    </div>

                    <div class="invoice-title">BILL</div>

                    <div class="info-section">
                        <table class="info-table">
                            <tbody>
                                <tr>
                                    <td class="lbl">Consignee</td>
                                    <td class="col">:</td>
                                    <td><strong>${invoice.client.name}</strong></td>
                                    <td style="width:40px;"></td>
                                    <td class="lbl">Invoice No</td>
                                    <td class="col">:</td>
                                    <td>${invoice.invoiceNo}</td>
                                </tr>
                                <tr>
                                    <td class="lbl">Address</td>
                                    <td class="col">:</td>
                                    <td>${invoice.client.address || 'N/A'}</td>
                                    <td></td>
                                    <td class="lbl">Date</td>
                                    <td class="col">:</td>
                                    <td>${dayjs(invoice.createdAt).format("DD.MM.YYYY")}</td>
                                </tr>
                                <tr>
                                    <td class="lbl">Contact</td>
                                    <td class="col">:</td>
                                    <td>${invoice.client.contactNo || 'N/A'}</td>
                                    <td></td>
                                    <td class="lbl">Currency</td>
                                    <td class="col">:</td>
                                    <td>${invoice.currency.name}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="items-section">
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>ARTICLE</th>
                                    <th>COLOR</th>
                                    <th>GSM</th>
                                    <th>WIDTH</th>
                                    <th>UNIT</th>
                                    <th>QTY</th>
                                    <th>UNIT PRICE</th>
                                    <th>COMMISSION</th>
                                    <th>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                                <tr class="total-row">
                                    <td colspan="5" style="text-align:right;">TOTAL</td>
                                    <td>${invoice.totalQty}</td>
                                    <td></td>
                                    <td>${sym}${invoice.totalCommissionAmount.toFixed(2)}</td>
                                    <td>${sym}${invoice.totalAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="amount-words">
                        <p><strong>Total Amount = ${sym} ${invoice.totalAmount.toLocaleString()}/=</strong></p>
                        <p><em>(${numberToWords(invoice.totalAmount)})</em></p>
                        <p style="margin-top:6px;">Payment will be made by local currency.</p>
                    </div>

                    <div class="payment-section">
                        <h3>Payment Details:</h3>
                        <table class="pay-table">
                            <tbody>
                                <tr>
                                    <td class="pay-lbl">A/C Name</td>
                                    <td class="pay-col">:</td>
                                    <td>${invoice.bank.accountName}</td>
                                </tr>
                                <tr>
                                    <td class="pay-lbl">Bank</td>
                                    <td class="pay-col">:</td>
                                    <td>${invoice.bank.name}</td>
                                </tr>
                                <tr>
                                    <td class="pay-lbl">Branch Name</td>
                                    <td class="pay-col">:</td>
                                    <td>${invoice.bank.branchName}</td>
                                </tr>
                                <tr>
                                    <td class="pay-lbl">Payment Method</td>
                                    <td class="pay-col">:</td>
                                    <td>${invoice.payment.name} (${invoice.payment.type})</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="signature-section">
                        Authorized Signatory
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
                    Print Invoice — {invoice.invoiceNo}
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={420}
            closeIcon={<CloseOutlined />}
        >
            <div style={{ padding: "16px 0" }}>
                <div style={{ background: "#F7FAFC", borderRadius: 8, padding: "16px", marginBottom: 20, fontSize: 13, lineHeight: 2 }}>
                    <div>Client: <strong>{invoice.client.name}</strong></div>
                    <div>Date: <strong>{dayjs(invoice.createdAt).format("DD MMM YYYY")}</strong></div>
                    <div>Items: <strong>{invoice.items.length}</strong></div>
                    <div>Total Qty: <strong>{invoice.totalQty}</strong></div>
                    <div>Amount: <strong>{sym}{invoice.totalAmount.toLocaleString()}</strong></div>
                </div>

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
                            fontSize: "15px",
                        }}
                    >
                        Open Print Window
                    </Button>
                    <Button onClick={onClose} size="large" block style={{ height: "44px" }}>
                        Cancel
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

export default InvoicePrintModal;