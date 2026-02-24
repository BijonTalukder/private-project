import { Modal, Descriptions, Table, Tag, Space, Divider } from "antd";
import { FileTextOutlined, UserOutlined, BankOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type { Invoice } from "../../../api/services/invoice/invoiceApi";

interface InvoiceViewModalProps {
    invoice: Invoice | null;
    open: boolean;
    onClose: () => void;
}

const InvoiceViewModal = ({ invoice, open, onClose }: InvoiceViewModalProps) => {
    if (!invoice) return null;

    const itemColumns: ColumnsType<any> = [
        {
            title: "#",
            key: "index",
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Finish Good",
            key: "finishGood",
            render: (_: any, record: any) => (
                <div>
                    <div style={{ fontWeight: "500", color: "#2D3748" }}>{record.finishGoods.articleNo}</div>
                    <Space size={4} style={{ marginTop: "4px" }}>
                        <Tag color="cyan" style={{ fontSize: "11px" }}>
                            {record.finishGoods.colorId.name}
                        </Tag>
                        <Tag color="orange" style={{ fontSize: "11px" }}>
                            {record.finishGoods.gsmId.name}
                        </Tag>
                    </Space>
                </div>
            ),
        },
        {
            title: "Supplier",
            key: "supplier",
            render: (_: any, record: any) => record.priceList.supplierId.supplierName,
        },
        {
            title: "Qty",
            dataIndex: "invoiceQty",
            align: "right",
            render: (qty: number) => (
                <span style={{ fontFamily: "monospace", fontWeight: "500" }}>{qty}</span>
            ),
        },
        {
            title: "Unit Price",
            dataIndex: "unitPrice",
            align: "right",
            render: (price: number) => (
                <span style={{ fontFamily: "monospace" }}>${price.toFixed(2)}</span>
            ),
        },
        {
            title: "Commission",
            dataIndex: "commission",
            align: "right",
            render: (commission: number) => (
                <span style={{ fontFamily: "monospace" }}>${commission.toFixed(2)}</span>
            ),
        },
        {
            title: "Price",
            dataIndex: "price",
            align: "right",
            render: (price: number) => (
                <span style={{ fontFamily: "monospace" }}>${price.toFixed(2)}</span>
            ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            align: "right",
            render: (amount: number) => (
                <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#667eea" }}>
                    ${amount.toFixed(2)}
                </span>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}>
                    <FileTextOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                    Invoice Details — {invoice.invoiceNo}
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            style={{ top: 30 }}
        >
            {/* Header Info */}
            <div
                style={{
                    background: "#F7FAFC",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                }}
            >
                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Invoice ID">
                        <Tag color="purple" style={{ fontFamily: "monospace" }}>
                            {invoice.invoiceId}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Invoice No">
                        <strong>{invoice.invoiceNo}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Client">
                        <Space>
                            <UserOutlined style={{ color: "#667eea" }} />
                            {invoice.client.name}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Currency">
                        <Tag color="blue">{invoice.currency.name}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Method">
                        {invoice.payment.name} ({invoice.payment.type})
                    </Descriptions.Item>
                    <Descriptions.Item label="Bank">
                        <Space direction="vertical" size={0}>
                            <span>
                                <BankOutlined style={{ marginRight: "5px", color: "#667eea" }} />
                                {invoice.bank.name}
                            </span>
                            <span style={{ fontSize: "12px", color: "#718096" }}>
                                {invoice.bank.branchName}
                            </span>
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={invoice.isActive ? "success" : "default"}>
                            {invoice.isActive ? "Active" : "Inactive"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">
                        {dayjs(invoice.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </Descriptions.Item>
                </Descriptions>
            </div>

            <Divider orientation="horizontal" style={{ fontWeight: "600", color: "#2D3748" }}>
                Line Items ({invoice.items.length})
            </Divider>

            {/* Items Table */}
            <Table
                columns={itemColumns}
                dataSource={invoice.items}
                rowKey="_id"
                pagination={false}
                size="small"
                style={{ marginBottom: "20px" }}
            />

            {/* Totals */}
            <div
                style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "20px",
                    borderRadius: "8px",
                }}
            >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                    <div>
                        <div style={{ fontSize: "12px", color: "#E0E7FF", marginBottom: "5px" }}>
                            Total Quantity
                        </div>
                        <div
                            style={{
                                fontSize: "24px",
                                fontWeight: "700",
                                color: "#fff",
                                fontFamily: "monospace",
                            }}
                        >
                            {invoice.totalQty}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "12px", color: "#E0E7FF", marginBottom: "5px" }}>
                            Total Commission
                        </div>
                        <div
                            style={{
                                fontSize: "24px",
                                fontWeight: "700",
                                color: "#fff",
                                fontFamily: "monospace",
                            }}
                        >
                            ${invoice.totalCommissionAmount.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "12px", color: "#E0E7FF", marginBottom: "5px" }}>
                            Total Amount
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: "700",
                                color: "#fff",
                                fontFamily: "monospace",
                            }}
                        >
                            ${invoice.totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default InvoiceViewModal;