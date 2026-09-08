import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { getAuthSession } from '../services/authService';

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({
    children
}: ProtectedRouteProps) {

    const [checking, setChecking] =
        useState(true);

    const [authenticated, setAuthenticated] =
        useState(false);


    useEffect(() => {

        const checkSession = async () => {

            try {

                const session =
                    await getAuthSession();

                setAuthenticated(
                    !!session.accessToken
                );

            } catch {

                setAuthenticated(false);

            } finally {

                setChecking(false);

            }

        };


        checkSession();

    }, []);


    // Mientras comprobamos Cognito
    if (checking) {

        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                Verificando sesión...
            </div>
        );

    }


    // No autenticado
    if (!authenticated) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    // Autenticado
    return children;
}


export default ProtectedRoute;
