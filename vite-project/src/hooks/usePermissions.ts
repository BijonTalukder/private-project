export const usePermissions = () => {
    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    console.log(admin)
    return admin?.role?.permissions || [];
};
