import { Amplify } from 'aws-amplify';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: 'us-east-1_UUxJ24QzU',
            userPoolClientId: '1pertl4p9uja06gtqrfuu36qqs',
        },
    },
});