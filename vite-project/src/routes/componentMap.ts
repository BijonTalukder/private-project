import SupplierPurchasePriceListManagement from "../pages/supplier-purchase-price/Supplierpurchasepricelistmanagement";
import AdminManagement from "../pages/admin-management/AdminManagement";
import BankInfoManagement from "../pages/bank-info/BankinfoManagement";
import ClientManagement from "../pages/client-management/ClientManagement";
import CurrencyInfoManagement from "../pages/currency-info/CurrencyManagement";
import FinishGoodsManagement from "../pages/finish-goods-management/Finishgoodsmanagement";
import InvoiceManagement from "../pages/invoice-management/InvoiceManagement";
import InvoiceListPage from "../pages/invoice-management/list/InvoiceListPage";
import MenuManagementWithRTK from "../pages/menu-management/MenuManagement";
import PaymentInfoManagement from "../pages/payment-info/PaymentInfoManagement";
import ProductAttributes from "../pages/product-attributes/ProductAttributes";
import PurchaseItemInfoManagement from "../pages/purchase-item-management/PurchaseItemInfoManagement";
import SupplierManagement from "../pages/supplier-management/SupplierManagement";
import DeliveryChallanManagement from "../pages/delivery-challan/DeliveryChallanManagement";
import ApprovedInvoiceListPage from "../pages/invoice-management/list/ApproveInvoiceListPage";



export const componentMap: Record<string, React.ComponentType<any>> = {
    menu: MenuManagementWithRTK,
    admin: AdminManagement,
    supplier: SupplierManagement,
    client: ClientManagement,
    purchaseitem: PurchaseItemInfoManagement,
    "finish-goods": FinishGoodsManagement,
    "supplier-purchase-price": SupplierPurchasePriceListManagement,
    "setting.attribute": ProductAttributes,
    "currency-info": CurrencyInfoManagement,
    "payment-info": PaymentInfoManagement,
    "bank-info": BankInfoManagement,
    "invoice-management": InvoiceManagement,
    "invoice-list": InvoiceListPage,
    "invoice-approved": ApprovedInvoiceListPage,
    "delivery-challan": DeliveryChallanManagement, // Placeholder, replace with actual Delivery Challan component when created

    // // ✅ Order Module Parent
    // order: OrderIndex,

    // // ✅ Order Children
    // "order.create": OrderCreate,
    // "order.list": OrderList,
};
// export const ROUTE_KEYS = Object.keys(componentMap);
export const ROUTE_KEYS = [
    "menu",
    "admin",
    "supplier",
    "client",
    "purchaseitem",
    "finish-goods",
    "supplier-purchase-price",
    "setting.attribute",
    "currency-info",
    "payment-info",
    "bank-info",
    "invoice-management",
    "invoice-list",
    "invoice-approved",
    "delivery-challan",

];