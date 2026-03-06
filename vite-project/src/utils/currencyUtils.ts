// Currency icon and symbol mapping utility
// Location: src/utils/currencyUtils.ts

export interface CurrencyConfig {
    symbol: string;
    icon: string;
    name: string;
    code: string;
}

// Predefined currency configurations
export const CURRENCY_MAP: Record<string, CurrencyConfig> = {
    // Major Currencies
    'USD': {
        symbol: '$',
        icon: '$',
        name: 'US Dollar',
        code: 'USD'
    },
    'EUR': {
        symbol: '€',
        icon: '💶',
        name: 'Euro',
        code: 'EUR'
    },
    'GBP': {
        symbol: '£',
        icon: '💷',
        name: 'British Pound',
        code: 'GBP'
    },
    'JPY': {
        symbol: '¥',
        icon: '💴',
        name: 'Japanese Yen',
        code: 'JPY'
    },
    'CNY': {
        symbol: '¥',
        icon: '💴',
        name: 'Chinese Yuan',
        code: 'CNY'
    },

    // Asian Currencies
    'BDT': {
        symbol: '৳',
        icon: '🇧🇩',
        name: 'Bangladeshi Taka',
        code: 'BDT'
    },
    'INR': {
        symbol: '₹',
        icon: '🇮🇳',
        name: 'Indian Rupee',
        code: 'INR'
    },
    'PKR': {
        symbol: '₨',
        icon: '🇵🇰',
        name: 'Pakistani Rupee',
        code: 'PKR'
    },
    'SGD': {
        symbol: 'S$',
        icon: '🇸🇬',
        name: 'Singapore Dollar',
        code: 'SGD'
    },
    'MYR': {
        symbol: 'RM',
        icon: '🇲🇾',
        name: 'Malaysian Ringgit',
        code: 'MYR'
    },
    'THB': {
        symbol: '฿',
        icon: '🇹🇭',
        name: 'Thai Baht',
        code: 'THB'
    },
    'IDR': {
        symbol: 'Rp',
        icon: '🇮🇩',
        name: 'Indonesian Rupiah',
        code: 'IDR'
    },
    'PHP': {
        symbol: '₱',
        icon: '🇵🇭',
        name: 'Philippine Peso',
        code: 'PHP'
    },
    'VND': {
        symbol: '₫',
        icon: '🇻🇳',
        name: 'Vietnamese Dong',
        code: 'VND'
    },
    'KRW': {
        symbol: '₩',
        icon: '🇰🇷',
        name: 'South Korean Won',
        code: 'KRW'
    },

    // Middle East Currencies
    'AED': {
        symbol: 'د.إ',
        icon: '🇦🇪',
        name: 'UAE Dirham',
        code: 'AED'
    },
    'SAR': {
        symbol: '﷼',
        icon: '🇸🇦',
        name: 'Saudi Riyal',
        code: 'SAR'
    },
    'QAR': {
        symbol: '﷼',
        icon: '🇶🇦',
        name: 'Qatari Riyal',
        code: 'QAR'
    },
    'KWD': {
        symbol: 'د.ك',
        icon: '🇰🇼',
        name: 'Kuwaiti Dinar',
        code: 'KWD'
    },
    'BHD': {
        symbol: 'د.ب',
        icon: '🇧🇭',
        name: 'Bahraini Dinar',
        code: 'BHD'
    },
    'OMR': {
        symbol: '﷼',
        icon: '🇴🇲',
        name: 'Omani Rial',
        code: 'OMR'
    },

    // Other Major Currencies
    'AUD': {
        symbol: 'A$',
        icon: '🇦🇺',
        name: 'Australian Dollar',
        code: 'AUD'
    },
    'CAD': {
        symbol: 'C$',
        icon: '🇨🇦',
        name: 'Canadian Dollar',
        code: 'CAD'
    },
    'CHF': {
        symbol: 'Fr',
        icon: '🇨🇭',
        name: 'Swiss Franc',
        code: 'CHF'
    },
    'NZD': {
        symbol: 'NZ$',
        icon: '🇳🇿',
        name: 'New Zealand Dollar',
        code: 'NZD'
    },
    'SEK': {
        symbol: 'kr',
        icon: '🇸🇪',
        name: 'Swedish Krona',
        code: 'SEK'
    },
    'NOK': {
        symbol: 'kr',
        icon: '🇳🇴',
        name: 'Norwegian Krone',
        code: 'NOK'
    },
    'DKK': {
        symbol: 'kr',
        icon: '🇩🇰',
        name: 'Danish Krone',
        code: 'DKK'
    },
    'RUB': {
        symbol: '₽',
        icon: '🇷🇺',
        name: 'Russian Ruble',
        code: 'RUB'
    },
    'ZAR': {
        symbol: 'R',
        icon: '🇿🇦',
        name: 'South African Rand',
        code: 'ZAR'
    },
    'BRL': {
        symbol: 'R$',
        icon: '🇧🇷',
        name: 'Brazilian Real',
        code: 'BRL'
    },
    'MXN': {
        symbol: '$',
        icon: '🇲🇽',
        name: 'Mexican Peso',
        code: 'MXN'
    },
    'TRY': {
        symbol: '₺',
        icon: '🇹🇷',
        name: 'Turkish Lira',
        code: 'TRY'
    },
    'PLN': {
        symbol: 'zł',
        icon: '🇵🇱',
        name: 'Polish Zloty',
        code: 'PLN'
    },
    'HKD': {
        symbol: 'HK$',
        icon: '🇭🇰',
        name: 'Hong Kong Dollar',
        code: 'HKD'
    },
};

// Default fallback currency
const DEFAULT_CURRENCY: CurrencyConfig = {
    symbol: '$',
    icon: '$',
    name: 'Unknown Currency',
    code: 'XXX'
};

/**
 * Get currency configuration by currency name or code
 * Matches against both exact code and currency name
 */
export const getCurrencyConfig = (currencyNameOrCode: string): CurrencyConfig => {
    if (!currencyNameOrCode) return DEFAULT_CURRENCY;

    const upperName = currencyNameOrCode.trim().toUpperCase();

    // Direct code match
    if (CURRENCY_MAP[upperName]) {
        return CURRENCY_MAP[upperName];
    }

    // Try to find by partial name match
    const matchedEntry = Object.entries(CURRENCY_MAP).find(([code, config]) => {
        return config.name.toUpperCase().includes(upperName) ||
            upperName.includes(code);
    });

    if (matchedEntry) {
        return matchedEntry[1];
    }

    return DEFAULT_CURRENCY;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currencyNameOrCode: string): string => {
    return getCurrencyConfig(currencyNameOrCode).symbol;
};

/**
 * Get currency icon (emoji)
 */
export const getCurrencyIcon = (currencyNameOrCode: string): string => {
    return getCurrencyConfig(currencyNameOrCode).icon;
};

/**
 * Format amount with currency
 */
export const formatCurrency = (
    amount: number,
    currencyNameOrCode: string,
    options?: {
        showIcon?: boolean;
        showSymbol?: boolean;
        decimals?: number;
    }
): string => {
    const config = getCurrencyConfig(currencyNameOrCode);
    const { showIcon = false, showSymbol = true, decimals = 2 } = options || {};

    const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    const parts = [];

    if (showIcon) {
        parts.push(config.icon);
    }

    if (showSymbol) {
        parts.push(config.symbol);
    }

    parts.push(formattedAmount);

    return parts.join(' ');
};

/**
 * Get all available currencies
 */
export const getAllCurrencies = (): CurrencyConfig[] => {
    return Object.values(CURRENCY_MAP);
};

/**
 * Check if currency exists in predefined list
 */
export const isCurrencySupported = (currencyNameOrCode: string): boolean => {
    const config = getCurrencyConfig(currencyNameOrCode);
    return config.code !== 'XXX';
};