import { Modal, Space, Tag, Divider } from "antd";
import { CloseOutlined, FileTextOutlined, UserOutlined, DollarOutlined, CalendarOutlined } from "@ant-design/icons";
import type { Invoice } from "../../../api/services/invoice/invoiceApi";
import dayjs from "dayjs";
import { getCurrencyConfig } from "../../../utils/currencyUtils";

interface InvoiceViewModalProps {
    invoice: Invoice | null;
    open: boolean;
    onClose: () => void;
}

const InvoiceViewModal = ({ invoice, open, onClose }: InvoiceViewModalProps) => {
    if (!invoice) return null;

    const currencyConfig = getCurrencyConfig(invoice.currency.name);

    return (
        <>
            <Modal
                title={
                    <div className="modal-header">
                        <FileTextOutlined style={{ marginRight: "8px", color: "#667eea", fontSize: "18px" }} />
                        <span>Invoice Details</span>
                    </div>
                }
                open={open}
                onCancel={onClose}
                footer={null}
                width={1000}
                closeIcon={<CloseOutlined style={{ fontSize: "16px", color: "#667eea" }} />}
                className="invoice-view-modal"
            >
                {/* Status Badge */}
                <div className="status-section">
                    <Tag color={invoice.isActive ? "success" : "default"} style={{ fontSize: "14px", padding: "5px 15px", borderRadius: "20px" }}>
                        {invoice.isActive ? "✓ ACTIVE" : "INACTIVE"}
                    </Tag>
                    <Tag color="blue" style={{ fontSize: "14px", padding: "5px 15px", borderRadius: "20px", marginLeft: "10px" }}>
                        <Space size={4}>
                            {/* <span>{currencyConfig.icon}</span> */}
                            <span>{currencyConfig.symbol}</span>
                        </Space>
                    </Tag>
                </div>

                <Divider style={{ margin: "15px 0" }} />

                {/* Invoice & Client Info */}
                <div className="info-section">
                    <h3>General Information</h3>
                    <div className="descriptions-grid">
                        <div className="desc-item">
                            <div className="desc-label">
                                <FileTextOutlined style={{ marginRight: "6px", color: "#667eea" }} />
                                Invoice Number
                            </div>
                            <div className="desc-value">{invoice.invoiceNo}</div>
                        </div>
                        <div className="desc-item">
                            <div className="desc-label">
                                <FileTextOutlined style={{ marginRight: "6px", color: "#667eea" }} />
                                Invoice ID
                            </div>
                            <div className="desc-value">
                                <Tag color="purple" style={{ fontFamily: "monospace" }}>{invoice.invoiceId}</Tag>
                            </div>
                        </div>
                        <div className="desc-item">
                            <div className="desc-label">
                                <UserOutlined style={{ marginRight: "6px", color: "#667eea" }} />
                                Client
                            </div>
                            <div className="desc-value">{invoice.client.name}</div>
                        </div>
                        <div className="desc-item">
                            <div className="desc-label">
                                <DollarOutlined style={{ marginRight: "6px", color: "#667eea" }} />
                                Currency
                            </div>
                            <div className="desc-value">
                                <Space size={6}>
                                    {/* <span style={{ fontSize: "18px" }}>{currencyConfig.icon}</span> */}
                                    <span>{currencyConfig.name}</span>
                                    <Tag color="blue">{currencyConfig.symbol}</Tag>
                                </Space>
                            </div>
                        </div>
                        <div className="desc-item">
                            <div className="desc-label">Payment Method</div>
                            <div className="desc-value">{invoice.payment.name}</div>
                        </div>
                        <div className="desc-item">
                            <div className="desc-label">Bank</div>
                            <div className="desc-value">{invoice.bank.name}</div>
                        </div>
                        <div className="desc-item">
                            <div className="desc-label">
                                <CalendarOutlined style={{ marginRight: "6px", color: "#667eea" }} />
                                Created Date
                            </div>
                            <div className="desc-value">{dayjs(invoice.createdAt).format("DD MMMM YYYY")}</div>
                        </div>
                    </div>
                </div>

                <Divider style={{ margin: "20px 0" }} />

                {/* Line Items */}
                <div className="items-section">
                    <h3>Line Items ({invoice.items.length})</h3>
                    <div className="items-table-wrapper">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th className="th-center">#</th>
                                    <th>Finish Good</th>
                                    <th className="th-supplier">Supplier</th>
                                    <th className="th-right">Qty</th>
                                    <th className="th-right th-unit-price">Unit Price</th>
                                    <th className="th-right th-commission">Commission</th>
                                    <th className="th-right th-price">Price</th>
                                    <th className="th-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="td-center">{idx + 1}</td>
                                        <td className="td-finish-good">{item.finishGoods.articleNo}</td>
                                        <td className="td-supplier">{item.priceList.supplierId.supplierName}</td>
                                        <td className="td-right">{item.invoiceQty}</td>
                                        <td className="td-right td-unit-price">{currencyConfig.symbol}{item.unitPrice.toFixed(2)}</td>
                                        <td className="td-right td-commission">{currencyConfig.symbol}{item.commission.toFixed(2)}</td>
                                        <td className="td-right td-price">{currencyConfig.symbol}{item.price.toFixed(2)}</td>
                                        <td className="td-right td-amount">{currencyConfig.symbol}{item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Divider style={{ margin: "20px 0" }} />

                {/* Totals */}
                <div className="totals-section">
                    <div className="totals-grid">
                        <div className="total-item">
                            <div className="total-label">Total Quantity</div>
                            <div className="total-value">{invoice.totalQty}</div>
                        </div>
                        <div className="total-item">
                            <div className="total-label">Total Commission</div>
                            <div className="total-value">
                                <Space size={4}>
                                    {/* <span>{currencyConfig.icon}</span> */}
                                    <span>{currencyConfig.symbol}{invoice.totalCommissionAmount.toFixed(2)}</span>
                                </Space>
                            </div>
                        </div>
                        <div className="total-item total-amount">
                            <div className="total-label">Total Amount</div>
                            <div className="total-value">
                                <Space size={4}>
                                    {/* <span style={{ fontSize: "28px" }}>{currencyConfig.symbol}</span> */}
                                    <span>{currencyConfig.symbol}{invoice.totalAmount.toFixed(2)}</span>
                                </Space>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            <style>{`
                .invoice-view-modal .modal-header {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2D3748;
                    display: flex;
                    align-items: center;
                }

                .status-section {
                    text-align: center;
                    margin-bottom: 10px;
                }

                .info-section h3,
                .items-section h3 {
                    font-size: 15px;
                    font-weight: 600;
                    color: #2D3748;
                    margin: 0 0 15px;
                }

                .descriptions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }

                .desc-item {
                    padding: 12px;
                    background: #F7FAFC;
                    border-radius: 6px;
                    border-left: 3px solid #667eea;
                }

                .desc-label {
                    font-size: 12px;
                    color: #718096;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                }

                .desc-value {
                    font-size: 14px;
                    font-weight: 500;
                    color: #2D3748;
                }

                .items-table-wrapper {
                    overflow-x: auto;
                    border-radius: 8px;
                    border: 1px solid #E2E8F0;
                }

                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .items-table thead {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .items-table th {
                    padding: 12px 10px;
                    font-weight: 600;
                    text-align: left;
                    white-space: nowrap;
                }

                .items-table .th-center {
                    text-align: center;
                    width: 40px;
                }

                .items-table .th-right {
                    text-align: right;
                }

                .items-table td {
                    padding: 10px;
                    border-top: 1px solid #E2E8F0;
                    color: #2D3748;
                }

                .items-table .td-center {
                    text-align: center;
                }

                .items-table .td-right {
                    text-align: right;
                    font-family: monospace;
                }

                .items-table .td-amount {
                    font-weight: 600;
                    color: #667eea;
                }

                .items-table tbody tr:nth-child(even) {
                    background: #F7FAFC;
                }

                .totals-section {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                    border-radius: 8px;
                }

                .totals-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    text-align: center;
                }

                .total-item {
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                }

                .total-label {
                    font-size: 12px;
                    color: #E0E7FF;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }

                .total-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    font-family: monospace;
                }

                .total-amount .total-value {
                    font-size: 26px;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .invoice-view-modal .ant-modal {
                        max-width: calc(100vw - 20px);
                        margin: 10px auto;
                        top: 10px !important;
                    }

                    .invoice-view-modal .ant-modal-content {
                        padding: 12px;
                    }

                    .invoice-view-modal .ant-modal-body {
                        padding: 12px;
                        max-height: calc(100vh - 120px);
                        overflow-y: auto;
                    }

                    .modal-header {
                        font-size: 16px !important;
                    }

                    .status-section {
                        margin-bottom: 15px;
                    }

                    .descriptions-grid {
                        grid-template-columns: 1fr !important;
                        gap: 10px !important;
                    }

                    .desc-item {
                        padding: 10px !important;
                    }

                    .desc-label {
                        font-size: 11px !important;
                    }

                    .desc-value {
                        font-size: 13px !important;
                    }

                    .items-table-wrapper {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }

                    .items-table {
                        min-width: 800px;
                        font-size: 11px;
                    }

                    .items-table th,
                    .items-table td {
                        padding: 8px 6px;
                        font-size: 11px;
                    }

                    /* Hide less important columns on mobile */
                    .items-table .th-supplier,
                    .items-table .td-supplier {
                        display: none;
                    }

                    .items-table .th-unit-price,
                    .items-table .td-unit-price,
                    .items-table .th-commission,
                    .items-table .td-commission,
                    .items-table .th-price,
                    .items-table .td-price {
                        display: none;
                    }

                    .totals-grid {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                    }

                    .total-item {
                        text-align: left !important;
                        padding: 12px !important;
                        background: rgba(255, 255, 255, 0.15) !important;
                    }

                    .total-label {
                        font-size: 11px !important;
                        margin-bottom: 6px !important;
                    }

                    .total-value {
                        font-size: 18px !important;
                    }

                    .total-amount .total-value {
                        font-size: 22px !important;
                    }
                }

                /* Very small screens */
                @media (max-width: 400px) {
                    .invoice-view-modal .ant-modal {
                        max-width: calc(100vw - 10px);
                    }

                    .modal-header {
                        font-size: 14px !important;
                    }

                    .desc-label {
                        font-size: 10px !important;
                    }

                    .desc-value {
                        font-size: 12px !important;
                    }

                    .total-value {
                        font-size: 16px !important;
                    }

                    .total-amount .total-value {
                        font-size: 20px !important;
                    }
                }

                /* Landscape mode */
                @media (max-height: 500px) and (orientation: landscape) {
                    .invoice-view-modal .ant-modal-body {
                        max-height: calc(100vh - 80px);
                    }
                }
            `}</style>
        </>
    );
};

export default InvoiceViewModal;