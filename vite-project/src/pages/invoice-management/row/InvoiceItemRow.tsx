import { Select, InputNumber, Button, Tooltip, Space, Spin } from "antd";
import { DeleteOutlined, SwapOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import type { InvoiceItemDto } from "../../../api/services/invoice/invoiceApi";
import type { FinishGoods } from "../../../api/services/finish-goods/finishGoodsApi";
import type { Supplier } from "../../../api/services/supplier/supplierApi";
import { getCurrencyConfig } from "../../../utils/currencyUtils";
import { useGetPriceListsBySupplierQuery } from "../../../api/services/supplier-purchase-price/SupplierpurchasepricelistApi";
// ✅ Use query (not mutation) — RTK Query caches by (from,to) pair automatically
import { useGetConversionRateQuery } from "../../../api/services/currency-convert/currencyConversionApi";

interface InvoiceItemRowProps {
    item: InvoiceItemDto;
    index: number;
    finishGoods: FinishGoods[];
    suppliers: Supplier[];
    onChange: (index: number, field: string, value: any) => void;
    onDelete: (index: number) => void;
    currencyName: string;
    toCurrencyId: string; // invoice currency _id — passed from parent
}

const InvoiceItemRow = memo(({
    item,
    index,
    finishGoods,
    suppliers,
    onChange,
    onDelete,
    currencyName,
    toCurrencyId,
}: InvoiceItemRowProps) => {

    const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

    // ── Price lists for selected supplier ─────────────────────────────────────
    const { data: priceLists = [], isLoading: priceListsLoading } = useGetPriceListsBySupplierQuery(
        selectedSupplierId,
        { skip: !selectedSupplierId }
    );

    // ── Derived values ────────────────────────────────────────────────────────
    const selectedPriceList = useMemo(
        () => priceLists.find((pl) => pl._id === item.supplierPurchasePriceId),
        [priceLists, item.supplierPurchasePriceId]
    );

    const invoiceCurrencyConfig = useMemo(
        () => getCurrencyConfig(currencyName),
        [currencyName]
    );

    // ── Resolve fromCurrencyId from price list ────────────────────────────────
    // Handles both populated { _id, name } and flat string shapes
    const fromCurrencyId = useMemo((): string => {
        if (!selectedPriceList) return "";
        const cid = selectedPriceList.currencyId as any;
        return cid?._id ?? cid ?? "";
    }, [selectedPriceList]);

    const isSameCurrency = useMemo(() => {
        if (!fromCurrencyId || !toCurrencyId) return true;
        const plCurrencyName = (selectedPriceList?.currencyId as any)?.name ?? "";
        return fromCurrencyId === toCurrencyId || plCurrencyName === currencyName;
    }, [fromCurrencyId, toCurrencyId, selectedPriceList, currencyName]);

    // ── Fetch conversion rate — RTK Query caches by (from, to) ───────────────
    const {
        data: conversionData,
        isLoading: rateLoading,
        isFetching: rateFetching,
    } = useGetConversionRateQuery(
        { from: fromCurrencyId, to: toCurrencyId },
        { skip: !fromCurrencyId || !toCurrencyId || isSameCurrency }
    );

    const isConverting = rateLoading || rateFetching;
    const exchangeRate = conversionData?.exchangeRate ?? null;

    // ── Apply price whenever priceList or rate changes ────────────────────────
    useEffect(() => {
        if (!selectedPriceList) return;

        if (isSameCurrency) {
            const unitPrice = selectedPriceList.purchaseRate;
            const commission = selectedPriceList.commission || 0;
            onChange(index, "unitPrice", unitPrice);
            onChange(index, "commission", commission);
            onChange(index, "price", parseFloat((unitPrice - commission).toFixed(2)));
            onChange(index, "amount", parseFloat((item.invoiceQty * unitPrice).toFixed(2)));
            return;
        }

        // Wait for rate to load
        if (!exchangeRate || isConverting) return;

        const convertedUnitPrice = parseFloat((selectedPriceList.purchaseRate * exchangeRate).toFixed(6));
        const convertedCommission = parseFloat(((selectedPriceList.commission || 0) * exchangeRate).toFixed(2));

        onChange(index, "unitPrice", convertedUnitPrice);
        onChange(index, "commission", convertedCommission);
        onChange(index, "price", parseFloat((convertedUnitPrice - convertedCommission).toFixed(2)));
        onChange(index, "amount", parseFloat((item.invoiceQty * convertedUnitPrice).toFixed(2)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPriceList?._id, exchangeRate, isSameCurrency, isConverting, item.invoiceQty]);

    // ── Event handlers ────────────────────────────────────────────────────────
    const handleFinishGoodChange = useCallback((value: string) => {
        onChange(index, "finishGoodsId", value);
        setSelectedSupplierId("");
        onChange(index, "supplierPurchasePriceId", "");
        onChange(index, "unitPrice", 0);
        onChange(index, "commission", 0);
        onChange(index, "price", 0);
        onChange(index, "amount", 0);
    }, [index, onChange]);

    const handleSupplierChange = useCallback((value: string) => {
        setSelectedSupplierId(value);
        onChange(index, "supplierPurchasePriceId", "");
        onChange(index, "unitPrice", 0);
        onChange(index, "commission", 0);
        onChange(index, "price", 0);
        onChange(index, "amount", 0);
    }, [index, onChange]);

    const handlePriceListChange = useCallback((value: string) => {
        onChange(index, "supplierPurchasePriceId", value);
    }, [index, onChange]);

    const handleQtyChange = useCallback((value: number | null) => {
        const qty = value || 0;
        onChange(index, "invoiceQty", qty);
        onChange(index, "amount", parseFloat((qty * item.unitPrice).toFixed(2)));
    }, [index, item.unitPrice, onChange]);

    const handleUnitPriceChange = useCallback((value: number | null) => {
        const unitPrice = value || 0;
        onChange(index, "unitPrice", unitPrice);
        onChange(index, "price", parseFloat((unitPrice - item.commission).toFixed(2)));
        onChange(index, "amount", parseFloat((item.invoiceQty * unitPrice).toFixed(2)));
    }, [index, item.commission, item.invoiceQty, onChange]);

    const handleCommissionChange = useCallback((value: number | null) => {
        const commission = value || 0;
        onChange(index, "commission", commission);
        onChange(index, "price", parseFloat((item.unitPrice - commission).toFixed(2)));
    }, [index, item.unitPrice, onChange]);

    // ── Render helpers ────────────────────────────────────────────────────────
    const showConversionBadge = !isSameCurrency && exchangeRate !== null && !isConverting;

    // Memoized price list options — shows converted preview price in dropdown
    const priceListOptions = useMemo(() => priceLists.map((pl) => {
        const plCurrencyConfig = getCurrencyConfig((pl.currencyId as any)?.name ?? "");
        const plFromId: string = (pl.currencyId as any)?._id ?? (pl.currencyId as any) ?? "";
        const isDifferent = plFromId !== toCurrencyId;
        const previewRate = isDifferent && exchangeRate ? exchangeRate : 1;
        const previewPrice = parseFloat((pl.purchaseRate * previewRate).toFixed(2));

        return (
            <Select.Option key={pl._id} value={pl._id}>
                <Space>
                    <span style={{ color: "#667eea", fontFamily: "monospace" }}>
                        {plCurrencyConfig.symbol}{pl.purchaseRate.toFixed(2)}
                    </span>
                    {isDifferent && (
                        <>
                            <SwapOutlined style={{ color: "#667eea", fontSize: "12px" }} />
                            <span style={{ color: "#52c41a", fontFamily: "monospace" }}>
                                {isConverting
                                    ? <Spin size="small" />
                                    : <>{invoiceCurrencyConfig.symbol}{previewPrice.toFixed(2)}</>
                                }
                            </span>
                        </>
                    )}
                </Space>
            </Select.Option>
        );
    }), [priceLists, toCurrencyId, exchangeRate, isConverting, invoiceCurrencyConfig.symbol]);

    return (
        <>
            <div className="invoice-item-row">
                {/* Finish Good */}
                <Select
                    value={item.finishGoodsId || undefined}
                    onChange={handleFinishGoodChange}
                    placeholder="Select finish good"
                    showSearch
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                >
                    {finishGoods.map((fg) => (
                        <Select.Option key={fg._id} value={fg._id}>{fg.articleNo}</Select.Option>
                    ))}
                </Select>

                {/* Supplier */}
                <Select
                    value={selectedSupplierId || undefined}
                    onChange={handleSupplierChange}
                    placeholder="Select supplier"
                    disabled={!item.finishGoodsId}
                    showSearch
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                >
                    {suppliers.map((s) => (
                        <Select.Option key={s._id} value={s._id}>{s.supplierName}</Select.Option>
                    ))}
                </Select>

                {/* Price List — shows original + converted preview */}
                <Select
                    value={item.supplierPurchasePriceId || undefined}
                    onChange={handlePriceListChange}
                    placeholder={priceListsLoading ? "Loading..." : "Select price list"}
                    disabled={!selectedSupplierId || priceListsLoading}
                    showSearch
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    notFoundContent={priceListsLoading ? <Spin size="small" /> : "No price lists found"}
                >
                    {priceListOptions}
                </Select>

                {/* Quantity */}
                <InputNumber
                    value={item.invoiceQty}
                    onChange={handleQtyChange}
                    min={0}
                    placeholder="0"
                    style={{ width: "100%" }}
                />

                {/* Unit Price — with conversion badge */}
                <div style={{ position: "relative" }}>
                    <InputNumber
                        value={item.unitPrice}
                        onChange={handleUnitPriceChange}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        prefix={invoiceCurrencyConfig.symbol}
                        style={{ width: "100%" }}
                        disabled={isConverting}
                    />
                    {showConversionBadge && selectedPriceList && (
                        <Tooltip
                            title={
                                `Original: ${getCurrencyConfig((selectedPriceList.currencyId as any)?.name ?? "").symbol}` +
                                `${selectedPriceList.purchaseRate.toFixed(2)} × ${exchangeRate!.toFixed(4)}` +
                                ` = ${invoiceCurrencyConfig.symbol}${item.unitPrice.toFixed(2)}`
                            }
                        >
                            <SwapOutlined
                                style={{
                                    position: "absolute",
                                    right: "8px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#52c41a",
                                    fontSize: "12px",
                                    pointerEvents: "none",
                                }}
                            />
                        </Tooltip>
                    )}
                </div>

                {/* Commission */}
                <InputNumber
                    value={item.commission}
                    onChange={handleCommissionChange}
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix={invoiceCurrencyConfig.symbol}
                    style={{ width: "100%" }}
                    disabled={isConverting}
                />

                {/* Price (read-only) */}
                <InputNumber
                    value={item.price}
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix={invoiceCurrencyConfig.symbol}
                    style={{ width: "100%" }}
                    disabled
                />

                {/* Amount (read-only) */}
                <InputNumber
                    value={item.amount}
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix={invoiceCurrencyConfig.symbol}
                    style={{ width: "100%", fontWeight: "600" }}
                    disabled
                />

                {/* Delete */}
                <Tooltip title="Delete">
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(index)}
                        style={{ borderRadius: "6px" }}
                    />
                </Tooltip>
            </div>

            <style>{`
                .invoice-item-row {
                    display: grid;
                    grid-template-columns: 1.5fr 1.5fr 2fr 0.8fr 1fr 1fr 1fr 1.2fr 60px;
                    gap: 10px;
                    padding: 10px 12px;
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    margin-bottom: 10px;
                    align-items: center;
                }
                .invoice-item-row:hover {
                    border-color: #667eea;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
                }
                @media (max-width: 768px) {
                    .invoice-item-row { grid-template-columns: 1fr; gap: 12px; padding: 15px; }
                    .invoice-item-row > * { width: 100% !important; }
                }
            `}</style>
        </>
    );
});

InvoiceItemRow.displayName = "InvoiceItemRow";
export default InvoiceItemRow;