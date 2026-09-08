import { useEffect, useState } from 'react';

import type {
    FormEvent,
    KeyboardEvent,
    ClipboardEvent,
    Dispatch,
    SetStateAction
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
    login,
    register,
    confirmRegistration,
    resendRegistrationCode,
    sendPasswordResetCode,
    confirmPasswordReset,
    getAuthSession
} from '../services/authService';

import {
    getAuthMe,
    getCurrentCloudBoxUser
} from '../services/apiService';

import { getFolders } from '../services/folderService';


// =========================================================
// TIPOS
// =========================================================

type AuthView =
    | 'login'
    | 'register'
    | 'verify'
    | 'forgot'
    | 'newPassword';

type VerifyMode =
    | 'registration'
    | 'passwordReset';

type AlertType =
    | 'info'
    | 'success'
    | 'error';

type Theme =
    | 'light'
    | 'dark';


// =========================================================
// COMPONENTE
// =========================================================

function Login() {

    const navigate = useNavigate();


    // =====================================================
    // VISTA ACTUAL
    // =====================================================

    const [authView, setAuthView] =
        useState<AuthView>('login');


    // =====================================================
    // TEMA
    // =====================================================

    const [theme, setTheme] =
        useState<Theme>(() => {

            const savedTheme =
                localStorage.getItem(
                    'cloudbox-theme'
                );

            return savedTheme === 'dark'
                ? 'dark'
                : 'light';

        });


    // =====================================================
    // MODO DE VERIFICACIÓN
    // =====================================================

    const [verifyMode, setVerifyMode] =
        useState<VerifyMode>('registration');


    // =====================================================
    // LOGIN
    // =====================================================

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [rememberMe, setRememberMe] =
        useState(false);


    // =====================================================
    // REGISTRO
    // =====================================================

    const [registerName, setRegisterName] =
        useState('');

    const [registerEmail, setRegisterEmail] =
        useState('');

    const [registerPassword, setRegisterPassword] =
        useState('');

    const [registerConfirmPassword, setRegisterConfirmPassword] =
        useState('');


    // =====================================================
    // RECUPERACIÓN
    // =====================================================

    const [forgotEmail, setForgotEmail] =
        useState('');


    // =====================================================
    // VERIFICACIÓN
    // =====================================================

    const [verificationCode, setVerificationCode] =
        useState('');

    const [newPassword, setNewPassword] =
        useState('');


    // =====================================================
    // PASSWORD VISIBILITY
    // =====================================================

    const [showLoginPassword, setShowLoginPassword] =
        useState(false);

    const [showRegisterPassword, setShowRegisterPassword] =
        useState(false);

    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);


    // =====================================================
    // ESTADOS
    // =====================================================

    const [loading, setLoading] =
        useState(false);

    const [sendingCode, setSendingCode] =
        useState(false);


    // =====================================================
    // ALERTA
    // =====================================================

    const [alert, setAlert] =
        useState<{
            message: string;
            type: AlertType;
        } | null>(null);


    // =====================================================
    // APLICAR TEMA
    // =====================================================

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


    // =====================================================
    // CAMBIAR TEMA
    // =====================================================

    const toggleTheme = () => {

        setTheme(
            previous =>
                previous === 'dark'
                    ? 'light'
                    : 'dark'
        );

    };


    // =====================================================
    // FORTALEZA PASSWORD
    // =====================================================

    const getPasswordStrength =
        (value: string) => {

            let strength = 0;

            if (value.length >= 8) {
                strength++;
            }

            if (/[A-Z]/.test(value)) {
                strength++;
            }

            if (/[0-9]/.test(value)) {
                strength++;
            }

            if (/[^A-Za-z0-9]/.test(value)) {
                strength++;
            }

            return strength;
        };


    const registerPasswordStrength =
        getPasswordStrength(
            registerPassword
        );


    const newPasswordStrength =
        getPasswordStrength(
            newPassword
        );


    // =====================================================
    // EMAIL ACTUAL DE VERIFICACIÓN
    // =====================================================

    const verificationEmail =
        verifyMode === 'registration'
            ? registerEmail
            : forgotEmail;


    // =====================================================
    // UTILIDADES
    // =====================================================

    const isEmail =
        (value: string) => {

            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                value
            );

        };


    const isStrongPassword =
        (value: string) => {

            return (
                value.length >= 8 &&
                /[A-Z]/.test(value) &&
                /[0-9]/.test(value) &&
                /[^A-Za-z0-9]/.test(value)
            );

        };


    // =====================================================
    // ALERTA
    // =====================================================

    const showAlert =
        (
            message: string,
            type: AlertType
        ) => {

            setAlert({
                message,
                type
            });

        };


    const hideAlert = () => {

        setAlert(null);

    };


    // =====================================================
    // CAMBIAR VISTA
    // =====================================================

    const changeView =
        (view: AuthView) => {

            hideAlert();

            setAuthView(view);

        };


    // =====================================================
    // TOGGLE PASSWORD
    // =====================================================

    const togglePassword =
        (
            setter: Dispatch<
                SetStateAction<boolean>
            >
        ) => {

            setter(
                previous =>
                    !previous
            );

        };


    // =====================================================
    // MANEJO DE ERRORES COGNITO
    // =====================================================

    const getCognitoErrorMessage =
        (error: unknown) => {

            const cognitoError =
                error as {
                    name?: string;
                    code?: string;
                    message?: string;
                };


            const errorCode =
                cognitoError.name ||
                cognitoError.code;


            const messages: Record<
                string,
                string
            > = {

                NotAuthorizedException:
                    'Correo o contraseña incorrectos.',

                UserNotFoundException:
                    'No existe una cuenta con ese correo.',

                UserNotConfirmedException:
                    'Debes verificar tu correo antes de iniciar sesión.',

                PasswordResetRequiredException:
                    'Debes restablecer tu contraseña.',

                TooManyRequestsException:
                    'Demasiados intentos. Espera unos minutos.',

                TooManyFailedAttemptsException:
                    'Demasiados intentos fallidos. Espera unos minutos.',

                UserLambdaValidationException:
                    'Error de validación. Intenta de nuevo.',

                UsernameExistsException:
                    'Ya existe una cuenta con ese correo.',

                CodeMismatchException:
                    'El código ingresado es incorrecto.',

                ExpiredCodeException:
                    'El código ha expirado. Solicita uno nuevo.',

                LimitExceededException:
                    'Has solicitado demasiados códigos. Espera unos minutos.',

                InvalidPasswordException:
                    'La contraseña no cumple los requisitos.',

                InvalidParameterException:
                    'Los datos proporcionados no son válidos.'

            };


            if (
                errorCode &&
                messages[errorCode]
            ) {

                return messages[errorCode];

            }


            return (
                cognitoError.message ||
                'Ocurrió un error. Intenta nuevamente.'
            );

        };


    // =====================================================
    // PROTEGER LOGIN
    // =====================================================

    useEffect(() => {

        let mounted = true;


        const checkExistingSession =
            async () => {

                try {

                    const session =
                        await getAuthSession();

                    console.log("TOKEN:", session.accessToken);

                    if (
                        mounted &&
                        session.accessToken
                    ) {

                        navigate(
                            '/dashboard',
                            {
                                replace: true
                            }
                        );

                    }

                } catch {

                    // No hay sesión.
                    // Permanecer en login.

                }

            };


        checkExistingSession();


        return () => {

            mounted = false;

        };

    }, [navigate]);


    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin =
        async (
            event: FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            hideAlert();


            const cleanEmail =
                email
                    .trim()
                    .toLowerCase();


            let valid = true;


            if (
                !isEmail(cleanEmail)
            ) {

                showAlert(
                    'Ingresa un correo válido.',
                    'error'
                );

                valid = false;

            }


            if (!password) {

                showAlert(
                    'La contraseña es obligatoria.',
                    'error'
                );

                valid = false;

            }


            if (!valid) {

                return;

            }


            try {

                setLoading(true);


                // =================================================
                // AUTENTICAR CON COGNITO
                // =================================================

                const result =
                    await login(
                        cleanEmail,
                        password
                    );


                // =================================================
                // USUARIO NO COMPLETÓ EL FLUJO
                // =================================================

                if (!result.isSignedIn) {

                    const nextStep =
                        result.nextStep;


                    if (
                        nextStep?.signInStep ===
                        'CONFIRM_SIGN_UP'
                    ) {

                        setRegisterEmail(
                            cleanEmail
                        );

                        setVerifyMode(
                            'registration'
                        );

                        setVerificationCode('');

                        showAlert(
                            'Debes verificar tu correo antes de iniciar sesión.',
                            'info'
                        );

                        setAuthView(
                            'verify'
                        );

                        return;

                    }


                    if (
                        nextStep?.signInStep ===
                        'RESET_PASSWORD'
                    ) {

                        setForgotEmail(
                            cleanEmail
                        );

                        setVerifyMode(
                            'passwordReset'
                        );

                        setVerificationCode('');

                        setAuthView(
                            'forgot'
                        );

                        showAlert(
                            'Debes restablecer tu contraseña.',
                            'info'
                        );

                        return;

                    }


                    showAlert(
                        'El inicio de sesión no se completó.',
                        'error'
                    );

                    return;

                }


                // =================================================
                // OBTENER SESIÓN
                // =================================================

                const session =
                    await getAuthSession();


                if (!session.accessToken) {

                    throw new Error(
                        'No se pudo obtener la sesión de autenticación.'
                    );

                }


                // =================================================
                // SINCRONIZAR CON BACKEND
                // =================================================

                await getAuthMe();

                await getCurrentCloudBoxUser();

                await getFolders();


                console.log(
                    'Inicio de sesión correcto.'
                );


                console.log(
                    'Recordarme:',
                    rememberMe
                );


                // =================================================
                // BIENVENIDA
                // =================================================

                showAlert(
                    '¡Bienvenido! Redirigiendo…',
                    'success'
                );


                // =================================================
                // DASHBOARD
                // =================================================

                setTimeout(() => {

                    navigate(
                        '/dashboard',
                        {
                            replace: true
                        }
                    );

                }, 800);

            } catch (
                error: unknown
            ) {

                const cognitoError =
                    error as {
                        name?: string;
                        code?: string;
                    };


                // =================================================
                // USUARIO NO CONFIRMADO
                // =================================================

                if (
                    cognitoError.name ===
                    'UserNotConfirmedException' ||
                    cognitoError.code ===
                    'UserNotConfirmedException'
                ) {

                    setRegisterEmail(
                        cleanEmail
                    );

                    setVerifyMode(
                        'registration'
                    );

                    setVerificationCode('');

                    showAlert(
                        'Debes verificar tu correo antes de iniciar sesión.',
                        'info'
                    );

                    setAuthView(
                        'verify'
                    );

                    return;

                }


                showAlert(
                    getCognitoErrorMessage(error),
                    'error'
                );

            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // REGISTRO
    // =====================================================

    const handleRegister =
        async (
            event: FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            hideAlert();


            const name =
                registerName.trim();


            const cleanEmail =
                registerEmail
                    .trim()
                    .toLowerCase();


            let valid = true;


            if (
                name.length < 2
            ) {

                showAlert(
                    'El nombre debe tener al menos 2 caracteres.',
                    'error'
                );

                valid = false;

            }


            if (
                !isEmail(cleanEmail)
            ) {

                showAlert(
                    'Ingresa un correo válido.',
                    'error'
                );

                valid = false;

            }


            if (
                !isStrongPassword(
                    registerPassword
                )
            ) {

                showAlert(
                    'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo.',
                    'error'
                );

                valid = false;

            }


            if (
                registerPassword !==
                registerConfirmPassword
            ) {

                showAlert(
                    'Las contraseñas no coinciden.',
                    'error'
                );

                valid = false;

            }


            if (!valid) {

                return;

            }


            try {

                setLoading(true);


                const result =
                    await register(
                        name,
                        cleanEmail,
                        registerPassword
                    );


                // =================================================
                // REGISTRO REQUIERE CONFIRMACIÓN
                // =================================================

                if (
                    result.nextStep?.signUpStep ===
                    'CONFIRM_SIGN_UP'
                ) {

                    setRegisterEmail(
                        cleanEmail
                    );

                    setVerifyMode(
                        'registration'
                    );

                    setVerificationCode('');

                    showAlert(
                        'Cuenta creada. Revisa tu correo.',
                        'success'
                    );

                    setAuthView(
                        'verify'
                    );

                    return;

                }


                // =================================================
                // REGISTRO COMPLETADO
                // =================================================

                setEmail(
                    cleanEmail
                );

                setPassword('');

                setAuthView(
                    'login'
                );

                showAlert(
                    'Cuenta creada correctamente. Ya puedes iniciar sesión.',
                    'success'
                );

            } catch (
                error: unknown
            ) {

                showAlert(
                    getCognitoErrorMessage(error),
                    'error'
                );

            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // OBTENER CÓDIGO
    // =====================================================

    const handleCodeChange =
        (
            index: number,
            value: string
        ) => {

            const numericValue =
                value
                    .replace(/\D/g, '')
                    .slice(-1);


            const current =
                verificationCode
                    .split('');


            current[index] =
                numericValue;


            const code =
                current
                    .join('')
                    .slice(0, 6);


            setVerificationCode(
                code
            );


            // =================================================
            // MOVER AL SIGUIENTE INPUT
            // =================================================

            if (
                numericValue &&
                index < 5
            ) {

                const next =
                    document.getElementById(
                        `code - ${ index + 1 } `
                    );


                next?.focus();

            }

        };


    // =====================================================
    // PEGAR CÓDIGO
    // =====================================================

    const handleCodePaste =
        (
            event: ClipboardEvent<HTMLInputElement>
        ) => {

            event.preventDefault();


            const pasted =
                event.clipboardData
                    .getData('text')
                    .replace(/\D/g, '')
                    .slice(0, 6);


            if (!pasted) {

                return;

            }


            setVerificationCode(
                pasted
            );


            const target =
                document.getElementById(
                    `code - ${
    Math.min(
        pasted.length,
        6
    ) - 1
} `
                );


            target?.focus();

        };


    // =====================================================
    // BACKSPACE CÓDIGO
    // =====================================================

    const handleCodeKeyDown =
        (
            event: KeyboardEvent<HTMLInputElement>,
            index: number
        ) => {

            if (
                event.key === 'Backspace' &&
                !verificationCode[index] &&
                index > 0
            ) {

                const previous =
                    document.getElementById(
                        `code - ${ index - 1 } `
                    );


                previous?.focus();

            }

        };


    // =====================================================
    // VERIFICAR REGISTRO
    // =====================================================

    const handleVerify =
        async () => {

            hideAlert();


            const code =
                verificationCode.trim();


            if (
                code.length !== 6
            ) {

                showAlert(
                    'Ingresa el código de 6 dígitos.',
                    'error'
                );

                return;

            }


            if (!verificationEmail) {

                showAlert(
                    'No se encontró el correo electrónico.',
                    'error'
                );

                return;

            }


            try {

                setLoading(true);


                // =================================================
                // CONFIRMAR REGISTRO
                // =================================================

                if (
                    verifyMode ===
                    'registration'
                ) {

                    await confirmRegistration(
                        verificationEmail,
                        code
                    );


                    showAlert(
                        'Correo verificado correctamente.',
                        'success'
                    );


                    setVerificationCode('');

                    setEmail(
                        verificationEmail
                    );

                    setPassword('');


                    setTimeout(() => {

                        setAuthView(
                            'login'
                        );

                    }, 1200);


                    return;

                }


                // =================================================
                // RECUPERACIÓN
                // =================================================

                if (
                    verifyMode ===
                    'passwordReset'
                ) {

                    setAuthView(
                        'newPassword'
                    );

                }

            } catch (
                error: unknown
            ) {

                showAlert(
                    getCognitoErrorMessage(error),
                    'error'
                );

            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // REENVIAR CÓDIGO
    // =====================================================

    const handleResendCode =
        async () => {

            hideAlert();


            if (!verificationEmail) {

                showAlert(
                    'No se encontró el correo electrónico.',
                    'error'
                );

                return;

            }


            try {

                setSendingCode(true);


                if (
                    verifyMode ===
                    'registration'
                ) {

                    await resendRegistrationCode(
                        verificationEmail
                    );


                    showAlert(
                        'Nuevo código enviado.',
                        'success'
                    );


                    return;

                }


                await sendPasswordResetCode(
                    verificationEmail
                );


                showAlert(
                    'Nuevo código enviado.',
                    'success'
                );

            } catch (
                error: unknown
            ) {

                showAlert(
                    getCognitoErrorMessage(error),
                    'error'
                );

            } finally {

                setSendingCode(false);

            }

        };


    // =====================================================
    // RECUPERAR CONTRASEÑA
    // =====================================================

    const handleForgot =
        async () => {

            hideAlert();


            const cleanEmail =
                forgotEmail
                    .trim()
                    .toLowerCase();


            if (
                !isEmail(cleanEmail)
            ) {

                showAlert(
                    'Ingresa un correo válido.',
                    'error'
                );

                return;

            }


            try {

                setLoading(true);


                await sendPasswordResetCode(
                    cleanEmail
                );


                setForgotEmail(
                    cleanEmail
                );

                setVerifyMode(
                    'passwordReset'
                );

                setVerificationCode('');


                showAlert(
                    'Código enviado a tu correo.',
                    'success'
                );


                setAuthView(
                    'verify'
                );

            } catch (
                error: unknown
            ) {

                showAlert(
                    getCognitoErrorMessage(error),
                    'error'
                );

            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // NUEVA CONTRASEÑA
    // =====================================================

    const handleNewPassword =
        async () => {

            hideAlert();


            const code =
                verificationCode.trim();


            if (
                code.length !== 6
            ) {

                showAlert(
                    'Ingresa el código de 6 dígitos.',
                    'error'
                );

                return;

            }


            if (
                !isStrongPassword(
                    newPassword
                )
            ) {

                showAlert(
                    'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo.',
                    'error'
                );

                return;

            }


            if (!forgotEmail) {

                showAlert(
                    'No se encontró el correo electrónico.',
                    'error'
                );

                return;

            }


            try {

                setLoading(true);


                await confirmPasswordReset(
                    forgotEmail,
                    code,
                    newPassword
                );


                showAlert(
                    '¡Contraseña actualizada! Ya puedes iniciar sesión.',
                    'success'
                );


                setVerificationCode('');

                setNewPassword('');

                setForgotEmail('');


                setTimeout(() => {

                    setAuthView(
                        'login'
                    );

                }, 1500);

            } catch (
                error: unknown
            ) {

                showAlert(
                    getCognitoErrorMessage(error),
                    'error'
                );

            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // FORTALEZA PASSWORD
    // =====================================================

    const renderStrength =
        (
            strength: number
        ) => {

            const labels = [
                '',
                'Muy débil',
                'Débil',
                'Media',
                'Fuerte'
            ];


            return (

                <div className="strength-wrap">

                    <div className="strength-bar">

                        {[1, 2, 3, 4].map(
                            segment => (

                                <div
                                    key={segment}
                                    className={
                                        `strength - seg ${
    strength >= segment
        ? 'active'
        : ''
} `
                                    }
                                />

                            )
                        )}

                    </div>


                    <div className="strength-lbl">

                        {
                            labels[strength]
                        }

                    </div>

                </div>

            );

        };


    // =====================================================
    // INPUT DE CÓDIGO
    // =====================================================

    const renderCodeInputs =
        () => {

            return (

                <div className="code-inputs">

                    {Array.from(
                        { length: 6 },
                        (_, index) => (

                            <input
                                key={index}
                                id={`code - ${ index } `}
                                className="code-input"
                                type="text"
                                maxLength={1}
                                inputMode="numeric"
                                autoComplete={
                                    index === 0
                                        ? 'one-time-code'
                                        : 'off'
                                }
                                value={
                                    verificationCode[index] ||
                                    ''
                                }
                                onChange={
                                    event =>
                                        handleCodeChange(
                                            index,
                                            event.target.value
                                        )
                                }
                                onPaste={
                                    handleCodePaste
                                }
                                onKeyDown={
                                    event =>
                                        handleCodeKeyDown(
                                            event,
                                            index
                                        )
                                }
                            />

                        )
                    )}

                </div>

            );

        };


    // =====================================================
    // ALERT ICON
    // =====================================================

    const alertIcon =
        alert?.type === 'success'
            ? 'bi-check-circle-fill'
            : alert?.type === 'error'
                ? 'bi-exclamation-triangle-fill'
                : 'bi-info-circle-fill';


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <>

            {/* =================================================
                BOTÓN TEMA
            ================================================== */}

            <button
                type="button"
                className="theme-btn"
                title={
                    theme === 'dark'
                        ? 'Cambiar a modo claro'
                        : 'Cambiar a modo oscuro'
                }
                aria-label={
                    theme === 'dark'
                        ? 'Cambiar a modo claro'
                        : 'Cambiar a modo oscuro'
                }
                onClick={toggleTheme}
            >

                <i
                    className={
                        theme === 'dark'
                            ? 'bi bi-sun'
                            : 'bi bi-moon'
                    }
                />

            </button>


            {/* =================================================
                LOGIN PAGE
            ================================================== */}

            <main className="login-page">


                {/* =================================================
                    FONDOS DECORATIVOS
                ================================================== */}

                <div
                    className="background-shape shape-one"
                />

                <div
                    className="background-shape shape-two"
                />


                {/* =================================================
                    CONTENEDOR PRINCIPAL
                ================================================== */}

                <div className="login-container">


                    {/* =================================================
                        PANEL BRAND
                    ================================================== */}

                    <section className="login-brand-panel">


                        {/* =================================================
                            BRAND
                        ================================================== */}

                        <button
                            type="button"
                            className="brand"
                            onClick={() =>
                                changeView('login')
                            }
                        >

                            <span className="brand-logo">

                                <i className="bi bi-cloud-fill" />

                            </span>


                            <span className="brand-name">

                                CloudBox

                            </span>

                        </button>


                        {/* =================================================
                            BRAND CONTENT
                        ================================================== */}

                        <div className="brand-content">


                            <h1>

                                Tus archivos.

                                <br />

                                Siempre contigo.

                            </h1>


                            <p>

                                Guarda, organiza y comparte tus
                                archivos de forma segura desde
                                cualquier dispositivo.

                            </p>


                            <div className="feature">

                                <span className="feature-icon">

                                    <i className="bi bi-cloud-check" />

                                </span>

                                Almacenamiento seguro en la nube

                            </div>


                            <div className="feature">

                                <span className="feature-icon">

                                    <i className="bi bi-folder2-open" />

                                </span>

                                Organiza tus archivos fácilmente

                            </div>


                            <div className="feature">

                                <span className="feature-icon">

                                    <i className="bi bi-shield-lock" />

                                </span>

                                Protegido por AWS Cognito

                            </div>


                            <div className="feature">

                                <span className="feature-icon">

                                    <i className="bi bi-envelope-check" />

                                </span>

                                Verificación de correo automática

                            </div>


                        </div>


                        {/* =================================================
                            FOOTER
                        ================================================== */}

                        <div className="brand-footer">

                            © 2026 CloudBox · Plataforma de almacenamiento

                        </div>


                    </section>


                    {/* =================================================
                        PANEL AUTENTICACIÓN
                    ================================================== */}

                    <section className="login-panel">


                        {/* =================================================
                            ALERTA
                        ================================================== */}

                        {alert && (
                            <div
                                className={`cb-alert ${alert.type} show`}
                            >
                                <i
                                    className={`bi ${alertIcon}`}
                                />

                                <span>
                                    {alert.message}
                                </span>
                            </div>
                        )}


                        {/* =================================================
                            LOGIN
                        ================================================== */}

                        {authView === 'login' && (

                            <div>

                                <div className="auth-tabs">

                                    <button
                                        className="auth-tab active"
                                        type="button"
                                        onClick={() =>
                                            changeView('login')
                                        }
                                    >

                                        Iniciar sesión

                                    </button>


                                    <button
                                        className="auth-tab"
                                        type="button"
                                        onClick={() =>
                                            changeView('register')
                                        }
                                    >

                                        Crear cuenta

                                    </button>

                                </div>


                                <form
                                    onSubmit={handleLogin}
                                    noValidate
                                >


                                    {/* EMAIL */}

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Correo electrónico

                                        </label>


                                        <div className="input-group">

                                            <span className="input-group-text">

                                                <i className="bi bi-envelope" />

                                            </span>


                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="nombre@ejemplo.com"
                                                autoComplete="email"
                                                value={email}
                                                onChange={
                                                    event =>
                                                        setEmail(
                                                            event.target.value
                                                        )
                                                }
                                            />

                                        </div>

                                    </div>


                                    {/* PASSWORD */}

                                    <div className="mb-1">

                                        <label className="form-label">

                                            Contraseña

                                        </label>


                                        <div className="input-group">

                                            <span className="input-group-text">

                                                <i className="bi bi-lock" />

                                            </span>


                                            <input
                                                type={
                                                    showLoginPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className="form-control"
                                                placeholder="Tu contraseña"
                                                autoComplete="current-password"
                                                value={password}
                                                onChange={
                                                    event =>
                                                        setPassword(
                                                            event.target.value
                                                        )
                                                }
                                            />


                                            <button
                                                type="button"
                                                className="pass-btn"
                                                onClick={() =>
                                                    togglePassword(
                                                        setShowLoginPassword
                                                    )
                                                }
                                            >

                                                <i
                                                    className={
                                                        `bi ${
    showLoginPassword
        ? 'bi-eye-slash'
        : 'bi-eye'
} `
                                                    }
                                                />

                                            </button>

                                        </div>

                                    </div>


                                    {/* OPCIONES */}

                                    <div className="login-opts">


                                        <div className="form-check">

                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="remember"
                                                checked={rememberMe}
                                                onChange={
                                                    event =>
                                                        setRememberMe(
                                                            event.target.checked
                                                        )
                                                }
                                            />


                                            <label
                                                className="form-check-label"
                                                htmlFor="remember"
                                            >

                                                Recordarme

                                            </label>

                                        </div>


                                        <button
                                            type="button"
                                            className="forgot"
                                            onClick={() =>
                                                changeView('forgot')
                                            }
                                        >

                                            ¿Olvidaste tu contraseña?

                                        </button>


                                    </div>


                                    {/* LOGIN BUTTON */}

                                    <button
                                        type="submit"
                                        className="btn-main"
                                        disabled={loading}
                                    >

                                        {loading && (

                                            <span className="spinner-sm" />

                                        )}


                                        <i className="bi bi-box-arrow-in-right" />


                                        <span>

                                            {
                                                loading
                                                    ? 'Iniciando sesión...'
                                                    : 'Iniciar sesión'
                                            }

                                        </span>

                                    </button>


                                    {/* SEGURIDAD */}

                                    <div className="sec-badges">


                                        <span className="sec-badge">

                                            <i className="bi bi-shield-fill" />

                                        </span>


                                        <span className="sec-badge">

                                            <i className="bi bi-lock-fill" />

                                        </span>


                                        <span className="sec-badge">

                                            <i className="bi bi-eye-slash-fill" />

                                        </span>


                                        <span className="sec-badge">

                                            <i className="bi bi-cloud-check-fill" />

                                        </span>


                                    </div>


                                </form>

                            </div>

                        )}


                        {/* =================================================
                            REGISTRO
                        ================================================== */}

                        {authView === 'register' && (

                            <div>

                                <div className="auth-tabs">

                                    <button
                                        className="auth-tab"
                                        type="button"
                                        onClick={() =>
                                            changeView('login')
                                        }
                                    >

                                        Iniciar sesión

                                    </button>


                                    <button
                                        className="auth-tab active"
                                        type="button"
                                        onClick={() =>
                                            changeView('register')
                                        }
                                    >

                                        Crear cuenta

                                    </button>

                                </div>


                                <form
                                    onSubmit={handleRegister}
                                    noValidate
                                >


                                    {/* NOMBRE */}

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Nombre completo

                                        </label>


                                        <div className="input-group">

                                            <span className="input-group-text">

                                                <i className="bi bi-person" />

                                            </span>


                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Tu nombre"
                                                autoComplete="name"
                                                value={registerName}
                                                onChange={
                                                    event =>
                                                        setRegisterName(
                                                            event.target.value
                                                        )
                                                }
                                            />

                                        </div>

                                    </div>


                                    {/* EMAIL */}

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Correo electrónico

                                        </label>


                                        <div className="input-group">

                                            <span className="input-group-text">

                                                <i className="bi bi-envelope" />

                                            </span>


                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="nombre@ejemplo.com"
                                                autoComplete="email"
                                                value={registerEmail}
                                                onChange={
                                                    event =>
                                                        setRegisterEmail(
                                                            event.target.value
                                                        )
                                                }
                                            />

                                        </div>

                                    </div>


                                    {/* PASSWORD */}

                                    <div className="mb-1">

                                        <label className="form-label">

                                            Contraseña

                                        </label>


                                        <div className="input-group">

                                            <span className="input-group-text">

                                                <i className="bi bi-lock" />

                                            </span>


                                            <input
                                                type={
                                                    showRegisterPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className="form-control"
                                                placeholder="Mínimo 8 caracteres"
                                                autoComplete="new-password"
                                                value={registerPassword}
                                                onChange={
                                                    event =>
                                                        setRegisterPassword(
                                                            event.target.value
                                                        )
                                                }
                                            />


                                            <button
                                                type="button"
                                                className="pass-btn"
                                                onClick={() =>
                                                    togglePassword(
                                                        setShowRegisterPassword
                                                    )
                                                }
                                            >

                                                <i
                                                    className={
                                                        `bi ${
    showRegisterPassword
        ? 'bi-eye-slash'
        : 'bi-eye'
} `
                                                    }
                                                />

                                            </button>

                                        </div>


                                        {
                                            renderStrength(
                                                registerPasswordStrength
                                            )
                                        }

                                    </div>


                                    {/* CONFIRMAR PASSWORD */}

                                    <div
                                        className="mb-3"
                                        style={{
                                            marginTop: '10px'
                                        }}
                                    >

                                        <label className="form-label">

                                            Confirmar contraseña

                                        </label>


                                        <div className="input-group">

                                            <span className="input-group-text">

                                                <i className="bi bi-lock-fill" />

                                            </span>


                                            <input
                                                type={
                                                    showRegisterConfirmPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className="form-control"
                                                placeholder="Repite tu contraseña"
                                                autoComplete="new-password"
                                                value={
                                                    registerConfirmPassword
                                                }
                                                onChange={
                                                    event =>
                                                        setRegisterConfirmPassword(
                                                            event.target.value
                                                        )
                                                }
                                            />


                                            <button
                                                type="button"
                                                className="pass-btn"
                                                onClick={() =>
                                                    togglePassword(
                                                        setShowRegisterConfirmPassword
                                                    )
                                                }
                                            >

                                                <i
                                                    className={
                                                        `bi ${
    showRegisterConfirmPassword
        ? 'bi-eye-slash'
        : 'bi-eye'
} `
                                                    }
                                                />

                                            </button>

                                        </div>

                                    </div>


                                    {/* BOTÓN */}

                                    <button
                                        type="submit"
                                        className="btn-main"
                                        disabled={loading}
                                    >

                                        {loading && (

                                            <span className="spinner-sm" />

                                        )}


                                        <i className="bi bi-person-plus" />


                                        <span>

                                            {
                                                loading
                                                    ? 'Creando cuenta...'
                                                    : 'Crear cuenta'
                                            }

                                        </span>

                                    </button>


                                    <div className="switch-txt">

                                        ¿Ya tienes cuenta?{' '}


                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeView('login')
                                            }
                                        >

                                            Inicia sesión

                                        </button>

                                    </div>


                                </form>

                            </div>

                        )}


                        {/* =================================================
                            VERIFICACIÓN
                        ================================================== */}

                        {authView === 'verify' && (

                            <div>

                                <h5>

                                    {
                                        verifyMode === 'registration'
                                            ? 'Verifica tu correo 📧'
                                            : 'Verifica el código 📧'
                                    }

                                </h5>


                                <p className="view-description">

                                    Te enviamos un código de 6 dígitos a{' '}

                                    <strong>
                                        {verificationEmail}
                                    </strong>.

                                    <br />

                                    Revisa tu bandeja de entrada y
                                    correo no deseado.

                                </p>


                                {renderCodeInputs()}


                                <button
                                    className="btn-main"
                                    type="button"
                                    onClick={handleVerify}
                                    disabled={loading}
                                >

                                    {loading && (

                                        <span className="spinner-sm" />

                                    )}


                                    <i className="bi bi-patch-check" />


                                    <span>

                                        {
                                            verifyMode === 'registration'
                                                ? 'Verificar cuenta'
                                                : 'Continuar'
                                        }

                                    </span>

                                </button>


                                <div
                                    className="switch-txt"
                                    style={{
                                        marginTop: '14px'
                                    }}
                                >

                                    ¿No recibiste el código?{' '}


                                    <button
                                        type="button"
                                        onClick={
                                            handleResendCode
                                        }
                                        disabled={
                                            sendingCode
                                        }
                                    >

                                        {
                                            sendingCode
                                                ? 'Enviando...'
                                                : 'Reenviar'
                                        }

                                    </button>

                                </div>


                                <div
                                    className="switch-txt"
                                    style={{
                                        marginTop: '10px'
                                    }}
                                >

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeView('login')
                                        }
                                    >

                                        ← Volver al inicio de sesión

                                    </button>

                                </div>


                            </div>

                        )}


                        {/* =================================================
                            RECUPERAR PASSWORD
                        ================================================== */}

                        {authView === 'forgot' && (

                            <div>

                                <h5>

                                    Recuperar contraseña

                                </h5>


                                <p className="view-description">

                                    Ingresa tu correo y te enviaremos
                                    un código para restablecer tu contraseña.

                                </p>


                                <div className="mb-3">

                                    <label className="form-label">

                                        Correo electrónico

                                    </label>


                                    <div className="input-group">

                                        <span className="input-group-text">

                                            <i className="bi bi-envelope" />

                                        </span>


                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="nombre@ejemplo.com"
                                            value={forgotEmail}
                                            onChange={
                                                event =>
                                                    setForgotEmail(
                                                        event.target.value
                                                    )
                                            }
                                        />

                                    </div>

                                </div>


                                <button
                                    className="btn-main"
                                    type="button"
                                    onClick={handleForgot}
                                    disabled={loading}
                                >

                                    {loading && (

                                        <span className="spinner-sm" />

                                    )}


                                    <i className="bi bi-send" />


                                    <span>

                                        {
                                            loading
                                                ? 'Enviando...'
                                                : 'Enviar código'
                                        }

                                    </span>

                                </button>


                                <div
                                    className="switch-txt"
                                    style={{
                                        marginTop: '14px'
                                    }}
                                >

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeView('login')
                                        }
                                    >

                                        ← Volver al inicio de sesión

                                    </button>

                                </div>


                            </div>

                        )}


                        {/* =================================================
                            NUEVA PASSWORD
                        ================================================== */}

                        {authView === 'newPassword' && (

                            <div>

                                <h5>

                                    Nueva contraseña

                                </h5>


                                <p className="view-description">

                                    Ingresa el código que te enviamos
                                    y tu nueva contraseña.

                                </p>


                                {/* CÓDIGO */}

                                <div className="mb-3">

                                    <label className="form-label">

                                        Código de verificación

                                    </label>


                                    <div className="input-group">

                                        <span className="input-group-text">

                                            <i className="bi bi-key" />

                                        </span>


                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="123456"
                                            maxLength={6}
                                            inputMode="numeric"
                                            value={verificationCode}
                                            onChange={
                                                event =>
                                                    setVerificationCode(
                                                        event.target.value
                                                            .replace(/\D/g, '')
                                                            .slice(0, 6)
                                                    )
                                            }
                                        />

                                    </div>

                                </div>


                                {/* NUEVA PASSWORD */}

                                <div className="mb-3">

                                    <label className="form-label">

                                        Nueva contraseña

                                    </label>


                                    <div className="input-group">

                                        <span className="input-group-text">

                                            <i className="bi bi-lock" />

                                        </span>


                                        <input
                                            type={
                                                showNewPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            className="form-control"
                                            placeholder="Mínimo 8 caracteres"
                                            autoComplete="new-password"
                                            value={newPassword}
                                            onChange={
                                                event =>
                                                    setNewPassword(
                                                        event.target.value
                                                    )
                                            }
                                        />


                                        <button
                                            type="button"
                                            className="pass-btn"
                                            onClick={() =>
                                                togglePassword(
                                                    setShowNewPassword
                                                )
                                            }
                                        >

                                            <i
                                                className={
                                                    `bi ${
    showNewPassword
        ? 'bi-eye-slash'
        : 'bi-eye'
} `
                                                }
                                            />

                                        </button>

                                    </div>


                                    {
                                        renderStrength(
                                            newPasswordStrength
                                        )
                                    }

                                </div>


                                {/* BOTÓN */}

                                <button
                                    className="btn-main"
                                    type="button"
                                    onClick={
                                        handleNewPassword
                                    }
                                    disabled={loading}
                                >

                                    {loading && (

                                        <span className="spinner-sm" />

                                    )}


                                    <i className="bi bi-check-circle" />


                                    <span>

                                        {
                                            loading
                                                ? 'Cambiando...'
                                                : 'Cambiar contraseña'
                                        }

                                    </span>

                                </button>


                            </div>

                        )}

                    </section>

                </div>

            </main>

        </>

    );

}


export default Login;
