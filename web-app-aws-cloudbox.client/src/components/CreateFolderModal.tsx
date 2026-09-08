import { useState } from 'react';
import { createFolder } from '../services/folderService';
import ToastNotification from './ToastNotification';

interface CreateFolderModalProps {
    show: boolean;
    onClose: () => void;
    onCreated: () => void;
    parentFolderId?: number | null;
}

const CreateFolderModal = ({
    show,
    onClose,
    onCreated,
    parentFolderId = null
}: CreateFolderModalProps) => {

    const [name, setName] = useState('');

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    if (!show) {
        return (
            <ToastNotification
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast((current) => ({
                        ...current,
                        show: false
                    }))
                }
            />
        );
    }

    const handleCreate = async () => {

        if (!name.trim()) {
            setToast({
                show: true,
                message: 'El nombre de la carpeta es obligatorio.',
                type: 'warning'
            });

            return;
        }

        try {

            await createFolder(
                name.trim(),
                parentFolderId
            );

            setName('');

            onCreated();
            onClose();

            setToast({
                show: true,
                message: 'Carpeta creada correctamente.',
                type: 'success'
            });

        } catch (error: any) {

            console.error('Error creando carpeta:', error);

            setToast({
                show: true,
                message:
                    error?.message ||
                    'No se pudo crear la carpeta.',
                type: 'error'
            });
        }
    };

    return (
        <>
            <div
                className="modal-backdrop fade show"
                onClick={onClose}
            ></div>

            <div
                className="modal fade show d-block"
                tabIndex={-1}
                role="dialog"
            >
                <div className="modal-dialog modal-dialog-centered">

                    <div className="modal-content">

                        <div className="modal-header">

                            <h5 className="modal-title">
                                <i className="bi bi-folder-plus me-2"></i>
                                Nueva carpeta
                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            ></button>

                        </div>

                        <div className="modal-body">

                            <label
                                htmlFor="folderName"
                                className="form-label"
                            >
                                Nombre de la carpeta
                            </label>

                            <input
                                id="folderName"
                                type="text"
                                className="form-control"
                                placeholder="Ej. Documentos"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreate();
                                    }
                                }}
                                autoFocus
                            />

                        </div>

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={!name.trim()}
                            >
                                <i className="bi bi-folder-plus me-2"></i>
                                Crear carpeta
                            </button>

                        </div>

                    </div>

                </div>
            </div>

            <ToastNotification
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast((current) => ({
                        ...current,
                        show: false
                    }))
                }
            />
        </>
    );
};

export default CreateFolderModal;
