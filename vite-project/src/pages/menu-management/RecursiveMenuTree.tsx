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

const RecursiveMenuTree = ({ menuData, onAddChild, onEdit, onDelete }: RecursiveMenuTreeProps) => {
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

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

    useEffect(() => {
        setExpandedKeys(getAllKeys(menuData));
    }, [menuData]);

    const convertToTreeData = (items: MenuItem[]): DataNode[] => {
        return items.map((item) => {
            const children = item.children ?? [];
            const hasChildren = !!children.length;

            return {
                key: item._id,
                title: (
                    <div className="tree-node">
                        {/* Left side */}
                        <Space className="tree-node-left">
                            <span className="tree-node-name">{item.name}</span>
                            {item.key && (
                                <Tag color="blue" className="tree-node-key">
                                    {item.key}
                                </Tag>
                            )}
                            {hasChildren && (
                                <Tag color="green" className="tree-node-count">
                                    {children.length}
                                </Tag>
                            )}
                        </Space>

                        {/* Right actions */}
                        <Space size="small" className="tree-node-actions">
                            <Tooltip title="Add Child">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddChild(item._id);
                                    }}
                                    className="action-btn add-btn"
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
                                    className="action-btn edit-btn"
                                />
                            </Tooltip>

                            <Popconfirm
                                title="Delete Menu"
                                description={
                                    <div>
                                        <p>Delete "{item.name}"?</p>
                                        {hasChildren && (
                                            <p style={{ color: "red", fontWeight: 500, marginTop: 8 }}>
                                                ⚠️ Deletes {children.length} submenu(s)
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
                                        className="action-btn delete-btn"
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
        <>
            <div className="tree-container">
                {menuData.length === 0 ? (
                    <div className="tree-empty">
                        <FolderOpenOutlined style={{ fontSize: 40, opacity: 0.4, marginBottom: 10 }} />
                        <p style={{ margin: 0, color: "#718096" }}>No menu found</p>
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

            {/* Responsive CSS */}
            <style>{`
                /* Desktop styles */
                .tree-container {
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #E2E8F0;
                }

                .tree-node {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .tree-node:hover {
                    background: #F7FAFC;
                }

                .tree-node-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;
                }

                .tree-node-name {
                    font-weight: 500;
                    font-size: 14px;
                    color: #2D3748;
                }

                .tree-node-key {
                    font-family: monospace;
                    font-size: 11px;
                    padding: 2px 8px;
                }

                .tree-node-count {
                    font-size: 11px;
                }

                .tree-node-actions {
                    display: flex;
                    gap: 4px;
                }

                .action-btn {
                    border-radius: 4px;
                }

                .add-btn {
                    color: #52c41a !important;
                }

                .edit-btn {
                    color: #667eea !important;
                }

                .tree-empty {
                    text-align: center;
                    padding: 60px 20px;
                }

                /* Mobile responsive (< 768px) */
                @media (max-width: 768px) {
                    .tree-container {
                        padding: 12px;
                    }

                    .tree-node {
                        padding: 6px 4px;
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .tree-node-left {
                        flex-wrap: wrap;
                        gap: 6px;
                        max-width: calc(100% - 120px);
                    }

                    .tree-node-name {
                        font-size: 13px;
                        word-break: break-word;
                    }

                    .tree-node-key {
                        font-size: 10px;
                        padding: 1px 6px;
                    }

                    .tree-node-count {
                        font-size: 10px;
                        padding: 1px 6px;
                    }

                    .tree-node-actions {
                        gap: 2px;
                    }

                    .action-btn {
                        min-width: 32px;
                        height: 32px;
                    }

                    /* Reduce tree indentation on mobile */
                    .ant-tree .ant-tree-treenode {
                        padding: 2px 0 !important;
                    }

                    .ant-tree .ant-tree-indent-unit {
                        width: 16px !important;
                    }
                }

                /* Very small screens (< 400px) */
                @media (max-width: 400px) {
                    .tree-node {
                        flex-direction: column;
                        align-items: flex-start !important;
                    }

                    .tree-node-left {
                        width: 100%;
                        max-width: 100%;
                    }

                    .tree-node-actions {
                        width: 100%;
                        justify-content: flex-end;
                        padding-top: 4px;
                        border-top: 1px solid #f0f0f0;
                        margin-top: 4px;
                    }

                    .tree-container {
                        padding: 8px;
                    }

                    .ant-tree .ant-tree-indent-unit {
                        width: 12px !important;
                    }
                }
            `}</style>
        </>
    );
};

export default RecursiveMenuTree;