import { InputNumber, Button, Tag, Space, Tooltip } from "antd";
import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { InvoiceDeliveryItem } from "../../api/services/delivery-challan/deliverychallanaApi";

interface DeliveryChallanItemRowProps {
    item: {
        invoiceItemId: string;
        deliveryQty: number;
    };
    invoiceItem: InvoiceDeliveryItem;
    index: number;
    onChange: (index: number, value: number) => void;
    onDelete: (index: number) => void;
    disabled?: boolean;
}

const DeliveryChallanItemRow = ({
    item,
    invoiceItem,
    index,
    onChange,
    onDelete,
    disabled = false,
}: DeliveryChallanItemRowProps) => {
    const handleQtyChange = (value: number | null) => {
        if (value === null || value < 0) return;
        onChange(index, value);
    };

    // Calculate delivery percentage
    const deliveryPercentage = invoiceItem.invoiceQty > 0
        ? ((invoiceItem.previousDeliveryQty / invoiceItem.invoiceQty) * 100).toFixed(1)
        : 0;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr 60px",
                gap: "10px",
                alignItems: "center",
                padding: "12px",
                background: "#F7FAFC",
                borderRadius: "6px",
                marginBottom: "10px",
            }}
        >
            {/* Finish Good Info */}
            <div>
                <div style={{ fontWeight: "500", fontSize: "14px", color: "#2D3748", marginBottom: "4px" }}>
                    {invoiceItem.finishGoods.articleNo}
                </div>
                <Space size={4}>
                    <Tag color="cyan" style={{ fontSize: "11px" }}>
                        {invoiceItem.finishGoods.colorId.name}
                    </Tag>
                    <Tag color="orange" style={{ fontSize: "11px" }}>
                        {invoiceItem.finishGoods.gsmId.name}
                    </Tag>
                </Space>
            </div>

            {/* Invoice Qty */}
            <div>
                <div style={{ fontSize: "11px", color: "#718096", marginBottom: "2px" }}>Invoice Qty</div>
                <div style={{ fontFamily: "monospace", fontWeight: "600", color: "#2D3748" }}>
                    {invoiceItem.invoiceQty}
                </div>
            </div>

            {/* Previous Delivery */}
            <div>
                <div style={{ fontSize: "11px", color: "#718096", marginBottom: "2px" }}>
                    Previous
                    <Tooltip title={`${deliveryPercentage}% delivered`}>
                        <InfoCircleOutlined style={{ marginLeft: "4px", fontSize: "10px" }} />
                    </Tooltip>
                </div>
                <div style={{ fontFamily: "monospace", fontWeight: "600", color: "#f5222d" }}>
                    {invoiceItem.previousDeliveryQty}
                </div>
            </div>

            {/* Deliverable Qty */}
            <div>
                <div style={{ fontSize: "11px", color: "#718096", marginBottom: "2px" }}>Deliverable</div>
                <div
                    style={{
                        fontFamily: "monospace",
                        fontWeight: "700",
                        color: invoiceItem.deliverableQty > 0 ? "#52c41a" : "#d9d9d9",
                    }}
                >
                    {invoiceItem.deliverableQty}
                </div>
            </div>

            {/* Delivery Qty Input */}
            <div>
                <div style={{ fontSize: "11px", color: "#718096", marginBottom: "2px" }}>Deliver Now</div>
                <InputNumber
                    min={0}
                    max={invoiceItem.deliverableQty}
                    value={item.deliveryQty}
                    onChange={handleQtyChange}
                    disabled={disabled || invoiceItem.deliverableQty === 0}
                    style={{
                        width: "100%",
                        borderColor: item.deliveryQty > invoiceItem.deliverableQty ? "#f5222d" : undefined,
                    }}
                    status={item.deliveryQty > invoiceItem.deliverableQty ? "error" : undefined}
                />
                {item.deliveryQty > invoiceItem.deliverableQty && (
                    <div style={{ fontSize: "11px", color: "#f5222d", marginTop: "2px" }}>
                        Exceeds deliverable!
                    </div>
                )}
            </div>

            {/* Delete Button */}
            <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(index)}
                disabled={disabled}
                style={{ borderRadius: "6px" }}
            />
        </div>
    );
};

export default DeliveryChallanItemRow;