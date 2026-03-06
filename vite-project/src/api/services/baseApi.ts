import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../axiosBaseQuery';
// https://private-project-ur1i.onrender.com/
// 'https://private-project-ur1i.onrender.com
export const TAG_TYPES = {
    // Authentication & Admin
    AUTH: 'Auth',
    ADMIN: 'Admin',
    ROLE: 'Role',

    // Menu System
    MENU: 'Menu',

    // Master Data
    SUPPLIER: 'Supplier',
    CLIENT: 'Client',
    PURCHASE_ITEM: 'PurchaseItem',
    FINISH_GOODS: 'FinishGoods',
    SUPPLIER_PURCHASE_PRICE: 'SupplierPurchasePrice',

    // Settings & Attributes
    COLOR: 'Color',
    WIDTH: 'Width',
    UNIT: 'Unit',
    GSM: 'GSM',

    // Financial
    CURRENCY: 'Currency',
    PAYMENT: 'Payment',
    BANK: 'Bank',

    // Transactions
    INVOICE: 'Invoice',
    DELIVERY_CHALLAN: 'DeliveryChallan',
    CURRENCY_CONVERT: "CurrencyConversion"
} as const;
const tagTypesArray = Object.values(TAG_TYPES);
export const baseApi = createApi({
    reducerPath: 'api', //http://test-api.shuvadebnathbd.com/api
    baseQuery: axiosBaseQuery({
        baseUrl: 'http://test-api.shuvadebnathbd.com/api'
    }),
    tagTypes: tagTypesArray,

    endpoints: (builder) => ({

    }),
});

export const {

} = baseApi;