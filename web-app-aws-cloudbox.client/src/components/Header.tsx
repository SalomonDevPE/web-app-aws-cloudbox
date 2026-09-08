import {
    useEffect,
    useRef,
    useState
} from 'react';

import {
    signOut,
    getCurrentUser,
    fetchUserAttributes
} from 'aws-amplify/auth';



const Header = () => {

    /*
     * =========================================================
     * ESTADOS
     * =========================================================
     */

    const [theme, setTheme] =
        useState<'light' | 'dark'>(() =>
            (localStorage.getItem(
                'cloudbox-theme'
            ) as 'light' | 'dark') || 'light'
        );

    const [userName, setUserName] =
        useState('Usuario');

    const [userInitial, setUserInitial] =
        useState('U');

    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [loggingOut, setLoggingOut] =
        useState(false);


    /*
     * =========================================================
     * REFERENCIAS
     * =========================================================
     */

    const userMenuRef =
        useRef<HTMLLIElement>(null);

    const notificationsRef =
        useRef<HTMLLIElement>(null);


    /*
     * =========================================================
     * TEMA
     * =========================================================
     */

    useEffect(() => {

        document.documentElement.setAttribute(
            'data-bs-theme',
            theme
        );

        localStorage.setItem(
            'cloudbox-theme',
            theme
        );

    }, [theme]);


    const handleThemeToggle = () => {

        setTheme(current =>
            current === 'light'
                ? 'dark'
                : 'light'
        );

    };


    /*
     * =========================================================
     * OBTENER USUARIO
     * =========================================================
     */

    useEffect(() => {

        const loadUser = async () => {

            try {

                await getCurrentUser();

                const attributes =
                    await fetchUserAttributes();

                const name =
                    attributes.name?.trim();

                const givenName =
                    attributes.given_name?.trim();

                const familyName =
                    attributes.family_name?.trim();

                const email =
                    attributes.email?.trim();


                let displayName =
                    'Usuario';


                if (name) {

                    displayName = name;

                } else if (
                    givenName &&
                    familyName
                ) {

                    displayName =
                        `${ givenName } ${ familyName } `;

                } else if (givenName) {

                    displayName =
                        givenName;

                } else if (email) {

                    displayName =
                        email;

                }


                setUserName(displayName);

                setUserInitial(
                    displayName
                        .charAt(0)
                        .toUpperCase()
                );

            } catch (error) {

                console.error(
                    'Error obteniendo usuario:',
                    error
                );

            }

        };

        loadUser();

    }, []);


    /*
     * =========================================================
     * CERRAR DROPDOWNS AL HACER CLICK FUERA
     * =========================================================
     */

    useEffect(() => {

        const handleClickOutside =
            (event: MouseEvent) => {

                const target =
                    event.target as Node;


                if (
                    userMenuRef.current &&
                    !userMenuRef.current.contains(target)
                ) {

                    setShowUserMenu(false);

                }


                if (
                    notificationsRef.current &&
                    !notificationsRef.current.contains(target)
                ) {

                    setShowNotifications(false);

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


    /*
     * =========================================================
     * DROPDOWN USUARIO
     * =========================================================
     */

    const handleUserMenu = (
        event: React.MouseEvent<HTMLAnchorElement>
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setShowNotifications(false);

        setShowUserMenu(current =>
            !current
        );

    };


    /*
     * =========================================================
     * DROPDOWN NOTIFICACIONES
     * =========================================================
     */

    const handleNotifications = (
        event: React.MouseEvent<HTMLAnchorElement>
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setShowUserMenu(false);

        setShowNotifications(current =>
            !current
        );

    };


    /*
     * =========================================================
     * MI PERFIL
     * =========================================================
     */

    const handleProfile = (
        event: React.MouseEvent<HTMLAnchorElement>
    ) => {

        event.preventDefault();

        setShowUserMenu(false);

        console.log(
            'Abrir perfil del usuario'
        );

    };


    /*
     * =========================================================
     * CONFIGURACIÓN
     * =========================================================
     */

    const handleSettings = (
        event: React.MouseEvent<HTMLAnchorElement>
    ) => {

        event.preventDefault();

        setShowUserMenu(false);

        console.log(
            'Abrir configuración'
        );

    };


    /*
     * =========================================================
     * CERRAR SESIÓN
     * =========================================================
     */

    const handleLogout = async () => {

        if (loggingOut) {
            return;
        }


        try {

            setLoggingOut(true);

            setShowUserMenu(false);

            await signOut();

            window.location.href =
                '/login';

        } catch (error) {

            console.error(
                'Error cerrando sesión:',
                error
            );

            setLoggingOut(false);

        }

    };


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (

        <nav className="app-header navbar navbar-expand">

            <div className="container-fluid">


                {/* =================================================
                    BOTÓN SIDEBAR
                ================================================== */}

                <ul className="navbar-nav">

                    <li className="nav-item">

                        <a
                            className="nav-link"
                            data-lte-toggle="sidebar"
                            href="#"
                            title="Mostrar menú"
                        >

                            <i className="bi bi-list fs-5"></i>

                        </a>

                    </li>

                </ul>


                {/* =================================================
                    HEADER DERECHO
                ================================================== */}

                <ul className="navbar-nav ms-auto align-items-center">


                    {/* =================================================
                        TEMA
                    ================================================== */}

                    <li className="nav-item me-1">

                        <button
                            className="theme-toggle"
                            type="button"
                            title="Cambiar tema"
                            onClick={
                                handleThemeToggle
                            }
                        >

                            <i
                                className={
                                    theme === 'light'
                                        ? 'bi bi-moon'
                                        : 'bi bi-sun'
                                }
                            ></i>

                        </button>

                    </li>


                    {/* =================================================
                        NOTIFICACIONES
                    ================================================== */}

                    <li
                        className="nav-item dropdown"
                        ref={notificationsRef}
                    >

                        <a
                            className="nav-link"
                            href="#"
                            onClick={
                                handleNotifications
                            }
                        >

                            <i className="bi bi-bell fs-5"></i>

                            <span className="navbar-badge badge text-bg-danger">
                                3
                            </span>

                        </a>


                        {showNotifications && (

                            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end show">

                                <span className="dropdown-item dropdown-header">
                                    3 notificaciones
                                </span>

                                <div className="dropdown-divider"></div>


                                <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={(event) =>
                                        event.preventDefault()
                                    }
                                >

                                    <i className="bi bi-cloud-upload me-2 text-primary"></i>

                                    Archivo subido correctamente

                                </a>


                                <div className="dropdown-divider"></div>


                                <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={(event) =>
                                        event.preventDefault()
                                    }
                                >

                                    <i className="bi bi-share me-2 text-primary"></i>

                                    Ana compartió una carpeta

                                </a>


                                <div className="dropdown-divider"></div>


                                <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={(event) =>
                                        event.preventDefault()
                                    }
                                >

                                    <i className="bi bi-info-circle me-2 text-primary"></i>

                                    Almacenamiento al 68%

                                </a>

                            </div>

                        )}

                    </li>


                    {/* =================================================
                        USUARIO
                    ================================================== */}

                    <li
                        className="nav-item dropdown ms-1"
                        ref={userMenuRef}
                    >

                        <a
                            className="nav-link d-flex align-items-center"
                            href="#"
                            onClick={
                                handleUserMenu
                            }
                        >

                            <span className="cloud-avatar me-2">
                                {userInitial}
                            </span>


                            <span className="cloud-desktop">
                                {userName}
                            </span>


                            <i
                                className={`bi ${
    showUserMenu
        ? 'bi-chevron-up'
        : 'bi-chevron-down'
} ms - 2 small`}
                            ></i>

                        </a>


                        {showUserMenu && (

                            <ul className="dropdown-menu dropdown-menu-end show">

                                {/* =================================================
                                    PERFIL
                                ================================================== */}

                                <li>

                                    <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={
                                            handleProfile
                                        }
                                    >

                                        <i className="bi bi-person me-2"></i>

                                        Mi perfil

                                    </a>

                                </li>


                                {/* =================================================
                                    CONFIGURACIÓN
                                ================================================== */}

                                <li>

                                    <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={
                                            handleSettings
                                        }
                                    >

                                        <i className="bi bi-gear me-2"></i>

                                        Configuración

                                    </a>

                                </li>


                                <li>

                                    <hr className="dropdown-divider" />

                                </li>


                                {/* =================================================
                                    CERRAR SESIÓN
                                ================================================== */}

                                <li>

                                    <button
                                        type="button"
                                        className="dropdown-item text-danger"
                                        onClick={
                                            handleLogout
                                        }
                                        disabled={
                                            loggingOut
                                        }
                                    >

                                        {loggingOut ? (

                                            <>

                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>

                                                Cerrando sesión...

                                            </>

                                        ) : (

                                            <>

                                                <i className="bi bi-box-arrow-right me-2"></i>

                                                Cerrar sesión 

                                            </>

                                        )}

                                    </button>

                                </li>

                            </ul>

                        )}

                    </li>

                </ul>

            </div>

        </nav>
    );
};

export default Header;
