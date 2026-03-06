import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message, Divider } from "antd";
import { PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import type { CreateInvoiceDto, Invoice, InvoiceItemDto } from "../../../api/services/invoice/invoiceApi";
import type { Client } from "../../../api/services/client/clientApi";
import type { CurrencyInfo } from "../../../api/services/currency/currencyInfoApi";
import type { PaymentInfo } from "../../../api/services/payment-info/paymentInfoApi";
import type { BankInfo } from "../../../api/services/bank-info/bankInfoApi";
import type { SupplierPurchasePriceList } from "../../../api/services/supplier-purchase-price/SupplierpurchasepricelistApi";
import type { FinishGoods } from "../../../api/services/finish-goods/finishGoodsApi";
import InvoiceItemRow from "../row/InvoiceItemRow";
import { getCurrencyConfig } from "../../../utils/currencyUtils";

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

    // ✅ Watch the selected currencyId from the form
    const selectedCurrencyId = Form.useWatch("currencyId", form);
    const selectedCurrency = currencies.find((c) => c._id === selectedCurrencyId);

    // ✅ Resolve currency icon once — used in totals and rows
    const currencyIcon = getCurrencyConfig(selectedCurrency?.name ?? "").symbol;

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
                currencyId: typeof item.currencyId === 'string'
                    ? currencies.find((c) => c._id === item.currencyId) || { _id: '', name: '' }
                    : item.currencyId,
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
        const currencyId = form.getFieldValue("currencyId") ?? "";
        setItems([...items, {
            finishGoodsId: "",
            supplierPurchasePriceId: "",
            invoiceQty: 0,
            unitPrice: 0,
            commission: 0,
            price: 0,
            amount: 0,
            currencyId,
        }]);
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

            const invalidItem = items.find(
                (item) => !item.finishGoodsId || !item.supplierPurchasePriceId || item.invoiceQty <= 0
            );

            if (invalidItem) {
                message.error("Please complete all item fields");
                return;
            }

            onSubmit({ ...values, items });
        });
    };

    const totalQty = items.reduce((sum, item) => sum + item.invoiceQty, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const totalCommission = items.reduce((sum, item) => sum + item.commission * item.invoiceQty, 0);

    return (
        <>
            <Modal
                title={
                    <div className="invoice-modal-title">
                        <FileTextOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                        <span>{editingInvoice ? "Edit Invoice" : "Create Invoice"}</span>
                    </div>
                }
                open={open}
                onCancel={onCancel}
                footer={null}
                width={1200}
                style={{ top: 20 }}
                className="invoice-form-modal"
            >
                <Form form={form} layout="vertical" style={{ marginTop: "20px" }}>
                    {/* Header Section */}
                    <div className="invoice-header-section">
                        <h4>Invoice Header</h4>
                        <div className="header-grid">
                            {/* <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Invoice No</span>}
                                name="invoiceNo"
                                rules={[{ required: true, message: "Required" }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input placeholder="INV-2024-001" style={{ height: "42px" }} />
                            </Form.Item> */}
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Client</span>}
                                name="clientId"
                                rules={[{ required: true, message: "Required" }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Select placeholder="Select client" style={{ height: "42px" }} showSearch>
                                    {clients.map((c) => (
                                        <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
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
                                        <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>
                        <div className="payment-grid">
                            <Form.Item
                                label={<span style={{ fontWeight: "500" }}>Payment Method</span>}
                                name="paymentId"
                                rules={[{ required: true, message: "Required" }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Select placeholder="Select payment" style={{ height: "42px" }} showSearch>
                                    {payments.map((p) => (
                                        <Select.Option key={p._id} value={p._id}>{p.name}</Select.Option>
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
                                        <Select.Option key={b._id} value={b._id}>{b.name} — {b.branchName}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="invoice-items-section">
                        <div className="items-header">
                            <h4>Invoice Items</h4>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={handleAddItem}
                                style={{ borderColor: "#667eea", color: "#667eea" }}
                            >
                                <span className="add-item-text">Add Item</span>
                            </Button>
                        </div>

                        {/* Column Headers */}
                        <div className="items-column-headers">
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
                        <div className="items-list">
                            {items.map((item, index) => (
                                <InvoiceItemRow
                                    key={index}
                                    item={item}
                                    index={index}
                                    finishGoods={finishGoods}
                                    priceLists={priceLists}
                                    onChange={handleItemChange}
                                    onDelete={handleDeleteItem}
                                    currencyName={selectedCurrency?.name ?? ""}
                                />
                            ))}
                        </div>

                        {items.length === 0 && (
                            <div className="empty-items">No items added. Click "Add Item" to begin.</div>
                        )}
                    </div>

                    {/* Totals */}
                    {items.length > 0 && (
                        <div className="invoice-totals">
                            <div className="totals-grid">
                                <div className="total-item">
                                    <div className="total-label">Total Quantity</div>
                                    <div className="total-value">{totalQty}</div>
                                </div>
                                <div className="total-item">
                                    <div className="total-label">Total Commission</div>
                                    {/* ✅ Uses selected currency icon */}
                                    <div className="total-value">{currencyIcon} {totalCommission.toFixed(2)}</div>
                                </div>
                                <div className="total-item">
                                    <div className="total-label">Total Amount</div>
                                    {/* ✅ Uses selected currency icon */}
                                    <div className="total-value total-amount">{currencyIcon} {totalAmount.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Divider style={{ margin: "20px 0" }} />

                    {/* Footer Buttons */}
                    <div className="modal-footer">
                        <Button onClick={onCancel} style={{ height: "42px", minWidth: "100px" }}>Cancel</Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={isCreating || isUpdating}
                            style={{ height: "42px", background: "linear-gradient(to right, #667eea, #764ba2)", border: "none", minWidth: "120px" }}
                        >
                            {editingInvoice ? "Update" : "Create"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <style>{`
                .invoice-form-modal .ant-modal { max-width: calc(100vw - 40px); }
                .invoice-modal-title { font-size: 18px; font-weight: 600; color: #2D3748; padding: 10px 0; }
                .invoice-header-section { background: #F7FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                .invoice-header-section h4 { margin: 0 0 15px; font-size: 14px; font-weight: 600; color: #2D3748; }
                .header-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
                .invoice-items-section { margin-bottom: 20px; }
                .items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .items-header h4 { margin: 0; font-size: 14px; font-weight: 600; color: #2D3748; }
                .items-column-headers { display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr 1.2fr 60px; gap: 10px; padding: 10px 12px; background: #E2E8F0; border-radius: 6px; margin-bottom: 10px; font-size: 12px; font-weight: 600; color: #2D3748; }
                .empty-items { padding: 40px; text-align: center; background: #F7FAFC; border-radius: 6px; color: #718096; }
                .invoice-totals { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; }
                .totals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .total-item { text-align: center; }
                .total-label { font-size: 12px; color: #E0E7FF; margin-bottom: 5px; }
                .total-value { font-size: 20px; font-weight: 700; color: #fff; font-family: monospace; }
                .total-amount { font-size: 24px; }
                .modal-footer { display: flex; gap: 10px; justify-content: flex-end; }

                @media (max-width: 768px) {
                    .invoice-form-modal .ant-modal { max-width: calc(100vw - 20px); margin: 10px auto; top: 10px !important; }
                    .invoice-form-modal .ant-modal-content { padding: 12px; }
                    .invoice-form-modal .ant-modal-body { padding: 12px; max-height: calc(100vh - 120px); overflow-y: auto; }
                    .invoice-modal-title { font-size: 16px !important; }
                    .invoice-modal-title span { font-size: 15px; }
                    .invoice-header-section { padding: 12px !important; }
                    .invoice-header-section h4 { font-size: 13px !important; margin-bottom: 12px !important; }
                    .header-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
                    .payment-grid { grid-template-columns: 1fr !important; gap: 12px !important; margin-top: 12px !important; }
                    .items-header { flex-direction: column; align-items: flex-start !important; gap: 10px; }
                    .items-header h4 { font-size: 13px !important; }
                    .items-header button { width: 100%; }
                    .add-item-text { display: inline; }
                    .items-column-headers { display: none !important; }
                    .items-list { overflow-x: auto; -webkit-overflow-scrolling: touch; }
                    .empty-items { padding: 30px 20px !important; font-size: 13px; }
                    .invoice-totals { padding: 12px !important; }
                    .totals-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
                    .total-item { text-align: left !important; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; }
                    .total-label { font-size: 11px !important; margin-bottom: 6px !important; }
                    .total-value { font-size: 18px !important; }
                    .total-amount { font-size: 22px !important; }
                    .modal-footer { flex-direction: column; }
                    .modal-footer button { width: 100%; min-width: auto !important; }
                }

                @media (max-width: 400px) {
                    .invoice-form-modal .ant-modal { max-width: calc(100vw - 10px); }
                    .invoice-modal-title { font-size: 14px !important; }
                    .invoice-header-section h4, .items-header h4 { font-size: 12px !important; }
                    .total-value { font-size: 16px !important; }
                    .total-amount { font-size: 20px !important; }
                }

                @media (max-height: 500px) and (orientation: landscape) {
                    .invoice-form-modal .ant-modal-body { max-height: calc(100vh - 80px); }
                }
            `}</style>
        </>
    );
};

export default InvoiceFormModal;