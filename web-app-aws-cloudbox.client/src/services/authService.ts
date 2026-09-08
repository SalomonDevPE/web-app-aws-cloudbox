import {
    signIn,
    signOut,
    signUp,
    getCurrentUser,
    fetchAuthSession,
    resetPassword,
    confirmResetPassword,
    confirmSignUp,
    resendSignUpCode
} from 'aws-amplify/auth';


// =========================================================
// LOGIN
// =========================================================

export const login = async (
    email: string,
    password: string
) => {
    return await signIn({
        username: email.trim().toLowerCase(),
        password
    });
};


// =========================================================
// LOGOUT
// =========================================================

export const logout = async () => {
    await signOut();
};


// =========================================================
// USUARIO AUTENTICADO
// =========================================================

export const getAuthenticatedUser = async () => {

    try {

        return await getCurrentUser();

    } catch {

        return null;

    }

};


// =========================================================
// SESIÓN / TOKENS
// =========================================================

export const getAuthSession = async () => {

    try {

        const session = await fetchAuthSession();

        const accessToken =
            session.tokens?.accessToken;

        const idToken =
            session.tokens?.idToken;

        return {

            accessToken:
                accessToken?.toString() ?? null,

            idToken:
                idToken?.toString() ?? null

        };

    } catch {

        return {

            accessToken: null,

            idToken: null

        };

    }

};


// =========================================================
// ATRIBUTOS DEL USUARIO
// =========================================================

export const getUserAttributes = async () => {

    const session =
        await fetchAuthSession();

    const idToken =
        session.tokens?.idToken;

    if (!idToken) {

        throw new Error(
            'No hay un ID Token disponible.'
        );

    }

    return {

        cognitoUserId:
            idToken.payload.sub as string,

        name:
            idToken.payload.name as string,

        email:
            idToken.payload.email as string

    };

};


// =========================================================
// REGISTRO DE USUARIO
// =========================================================

export const register = async (
    name: string,
    email: string,
    password: string
) => {

    const cleanEmail =
        email.trim().toLowerCase();

    const cleanName =
        name.trim();

    return await signUp({

        username: cleanEmail,

        password,

        options: {

            userAttributes: {

                email: cleanEmail,

                name: cleanName

            }

        }

    });

};


// =========================================================
// CONFIRMAR REGISTRO
// =========================================================

export const confirmRegistration = async (
    email: string,
    code: string
) => {

    return await confirmSignUp({

        username:
            email.trim().toLowerCase(),

        confirmationCode:
            code.trim()

    });

};


// =========================================================
// REENVIAR CÓDIGO DE REGISTRO
// =========================================================

export const resendRegistrationCode = async (
    email: string
) => {

    return await resendSignUpCode({

        username:
            email.trim().toLowerCase()

    });

};


// =========================================================
// ENVIAR CÓDIGO PARA RESTABLECER CONTRASEÑA
// =========================================================

export const sendPasswordResetCode = async (
    email: string
) => {

    return await resetPassword({

        username:
            email.trim().toLowerCase()

    });

};


// =========================================================
// CONFIRMAR NUEVA CONTRASEÑA
// =========================================================

export const confirmPasswordReset = async (
    email: string,
    code: string,
    newPassword: string
) => {

    return await confirmResetPassword({

        username:
            email.trim().toLowerCase(),

        confirmationCode:
            code.trim(),

        newPassword

    });

};
