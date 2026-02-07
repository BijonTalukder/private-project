export const hasPermission = (
    permissions: any[],
    menuKey: string,
    action: "create" | "read" | "update" | "delete"
) => {
    const permission = permissions.find(
        (p) => p.menuKey === menuKey
    );

    if (!permission) return false;

    return permission[action] === true;
};
