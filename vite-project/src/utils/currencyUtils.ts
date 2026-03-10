// Currency icon, symbol, formatting and conversion utility
// Location: src/utils/currencyUtils.ts

import { useMemo } from "react";
import { currencyConversionApi, useGetActiveConversionsQuery, type CurrencyConversion } from "../api/services/currency-convert/currencyConversionApi";
import { store } from "../redux/store";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CurrencyConfig {
    symbol: string;
    icon: string;
    name: string;
    code: string;
}

export interface ConvertOptions {
    amount: number;
    fromCurrencyId: string;
    toCurrencyId: string;
}

export interface ConvertByNameOptions {
    amount: number;
    fromCurrencyName: string;
    toCurrencyName: string;
}

export interface ConvertResult {
    originalAmount: number;
    convertedAmount: number;
    exchangeRate: number;
    fromCurrencyId: string;
    toCurrencyId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Currency Map
// ─────────────────────────────────────────────────────────────────────────────

export const CURRENCY_MAP: Record<string, CurrencyConfig> = {
    USD: { symbol: '$', icon: '$', name: 'US Dollar', code: 'USD' },
    EUR: { symbol: '€', icon: '💶', name: 'Euro', code: 'EUR' },
    GBP: { symbol: '£', icon: '💷', name: 'British Pound', code: 'GBP' },
    JPY: { symbol: '¥', icon: '💴', name: 'Japanese Yen', code: 'JPY' },
    CNY: { symbol: '¥', icon: '💴', name: 'Chinese Yuan', code: 'CNY' },
    BDT: { symbol: '৳', icon: '🇧🇩', name: 'Bangladeshi Taka', code: 'BDT' },
    INR: { symbol: '₹', icon: '🇮🇳', name: 'Indian Rupee', code: 'INR' },
    PKR: { symbol: '₨', icon: '🇵🇰', name: 'Pakistani Rupee', code: 'PKR' },
    SGD: { symbol: 'S$', icon: '🇸🇬', name: 'Singapore Dollar', code: 'SGD' },
    MYR: { symbol: 'RM', icon: '🇲🇾', name: 'Malaysian Ringgit', code: 'MYR' },
    THB: { symbol: '฿', icon: '🇹🇭', name: 'Thai Baht', code: 'THB' },
    IDR: { symbol: 'Rp', icon: '🇮🇩', name: 'Indonesian Rupiah', code: 'IDR' },
    PHP: { symbol: '₱', icon: '🇵🇭', name: 'Philippine Peso', code: 'PHP' },
    VND: { symbol: '₫', icon: '🇻🇳', name: 'Vietnamese Dong', code: 'VND' },
    KRW: { symbol: '₩', icon: '🇰🇷', name: 'South Korean Won', code: 'KRW' },
    AED: { symbol: 'د.إ', icon: '🇦🇪', name: 'UAE Dirham', code: 'AED' },
    SAR: { symbol: '﷼', icon: '🇸🇦', name: 'Saudi Riyal', code: 'SAR' },
    QAR: { symbol: '﷼', icon: '🇶🇦', name: 'Qatari Riyal', code: 'QAR' },
    KWD: { symbol: 'د.ك', icon: '🇰🇼', name: 'Kuwaiti Dinar', code: 'KWD' },
    BHD: { symbol: 'د.ب', icon: '🇧🇭', name: 'Bahraini Dinar', code: 'BHD' },
    OMR: { symbol: '﷼', icon: '🇴🇲', name: 'Omani Rial', code: 'OMR' },
    AUD: { symbol: 'A$', icon: '🇦🇺', name: 'Australian Dollar', code: 'AUD' },
    CAD: { symbol: 'C$', icon: '🇨🇦', name: 'Canadian Dollar', code: 'CAD' },
    CHF: { symbol: 'Fr', icon: '🇨🇭', name: 'Swiss Franc', code: 'CHF' },
    NZD: { symbol: 'NZ$', icon: '🇳🇿', name: 'New Zealand Dollar', code: 'NZD' },
    SEK: { symbol: 'kr', icon: '🇸🇪', name: 'Swedish Krona', code: 'SEK' },
    NOK: { symbol: 'kr', icon: '🇳🇴', name: 'Norwegian Krone', code: 'NOK' },
    DKK: { symbol: 'kr', icon: '🇩🇰', name: 'Danish Krone', code: 'DKK' },
    RUB: { symbol: '₽', icon: '🇷🇺', name: 'Russian Ruble', code: 'RUB' },
    ZAR: { symbol: 'R', icon: '🇿🇦', name: 'South African Rand', code: 'ZAR' },
    BRL: { symbol: 'R$', icon: '🇧🇷', name: 'Brazilian Real', code: 'BRL' },
    MXN: { symbol: '$', icon: '🇲🇽', name: 'Mexican Peso', code: 'MXN' },
    TRY: { symbol: '₺', icon: '🇹🇷', name: 'Turkish Lira', code: 'TRY' },
    PLN: { symbol: 'zł', icon: '🇵🇱', name: 'Polish Zloty', code: 'PLN' },
    HKD: { symbol: 'HK$', icon: '🇭🇰', name: 'Hong Kong Dollar', code: 'HKD' },
};

const DEFAULT_CURRENCY: CurrencyConfig = {
    symbol: '$',
    icon: '$',
    name: 'Unknown Currency',
    code: 'XXX',
};

// ─────────────────────────────────────────────────────────────────────────────
// Symbol / Icon / Format helpers
// ─────────────────────────────────────────────────────────────────────────────

export const getCurrencyConfig = (currencyNameOrCode: string): CurrencyConfig => {
    if (!currencyNameOrCode) return DEFAULT_CURRENCY;
    const upper = currencyNameOrCode.trim().toUpperCase();
    if (CURRENCY_MAP[upper]) return CURRENCY_MAP[upper];
    const match = Object.entries(CURRENCY_MAP).find(
        ([code, config]) =>
            config.name.toUpperCase().includes(upper) || upper.includes(code)
    );
    return match ? match[1] : DEFAULT_CURRENCY;
};

export const getCurrencySymbol = (currencyNameOrCode: string): string =>
    getCurrencyConfig(currencyNameOrCode).symbol;

export const getCurrencyIcon = (currencyNameOrCode: string): string =>
    getCurrencyConfig(currencyNameOrCode).icon;

export const formatCurrency = (
    amount: number,
    currencyNameOrCode: string,
    options?: { showIcon?: boolean; showSymbol?: boolean; decimals?: number }
): string => {
    const config = getCurrencyConfig(currencyNameOrCode);
    const { showIcon = false, showSymbol = true, decimals = 2 } = options ?? {};
    const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    const parts: string[] = [];
    if (showIcon) parts.push(config.icon);
    if (showSymbol) parts.push(config.symbol);
    parts.push(formatted);
    return parts.join(' ');
};

export const getAllCurrencies = (): CurrencyConfig[] => Object.values(CURRENCY_MAP);

export const isCurrencySupported = (currencyNameOrCode: string): boolean =>
    getCurrencyConfig(currencyNameOrCode).code !== 'XXX';

// ─────────────────────────────────────────────────────────────────────────────
// Internal: normalise a conversion record
//
// The backend can return currencies in TWO shapes:
//
//   POPULATED (ideal):
//     fromCurrency: { _id, currencyId, name, type }
//     toCurrency:   { _id, currencyId, name, type }
//
//   FLAT / UNPOPULATED (what your DB currently returns):
//     fromCurrencyId: "69a3d87103ad9bff16038747"   ← plain ObjectId string
//     toCurrencyId:   "69a3d85d03ad9bff16038742"
//
// _getFromId / _getToId read both shapes safely.
// ─────────────────────────────────────────────────────────────────────────────

type AnyConversion = CurrencyConversion & {
    // flat shape — backend returns raw ObjectId strings
    fromCurrencyId?: string;
    toCurrencyId?: string;
};

/** Read the "from" currency _id regardless of populated vs flat shape */
function _getFromId(c: AnyConversion): string | undefined {
    return c.fromCurrency?.currencyId       // populated: { currencyId: "..." }
        || c.fromCurrency?._id              // populated alternate key
        || c.fromCurrencyId;               // flat: "69a3d87103ad9bff16038747"
}

/** Read the "to" currency _id regardless of populated vs flat shape */
function _getToId(c: AnyConversion): string | undefined {
    return c.toCurrency?.currencyId
        || c.toCurrency?._id
        || c.toCurrencyId;
}

/** Read the "from" currency name — only available when populated */
function _getFromName(c: AnyConversion): string | undefined {
    return c.fromCurrency?.name;
}

/** Read the "to" currency name — only available when populated */
function _getToName(c: AnyConversion): string | undefined {
    return c.toCurrency?.name;
}

/** Keep only entries where we can at least resolve an ID for both sides */
function _validConversions(conversions: CurrencyConversion[]): AnyConversion[] {
    return (conversions as AnyConversion[]).filter(
        (c) => !!_getFromId(c) && !!_getToId(c)
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate resolvers
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve by MongoDB _id (works with both populated and flat responses) */
function _resolveRateById(
    conversions: CurrencyConversion[],
    fromId: string,
    toId: string
): number | null {
    const valid = _validConversions(conversions);

    const direct = valid.find(
        (c) => _getFromId(c) === fromId && _getToId(c) === toId
    );
    if (direct) return direct.exchangeRate;

    const inverse = valid.find(
        (c) => _getFromId(c) === toId && _getToId(c) === fromId
    );
    if (inverse && inverse.exchangeRate !== 0) return 1 / inverse.exchangeRate;

    return null;
}

/**
 * Match a name/code string against a currency ref that may be populated or flat.
 *
 * Priority:
 *  1. Raw _id exact match      — "69a3d..." === "69a3d..."
 *  2. Populated name match     — "US Dollar" === "US Dollar"
 *  3. CURRENCY_MAP code→name   — "USD" → "US Dollar" then compare
 *  4. Partial name contains    — fallback fuzzy
 */
function _matchesCurrencyByName(c: AnyConversion, side: 'from' | 'to', nameOrCode: string): boolean {
    if (!nameOrCode) return false;
    const input = nameOrCode.trim().toUpperCase();
    const rawId = side === 'from' ? _getFromId(c) : _getToId(c);
    const storedName = (side === 'from' ? (_getFromName(c) ?? '') : (_getToName(c) ?? '')).toUpperCase();

    // 1. Direct _id match (if caller accidentally passes an ObjectId)
    if (rawId && rawId.toUpperCase() === input) return true;

    // 2. Exact name match (populated)
    if (storedName && storedName === input) return true;

    // 3. Code → name via CURRENCY_MAP
    const mapped = getCurrencyConfig(nameOrCode);
    if (mapped.code !== 'XXX' && storedName && mapped.name.toUpperCase() === storedName) return true;

    // 4. Partial name match
    if (storedName && storedName.includes(input)) return true;

    return false;
}

/**
 * Resolve by currency name/code.
 * ⚠️  Requires populated currency objects from the backend.
 *    If your backend returns flat IDs only, use _resolveRateById instead.
 */
function _resolveRateByName(
    conversions: CurrencyConversion[],
    fromName: string,
    toName: string
): number | null {
    const valid = _validConversions(conversions);

    const direct = valid.find(
        (c) => _matchesCurrencyByName(c, 'from', fromName) && _matchesCurrencyByName(c, 'to', toName)
    );
    if (direct) return direct.exchangeRate;

    const inverse = valid.find(
        (c) => _matchesCurrencyByName(c, 'from', toName) && _matchesCurrencyByName(c, 'to', fromName)
    );
    if (inverse && inverse.exchangeRate !== 0) return 1 / inverse.exchangeRate;

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Async util — use anywhere outside React
// ─────────────────────────────────────────────────────────────────────────────

async function _fetchActiveConversions(): Promise<CurrencyConversion[]> {
    const result = await store.dispatch(
        currencyConversionApi.endpoints.getActiveConversions.initiate(undefined, {
            subscribe: false,
            forceRefetch: false,
        })
    );
    if ('error' in result) throw new Error('Failed to load currency conversion rates.');
    return result.data ?? [];
}

/**
 * Convert by MongoDB _id — works with both populated and flat backend responses.
 *
 * @example
 * const result = await convertCurrency({ amount: 1000, fromCurrencyId: '69a3d871...', toCurrencyId: '69a3d85d...' });
 */
export async function convertCurrency({ amount, fromCurrencyId, toCurrencyId }: ConvertOptions): Promise<ConvertResult> {
    if (fromCurrencyId === toCurrencyId) {
        return { originalAmount: amount, convertedAmount: amount, exchangeRate: 1, fromCurrencyId, toCurrencyId };
    }
    const conversions = await _fetchActiveConversions();
    const rate = _resolveRateById(conversions, fromCurrencyId, toCurrencyId);
    if (rate === null) throw new Error(`No active conversion rate: "${fromCurrencyId}" → "${toCurrencyId}"`);
    return {
        originalAmount: amount,
        convertedAmount: parseFloat((amount * rate).toFixed(6)),
        exchangeRate: rate,
        fromCurrencyId,
        toCurrencyId,
    };
}

/**
 * Convert by currency name/code.
 * ⚠️  Requires the backend to populate fromCurrency/toCurrency objects.
 *    If backend returns flat IDs, use convertCurrency() with the raw _id instead.
 *
 * @example
 * const result = await convertCurrencyByName({ amount: 1000, fromCurrencyName: 'BDT', toCurrencyName: 'USD' });
 */
export async function convertCurrencyByName({ amount, fromCurrencyName, toCurrencyName }: ConvertByNameOptions): Promise<ConvertResult> {
    const normFrom = fromCurrencyName.trim().toUpperCase();
    const normTo = toCurrencyName.trim().toUpperCase();
    if (normFrom === normTo) {
        return { originalAmount: amount, convertedAmount: amount, exchangeRate: 1, fromCurrencyId: normFrom, toCurrencyId: normTo };
    }
    const conversions = await _fetchActiveConversions();
    const rate = _resolveRateByName(conversions, fromCurrencyName, toCurrencyName);
    if (rate === null) throw new Error(`No active conversion rate: "${fromCurrencyName}" → "${toCurrencyName}"`);
    return {
        originalAmount: amount,
        convertedAmount: parseFloat((amount * rate).toFixed(6)),
        exchangeRate: rate,
        fromCurrencyId: fromCurrencyName,
        toCurrencyId: toCurrencyName,
    };
}

export async function toConvertedAmount(amount: number, fromCurrencyId: string, toCurrencyId: string): Promise<number> {
    return (await convertCurrency({ amount, fromCurrencyId, toCurrencyId })).convertedAmount;
}

export async function toConvertedAmountByName(amount: number, fromCurrencyName: string, toCurrencyName: string): Promise<number> {
    return (await convertCurrencyByName({ amount, fromCurrencyName, toCurrencyName })).convertedAmount;
}

// ─────────────────────────────────────────────────────────────────────────────
// React hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCurrencyConverter() {
    const { data: conversions = [], isLoading, isError } = useGetActiveConversionsQuery();

    /** Convert by MongoDB _id — works even when backend doesn't populate */
    const convert = useMemo(
        () => (amount: number, fromCurrencyId: string, toCurrencyId: string): number => {
            if (fromCurrencyId === toCurrencyId) return amount;
            const rate = _resolveRateById(conversions, fromCurrencyId, toCurrencyId);
            if (rate === null) {
                console.warn(`[currencyUtils] No rate by ID: ${fromCurrencyId} → ${toCurrencyId}`);
                return amount;
            }
            return parseFloat((amount * rate).toFixed(6));
        },
        [conversions]
    );

    /**
     * Convert by currency name/code.
     * ⚠️  Only works when backend populates fromCurrency/toCurrency with { name }.
     *    If your backend returns flat IDs, use `convert()` with the raw _id.
     */
    const convertByName = useMemo(
        () => (amount: number, fromCurrencyName: string, toCurrencyName: string): number => {
            if (fromCurrencyName.trim().toUpperCase() === toCurrencyName.trim().toUpperCase()) return amount;
            const rate = _resolveRateByName(conversions, fromCurrencyName, toCurrencyName);
            if (rate === null) {
                console.warn(`[currencyUtils] No rate by name: "${fromCurrencyName}" → "${toCurrencyName}". Backend may not be populating currency refs.`);
                return amount;
            }
            return parseFloat((amount * rate).toFixed(6));
        },
        [conversions]
    );

    const formatConverted = useMemo(
        () => (amount: number, fromCurrencyId: string, toCurrencyId: string, toCurrencyCode: string, options?: { showIcon?: boolean; showSymbol?: boolean; decimals?: number }): string =>
            formatCurrency(convert(amount, fromCurrencyId, toCurrencyId), toCurrencyCode, options),
        [convert]
    );

    const formatConvertedByName = useMemo(
        () => (amount: number, fromCurrencyName: string, toCurrencyName: string, toCurrencyCode: string, options?: { showIcon?: boolean; showSymbol?: boolean; decimals?: number }): string =>
            formatCurrency(convertByName(amount, fromCurrencyName, toCurrencyName), toCurrencyCode, options),
        [convertByName]
    );

    return { convert, convertByName, formatConverted, formatConvertedByName, isLoading, isError };
}