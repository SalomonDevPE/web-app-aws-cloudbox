import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Archivo } from '../services/archivoService';

interface FileViewerModalProps {
    show: boolean;
    archivo: Archivo | null;
    onClose: () => void;
}

const API_URL = '';

const FileViewerModal = ({
    show,
    archivo,
    onClose
}: FileViewerModalProps) => {

    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        if (!show || !archivo) {
            setUrl(null);
            setError(null);
            return;
        }

        const loadPreviewUrl = async () => {

            setLoading(true);
            setError(null);
            setUrl(null);

            try {

                const session = await fetchAuthSession();

                const accessToken =
                    session.tokens?.accessToken?.toString();

                if (!accessToken) {
                    throw new Error(
                        'No hay un Access Token disponible'
                    );
                }

                const response = await fetch(
                    `${API_URL}/api/archivos/${archivo.id}/view`,
{
    method: 'GET',
        headers: {
        Authorization: `Bearer ${accessToken}`
    }
}
                );

if (!response.ok) {

    const errorData =
        await response.json().catch(() => null);

    throw new Error(
        errorData?.message ||
        `Error obteniendo el archivo: ${response.status}`
    );
}

const data = await response.json();

setUrl(data.url);

            } catch (err) {

    setError(
        err instanceof Error
            ? err.message
            : 'No se pudo cargar el archivo.'
    );

} finally {

    setLoading(false);

}
        };

loadPreviewUrl();

    }, [show, archivo]);

if (!show || !archivo) {
    return null;
}

const extension =
    archivo.extension
        ?.replace('.', '')
        .toLowerCase();

const isImage = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp'
].includes(extension);

const isPdf =
    extension === 'pdf';

const isText =
    extension === 'txt';

const isAudio = [
    'mp3',
    'wav',
    'ogg',
    'm4a'
].includes(extension);

const isVideo = [
    'mp4',
    'webm',
    'mov'
].includes(extension);

const formatFileSize = (bytes: number) => {

    if (bytes === 0) {
        return '0 Bytes';
    }

    const units = [
        'Bytes',
        'KB',
        'MB',
        'GB'
    ];

    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    return `${(
        bytes /
        Math.pow(1024, index)
    ).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const getFileIcon = () => {

    if (isImage) {
        return 'bi-file-earmark-image';
    }

    if (isPdf) {
        return 'bi-file-earmark-pdf';
    }

    if (isText) {
        return 'bi-file-earmark-text';
    }

    if (isAudio) {
        return 'bi-file-earmark-music';
    }

    if (isVideo) {
        return 'bi-file-earmark-play';
    }

    return 'bi-file-earmark';
};

const handleOpenNew = () => {

    if (!url) {
        return;
    }

    window.open(
        url,
        '_blank',
        'noopener,noreferrer'
    );
};

const handleDownload = () => {

    if (!url) {
        return;
    }

    const link =
        document.createElement('a');

    link.href = url;
    link.download = archivo.name;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
};

const renderViewer = () => {

    if (loading) {

        return (
            <div className="file-viewer-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <div className="mt-3">
                    Cargando archivo...
                </div>

            </div>
        );
    }

    if (error) {

        return (
            <div className="file-viewer-error">

                <i className="bi bi-exclamation-circle"></i>

                <h6 className="mt-3">
                    No se pudo cargar el archivo
                </h6>

                <p className="small text-muted mb-0">
                    {error}
                </p>

            </div>
        );
    }

    if (!url) {
        return null;
    }

    if (isImage) {

        return (
            <div className="file-viewer-image-container">

                <img
                    src={url}
                    alt={archivo.name}
                    className="file-viewer-image"
                />

            </div>
        );
    }

    if (isPdf || isText) {

        return (
            <iframe
                src={url}
                title={archivo.name}
                className="file-viewer-iframe"
            />
        );
    }

    if (isAudio) {

        return (
            <div className="file-viewer-media">

                <i className="bi bi-music-note-beamed"></i>

                <h6 className="mt-3">
                    {archivo.name}
                </h6>

                <audio
                    controls
                    src={url}
                    className="file-viewer-audio"
                >
                    Tu navegador no soporta audio.
                </audio>

            </div>
        );
    }

    if (isVideo) {

        return (
            <div className="file-viewer-video-container">

                <video
                    controls
                    src={url}
                    className="file-viewer-video"
                >
                    Tu navegador no soporta video.
                </video>

            </div>
        );
    }

    return (
        <div className="file-viewer-unsupported">

            <i className="bi bi-file-earmark"></i>

            <h6 className="mt-3">
                Vista previa no disponible
            </h6>

            <p className="small text-muted">
                Este tipo de archivo no puede
                visualizarse directamente.
            </p>

            <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownload}
            >
                <i className="bi bi-download me-2"></i>
                Descargar archivo
            </button>

        </div>
    );
};

return (
    <div
        className="modal fade show file-viewer-modal d-block"
        tabIndex={-1}
        role="dialog"
        style={{
            backgroundColor: 'rgba(0, 0, 0, .65)'
        }}
    >

        <div
            className="modal-dialog modal-dialog-centered modal-xl"
            role="document"
        >

            <div className="modal-content">

                {/* HEADER */}

                <div className="file-viewer-header">

                    <div className="file-viewer-title">

                        <span
                            className="file-icon file-text"
                        >

                            <i
                                className={`bi ${getFileIcon()}`}
                            ></i>

                        </span>

                        <div className="viewer-file-info">

                            <div className="viewer-file-name">
                                {archivo.name}
                            </div>

                            <div className="viewer-file-type">
                                {archivo.contentType ||
                                    'Archivo'}
                            </div>

                        </div>

                    </div>

                    <div className="file-viewer-actions">

                        <button
                            type="button"
                            className="viewer-action btn-open-new"
                            title="Abrir en nueva pestaña"
                            onClick={handleOpenNew}
                            disabled={!url}
                        >
                            <i className="bi bi-box-arrow-up-right"></i>
                        </button>

                        <button
                            type="button"
                            className="viewer-action"
                            title="Descargar"
                            onClick={handleDownload}
                            disabled={!url}
                        >
                            <i className="bi bi-download"></i>
                        </button>

                        <button
                            type="button"
                            className="viewer-action viewer-close"
                            title="Cerrar"
                            onClick={onClose}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                    </div>

                </div>

                {/* BODY */}

                <div className="file-viewer-body">

                    {renderViewer()}

                </div>

                {/* FOOTER */}

                <div className="file-viewer-footer">

                    <span>
                        {formatFileSize(archivo.size)}
                    </span>

                    <span>
                        CloudBox
                    </span>

                </div>

            </div>

        </div>

    </div>
);
};

export default FileViewerModal;

