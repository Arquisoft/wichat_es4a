// This hole code has been taken from this source: https://github.com/Arquisoft/wiq_es1c/blob/master/webapp/src/routers/AuthRoute.js
// It is from a project of the last year of the Software Architecture course in the University of Oviedo
import { useEffect, useState, useContext } from "react";
import { Navigate } from "react-router";
import AuthContext from "../contextProviders/AuthContext";


export const PrivateRouter = ({ children }) =>
{
    const {token, isValidToken, isLoading: authLoading } = useContext(AuthContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
           
            if (!token) {
                setIsAuthenticated(false);
                setIsChecking(false);
                return;
            }

            try {
                const valid = await isValidToken(token);
                setIsAuthenticated(valid);
            } catch (error) {
                setIsAuthenticated(false);
            }

            setIsChecking(false);
        };

        if (!authLoading) {
            verifyToken();
        }
    }, [authLoading, token]);

    if (authLoading || isChecking) return <></>;

    if (isAuthenticated) return children;

    return <Navigate to="/login" replace />;

}