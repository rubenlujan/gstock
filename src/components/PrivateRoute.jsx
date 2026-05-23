import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
    const companyId = sessionStorage.getItem("CompanyId");
    return companyId ? children : <Navigate to="/login" />;
};
