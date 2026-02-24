import { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Button, Space, message, Divider, Select, Spin, Alert } from "antd";
import { PlusOutlined, FileTextOutlined, TruckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DeliveryChallanItemRow from "./DeliveryChallanItemRow";

import { useGetAllInvoicesQuery } from "../../api/services/invoice/invoiceApi";
import { useGetInvoiceDeliverySummaryQuery, type CreateDeliveryChallanDto, type DeliveryChallanItemDto } from "../../api/services/delivery-challan/deliverychallanaApi";

interface DeliveryChallanFormModalProps {
    open: boolean;
    isCreating: boolean;
    onSubmit: (values: CreateDeliveryChallanDto) => void;
    onCancel: () => void;
}

const DeliveryChallanFormModal = ({ open, isCreating, onSubmit, onCancel }: DeliveryChallanFormModalProps) => {
    const [form] = Form.useForm();
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [items, setItems] = useState<DeliveryChallanItemDto[]>([]);

    // Fetch invoices
    const { data: invoices = [], isLoading: invoicesLoading } = useGetAllInvoicesQuery();

    // Fetch invoice delivery summary
    const {
        data: summary,
        isLoading: summaryLoading,
        error: summaryError,
    } = useGetInvoiceDeliverySummaryQuery(selectedInvoiceId!, {
        skip: !selectedInvoiceId,
    });

    // Reset when modal opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedInvoiceId(null);
            setItems([]);
            form.resetFields();
        }
    }, [open, form]);

    // Auto-add deliverable items when invoice selected
    useEffect(() => {
        if (summary && summary.items.length > 0) {
            // Only add items that have deliverable qty > 0
            const deliverableItems = summary.items
                .filter((item) => item.deliverableQty > 0)
                .map((item) => ({
                    invoiceItemId: item._id,
                    deliveryQty: 0, // User will fill this
                }));
            setItems(deliverableItems);
        }
    }, [summary]);

    const handleInvoiceChange = (invoiceId: string) => {
        setSelectedInvoiceId(invoiceId);
        setItems([]);
    };

    const handleItemChange = (index: number, value: number) => {
        const newItems = [...items];
        newItems[index].deliveryQty = value;
        setItems(newItems);
    };

    const handleDeleteItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (!selectedInvoiceId) {
                message.error("Please select an invoice");
                return;
            }

            if (items.length === 0) {
                message.error("Please add at least one item");
                return;
            }

            // Validate all items have delivery qty
            const invalidItem = items.find((item) => item.deliveryQty <= 0);
            if (invalidItem) {
                message.error("Please enter delivery quantity for all items");
                return;
            }

            // Check if any item exceeds deliverable qty
            const exceedingItem = items.find((item) => {
                const summaryItem = summary?.items.find((si) => si._id === item.invoiceItemId);
                return summaryItem && item.deliveryQty > summaryItem.deliverableQty;
            });

            if (exceedingItem) {
                message.error("Delivery quantity exceeds deliverable quantity for some items");
                return;
            }

            onSubmit({
                challanNo: values.challanNo,
                invoiceId: selectedInvoiceId,
                challanDate: values.challanDate.format("YYYY-MM-DD"),
                items,
                remarks: values.remarks,
            });
        });
    };

    const totalDeliveryQty = items.reduce((sum, item) => sum + item.deliveryQty, 0);

    return (
        <Modal
            title={
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", padding: "10px 0" }}>
                    <TruckOutlined style={{ marginRight: "8px", color: "#667eea" }} />
                    Create Delivery Challan
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
                        Challan Information
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Challan No</span>}
                            name="challanNo"
                            rules={[{ required: true, message: "Required" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input placeholder="CH-2024-001" style={{ height: "42px" }} />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Invoice</span>}
                            name="invoiceId"
                            rules={[{ required: true, message: "Required" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Select
                                placeholder="Select invoice"
                                showSearch
                                optionFilterProp="children"
                                loading={invoicesLoading}
                                onChange={handleInvoiceChange}
                                style={{ height: "42px" }}
                            >
                                {invoices.map((inv) => (
                                    <Select.Option key={inv._id} value={inv._id}>
                                        {inv.invoiceNo} — {inv.client.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: "500" }}>Challan Date</span>}
                            name="challanDate"
                            rules={[{ required: true, message: "Required" }]}
                            initialValue={dayjs()}
                            style={{ marginBottom: 0 }}
                        >
                            <DatePicker format="DD MMM YYYY" style={{ width: "100%", height: "42px" }} />
                        </Form.Item>
                    </div>

                    {/* <Form.Item
                        label={<span style={{ fontWeight: "500" }}>Remarks</span>}
                        name="remarks"
                        style={{ marginTop: "15px", marginBottom: 0 }}
                    >
                        <Input.TextArea rows={2} placeholder="Optional notes..." />
                    </Form.Item> */}
                </div>

                {/* Invoice Summary */}
                {selectedInvoiceId && (
                    <>
                        {summaryLoading && (
                            <div style={{ textAlign: "center", padding: "20px" }}>
                                <Spin />
                            </div>
                        )}

                        {summaryError && (
                            <Alert
                                message="Error loading invoice"
                                description="Could not load invoice delivery summary"
                                type="error"
                                showIcon
                                style={{ marginBottom: "20px" }}
                            />
                        )}

                        {summary && (
                            <>
                                {/* Invoice Info */}
                                <div
                                    style={{
                                        background: "#E6F7FF",
                                        padding: "12px 15px",
                                        borderRadius: "6px",
                                        marginBottom: "15px",
                                        border: "1px solid #91D5FF",
                                    }}
                                >
                                    <Space split="|">
                                        <span>
                                            <FileTextOutlined style={{ marginRight: "5px", color: "#1890ff" }} />
                                            <strong>Invoice:</strong> {summary.invoice.invoiceNo}
                                        </span>
                                        <span>
                                            <strong>Client:</strong> {summary.invoice.client.name}
                                        </span>
                                        <span>
                                            <strong>Total Qty:</strong> {summary.invoice.totalQty}
                                        </span>
                                    </Space>
                                </div>

                                {/* Items Section */}
                                <div style={{ marginBottom: "20px" }}>
                                    <h4 style={{ margin: "0 0 15px", fontSize: "14px", fontWeight: "600", color: "#2D3748" }}>
                                        Delivery Items
                                    </h4>

                                    {/* Column Headers */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr 60px",
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
                                        <div>Invoice Qty</div>
                                        <div>Previous</div>
                                        <div>Deliverable</div>
                                        <div>Deliver Now</div>
                                        <div></div>
                                    </div>

                                    {/* Item Rows */}
                                    {items.length > 0 ? (
                                        items.map((item, index) => {
                                            const summaryItem = summary.items.find((si) => si._id === item.invoiceItemId);
                                            if (!summaryItem) return null;

                                            return (
                                                <DeliveryChallanItemRow
                                                    key={index}
                                                    item={item}
                                                    invoiceItem={summaryItem}
                                                    index={index}
                                                    onChange={handleItemChange}
                                                    onDelete={handleDeleteItem}
                                                />
                                            );
                                        })
                                    ) : (
                                        <div
                                            style={{
                                                padding: "40px",
                                                textAlign: "center",
                                                background: "#F7FAFC",
                                                borderRadius: "6px",
                                                color: "#718096",
                                            }}
                                        >
                                            {summary.items.every((item) => item.deliverableQty === 0) ? (
                                                <>
                                                    <p>All items from this invoice have been fully delivered.</p>
                                                    <p style={{ fontSize: "12px", marginTop: "5px" }}>
                                                        Please select a different invoice.
                                                    </p>
                                                </>
                                            ) : (
                                                <p>Loading deliverable items...</p>
                                            )}
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
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div style={{ color: "#fff" }}>
                                            <div style={{ fontSize: "12px", opacity: 0.9 }}>Total Delivery Quantity</div>
                                            <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "monospace" }}>
                                                {totalDeliveryQty}
                                            </div>
                                        </div>
                                        <div style={{ color: "#fff", textAlign: "right" }}>
                                            <div style={{ fontSize: "12px", opacity: 0.9 }}>Items</div>
                                            <div style={{ fontSize: "20px", fontWeight: "600" }}>{items.length}</div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
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
                        loading={isCreating}
                        disabled={!selectedInvoiceId || items.length === 0 || totalDeliveryQty === 0}
                        style={{
                            height: "42px",
                            background: "linear-gradient(to right, #667eea, #764ba2)",
                            border: "none",
                            minWidth: "120px",
                        }}
                    >
                        Create Challan
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default DeliveryChallanFormModal;