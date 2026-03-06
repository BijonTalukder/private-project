// Create DTO
export class CreateCurrencyConversionDto {
    fromCurrencyId: string;
    toCurrencyId: string;
    exchangeRate: number;
    effectiveDate?: Date | null;
    isActive?: boolean;
    notes?: string;
}

// Update DTO
export class UpdateCurrencyConversionDto {
    fromCurrencyId?: string;
    toCurrencyId?: string;
    exchangeRate?: number;
    effectiveDate?: Date | null;
    isActive?: boolean;
    notes?: string;
}

// Response DTO (with populated fields)
export interface CurrencyConversionResponse {
    _id: string;
    conversionId: string;
    fromCurrency: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    };
    toCurrency: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    };
    exchangeRate: number;
    effectiveDate: Date | null;
    isActive: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

// Convert Amount DTO
export class ConvertAmountDto {
    amount: number;
    fromCurrencyId: string;
    toCurrencyId: string;
}

// Convert Amount Response
export interface ConvertAmountResponse {
    originalAmount: number;
    convertedAmount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    conversionDate: Date;
}