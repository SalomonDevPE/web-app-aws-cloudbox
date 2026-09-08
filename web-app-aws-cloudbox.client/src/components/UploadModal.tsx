import { useRef, useState } from 'react';
import { uploadFile } from '../services/uploadService';

interface UploadModalProps {
    show: boolean;
    onClose: () => void;
    folderId: number | null;
    onUploaded?: () => void;
}

interface UploadItem {
    id: string;
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const UploadModal = ({
    show,
    onClose,
    folderId,
    onUploaded
}: UploadModalProps) => {

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<UploadItem[]>([]);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!show) {
        return null;
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';

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
            bytes / Math.pow(1024, index)
        ).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
    };

    const getFileIcon = (file: File) => {
        const extension =
            file.name.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'pdf':
                return 'bi-file-earmark-pdf';

            case 'doc':
            case 'docx':
                return 'bi-file-earmark-word';

            case 'xls':
            case 'xlsx':
                return 'bi-file-earmark-excel';

            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return 'bi-file-earmark-image';

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

    const addFiles = (selectedFiles: FileList | File[]) => {

        const newFiles: UploadItem[] = [];

        Array.from(selectedFiles).forEach(file => {

            if (file.size > MAX_FILE_SIZE) {
                newFiles.push({
                    id: crypto.randomUUID(),
                    file,
                    status: 'error',
                    progress: 0,
                    error: 'El archivo supera los 100 MB.'
                });

                return;
            }

            newFiles.push({
                id: crypto.randomUUID(),
                file,
                status: 'pending',
                progress: 0
            });
        });

        setFiles(current => [
            ...current,
            ...newFiles
        ]);
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        if (event.target.files) {
            addFiles(event.target.files);
        }

        event.target.value = '';
    };

    const handleDrop = (
        event: React.DragEvent<HTMLDivElement>
    ) => {

        event.preventDefault();

        setDragging(false);

        if (event.dataTransfer.files.length > 0) {
            addFiles(event.dataTransfer.files);
        }
    };

    const removeFile = (id: string) => {

        if (uploading) {
            return;
        }

        setFiles(current =>
            current.filter(file => file.id !== id)
        );
    };

    const clearFiles = () => {

        if (uploading) {
            return;
        }

        setFiles([]);
    };

    const handleUpload = async () => {

        const pendingFiles = files.filter(
            file => file.status === 'pending'
        );

        if (pendingFiles.length === 0) {
            return;
        }

        setUploading(true);

        let uploadedCount = 0;

        for (const item of pendingFiles) {

            setFiles(current =>
                current.map(file =>
                    file.id === item.id
                        ? {
                            ...file,
                            status: 'uploading',
                            progress: 10
                        }
                        : file
                )
            );

            try {

                await uploadFile(
                    item.file,
                    folderId
                );

                setFiles(current =>
                    current.map(file =>
                        file.id === item.id
                            ? {
                                ...file,
                                status: 'success',
                                progress: 100
                            }
                            : file
                    )
                );

                uploadedCount++;

            } catch (error) {

                setFiles(current =>
                    current.map(file =>
                        file.id === item.id
                            ? {
                                ...file,
                                status: 'error',
                                progress: 0,
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : 'Error al subir el archivo.'
                            }
                            : file
                    )
                );
            }
        }

        setUploading(false);

        if (uploadedCount > 0) {
            onUploaded?.();
        }
    };

    const totalSize = files.reduce(
        (total, item) =>
            total + item.file.size,
        0
    );

    const getStatusText = (item: UploadItem) => {

        switch (item.status) {

            case 'uploading':
                return 'Subiendo...';

            case 'success':
                return 'Subido correctamente';

            case 'error':
                return item.error || 'Error';

            default:
                return 'Pendiente';
        }
    };

    return (
        <div
            className="modal fade show d-block upload-modal"
            tabIndex={-1}
            role="dialog"
            style={{
                backgroundColor: 'rgba(0, 0, 0, .5)'
            }}
        >

            <div
                className="modal-dialog modal-lg modal-dialog-centered"
                role="document"
            >

                <div className="modal-content">

                    {/* HEADER */}

                    <div className="modal-header">

                        <div>
                            <h5 className="modal-title">
                                <i className="bi bi-cloud-arrow-up me-2"></i>
                                Subir archivos
                            </h5>

                            <small className="text-muted">
                                Agrega uno o varios archivos a CloudBox
                            </small>
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={uploading}
                            aria-label="Cerrar"
                        ></button>

                    </div>

                    {/* BODY */}

                    <div className="modal-body">

                        {/* DROP ZONE */}

                        <div
                            className={`upload-drop-zone ${dragging ? 'dragging' : ''
                                }`}
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            onDragEnter={(event) => {
                                event.preventDefault();
                                setDragging(true);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={(event) => {
                                event.preventDefault();
                                setDragging(false);
                            }}
                            onDrop={handleDrop}
                        >

                            <i className="bi bi-cloud-arrow-up"></i>

                            <h6>
                                Arrastra tus archivos aquí
                            </h6>

                            <p>
                                o haz clic para seleccionarlos
                            </p>

                            <div className="upload-limit">
                                Máximo 100 MB por archivo · Puedes seleccionar varios
                            </div>

                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            hidden
                            onChange={handleFileChange}
                        />

                        {/* FILE LIST */}

                        {files.length > 0 && (

                            <>

                                <div className="upload-files-header">

                                    <h6>
                                        Archivos seleccionados
                                    </h6>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={clearFiles}
                                        disabled={uploading}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Limpiar
                                    </button>

                                </div>

                                <div className="upload-file-list">

                                    {files.map(item => (

                                        <div
                                            key={item.id}
                                            className="upload-file-item"
                                        >

                                            {/* ICON */}

                                            <div className="upload-file-icon">

                                                <i
                                                    className={`bi ${getFileIcon(
                                                        item.file
                                                    )}`}
                                                ></i>

                                            </div>

                                            {/* INFO */}

                                            <div className="upload-file-info">

                                                <div className="upload-file-name">
                                                    {item.file.name}
                                                </div>

                                                <div className="upload-file-size">
                                                    {formatFileSize(
                                                        item.file.size
                                                    )}
                                                </div>

                                                {item.status === 'uploading' && (

                                                    <div className="progress upload-progress">

                                                        <div
                                                            className="progress-bar"
                                                            role="progressbar"
                                                            style={{
                                                                width: `${item.progress}%`
                                                            }}
                                                        ></div>

                                                    </div>

                                                )}

                                            </div>

                                            {/* STATUS */}

                                            <span
                                                className={`upload-status ${item.status}`}
                                            >
                                                {getStatusText(item)}
                                            </span>

                                            {/* REMOVE */}

                                            {item.status !== 'success' && (

                                                <button
                                                    type="button"
                                                    className="upload-remove"
                                                    onClick={() =>
                                                        removeFile(item.id)
                                                    }
                                                    disabled={uploading}
                                                    title="Quitar archivo"
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>

                                            )}

                                        </div>

                                    ))}

                                </div>

                                {/* SUMMARY */}

                                <div className="upload-summary">

                                    <span>
                                        <strong>
                                            {files.length}
                                        </strong>{' '}
                                        archivo{files.length !== 1 ? 's' : ''}
                                    </span>

                                    <span>
                                        Total:{' '}
                                        <strong>
                                            {formatFileSize(totalSize)}
                                        </strong>
                                    </span>

                                </div>

                            </>

                        )}

                    </div>

                    {/* FOOTER */}

                    <div className="modal-footer">

                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={uploading}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="btn btn-cloud"
                            onClick={handleUpload}
                            disabled={
                                uploading ||
                                files.filter(
                                    file =>
                                        file.status === 'pending'
                                ).length === 0
                            }
                        >

                            {uploading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        aria-hidden="true"
                                    ></span>

                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-cloud-arrow-up me-2"></i>
                                    Iniciar subida
                                </>
                            )}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default UploadModal;