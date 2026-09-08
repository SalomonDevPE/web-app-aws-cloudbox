import { useEffect, useRef, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import {
    getArchivos
} from '../services/archivoService';

import type {
    Archivo
} from '../services/archivoService';

import FileViewerModal from './FileViewerModal';

interface FileListProps {
    folderId: number | null;
    refresh: number;
    search: string;
    sortBy: string;
    viewMode: 'list' | 'grid';
    filterType: string;
}

const API_URL = '';

const FileList = ({
    folderId,
    refresh,
    search,
    sortBy,
    viewMode,
    filterType
}: FileListProps) => {

    const [archivos, setArchivos] =
        useState<Archivo[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [openMenuId, setOpenMenuId] =
        useState<number | null>(null);

    const [menuPosition, setMenuPosition] =
        useState<{
            top: number;
            left: number;
        } | null>(null);

    const menuRef =
        useRef<HTMLDivElement | null>(null);

    const [selectedArchivo, setSelectedArchivo] =
        useState<Archivo | null>(null);

    const [showViewer, setShowViewer] =
        useState(false);


    // =========================================================
    // CARGAR ARCHIVOS
    // =========================================================

    useEffect(() => {

        const loadArchivos = async () => {

            try {

                setLoading(true);
                setError(null);

                const data =
                    await getArchivos(folderId);

                setArchivos(data);

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : 'No se pudieron cargar los archivos.'
                );

            } finally {

                setLoading(false);

            }

        };

        loadArchivos();

    }, [folderId, refresh]);


    // =========================================================
    // CERRAR MENÚ AL HACER CLICK AFUERA
    // =========================================================

    useEffect(() => {

        const handleClickOutside = (
            event: MouseEvent
        ) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node
                )
            ) {

                setOpenMenuId(null);
                setMenuPosition(null);

            }

        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, []);


    // =========================================================
    // CERRAR MENÚ AL HACER SCROLL
    // =========================================================

    useEffect(() => {

        const handleScroll = () => {

            setOpenMenuId(null);
            setMenuPosition(null);

        };

        window.addEventListener(
            'scroll',
            handleScroll,
            true
        );

        return () => {

            window.removeEventListener(
                'scroll',
                handleScroll,
                true
            );

        };

    }, []);


    // =========================================================
    // CERRAR MENÚ AL CAMBIAR CONTEXTO
    // =========================================================

    useEffect(() => {

        setOpenMenuId(null);
        setMenuPosition(null);

    }, [
        viewMode,
        folderId,
        search,
        filterType
    ]);


    // =========================================================
    // OBTENER TOKEN
    // =========================================================

    const getAccessToken = async () => {

        const session =
            await fetchAuthSession();

        const accessToken =
            session.tokens?.accessToken?.toString();

        if (!accessToken) {

            throw new Error(
                'No hay un Access Token disponible'
            );

        }

        return accessToken;
    };


    // =========================================================
    // FORMATEAR TAMAÑO
    // =========================================================

    const formatFileSize = (
        bytes: number
    ) => {

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

        return `${
    (
        bytes / Math.pow(1024, index)
    ).toFixed(
        index === 0 ? 0 : 2
    )
} ${ units[index] } `;
    };


    // =========================================================
    // FORMATEAR FECHA
    // =========================================================

    const formatDate = (
        date: string
    ) => {

        return new Date(date)
            .toLocaleDateString(
                'es-PE',
                {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }
            );

    };


    // =========================================================
    // OBTENER ICONO
    // =========================================================

    const getFileIcon = (
        archivo: Archivo
    ) => {

        const extension =
            archivo.extension
                ?.replace('.', '')
                .toLowerCase();

        switch (extension) {

            case 'pdf':
                return 'bi-file-earmark-pdf';

            case 'doc':
            case 'docx':
                return 'bi-file-earmark-word';

            case 'xls':
            case 'xlsx':
                return 'bi-file-earmark-excel';

            case 'ppt':
            case 'pptx':
                return 'bi-file-earmark-ppt';

            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
            case 'svg':
                return 'bi-file-earmark-image';

            case 'mp3':
            case 'wav':
            case 'ogg':
            case 'm4a':
            case 'flac':
                return 'bi-file-earmark-music';

            case 'mp4':
            case 'webm':
            case 'mov':
            case 'avi':
            case 'mkv':
                return 'bi-file-earmark-play';

            case 'zip':
            case 'rar':
            case '7z':
                return 'bi-file-earmark-zip';

            case 'txt':
                return 'bi-file-earmark-text';

            default:
                return 'bi-file-earmark';
        }

    };


    // =========================================================
    // CATEGORÍA DEL ARCHIVO
    // =========================================================

    const getFileCategory = (
        archivo: Archivo
    ) => {

        const extension =
            archivo.extension
                ?.replace('.', '')
                .toLowerCase();

        if (
            [
                'jpg',
                'jpeg',
                'png',
                'gif',
                'webp',
                'svg'
            ].includes(extension)
        ) {
            return 'images';
        }

        if (extension === 'pdf') {
            return 'pdf';
        }

        if (
            [
                'doc',
                'docx',
                'xls',
                'xlsx',
                'ppt',
                'pptx',
                'txt',
                'csv'
            ].includes(extension)
        ) {
            return 'documents';
        }

        if (
            [
                'mp3',
                'wav',
                'ogg',
                'm4a',
                'flac'
            ].includes(extension)
        ) {
            return 'audio';
        }

        if (
            [
                'mp4',
                'webm',
                'mov',
                'avi',
                'mkv'
            ].includes(extension)
        ) {
            return 'videos';
        }

        return 'other';
    };


    // =========================================================
    // FILTRAR Y ORDENAR
    // =========================================================

    const processedArchivos =
        archivos
            .filter((archivo) => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();

                if (searchText) {

                    const name =
                        archivo.name.toLowerCase();

                    if (!name.includes(searchText)) {
                        return false;
                    }

                }

                if (
                    filterType !== 'all' &&
                    getFileCategory(archivo) !== filterType
                ) {
                    return false;
                }

                return true;

            })
            .sort((a, b) => {

                switch (sortBy) {

                    case 'name':

                        return a.name.localeCompare(
                            b.name,
                            'es',
                            {
                                sensitivity: 'base'
                            }
                        );

                    case 'date':

                        return (
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        );

                    case 'size':

                        return b.size - a.size;

                    case 'type':

                        return (
                            a.extension || ''
                        ).localeCompare(
                            b.extension || '',
                            'es',
                            {
                                sensitivity: 'base'
                            }
                        );

                    default:
                        return 0;
                }

            });


    // =========================================================
    // ABRIR / CERRAR MENÚ
    // =========================================================

    const handleMenuClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        archivoId: number
    ) => {

        event.preventDefault();
        event.stopPropagation();

        if (openMenuId === archivoId) {

            setOpenMenuId(null);
            setMenuPosition(null);

            return;
        }

        const rect =
            event.currentTarget.getBoundingClientRect();

        const menuWidth = 180;
        const menuHeight = 145;
        const margin = 10;

        let left =
            rect.right - menuWidth;

        let top =
            rect.bottom + 5;

        if (left < margin) {
            left = margin;
        }

        if (
            left + menuWidth >
            window.innerWidth - margin
        ) {

            left =
                window.innerWidth -
                menuWidth -
                margin;
        }

        if (
            top + menuHeight >
            window.innerHeight - margin
        ) {

            top =
                rect.top -
                menuHeight -
                5;
        }

        if (top < margin) {
            top = margin;
        }

        setMenuPosition({
            top,
            left
        });

        setOpenMenuId(archivoId);
    };


    // =========================================================
    // VER ARCHIVO
    // =========================================================

    const handleView = (
        archivo: Archivo
    ) => {

        setOpenMenuId(null);
        setMenuPosition(null);

        setSelectedArchivo(archivo);

        setShowViewer(true);
    };


    // =========================================================
    // DESCARGAR ARCHIVO
    // =========================================================

    const handleDownload = async (
        archivo: Archivo
    ) => {

        try {

            setOpenMenuId(null);
            setMenuPosition(null);

            const accessToken =
                await getAccessToken();

            const response =
                await fetch(
                    `${ API_URL } /api/archivos / ${ archivo.id }/download`,
{
    method: 'GET',
        headers: {
        Authorization:
        `Bearer ${accessToken}`
    }
}
                );

if (!response.ok) {

    const errorData =
        await response
            .json()
            .catch(() => null);

    throw new Error(
        errorData?.message ||
        `Error descargando archivo: ${response.status}`
    );
}

const data =
    await response.json();

const link =
    document.createElement('a');

link.href = data.url;
link.download = archivo.name;
link.target = '_blank';

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

        } catch (err) {

    alert(
        err instanceof Error
            ? err.message
            : 'No se pudo descargar el archivo.'
    );
}

    };


// =========================================================
// ELIMINAR ARCHIVO
// =========================================================

const handleDelete = async (
    archivo: Archivo
) => {

    setOpenMenuId(null);
    setMenuPosition(null);

    const confirmed =
        window.confirm(
            `¿Deseas eliminar "${archivo.name}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        const accessToken =
            await getAccessToken();

        const response =
            await fetch(
                `${API_URL}/api/archivos/${archivo.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            );

        if (!response.ok) {

            const errorData =
                await response
                    .json()
                    .catch(() => null);

            throw new Error(
                errorData?.message ||
                `Error eliminando archivo: ${response.status}`
            );
        }

        setArchivos(
            current =>
                current.filter(
                    item =>
                        item.id !== archivo.id
                )
        );

    } catch (err) {

        alert(
            err instanceof Error
                ? err.message
                : 'No se pudo eliminar el archivo.'
        );
    }

};


// =========================================================
// MENÚ DE ACCIONES
// =========================================================

const renderActionMenu = (
    archivo: Archivo
) => {

    if (
        openMenuId !== archivo.id ||
        !menuPosition
    ) {
        return null;
    }

    return (
        <div
            ref={menuRef}
            className="dropdown-menu show"
            style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
                zIndex: 99999,
                minWidth: '180px',
                margin: 0
            }}
            onMouseDown={(event) => {
                event.stopPropagation();
            }}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >

            <button
                type="button"
                className="dropdown-item"
                onClick={() =>
                    handleView(archivo)
                }
            >
                <i className="bi bi-eye me-2"></i>
                Ver
            </button>

            <button
                type="button"
                className="dropdown-item"
                onClick={() =>
                    handleDownload(archivo)
                }
            >
                <i className="bi bi-download me-2"></i>
                Descargar
            </button>

            <div className="dropdown-divider"></div>

            <button
                type="button"
                className="dropdown-item text-danger"
                onClick={() =>
                    handleDelete(archivo)
                }
            >
                <i className="bi bi-trash3 me-2"></i>
                Eliminar
            </button>

        </div>
    );
};


// =========================================================
// VISOR
// =========================================================

const viewer = (
    <FileViewerModal
        show={showViewer}
        archivo={selectedArchivo}
        onClose={() => {

            setShowViewer(false);
            setSelectedArchivo(null);

        }}
    />
);


// =========================================================
// CARGANDO
// =========================================================

if (loading) {

    return (
        <>
            <div className="text-center py-5">

                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">
                        Cargando...
                    </span>
                </div>

                <p className="text-muted mt-3 mb-0">
                    Cargando archivos...
                </p>

            </div>

            {viewer}
        </>
    );
}


// =========================================================
// ERROR
// =========================================================

if (error) {

    return (
        <>
            <div className="alert alert-danger">

                <i className="bi bi-exclamation-circle me-2"></i>

                {error}

            </div>

            {viewer}
        </>
    );
}


// =========================================================
// SIN RESULTADOS
// =========================================================

if (processedArchivos.length === 0) {

    return (
        <>
            <div className="empty-state">

                <i
                    className={
                        search ||
                            filterType !== 'all'
                            ? 'bi bi-search'
                            : 'bi bi-folder2-open'
                    }
                ></i>

                <h6 className="mt-2">

                    {search ||
                        filterType !== 'all'
                        ? 'No se encontraron resultados'
                        : 'No se encontraron archivos'}

                </h6>

                <p className="small">

                    {search ||
                        filterType !== 'all'
                        ? 'Intenta cambiar la búsqueda o los filtros.'
                        : 'Esta carpeta todavía no contiene archivos.'}

                </p>

            </div>

            {viewer}
        </>
    );
}


// =========================================================
// MENÚ GLOBAL
// =========================================================

const globalMenu =
    openMenuId !== null &&
    menuPosition &&
    (() => {

        const archivo =
            archivos.find(
                item =>
                    item.id === openMenuId
            );

        if (!archivo) {
            return null;
        }

        return renderActionMenu(archivo);

    })();


// =========================================================
// VISTA LISTA
// =========================================================

if (viewMode === 'list') {

    return (
        <>
            <div id="listView">

                <div className="table-responsive">

                    <table className="table table-hover file-table">

                        <thead>

                            <tr>

                                <th className="file-check">

                                    <input
                                        type="checkbox"
                                        id="selectAllFiles"
                                        className="form-check-input"
                                    />

                                </th>

                                <th>
                                    Nombre
                                </th>

                                <th>
                                    Propietario
                                </th>

                                <th>
                                    Modificado
                                </th>

                                <th>
                                    Tamaño
                                </th>

                                <th>
                                    Tipo
                                </th>

                                <th className="text-end">
                                    Acciones
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {processedArchivos.map(
                                archivo => (

                                    <tr
                                        key={archivo.id}
                                    >

                                        <td className="file-check">

                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                            />

                                        </td>

                                        <td>

                                            <div className="d-flex align-items-center">

                                                <span className="file-icon file-text me-2">

                                                    <i
                                                        className={
                                                            `bi ${getFileIcon(archivo)}`
                                                        }
                                                    ></i>

                                                </span>

                                                <div
                                                    className="file-name"
                                                    title={archivo.name}
                                                >
                                                    {archivo.name}
                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            <span className="text-muted">
                                                Yo
                                            </span>

                                        </td>

                                        <td>

                                            <span className="text-muted">

                                                {formatDate(
                                                    archivo.createdAt
                                                )}

                                            </span>

                                        </td>

                                        <td>

                                            {formatFileSize(
                                                archivo.size
                                            )}

                                        </td>

                                        <td>

                                            <span className="text-muted">

                                                {archivo.extension
                                                    ?.replace('.', '')
                                                    .toUpperCase() ||
                                                    'ARCHIVO'}

                                            </span>

                                        </td>

                                        <td className="text-end">

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-light"
                                                title="Acciones"
                                                onMouseDown={(event) => {
                                                    event.stopPropagation();
                                                }}
                                                onClick={(event) => {

                                                    event.preventDefault();
                                                    event.stopPropagation();

                                                    handleMenuClick(
                                                        event,
                                                        archivo.id
                                                    );

                                                }}
                                            >

                                                <i className="bi bi-three-dots-vertical"></i>

                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>


                <div className="table-footer d-flex justify-content-between align-items-center">

                    <span>

                        {processedArchivos.length}{' '}

                        archivo
                        {processedArchivos.length !== 1
                            ? 's'
                            : ''}

                    </span>

                    <span>

                        Mostrando{' '}

                        <strong>
                            {processedArchivos.length}
                        </strong>{' '}

                        archivos

                    </span>

                </div>

            </div>

            {globalMenu}

            {viewer}

        </>
    );
}


// =========================================================
// VISTA CUADRÍCULA
// =========================================================

return (
    <>
        <div
            id="gridView"
            className="grid-view"
        >

            <div className="row g-3">

                {processedArchivos.map(
                    archivo => (

                        <div
                            className="col-12 col-sm-6 col-md-4 col-lg-3"
                            key={archivo.id}
                        >

                            <div
                                className="grid-file"
                                onDoubleClick={() =>
                                    handleView(archivo)
                                }
                            >

                                <div className="d-flex justify-content-between align-items-start">

                                    <span className="file-icon file-text">

                                        <i
                                            className={
                                                `bi ${getFileIcon(archivo)}`
                                            }
                                        ></i>

                                    </span>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light"
                                        title="Acciones"
                                        onMouseDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                        onClick={(event) => {

                                            event.preventDefault();
                                            event.stopPropagation();

                                            handleMenuClick(
                                                event,
                                                archivo.id
                                            );

                                        }}
                                    >

                                        <i className="bi bi-three-dots-vertical"></i>

                                    </button>

                                </div>


                                <div
                                    className="grid-file-name"
                                    title={archivo.name}
                                >
                                    {archivo.name}
                                </div>


                                <div className="grid-file-info">

                                    {formatFileSize(
                                        archivo.size
                                    )}

                                    {' · '}

                                    {archivo.extension
                                        ?.replace('.', '')
                                        .toUpperCase() ||
                                        'ARCHIVO'}

                                </div>


                                <div className="mt-2">

                                    <small className="text-muted">

                                        {formatDate(
                                            archivo.createdAt
                                        )}

                                    </small>

                                </div>

                            </div>

                        </div>

                    )
                )}

            </div>

        </div>


        <div className="table-footer d-flex justify-content-between align-items-center">

            <span>

                {processedArchivos.length}{' '}

                archivo
                {processedArchivos.length !== 1
                    ? 's'
                    : ''}

            </span>

            <span>

                Mostrando{' '}

                <strong>
                    {processedArchivos.length}
                </strong>{' '}

                archivos

            </span>

        </div>


        {globalMenu}

        {viewer}

    </>
);

};

export default FileList;

