import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/commons/hooks/useAuth";

interface Props {
    children: React.ReactElement;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const { token, roles } = useAuth();
    const location = useLocation();
    
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.some((allowedRole) => roles.includes(allowedRole))) {
        return <Navigate to="/403" replace />;
    }

    return children;
};
