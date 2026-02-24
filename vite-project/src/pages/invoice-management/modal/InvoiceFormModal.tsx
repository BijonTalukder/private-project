import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Space, message, Divider } from "antd";
import { PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import type { CreateInvoiceDto, Invoice, InvoiceItemDto } from "../../../api/services/invoice/invoiceApi";
import type { Client } from "../../../api/services/client/clientApi";
import type { CurrencyInfo } from "../../../api/services/currency/currencyInfoApi";
import type { PaymentInfo } from "../../../api/services/payment-info/paymentInfoApi";
import type { BankInfo } from "../../../api/services/bank-info/bankInfoApi";
import type { SupplierPurchasePriceList } from "../../../api/services/supplier-purchase-price/SupplierpurchasepricelistApi";
import type { FinishGoods } from "../../../api/services/finish-goods/finishGoodsApi";
import InvoiceItemRow from "../row/InvoiceItemRow";


interface InvoiceFormModalProps {
    open: boolean;
    editingInvoice: Invoice | null;
    clients: Client[];
    currencies: CurrencyInfo[];
    payments: PaymentInfo[];
    banks: BankInfo[];
    finishGoods: FinishGoods[];
    priceLists: SupplierPurchasePriceList[];
    isCreating: boolean;
    isUpdating: boolean;
    onSubmit: (values: CreateInvoiceDto) => void;
    onCancel: () => void;
}

const InvoiceFormModal = ({
    open,
    editingInvoice,
    clients,
    currencies,
    payments,
    banks,
    finishGoods,
    priceLists,
    isCreating,
    isUpdating,
    onSubmit,
    onCancel,
}: InvoiceFormModalProps) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState<InvoiceItemDto[]>([]);

    // Initialize items when editing
    useEffect(() => {
        if (editingInvoice && open) {
            const mappedItems = editingInvoice.items.map((item) => ({
                finishGoodsId: item.finishGoodsId,
                supplierPurchasePriceId: item.supplierPurchasePriceId,
                invoiceQty: item.invoiceQty,
                unitPrice: item.unitPrice,
                commission: item.commission,
                price: item.price,
                amount: item.amount,
            }));
            setItems(mappedItems);
            form.setFieldsValue({
                invoiceNo: editingInvoice.invoiceNo,
                clientId: editingInvoice.clientId,
                currencyId: editingInvoice.currencyId,
                paymentId: editingInvoice.paymentId,
                bankId: editingInvoice.bankId,
            });
        } else if (!open) {
            setItems([]);
            form.resetFields();
        }
    }, [editingInvoice, open, form]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                finishGoodsId: "",
                supplierPurchasePriceId: "",
                invoiceQty: 0,
                unitPrice: 0,
                commission: 0,
                price: 0,
                amount: 0,
            },
        ]);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleDeleteItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (items.length === 0) {
                message.error("Please add at least one item");
                return;
            }

            // Validate all items have required fields
            const invalidItem = items.find(
                (item) =>
                    !item.finishGoodsId ||
                    !item.supplierPurchasePriceId ||
                    item.invoiceQty <= 0
            );

            if (invalidItem) {
                message.error("Please complete all item fields");
                return;
            }

            onSubmit({
                ...values,
                items,
            });
        });
    };

    const totalQty = items.reduce((sum, item) => sum + item.invoiceQty, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const totalCommission = items.reduce((sum, item) => sum + item.commission, 0);

    return (
        <Modal
            title={
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}>
                    <FileTextOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                    {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1200}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: "20px" }}>
                {/* Header Section */}
                <div
                    style={{
                        background: "#F7FAFC",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                    }}
                >
                    <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600", color: "#2D3748" }}>
                        Invoice Header
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Invoice No</span>}
                            name="invoiceNo"
                            rules={[{ required: true, message: "Required" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input placeholder="INV-2024-001" style={{ height: "42px" }} />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Client</span>}
                            name="clientId"
                            rules={[{ required: true, message: "Required" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Select placeholder="Select client" style={{ height: "42px" }} showSearch>
                                {clients.map((c) => (
                                    <Select.Option key={c._id} value={c._id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Currency</span>}
                            name="currencyId"
                            rules={[{ required: true, message: "Required" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Select placeholder="Select currency" style={{ height: "42px" }} showSearch>
                                {currencies.map((c) => (
                                    <Select.Option key={c._id} value={c._id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "15px" }}>
                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Payment Method</span>}
                            name="paymentId"
                            rules={[{ required: true, message: "Required" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Select placeholder="Select payment" style={{ height: "42px" }} showSearch>
                                {payments.map((p) => (
                                    <Select.Option key={p._id} value={p._id}>
                                        {p.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Bank</span>}
                            name="bankId"
                            rules={[{ required: true, message: "Required" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Select placeholder="Select bank" style={{ height: "42px" }} showSearch>
                                {banks.map((b) => (
                                    <Select.Option key={b._id} value={b._id}>
                                        {b.name} — {b.branchName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                </div>

                {/* Items Section */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#2D3748" }}>
                            Invoice Items
                        </h4>
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={handleAddItem}
                            style={{ borderColor: "#667eea", color: "#667eea" }}
                        >
                            Add Item
                        </Button>
                    </div>

                    {/* Column Headers */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1.2fr 60px",
                            gap: "10px",
                            padding: "10px 12px",
                            background: "#E2E8F0",
                            borderRadius: "6px",
                            marginBottom: "10px",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#2D3748",
                        }}
                    >
                        <div>Finish Good</div>
                        <div>Price List</div>
                        <div>Qty</div>
                        <div>Unit Price</div>
                        <div>Commission</div>
                        <div>Price</div>
                        <div>Amount</div>
                        <div></div>
                    </div>

                    {/* Item Rows */}
                    {items.map((item, index) => (
                        <InvoiceItemRow
                            key={index}
                            item={item}
                            index={index}
                            finishGoods={finishGoods}
                            priceLists={priceLists}
                            onChange={handleItemChange}
                            onDelete={handleDeleteItem}
                        />
                    ))}

                    {items.length === 0 && (
                        <div
                            style={{
                                padding: "40px",
                                textAlign: "center",
                                background: "#F7FAFC",
                                borderRadius: "6px",
                                color: "#718096",
                            }}
                        >
                            No items added. Click "Add Item" to begin.
                        </div>
                    )}
                </div>

                {/* Totals */}
                {items.length > 0 && (
                    <div
                        style={{
                            background: "#667eea",
                            padding: "15px 20px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                            <div>
                                <div style={{ fontSize: "12px", color: "#E0E7FF", marginBottom: "5px" }}>
                                    Total Quantity
                                </div>
                                <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff", fontFamily: "monospace" }}>
                                    {totalQty}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: "12px", color: "#E0E7FF", marginBottom: "5px" }}>
                                    Total Commission
                                </div>
                                <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff", fontFamily: "monospace" }}>
                                    ${totalCommission.toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: "12px", color: "#E0E7FF", marginBottom: "5px" }}>
                                    Total Amount
                                </div>
                                <div style={{ fontSize: "24px", fontWeight: "700", color: "#fff", fontFamily: "monospace" }}>
                                    ${totalAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Divider style={{ margin: "20px 0" }} />

                {/* Footer Buttons */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <Button onClick={onCancel} style={{ height: "42px", minWidth: "100px" }}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={isCreating || isUpdating}
                        style={{
                            height: "42px",
                            background: "linear-gradient(to right, #667eea, #764ba2)",
                            border: "none",
                            minWidth: "120px",
                        }}
                    >
                        {editingInvoice ? "Update Invoice" : "Create Invoice"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default InvoiceFormModal;