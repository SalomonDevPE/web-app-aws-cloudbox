import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = '';

export const getAuthMe = async () => {
    const session = await fetchAuthSession();

    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
        throw new Error('No hay un Access Token disponible');
    }

    const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`);
    }

    return await response.json();
};
export const getCurrentCloudBoxUser = async () => {
    const session = await fetchAuthSession();

    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
        throw new Error('No hay un Access Token disponible');
    }

    const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error obteniendo usuario: ${response.status}`);
    }

    return await response.json();
};
