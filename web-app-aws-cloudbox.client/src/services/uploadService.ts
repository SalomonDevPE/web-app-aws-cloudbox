import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = '';

export interface UploadedFile {
    id: number;
    name: string;
    size: number;
    folderId: number | null;
    s3Key: string;
    createdAt: string;
}

export const uploadFile = async (
    file: File,
    folderId: number | null = null
): Promise<UploadedFile> => {

    const session = await fetchAuthSession();

    const accessToken =
        session.tokens?.accessToken?.toString();

    if (!accessToken) {
        throw new Error('No hay un Access Token disponible');
    }

    const formData = new FormData();

    formData.append('file', file);

    const url = folderId !== null
        ? `${API_URL}/api/archivos/upload?folderId=${folderId}`
        : `${API_URL}/api/archivos/upload`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ||
            `Error subiendo archivo: ${response.status}`
        );
    }

    return await response.json();
};
