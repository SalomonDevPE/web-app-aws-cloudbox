import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = '';

export interface Folder {
    id: number;
    name: string;
    parentFolderId: number | null;
    createdAt: string;
}

export const getFolders = async (
    parentFolderId: number | null = null
): Promise<Folder[]> => {
    const session = await fetchAuthSession();

    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
        throw new Error('No hay un Access Token disponible');
    }

    const url = parentFolderId === null
        ? `${API_URL}/api/folders`
        : `${API_URL}/api/folders?parentFolderId=${parentFolderId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error obteniendo carpetas: ${response.status}`);
    }

    return await response.json();
};
export const createFolder = async (
    name: string,
    parentFolderId: number | null = null
): Promise<Folder> => {
    const session = await fetchAuthSession();

    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
        throw new Error('No hay un Access Token disponible');
    }

    const response = await fetch(`${API_URL}/api/folders`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            parentFolderId
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message || `Error creando carpeta: ${response.status}`
        );
    }

    return await response.json();
};
export const updateFolder = async (
    id: number,
    name: string
): Promise<Folder> => {

    const session = await fetchAuthSession();

    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
        throw new Error('No hay un Access Token disponible');
    }

    const response = await fetch(
        `${API_URL}/api/folders/${id}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${ accessToken } `,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        }
    );

    if (!response.ok) {

        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ||
            `Error modificando carpeta: ${ response.status } `
        );
    }

    return await response.json();
};
export const deleteFolder = async (id: number): Promise<void> => {
    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
        throw new Error('No hay un Access Token disponible');
    }

    const response = await fetch(
        `${API_URL}/api/folders/${id}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ||
            `Error eliminando carpeta: ${response.status}`
        );
    }
};
