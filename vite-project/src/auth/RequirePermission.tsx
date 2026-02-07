import { Navigate, Outlet } from "react-router-dom";

type Props = {
    permission: string;
};

const RequirePermission = ({ permission }: Props) => {
    const permissions = JSON.parse(
        localStorage.getItem("permissions") || "[]"
    );

    if (!permissions.includes(permission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default RequirePermission;
