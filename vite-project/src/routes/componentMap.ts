import AdminManagement from "../pages/admin-management/AdminManagement";
import ClientManagement from "../pages/client-management/ClientManagement";
import MenuManagementWithRTK from "../pages/menu-management/MenuManagement";
import ProductAttributes from "../pages/product-attributes/ProductAttributes";
import SupplierManagement from "../pages/supplier-management/SupplierManagement";

export const componentMap: Record<string, React.ComponentType<any>> = {
    menu: MenuManagementWithRTK,
    admin: AdminManagement,
    supplier: SupplierManagement,
    client: ClientManagement,
    "setting.attribute": ProductAttributes

    // // ✅ Order Module Parent
    // order: OrderIndex,

    // // ✅ Order Children
    // "order.create": OrderCreate,
    // "order.list": OrderList,
};