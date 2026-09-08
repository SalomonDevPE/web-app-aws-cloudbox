interface SidebarProps {
    usedStorage?: number;
    totalStorage?: number;
}

const Sidebar = ({
    usedStorage = 68,
    totalStorage = 100
}: SidebarProps) => {

    const storagePercentage =
        totalStorage > 0
            ? Math.min(
                100,
                Math.round(
                    (usedStorage / totalStorage) * 100
                )
            )
            : 0;


    return (
        <aside className="app-sidebar">


            {/* =====================================================
                BRAND
            ====================================================== */}

            <div className="sidebar-brand">

                <a
                    href="#"
                    className="brand-link text-decoration-none"
                    onClick={(event) =>
                        event.preventDefault()
                    }
                >

                    <span className="cloud-logo">

                        <i className="bi bi-cloud-fill"></i>

                    </span>

                    <span className="cloud-brand">

                        CloudBox

                    </span>

                </a>

            </div>


            <div className="sidebar-wrapper">


                {/* =================================================
                    MENÚ
                ================================================== */}

                <nav className="mt-2">

                    <ul
                        className="nav sidebar-menu flex-column"
                        data-lte-toggle="treeview"
                        role="menu"
                    >


                        {/* PRINCIPAL */}

                        <li className="nav-header">

                            PRINCIPAL

                        </li>


                        {/* MIS ARCHIVOS */}

                        <li className="nav-item">

                            <a
                                href="#"
                                className="nav-link active"
                            >

                                <i
                                    className="nav-icon bi bi-grid-1x2-fill"
                                ></i>

                                <p>

                                    Mis archivos

                                </p>

                            </a>

                        </li>


                        {/* RECIENTES */}

                        <li className="nav-item">

                            <a
                                href="#"
                                className="nav-link"
                            >

                                <i
                                    className="nav-icon bi bi-clock-history"
                                ></i>

                                <p>

                                    Recientes

                                </p>

                            </a>

                        </li>


                        {/* FAVORITOS */}

                        <li className="nav-item">

                            <a
                                href="#"
                                className="nav-link"
                            >

                                <i
                                    className="nav-icon bi bi-star-fill"
                                ></i>

                                <p>

                                    Favoritos

                                </p>

                            </a>

                        </li>


                        {/* =================================================
                            COMPARTIDO
                        ================================================== */}

                        <li className="nav-header mt-2">

                            COMPARTIDO

                        </li>


                        <li className="nav-item">

                            <a
                                href="#"
                                className="nav-link"
                                onClick={(event) =>
                                    event.preventDefault()
                                }
                            >

                                <i className="nav-icon bi bi-people-fill"></i>

                                <p>
                                    Compartidos
                                </p>

                            </a>

                        </li>


                        <li className="nav-item">

                            <a
                                href="#"
                                className="nav-link"
                                onClick={(event) =>
                                    event.preventDefault()
                                }
                            >

                                <i className="nav-icon bi bi-link-45deg"></i>

                                <p>
                                    Enlaces
                                </p>

                            </a>

                        </li>


                        {/* =================================================
                            SISTEMA
                        ================================================== */}

                        <li className="nav-header mt-2">

                            SISTEMA

                        </li>


                        <li className="nav-item">

                            <a
                                href="#"
                                className="nav-link"
                                onClick={(event) =>
                                    event.preventDefault()
                                }
                            >

                                <i className="nav-icon bi bi-trash3-fill"></i>

                                <p>
                                    Papelera
                                </p>

                            </a>

                        </li>


                        <li className="nav-item">

                            <a
                                href="#"
                                className="nav-link"
                                onClick={(event) =>
                                    event.preventDefault()
                                }
                            >

                                <i className="nav-icon bi bi-gear-fill"></i>

                                <p>
                                    Configuración
                                </p>

                            </a>

                        </li>

                    </ul>

                </nav>


                {/* =================================================
                    STORAGE
                ================================================== */}

                <div className="sidebar-storage">

                    <div className="d-flex align-items-center mb-2">

                        <i className="bi bi-cloud me-2 text-info"></i>

                        <span className="text-white small fw-semibold">

                            Almacenamiento

                        </span>

                    </div>


                    <div className="progress mb-2">

                        <div
                            className="progress-bar"
                            style={{
                                width:
                                    `${ storagePercentage }% `
                            }}
                        ></div>

                    </div>


                    <div className="d-flex justify-content-between">

                        <small className="text-white-50">

                            {usedStorage} GB usados

                        </small>


                        <small className="text-white-50">

                            {totalStorage} GB

                        </small>

                    </div>


                    <button
                        type="button"
                        className="btn btn-sm btn-outline-light w-100 mt-3"
                    >

                        <i className="bi bi-plus-lg me-1"></i>

                        Ampliar almacenamiento

                    </button>

                </div>

            </div>

        </aside>
    );
};

export default Sidebar;
