import { Button, Dropdown, Space } from "antd";
import type { ReactNode } from "react";
import {
    LogoutOutlined,
    SettingOutlined,
    BellOutlined,
    MenuOutlined,
    DownOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import type { MenuProps } from 'antd';
import { usePermissions } from "../../hooks/usePermissions";
import { hasPermission } from "../../utils/permission";

interface MenuItem {
    _id: string;
    name: string;
    key: string;
    parent: string | null;
    children?: MenuItem[];
    createdAt: string;
    updatedAt: string;
}

interface HeaderProps {
    children?: ReactNode;
    title?: string;
    subtitle?: string;
    showLogout?: boolean;
    showSettings?: boolean;
    showNotifications?: boolean;
    showMenu?: boolean;
    menuData?: MenuItem[]; // Menu data from backend
    onMenuClick?: () => void;
    onMenuItemClick?: (key: string, item: MenuItem) => void;
}

const Header = ({
    children,
    title = "Admin Dashboard",
    subtitle = "Welcome back!",
    showLogout = true,
    showSettings = true,
    showNotifications = true,
    showMenu = false,
    menuData = [],
    onMenuClick,
    onMenuItemClick
}: HeaderProps) => {
    const navigate = useNavigate();
    // const [logout, { isLoading }] = useLogoutMutation();
    const isLoading = false
    const permissions = usePermissions();
    const handleLogout = async () => {
        try {
            // await logout({}).unwrap();
            message.success("Logged out successfully!");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            navigate("/login");
        } catch (error: any) {
            message.error(error?.data?.message || "Logout failed");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            navigate("/login");
        }
    };

    // Convert menu data to Ant Design Menu format
    const convertToAntdMenu = (menuItems: MenuItem[]): MenuProps['items'] => {
        return menuItems.map(item => {
            // If item has children, create submenu
            if (item.children && item.children.length > 0) {
                return {
                    key: item.key,
                    label: item.name,
                    children: item.children.map(child => ({
                        key: child.key,
                        label: child.name,
                        onClick: () => {
                            if (onMenuItemClick) {
                                onMenuItemClick(child.key, child);
                            } else {
                                // Default navigation based on key
                                navigate(`/${child.key.replace('.', '/')}`);
                            }
                        }
                    }))
                };
            }

            // Single menu item without children
            return {
                key: item.key,
                label: item.name,
                onClick: () => {
                    if (onMenuItemClick) {
                        onMenuItemClick(item.key, item);
                    } else {
                        navigate(`/${item.key}`);
                    }
                }
            };
        });
    };

    const menuItems = convertToAntdMenu(menuData);

    return (
        <div style={{
            background: "linear-gradient(to right, #4A5568, #2D3748)",
            padding: "15px 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "3px solid #667eea",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            position: "sticky",
            top: 0,
            zIndex: 1000
        }}>
            {/* Left Side - Logo/Title/Menu */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {showMenu && (
                    <Button
                        icon={<MenuOutlined />}
                        onClick={onMenuClick}
                        style={{
                            background: "transparent",
                            border: "1px solid #667eea",
                            color: "#fff",
                            borderRadius: "6px",
                            marginRight: "10px"
                        }}
                    />
                )}

                <div style={{
                    width: "45px",
                    height: "45px",
                    background: "#667eea",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)"
                }}>
                    <span style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#fff"
                    }}>
                        A
                    </span>
                </div>

                <div>
                    <h2 style={{
                        color: "#fff",
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: "600"
                    }}>
                        {title}
                    </h2>
                    <p style={{
                        color: "#CBD5E0",
                        margin: 0,
                        fontSize: "12px"
                    }}>
                        {subtitle}
                    </p>
                </div>

                {/* Navigation Menu with Dropdowns */}
                {menuData.length > 0 && (
                    <div style={{ marginLeft: "30px" }}>
                        <Space size="middle">
                            {menuData.map(item => {

                                // if (!hasPermission(permissions, item.key, "read")) return null;
                                // If has children, show as dropdown
                                if (item.children && item.children.length > 0) {
                                    const dropdownItems: MenuProps['items'] = item.children.map(child => ({
                                        key: child.key,
                                        label: child.name,
                                        onClick: () => {
                                            if (onMenuItemClick) {
                                                onMenuItemClick(child.key, child);
                                            } else {
                                                navigate(`/${child.key.replace('.', '/')}`);
                                            }
                                        }
                                    }));

                                    return (
                                        <Dropdown
                                            key={item.key}
                                            menu={{ items: dropdownItems }}
                                            placement="bottomLeft"
                                        >
                                            <Button
                                                style={{
                                                    background: "transparent",
                                                    border: "1px solid #667eea",
                                                    color: "#fff",
                                                    borderRadius: "6px",
                                                    height: "38px",
                                                    fontWeight: "500",
                                                    padding: "0 20px"
                                                }}
                                            >
                                                {item.name} <DownOutlined style={{ fontSize: "12px" }} />
                                            </Button>
                                        </Dropdown>
                                    );
                                }

                                // Single menu item without children
                                return (
                                    <Button
                                        key={item.key}
                                        onClick={() => {
                                            if (onMenuItemClick) {
                                                onMenuItemClick(item.key, item);
                                            } else {
                                                // navigate(`/${item.key}`);
                                            }
                                        }}
                                        style={{
                                            background: "transparent",
                                            border: "1px solid #667eea",
                                            color: "#fff",
                                            borderRadius: "6px",
                                            height: "38px",
                                            fontWeight: "500",
                                            padding: "0 20px"
                                        }}
                                    >
                                        {item.name}
                                    </Button>
                                );
                            })}
                        </Space>
                    </div>
                )}
            </div>

            {/* Center - Children (if provided) */}
            {children && (
                <div style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    padding: "0 20px"
                }}>
                    {children}
                </div>
            )}

            {/* Right Side - Action Buttons */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {showNotifications && (
                    <Button
                        icon={<BellOutlined />}
                        style={{
                            background: "transparent",
                            border: "1px solid #667eea",
                            color: "#fff",
                            borderRadius: "6px",
                            height: "38px"
                        }}
                    />
                )}

                {showSettings && (
                    <Button
                        icon={<SettingOutlined />}
                        style={{
                            background: "transparent",
                            border: "1px solid #667eea",
                            color: "#fff",
                            borderRadius: "6px",
                            height: "38px"
                        }}
                    />
                )}

                {showLogout && (
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        loading={isLoading}
                        style={{
                            background: "#667eea",
                            border: "none",
                            color: "#fff",
                            borderRadius: "6px",
                            height: "38px",
                            fontWeight: "500"
                        }}
                    >
                        Logout
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Header;