import { createContext, useState, useEffect, Component } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';


const AuthContext = createContext();

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

/**
 * Component that provides the authentication context to its children. 
 * It will bring to the children the user and token stored in the local and session storage and the login and logout functions.
 * It keeps the user in the local storage to persist his information in the browser.
 * The token is stored in the session storage to avoid persisting it in the browser (for more security).
 * 
 * @param {Component} children that will be wrapped by the provider and receive the context
 * @returns component that provides the authentication context
 */
export const AuthProvider = ({ children }) => {

    const { t } = useTranslation();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = sessionStorage.getItem("token");

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setIsLoading(false);
    }, []);

    const login = async (username, password, callback) => {
        try {
            const res = await axios.post(apiEndpoint + "/login", { username, password });
            const { token, id } = res.data;
            setUser({ username, id });
            setError(null);

            setTimeout(() => {
                setToken(token);
                localStorage.setItem("user", JSON.stringify({ username, id }));
                sessionStorage.setItem("token", token);
            }, 1000)

            callback({ success: true })


        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError(t('auth-error-bad-credentials'));
                callback({ success: false, error: t('auth-error-bad-credentials') })
            }
            else if (error.response && error.response.status === 429) {
                setError(t('auth-error-too-many-attempts'));
                callback({ success: false, error: t('auth-error-too-many-attempts') })
            }
        }
    };


    const isValidToken = async (token) => {
        try {
            const res = await axios.post(apiEndpoint + "/validateToken", { token });
            return res.status === 200;
        } catch (error) {
            return false;
        }
    };



    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, error, login, logout, isValidToken, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
