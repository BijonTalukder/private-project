import { useEffect, useState } from "react";
import { Tree, Button, Space, Tooltip, Popconfirm, Tag } from "antd";
import {
    FolderOutlined,
    FileOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FolderOpenOutlined,
} from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
import type { MenuItem } from "../../api/services/menu/menuApi";

interface RecursiveMenuTreeProps {
    menuData: MenuItem[];
    onAddChild: (parentId: string | null) => void;
    onEdit: (menu: MenuItem) => void;
    onDelete: (id: string, hasChildren: boolean, childCount: number) => void;
}

const RecursiveMenuTree = ({
    menuData,
    onAddChild,
    onEdit,
    onDelete,
}: RecursiveMenuTreeProps) => {
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

    // ✅ Get all keys recursively (expand all)
    const getAllKeys = (items: MenuItem[]): React.Key[] => {
        let keys: React.Key[] = [];

        items.forEach((item) => {
            keys.push(item._id);
            if (item.children?.length) {
                keys = [...keys, ...getAllKeys(item.children)];
            }
        });

        return keys;
    };

    // ✅ Expand all when menu changes
    useEffect(() => {
        setExpandedKeys(getAllKeys(menuData));
    }, [menuData]);

    // ✅ Convert API menu → Ant Tree
    const convertToTreeData = (items: MenuItem[]): DataNode[] => {
        return items.map((item) => {
            const children = item.children ?? [];
            const hasChildren = !!children.length;

            return {
                key: item._id,
                title: (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "4px 8px",
                            borderRadius: "6px",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#F7FAFC")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                        }
                    >
                        {/* LEFT */}
                        <Space>
                            {/* {hasChildren ? (
                                <FolderOpenOutlined style={{ color: "#667eea" }} />
                            ) : (
                                <FileOutlined style={{ color: "#718096" }} />
                            )} */}

                            <span style={{ fontWeight: 500 }}>{item.name}</span>

                            {/* key tag (hide if empty) */}
                            {item.key && (
                                <Tag color="blue" style={{ fontFamily: "monospace" }}>
                                    {item.key}
                                </Tag>
                            )}

                            {hasChildren && <Tag color="green">{children.length}</Tag>}
                        </Space>

                        {/* RIGHT ACTIONS */}
                        <Space size="small">
                            <Tooltip title="Add Child">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddChild(item._id);
                                    }}
                                    style={{ color: "#52c41a" }}
                                />
                            </Tooltip>

                            <Tooltip title="Edit">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(item);
                                    }}
                                    style={{ color: "#667eea" }}
                                />
                            </Tooltip>

                            <Popconfirm
                                title="Delete Menu"
                                description={
                                    <div>
                                        <p>Are you sure to delete "{item.name}"?</p>
                                        {hasChildren && (
                                            <p style={{ color: "red", fontWeight: 500 }}>
                                                ⚠️ This will delete {children.length} submenu(s)
                                            </p>
                                        )}
                                    </div>
                                }
                                onConfirm={(e) => {
                                    e?.stopPropagation();
                                    onDelete(item._id, hasChildren, children.length);
                                }}
                                okText="Delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                            >
                                <Tooltip title="Delete">
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </Space>
                    </div>
                ),
                icon: hasChildren ? (
                    <FolderOutlined style={{ color: "#667eea" }} />
                ) : (
                    <FileOutlined style={{ color: "#718096" }} />
                ),
                children: hasChildren ? convertToTreeData(children) : undefined,
            };
        });
    };

    const treeData = convertToTreeData(menuData);

    return (
        <div
            style={{
                background: "#fff",
                padding: 20,
                borderRadius: 8,
                border: "1px solid #E2E8F0",
            }}
        >
            {/* ROOT ADD BUTTON */}
            {/* <div style={{ marginBottom: 12 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => onAddChild(null)}>
                    Create Root Menu
                </Button>
            </div> */}

            {/* EMPTY */}
            {menuData.length === 0 ? (
                <div style={{ textAlign: "center", padding: 50 }}>
                    <FolderOpenOutlined style={{ fontSize: 40, opacity: 0.4 }} />
                    <p>No menu found</p>
                </div>
            ) : (
                <Tree
                    showLine
                    showIcon
                    expandedKeys={expandedKeys}
                    onExpand={(keys) => setExpandedKeys(keys)}
                    treeData={treeData}
                />
            )}
        </div>
    );
};

export default RecursiveMenuTree;