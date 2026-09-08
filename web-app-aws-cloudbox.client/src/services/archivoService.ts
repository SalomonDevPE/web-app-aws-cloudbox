import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = '';

export interface Archivo {
    id: number;
    name: string;
    extension: string;
    contentType: string;
    size: number;
    folderId: number | null;
    s3Key: string;
    createdAt: string;
}

export const getArchivos = async (
    folderId: number | null = null
): Promise<Archivo[]> => {

    const session = await fetchAuthSession();

    const accessToken =
        session.tokens?.accessToken?.toString();

    if (!accessToken) {
        throw new Error('No hay un Access Token disponible');
    }

    const url = folderId !== null
        ? `${API_URL}/api/archivos?folderId=${folderId}`
        : `${API_URL}/api/archivos`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {

        const errorData =
            await response.json().catch(() => null);

        throw new Error(
            errorData?.message ||
            `Error obteniendo archivos: ${response.status}`
        );
    }

    return await response.json();
};
