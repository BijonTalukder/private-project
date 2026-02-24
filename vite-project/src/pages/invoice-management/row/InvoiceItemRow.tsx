import { Select, InputNumber, Button, Space, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { FinishGoods } from "../../../api/services/finish-goods/finishGoodsApi";
import type { SupplierPurchasePriceList } from "../../../api/services/supplier-purchase-price/SupplierpurchasepricelistApi";
// import type { FinishGoods } from "../../api/services/finishGoods/finishGoodsApi";
// import type { SupplierPurchasePriceList } from "../../api/services/supplierPurchasePriceList/supplierPurchasePriceListApi";

interface InvoiceItemRowProps {
    item: {
        finishGoodsId: string;
        supplierPurchasePriceId: string;
        invoiceQty: number;
        unitPrice: number;
        commission: number;
        price: number;
        amount: number;
    };
    index: number;
    finishGoods: FinishGoods[];
    priceLists: SupplierPurchasePriceList[];
    onChange: (index: number, field: string, value: any) => void;
    onDelete: (index: number) => void;
    disabled?: boolean;
}

const InvoiceItemRow = ({
    item,
    index,
    finishGoods,
    priceLists,
    onChange,
    onDelete,
    disabled = false,
}: InvoiceItemRowProps) => {
    const selectedFinishGood = finishGoods.find((fg) => fg._id === item.finishGoodsId);
    const selectedPriceList = priceLists.find((pl) => pl._id === item.supplierPurchasePriceId);

    // Auto-calculate amount when qty or price changes
    const handleQtyChange = (value: number | null) => {
        if (value === null) return;
        onChange(index, "invoiceQty", value);
        onChange(index, "amount", value * item.price);
    };

    const handlePriceChange = (value: number | null) => {
        if (value === null) return;
        onChange(index, "price", value);
        onChange(index, "amount", item.invoiceQty * value);
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1.2fr 60px",
                gap: "10px",
                alignItems: "center",
                padding: "12px",
                background: "#F7FAFC",
                borderRadius: "6px",
                marginBottom: "10px",
            }}
        >
            {/* Finish Good */}
            <Select
                placeholder="Select finish good"
                value={item.finishGoodsId || undefined}
                onChange={(value) => onChange(index, "finishGoodsId", value)}
                disabled={disabled}
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
            >
                {finishGoods.map((fg) => (
                    <Select.Option key={fg._id} value={fg._id}>
                        {fg.articleNo} — {fg.colorId.name} / {fg.gsmId.name}
                    </Select.Option>
                ))}
            </Select>

            {/* Price List */}
            <Select
                placeholder="Select price list"
                value={item.supplierPurchasePriceId || undefined}
                onChange={(value) => {
                    onChange(index, "supplierPurchasePriceId", value);
                    const priceList = priceLists.find((pl) => pl._id === value);
                    if (priceList) {
                        onChange(index, "unitPrice", priceList.purchaseRate);
                    }
                }}
                disabled={disabled}
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
            >
                {priceLists.map((pl) => (
                    <Select.Option key={pl._id} value={pl._id}>
                        {pl.supplierId.supplierName} — ${pl.purchaseRate}
                    </Select.Option>
                ))}
            </Select>

            {/* Qty */}
            <InputNumber
                placeholder="Qty"
                min={0}
                value={item.invoiceQty}
                onChange={handleQtyChange}
                disabled={disabled}
                style={{ width: "100%" }}
            />

            {/* Unit Price */}
            <InputNumber
                placeholder="Unit Price"
                min={0}
                precision={2}
                value={item.unitPrice}
                onChange={(value) => onChange(index, "unitPrice", value || 0)}
                disabled={disabled}
                style={{ width: "100%" }}
            />

            {/* Commission */}
            <InputNumber
                placeholder="Commission"
                min={0}
                precision={2}
                value={item.commission}
                onChange={(value) => onChange(index, "commission", value || 0)}
                disabled={disabled}
                style={{ width: "100%" }}
            />

            {/* Price */}
            <InputNumber
                placeholder="Price"
                min={0}
                precision={2}
                value={item.price}
                onChange={handlePriceChange}
                disabled={disabled}
                style={{ width: "100%" }}
            />

            {/* Amount (read-only) */}
            <div
                style={{
                    padding: "8px 12px",
                    background: "#fff",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontWeight: "600",
                    color: "#667eea",
                }}
            >
                ${item.amount.toFixed(2)}
            </div>

            {/* Delete */}
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

export default InvoiceItemRow;