import { Modal, Tag, Table, Descriptions, Badge, Divider, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { Invoice, InvoiceItem } from "../../../api/services/invoice/invoiceApi";
import { getCurrencyConfig } from "../../../utils/currencyUtils";

interface InvoiceViewModalProps {
    invoice: Invoice | null;
    open: boolean;
    onClose: () => void;
}

const InvoiceViewModal = ({ invoice, open, onClose }: InvoiceViewModalProps) => {
    if (!invoice) return null;

    const sym = getCurrencyConfig(invoice.currency.name).symbol;

    // ── Item table columns ────────────────────────────────────────────────────
    const columns: ColumnsType<InvoiceItem> = [
        {
            title: "#",
            width: 42,
            align: "center",
            render: (_v, _r, i) => (
                <span style={{ color: "#A0AEC0", fontSize: 12 }}>{i + 1}</span>
            ),
        },
        {
            title: "Article No",
            width: 110,
            render: (_, r) => (
                <span style={{ fontWeight: 600, color: "#2D3748", fontFamily: "monospace" }}>
                    {r.finishGoods?.articleNo ?? "—"}
                </span>
            ),
        },
        // ✅ Finish goods attributes
        {
            title: "Color",
            width: 100,
            render: (_, r) => {
                const name = r.finishGoods?.colorId?.name;
                return name ? <Tag color="blue">{name}</Tag> : <span style={{ color: "#CBD5E0" }}>—</span>;
            },
        },
        {
            title: "GSM",
            width: 80,
            align: "center",
            render: (_, r) => {
                const name = r.finishGoods?.gsmId?.name;
                return name ? <Tag color="purple">{name}</Tag> : <span style={{ color: "#CBD5E0" }}>—</span>;
            },
        },
        {
            title: "Width",
            width: 80,
            align: "center",
            render: (_, r) => {
                // Handles both widthId (ref) and width (plain number)
                const val = r.finishGoods?.widthId?.name ?? r.finishGoods?.width;
                return val != null
                    ? <Tag color="cyan">{val}</Tag>
                    : <span style={{ color: "#CBD5E0" }}>—</span>;
            },
        },
        {
            title: "Unit",
            width: 80,
            align: "center",
            render: (_, r) => {
                const name = r.finishGoods?.unitId?.name;
                return name ? <Tag color="geekblue">{name}</Tag> : <span style={{ color: "#CBD5E0" }}>—</span>;
            },
        },
        {
            title: "Supplier",
            render: (_, r) => (
                <span style={{ color: "#4A5568" }}>
                    {r.priceList?.supplierId?.supplierName ?? "—"}
                </span>
            ),
        },
        {
            title: "Qty",
            dataIndex: "invoiceQty",
            align: "right",
            width: 65,
            render: (v) => (
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{v}</span>
            ),
        },
        {
            title: "Unit Price",
            dataIndex: "unitPrice",
            align: "right",
            width: 105,
            render: (v) => (
                <span style={{ fontFamily: "monospace" }}>
                    {sym}{Number(v).toFixed(2)}
                </span>
            ),
        },
        {
            title: "Commission",
            dataIndex: "commission",
            align: "right",
            width: 115,
            render: (v) => (
                <span style={{ fontFamily: "monospace", color: "#E53E3E" }}>
                    {sym}{Number(v).toFixed(2)}
                </span>
            ),
        },
        {
            title: "Price",
            dataIndex: "price",
            align: "right",
            width: 100,
            render: (v) => (
                <span style={{ fontFamily: "monospace" }}>
                    {sym}{Number(v).toFixed(2)}
                </span>
            ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            align: "right",
            width: 115,
            render: (v) => (
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#667eea" }}>
                    {sym}{Number(v).toFixed(2)}
                </span>
            ),
        },
    ];

    return (
        <Modal
            title={
                <Space>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#2D3748" }}>
                        Invoice — {invoice.invoiceNo}
                    </span>
                    <Badge
                        status={invoice.isActive ? "success" : "default"}
                        text={
                            <span style={{ fontSize: 12, color: invoice.isActive ? "#38A169" : "#A0AEC0" }}>
                                {invoice.isActive ? "Approved" : "Unapproved"}
                            </span>
                        }
                    />
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={1200}
            style={{ top: 20 }}
        >
            {/* ── Header info ─────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Invoice No">
                        <span style={{ fontWeight: 600 }}>{invoice.invoiceNo}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Invoice ID">
                        <Tag color="purple" style={{ fontFamily: "monospace" }}>{invoice.invoiceId}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Date">
                        {dayjs(invoice.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Currency">
                        <Tag color="blue">{invoice.currency.name}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment">
                        {invoice.payment.name}
                    </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Client">
                        <span style={{ fontWeight: 600 }}>{invoice.client.name}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Contact">{invoice.client.contactNo}</Descriptions.Item>
                    <Descriptions.Item label="Email">{invoice.client.email}</Descriptions.Item>
                    <Descriptions.Item label="Address">{invoice.client.address}</Descriptions.Item>
                    <Descriptions.Item label="Bank">
                        {invoice.bank.name} — {invoice.bank.branchName}
                    </Descriptions.Item>
                </Descriptions>
            </div>

            <Divider style={{ margin: "12px 0" }}>
                <span style={{ color: "#667eea", fontWeight: 600 }}>
                    Items ({invoice.items.length})
                </span>
            </Divider>

            {/* ── Items table ──────────────────────────────────────────────────── */}
            <Table
                columns={columns}
                dataSource={invoice.items}
                rowKey="_id"
                pagination={false}
                size="small"
                scroll={{ x: 1100 }}
                rowClassName={(_, i) => i % 2 === 0 ? "row-even" : "row-odd"}
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row style={{ background: "#EBF4FF", fontWeight: 700 }}>
                            <Table.Summary.Cell index={0} colSpan={7} align="right">
                                <span style={{ color: "#2D3748" }}>Totals</span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={7} align="right">
                                <span style={{ fontFamily: "monospace" }}>{invoice.totalQty}</span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={8} />
                            <Table.Summary.Cell index={9} align="right">
                                <span style={{ fontFamily: "monospace", color: "#E53E3E" }}>
                                    {sym}{Number(invoice.totalCommissionAmount).toFixed(2)}
                                </span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={10} />
                            <Table.Summary.Cell index={11} align="right">
                                <span style={{ fontFamily: "monospace", fontSize: 15, color: "#667eea" }}>
                                    {sym}{Number(invoice.totalAmount).toFixed(2)}
                                </span>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />

            <style>{`
                .row-even td { background: #FAFAFA !important; }
                .row-odd  td { background: #fff    !important; }
            `}</style>
        </Modal>
    );
};

export default InvoiceViewModal;