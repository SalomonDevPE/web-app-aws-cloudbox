import React, {
    useEffect,
    useState
} from 'react';

import {
    getFolders,
    updateFolder,
    deleteFolder
} from '../services/folderService';

import type {
    Folder
} from '../services/folderService';

import ToastNotification from './ToastNotification';


interface FolderListProps {
    refresh: number;

    onFolderChange: (
        folderId: number | null
    ) => void;
}


interface FolderPath {
    id: number | null;
    name: string;
}


/*
 * ============================================================
 * TIPO AUXILIAR
 * ============================================================
 */

type FolderWithInfo = Folder & {
    archivos?: number;
    tamaño?: string;
};


const FolderList = ({
    refresh,
    onFolderChange
}: FolderListProps) => {


    /*
     * ============================================================
     * ESTADOS
     * ============================================================
     */

    const [folders, setFolders] =
        useState<Folder[]>([]);

    const [loading, setLoading] =
        useState(true);


    /*
     * ============================================================
     * CARPETA ACTUAL
     * ============================================================
     */

    const [currentFolderId, setCurrentFolderId] =
        useState<number | null>(null);


    /*
     * ============================================================
     * HISTORIAL DE NAVEGACIÓN
     * ============================================================
     *
     * Ejemplo:
     *
     * Mis archivos
     *      ↓
     * Documentos
     *      ↓
     * Trabajo
     *
     * folderPath:
     *
     * [
     *   { id: null, name: "Mis archivos" },
     *   { id: 5, name: "Documentos" },
     *   { id: 8, name: "Trabajo" }
     * ]
     */

    const [folderPath, setFolderPath] =
        useState<FolderPath[]>([
            {
                id: null,
                name: 'Mis archivos'
            }
        ]);


    /*
     * ============================================================
     * MENÚ DE OPCIONES
     * ============================================================
     */

    const [openMenuId, setOpenMenuId] =
        useState<number | null>(null);


    /*
     * ============================================================
     * CARPETA QUE SE ESTÁ EDITANDO
     * ============================================================
     */

    const [editingFolder, setEditingFolder] =
        useState<Folder | null>(null);


    /*
     * ============================================================
     * NUEVO NOMBRE
     * ============================================================
     */

    const [newFolderName, setNewFolderName] =
        useState('');


    /*
     * ============================================================
     * ESTADO GUARDANDO
     * ============================================================
     */

    const [saving, setSaving] =
        useState(false);


    /*
     * ============================================================
     * CARPETA ELIMINÁNDOSE
     * ============================================================
     */

    const [deletingFolderId, setDeletingFolderId] =
        useState<number | null>(null);


    /*
     * ============================================================
     * TOAST
     * ============================================================
     */

    const [toast, setToast] =
        useState({
            show: false,
            message: '',
            type:
                'info' as
                | 'success'
                | 'error'
                | 'warning'
                | 'info'
        });


    /*
     * ============================================================
     * CARGAR CARPETAS
     * ============================================================
     */

    useEffect(() => {

        const loadFolders = async () => {

            try {

                setLoading(true);

                const data =
                    await getFolders(
                        currentFolderId
                    );

                setFolders(data);

            } catch (err) {

                console.error(
                    'Error cargando carpetas:',
                    err
                );

                setToast({
                    show: true,
                    message:
                        'No se pudieron cargar las carpetas.',
                    type: 'error'
                });

            } finally {

                setLoading(false);

            }
        };


        loadFolders();

    }, [
        refresh,
        currentFolderId
    ]);


    /*
     * ============================================================
     * ABRIR CARPETA
     * ============================================================
     *
     * Se abre con doble clic.
     */

    const handleOpenFolder = (
        folder: Folder
    ) => {

        setOpenMenuId(null);


        /*
         * Cambiar carpeta actual
         */

        setCurrentFolderId(
            folder.id
        );


        /*
         * Agregar carpeta al historial
         */

        setFolderPath(
            currentPath => [

                ...currentPath,

                {
                    id: folder.id,
                    name: folder.name
                }

            ]
        );


        /*
         * Avisar al componente padre
         */

        onFolderChange(
            folder.id
        );
    };


    /*
     * ============================================================
     * NAVEGAR AL HISTORIAL
     * ============================================================
     *
     * Permite volver a cualquier nivel:
     *
     * Mis archivos
     * Documentos
     * Trabajo
     *
     * Por ejemplo:
     *
     * handleNavigateTo(0)
     *      → Mis archivos
     *
     * handleNavigateTo(1)
     *      → Documentos
     */

    const handleNavigateTo = (
        index: number
    ) => {

        const selectedFolder =
            folderPath[index];


        if (!selectedFolder) {
            return;
        }


        setOpenMenuId(null);


        /*
         * Cambiar carpeta actual
         */

        setCurrentFolderId(
            selectedFolder.id
        );


        /*
         * Eliminar del historial
         * los niveles posteriores
         */

        setFolderPath(
            currentPath =>
                currentPath.slice(
                    0,
                    index + 1
                )
        );


        /*
         * Avisar al componente padre
         */

        onFolderChange(
            selectedFolder.id
        );
    };


    /*
     * ============================================================
     * ABRIR / CERRAR MENÚ
     * ============================================================
     */

    const handleMenu = (
        event: React.MouseEvent<HTMLButtonElement>,
        folderId: number
    ) => {

        event.preventDefault();

        event.stopPropagation();


        setOpenMenuId(
            currentId =>
                currentId === folderId
                    ? null
                    : folderId
        );
    };


    /*
     * ============================================================
     * INICIAR RENOMBRADO
     * ============================================================
     */

    const handleStartRename = (
        event: React.MouseEvent<HTMLButtonElement>,
        folder: Folder
    ) => {

        event.preventDefault();

        event.stopPropagation();


        setOpenMenuId(null);


        setEditingFolder(
            folder
        );


        setNewFolderName(
            folder.name
        );
    };


    /*
     * ============================================================
     * CANCELAR RENOMBRADO
     * ============================================================
     */

    const handleCancelRename = () => {

        if (saving) {
            return;
        }


        setEditingFolder(null);

        setNewFolderName('');
    };


    /*
     * ============================================================
     * RENOMBRAR CARPETA
     * ============================================================
     */

    const handleRename = async () => {

        if (!editingFolder) {
            return;
        }


        const name =
            newFolderName.trim();


        /*
         * Validar nombre
         */

        if (!name) {

            setToast({
                show: true,
                message:
                    'El nombre de la carpeta es obligatorio.',
                type: 'warning'
            });

            return;
        }


        /*
         * No hacer nada si el nombre no cambió
         */

        if (
            name ===
            editingFolder.name
        ) {

            handleCancelRename();

            return;
        }


        try {

            setSaving(true);


            /*
             * updateFolder recibe:
             *
             * id
             * name
             */

            await updateFolder(
                editingFolder.id,
                name
            );


            /*
             * Cerrar modal
             */

            setEditingFolder(null);

            setNewFolderName('');


            /*
             * Recargar carpetas
             */

            const data =
                await getFolders(
                    currentFolderId
                );

            setFolders(data);


            /*
             * Mensaje
             */

            setToast({
                show: true,
                message:
                    'Carpeta renombrada correctamente.',
                type: 'success'
            });

        } catch (err: any) {

            console.error(
                'Error renombrando carpeta:',
                err
            );


            setToast({
                show: true,
                message:
                    err?.message ||
                    'No se pudo renombrar la carpeta.',
                type: 'error'
            });

        } finally {

            setSaving(false);

        }
    };


    /*
     * ============================================================
     * ELIMINAR CARPETA
     * ============================================================
     */

    const handleDelete = async (
        event: React.MouseEvent<HTMLButtonElement>,
        folder: Folder
    ) => {

        event.preventDefault();

        event.stopPropagation();


        setOpenMenuId(null);


        /*
         * Confirmación
         */

        const confirmed =
            window.confirm(
                `¿Estás seguro de eliminar la carpeta "${folder.name}" ? `
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingFolderId(
                folder.id
            );


            /*
             * Eliminar
             */

            await deleteFolder(
                folder.id
            );


            /*
             * Recargar carpetas
             */

            const data =
                await getFolders(
                    currentFolderId
                );

            setFolders(data);


            /*
             * Mensaje
             */

            setToast({
                show: true,
                message:
                    'Carpeta eliminada correctamente.',
                type: 'success'
            });

        } catch (err: any) {

            console.error(
                'Error eliminando carpeta:',
                err
            );


            setToast({
                show: true,
                message:
                    err?.message ||
                    'No se pudo eliminar la carpeta.',
                type: 'error'
            });

        } finally {

            setDeletingFolderId(
                null
            );

        }
    };


    /*
     * ============================================================
     * CERRAR MENÚ
     * ============================================================
     */

    const handleSectionClick = () => {

        if (
            openMenuId !== null
        ) {

            setOpenMenuId(null);

        }
    };


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <>

            {/* ======================================================
                 BREADCRUMB / NAVEGACIÓN
                 
                 IMPORTANTE:
                 Está FUERA del bloque de carpetas.

                 Por eso continúa visible aunque:
                 
                 folders.length === 0
            ======================================================= */}

            {folderPath.length > 1 && (<div className="cloud-folder-navigation"> <div className="cloud-breadcrumb"> {folderPath.map((path, index) => { const isLast = index === folderPath.length - 1; return (<React.Fragment key={`${path.id}-${index}`} > {/* Separador */} {index > 0 && (<span className="cloud-breadcrumb-separator"> / </span>)} {/* Carpeta actual */} {isLast ? (<span className="cloud-breadcrumb-current"> {path.name} </span>) : ( /* Carpetas anteriores */ <button type="button" className="cloud-breadcrumb-link" onClick={(event) => { event.stopPropagation(); handleNavigateTo(index); }} title={`Volver a ${path.name}`} > {path.name} </button>)} </React.Fragment>); })} </div> </div>)}


            {/* ======================================================
                 BLOQUE DE CARPETAS
                 
                 SOLO APARECE CUANDO:
                 
                 - Está cargando
                 - Existen subcarpetas
                 
                 Si no hay subcarpetas:
                 
                 Este bloque desaparece.
                 
                 El breadcrumb anterior SIGUE visible.
            ======================================================= */}

            {(loading || folders.length > 0) && (

                <section
                    className="content-section"
                    onClick={
                        handleSectionClick
                    }
                >

                    {/* ==================================================
                         ENCABEZADO
                    =================================================== */}

                    <div className="d-flex align-items-center justify-content-between mb-2">

                        <div>

                            <h2 className="section-title">

                                <i className="bi bi-cloud me-1 text-primary"></i>

                                Carpetas

                            </h2>


                            <div className="section-description">

                                {currentFolderId === null
                                    ? 'Tus carpetas almacenadas'
                                    : 'Subcarpetas de esta carpeta'}

                            </div>

                        </div>


                        {/* ==================================================
                             CONTADOR
                        =================================================== */}

                        <div className="small text-muted">

                            <span>
                                {folders.length}
                            </span>

                            {' '}

                            {folders.length === 1
                                ? 'carpeta'
                                : 'carpetas'}

                        </div>

                    </div>


                    {/* ==================================================
                         LOADING
                    =================================================== */}

                    {loading && (

                        <div className="text-muted small">

                            Cargando carpetas...

                        </div>

                    )}


                    {/* ==================================================
                         LISTA DE CARPETAS
                    =================================================== */}

                    {!loading &&
                        folders.length > 0 && (

                            <div
                                id="foldersContainer"
                                className="row g-3"
                            >

                                {folders.map(
                                    (
                                        folder: Folder
                                    ) => {

                                        /*
                                         * Información adicional
                                         */

                                        const folderInfo =
                                            folder as FolderWithInfo;


                                        return (

                                            <div
                                                key={
                                                    folder.id
                                                }
                                                className="col-6 col-md-4 col-xl-2"
                                            >

                                                <div
                                                    className="folder-card"
                                                    data-folder-id={
                                                        folder.id
                                                    }
                                                    onClick={() =>
                                                        handleOpenFolder(
                                                            folder
                                                        )
                                                    }
                                                    style={{
                                                        cursor:
                                                            'pointer',
                                                        position:
                                                            'relative',
                                                        overflow:
                                                            'visible'
                                                    }}
                                                >

                                                    {/* =================================
                                                         PARTE SUPERIOR
                                                    ================================== */}

                                                    <div className="d-flex justify-content-between">

                                                        {/* =================================
                                                             ICONO
                                                        ================================== */}

                                                        <span className="folder-icon">

                                                            <i className="bi bi-folder-fill"></i>

                                                        </span>


                                                        {/* =================================
                                                             MENÚ
                                                        ================================== */}

                                                        <button
                                                            className="btn btn-sm p-0 text-muted"
                                                            type="button"
                                                            title="Más opciones"
                                                            onMouseDown={(
                                                                event
                                                            ) => {

                                                                event.stopPropagation();

                                                            }}
                                                            onClick={(
                                                                event
                                                            ) =>
                                                                handleMenu(
                                                                    event,
                                                                    folder.id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingFolderId ===
                                                                folder.id
                                                            }
                                                        >

                                                            <i className="bi bi-three-dots"></i>

                                                        </button>


                                                        {/* =================================
                                                             DROPDOWN
                                                        ================================== */}

                                                        {openMenuId ===
                                                            folder.id && (

                                                            <div
                                                                className="dropdown-menu show"
                                                                style={{
                                                                    position:
                                                                        'absolute',
                                                                    right:
                                                                        '10px',
                                                                    top:
                                                                        '40px',
                                                                    zIndex:
                                                                        99999
                                                                }}
                                                                onMouseDown={(
                                                                    event
                                                                ) => {

                                                                    event.stopPropagation();

                                                                }}
                                                                onClick={(
                                                                    event
                                                                ) => {

                                                                    event.stopPropagation();

                                                                }}
                                                            >

                                                                {/* =================================
                                                                     RENOMBRAR
                                                                ================================== */}

                                                                <button
                                                                    type="button"
                                                                    className="dropdown-item"
                                                                    onClick={(
                                                                        event
                                                                    ) =>
                                                                        handleStartRename(
                                                                            event,
                                                                            folder
                                                                        )
                                                                    }
                                                                >

                                                                    <i className="bi bi-pencil me-2"></i>

                                                                    Renombrar

                                                                </button>


                                                                {/* =================================
                                                                     ELIMINAR
                                                                ================================== */}

                                                                <button
                                                                    type="button"
                                                                    className="dropdown-item text-danger"
                                                                    onClick={(
                                                                        event
                                                                    ) =>
                                                                        handleDelete(
                                                                            event,
                                                                            folder
                                                                        )
                                                                    }
                                                                >

                                                                    <i className="bi bi-trash me-2"></i>

                                                                    Eliminar

                                                                </button>

                                                            </div>

                                                        )}

                                                    </div>


                                                    {/* =================================
                                                         NOMBRE
                                                    ================================== */}

                                                    <div
                                                        className="folder-name"
                                                        title={
                                                            folder.name
                                                        }
                                                    >

                                                        {folder.name}

                                                    </div>


                                                    {/* =================================
                                                         INFORMACIÓN
                                                    ================================== */}

                                                    <div className="folder-info">

                                                        {folderInfo.archivos ??
                                                            0}

                                                        {' '}

                                                        {(
                                                            folderInfo.archivos ??
                                                            0
                                                        ) === 1
                                                            ? 'archivo'
                                                            : 'archivos'}

                                                        {' · '}

                                                        {folderInfo.tamaño ??
                                                            '0 KB'}

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                </section>

            )}


            {/* ==========================================================
                 MODAL RENOMBRAR
            =========================================================== */}

            {editingFolder && (

                <>

                    {/* BACKDROP */}

                    <div
                        className="modal-backdrop fade show"
                        onClick={
                            handleCancelRename
                        }
                    ></div>


                    {/* MODAL */}

                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="modal-dialog modal-dialog-centered">

                            <div className="modal-content">

                                {/* =========================================
                                     HEADER
                                ========================================== */}

                                <div className="modal-header">

                                    <h5 className="modal-title">

                                        <i className="bi bi-pencil me-2"></i>

                                        Renombrar carpeta

                                    </h5>


                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={
                                            handleCancelRename
                                        }
                                        disabled={
                                            saving
                                        }
                                    ></button>

                                </div>


                                {/* =========================================
                                     BODY
                                ========================================== */}

                                <div className="modal-body">

                                    <label
                                        htmlFor="renameFolder"
                                        className="form-label"
                                    >

                                        Nombre de la carpeta

                                    </label>


                                    <input
                                        id="renameFolder"
                                        type="text"
                                        className="form-control"
                                        value={
                                            newFolderName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setNewFolderName(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={(
                                            event
                                        ) => {

                                            if (
                                                event.key ===
                                                'Enter'
                                            ) {

                                                handleRename();

                                            }


                                            if (
                                                event.key ===
                                                'Escape'
                                            ) {

                                                handleCancelRename();

                                            }

                                        }}
                                        autoFocus
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                {/* =========================================
                                     FOOTER
                                ========================================== */}

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={
                                            handleCancelRename
                                        }
                                        disabled={
                                            saving
                                        }
                                    >

                                        Cancelar

                                    </button>


                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={
                                            handleRename
                                        }
                                        disabled={
                                            saving ||
                                            !newFolderName.trim()
                                        }
                                    >

                                        {saving ? (

                                            <>

                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>

                                                Guardando...

                                            </>

                                        ) : (

                                            <>

                                                <i className="bi bi-check-lg me-2"></i>

                                                Guardar

                                            </>

                                        )}

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </>

            )}


            {/* ==========================================================
                 TOAST
            =========================================================== */}

            <ToastNotification
                show={
                    toast.show
                }
                message={
                    toast.message
                }
                type={
                    toast.type
                }
                onClose={() =>
                    setToast(
                        current => ({
                            ...current,
                            show: false
                        })
                    )
                }
            />

        </>
    );
};


export default FolderList;
