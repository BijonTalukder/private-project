import { Outlet, useNavigate } from "react-router-dom"
import Header from "../components/header/Header"
import { useGetAllMenusQuery } from "../api/services/menu/menuApi";
import { Input, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { usePermissions } from "../hooks/usePermissions";

const MainLayout = () => {
    const { data, isLoading, error } = useGetAllMenusQuery();

    const navigate = useNavigate()
    const permissions = usePermissions();
    const handleMenuItemClick = (key: string, item: any) => {

        // Navigate based on menu key
        // Example: "order.create" -> "/order/create"
        const route = `/${key.replace('.', '/')}`;
        navigate(route);
    };
    if (isLoading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}>
                <Spin size="large" />
            </div>
        );
    }
    if (error) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}>
                <h2 style={{ color: "#fff" }}>Error loading menu</h2>
            </div>
        );
    }
    return (
        <div>
            <div>
                {/* header */}
                <Header
                    title="Admin Dashboard"
                    subtitle="Welcome back!"
                    menuData={data || []}
                    onMenuItemClick={handleMenuItemClick}
                >
                    {/* <Input
                        placeholder="Search anything..."
                        prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                        style={{
                            width: "400px",
                            height: "38px",
                            borderRadius: "6px"
                        }}
                    /> */}
                </Header>

            </div>
            <div>
                <Outlet />
            </div>

        </div>

    )
}

export default MainLayout