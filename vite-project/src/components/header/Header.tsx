import { useState } from "react";
import { Button, Drawer, Menu, Space, Dropdown } from "antd";
import type { ReactNode } from "react";
import {
    LogoutOutlined,
    SettingOutlined,
    BellOutlined,
    MenuOutlined,
    CloseOutlined,
    DownOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import type { MenuProps } from "antd";
import { usePermissions } from "../../hooks/usePermissions";
import { hasPermission } from "../../utils/permission";

interface MenuItem {
    _id: string;
    name: string;
    key: string;
    parent: string | null;
    level: number;
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
    menuData?: MenuItem[];
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
    onMenuItemClick,
}: HeaderProps) => {
    const navigate = useNavigate();
    const isLoading = false;
    const permissions = usePermissions();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
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

    // Recursive function to convert menu items to Ant Design Menu format
    const convertToAntdMenu = (menuItems: MenuItem[]): MenuProps["items"] => {
        return menuItems.map((item) => {
            if (item.children && item.children.length > 0) {
                return {
                    key: item.key,
                    label: item.name,
                    children: convertToAntdMenu(item.children),
                };
            }

            return {
                key: item.key,
                label: item.name,
                onClick: () => {
                    if (onMenuItemClick) {
                        onMenuItemClick(item.key, item);
                    } else {
                        navigate(`/${item.key.replace(/\./g, "/")}`);
                    }
                    setSidebarOpen(false);
                },
            };
        });
    };

    const hasChildren = (item: MenuItem): boolean => {
        return !!(item.children && item.children.length > 0);
    };

    const sidebarMenuItems = convertToAntdMenu(menuData);

    return (
        <>
            <div
                style={{
                    background: "linear-gradient(to right, #4A5568, #2D3748)",
                    padding: "15px 30px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "3px solid #667eea",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                }}
            >
                {/* Left Side - Logo/Title/Menu */}
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    {/* Hamburger Menu - Only visible on mobile */}
                    <Button
                        icon={<MenuOutlined />}
                        onClick={() => setSidebarOpen(true)}
                        className="mobile-only hamburger-btn"
                        style={{
                            background: "transparent",
                            border: "1px solid #667eea",
                            color: "#fff",
                            borderRadius: "6px",
                        }}
                    />

                    {/* Logo */}
                    <Link to={"/"}>
                        <div
                            style={{
                                width: "45px",
                                height: "45px",
                                background: "#667eea",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "24px",
                                    fontWeight: "bold",
                                    color: "#fff",
                                }}
                            >
                                A
                            </span>
                        </div>
                    </Link>

                    {/* Title */}
                    <div>
                        <h2
                            style={{
                                color: "#fff",
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: "600",
                            }}
                        >
                            {title}
                        </h2>
                        <p
                            style={{
                                color: "#CBD5E0",
                                margin: 0,
                                fontSize: "12px",
                            }}
                        >
                            {subtitle}
                        </p>
                    </div>

                    {/* Desktop Menu - Only visible on desktop */}
                    {menuData.length > 0 && (
                        <div style={{ marginLeft: "30px" }} className="desktop-menu">
                            <Space size="middle">
                                {menuData.map((item) => {
                                    if (hasChildren(item)) {
                                        const dropdownItems = convertToAntdMenu(item.children!);

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
                                                        padding: "0 20px",
                                                    }}
                                                >
                                                    {item.name}{" "}
                                                    <DownOutlined style={{ fontSize: "12px" }} />
                                                </Button>
                                            </Dropdown>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={item.key}
                                            onClick={() => {
                                                if (onMenuItemClick) {
                                                    onMenuItemClick(item.key, item);
                                                } else {
                                                    navigate(`/${item.key.replace(/\./g, "/")}`);
                                                }
                                            }}
                                            style={{
                                                background: "transparent",
                                                border: "1px solid #667eea",
                                                color: "#fff",
                                                borderRadius: "6px",
                                                height: "38px",
                                                fontWeight: "500",
                                                padding: "0 20px",
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

                {/* Center - Children */}
                {children && (
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            padding: "0 20px",
                        }}
                    >
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
                                height: "38px",
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
                                height: "38px",
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
                                fontWeight: "500",
                            }}
                            className="logout-btn"
                        >
                            <span className="logout-text">Logout</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Sidebar - Only opens on mobile */}
            <Drawer
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Space>
                            <div
                                style={{
                                    width: "35px",
                                    height: "35px",
                                    background: "#667eea",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        color: "#fff",
                                    }}
                                >
                                    A
                                </span>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        color: "#2D3748",
                                    }}
                                >
                                    {title}
                                </div>
                                <div style={{ fontSize: "12px", color: "#718096" }}>{subtitle}</div>
                            </div>
                        </Space>
                    </div>
                }
                placement="left"
                onClose={() => setSidebarOpen(false)}
                open={sidebarOpen}
                width={280}
                closeIcon={<CloseOutlined style={{ color: "#667eea" }} />}
                styles={{
                    header: {
                        borderBottom: "2px solid #E2E8F0",
                        paddingBottom: "15px",
                    },
                    body: {
                        padding: 0,
                    },
                }}
            >
                <Menu
                    mode="inline"
                    items={sidebarMenuItems}
                    style={{
                        border: "none",
                        fontSize: "14px",
                    }}
                    theme="light"
                />

                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        padding: "15px",
                        borderTop: "1px solid #E2E8F0",
                        background: "#F7FAFC",
                    }}
                >
                    <Space direction="vertical" style={{ width: "100%" }} size="small">
                        {showNotifications && (
                            <Button
                                icon={<BellOutlined />}
                                block
                                style={{
                                    height: "40px",
                                    borderRadius: "6px",
                                    border: "1px solid #667eea",
                                    color: "#667eea",
                                }}
                            >
                                Notifications
                            </Button>
                        )}
                        {showSettings && (
                            <Button
                                icon={<SettingOutlined />}
                                block
                                style={{
                                    height: "40px",
                                    borderRadius: "6px",
                                    border: "1px solid #667eea",
                                    color: "#667eea",
                                }}
                            >
                                Settings
                            </Button>
                        )}
                    </Space>
                </div>
            </Drawer>

            {/* Responsive CSS */}
            <style>{`
                /* Desktop (> 768px) - Show menu in header, hide hamburger */
                @media (min-width: 769px) {
                    .mobile-only {
                        display: none !important;
                    }
                }

                /* Mobile (< 768px) - Hide menu in header, show hamburger */
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .logout-text {
                        display: none;
                    }
                    .logout-btn {
                        padding: 0 11px !important;
                    }
                }

                /* Sidebar Styling */
                .ant-menu-item {
                    border-radius: 6px;
                    margin: 4px 8px;
                }
                .ant-menu-item-selected {
                    background: linear-gradient(to right, #667eea, #764ba2) !important;
                    color: #fff !important;
                }
                .ant-menu-submenu-title {
                    border-radius: 6px;
                    margin: 4px 8px;
                }
            `}</style>
        </>
    );
};

export default Header;