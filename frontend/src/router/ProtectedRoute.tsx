// import { Navigate } from "react-router-dom";
// import { useAuth } from "../components/commons/hooks/useAuth";

// interface Props {
//     children: JSX.Element;
//     allowedRoles?: string[];
// }

// export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
//     const { token, role, loading } = useAuth(); // Assuming you add 'loading' to your auth state

//     if (!token) {
//         return <Navigate to="/auth/login" replace />;
//     }

//     if (allowedRoles && !allowedRoles.includes(role || "")) {
//         return <Navigate to="/403" replace />;
//     }

//     return children;
// };