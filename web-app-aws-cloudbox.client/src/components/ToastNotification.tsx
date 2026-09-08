import { useEffect } from 'react';

interface ToastNotificationProps {
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    duration?: number;
}

const ToastNotification = ({
    show,
    message,
    type = 'info',
    onClose,
    duration = 4000
}: ToastNotificationProps) => {

    useEffect(() => {
        if (!show) {
            return;
        }

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [show, duration, onClose]);

    if (!show) {
        return null;
    }

    const config = {
        success: {
            icon: 'bi-check-circle-fill',
            title: 'Éxito'
        },
        error: {
            icon: 'bi-x-circle-fill',
            title: 'Error'
        },
        warning: {
            icon: 'bi-exclamation-triangle-fill',
            title: 'Advertencia'
        },
        info: {
            icon: 'bi-info-circle-fill',
            title: 'Información'
        }
    };

    const currentConfig = config[type];

    return (
        <div
            className="toast-container position-fixed top-0 end-0 p-3"
            style={{ zIndex: 9999 }}
        >
            <div
                className="toast show"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >

                <div className="toast-header">

                    <i
                        className={`bi ${ currentConfig.icon } me - 2`}
                    ></i>

                    <strong className="me-auto">
                        {currentConfig.title}
                    </strong>

                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Cerrar"
                        onClick={onClose}
                    ></button>

                </div>

                <div className="toast-body">
                    {message}
                </div>

            </div>
        </div>
    );
};

export default ToastNotification;
