// This hole code has been taken from this source: https://github.com/Arquisoft/wiq_es1c/blob/master/webapp/src/routers/AuthRoute.js
// It is from a project of the last year of the Software Architecture course in the University of Oviedo

import { Navigate } from "react-router";

/**
 * Renders the React Component passed as a prop if the user isn't authenticated. Otherwise, it redirects to the home page.
 * 
 * @param {ReactComponent} children - The React component to render if the user isn't authenticated.
 * @returns {ReactComponent} The React component to render.
 */
export const AuthRoute = ({ children }) =>
{
    const token = localStorage.getItem('token');

    return (token === undefined || token === null) ? children : <Navigate to='/home' replace />;
}