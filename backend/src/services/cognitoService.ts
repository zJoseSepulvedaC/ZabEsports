import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || 'us-east-1'
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

/**
 * Verifica si AWS Cognito está configurado mediante variables de entorno.
 */
export const isCognitoConfigured = (): boolean => {
  return !!(CLIENT_ID && USER_POOL_ID);
};

/**
 * Registra un nuevo usuario en AWS Cognito.
 */
export const registerUserInCognito = async (username: string, email: string, password: string): Promise<string> => {
  if (!isCognitoConfigured()) {
    throw new Error('AWS Cognito no está configurado.');
  }

  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email, // Usamos el email como el identificador único en Cognito
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'preferred_username', Value: username }
    ]
  });

  const response = await client.send(command);
  // Cognito retorna un UserSub (ID único del usuario en Cognito)
  if (!response.UserSub) {
    throw new Error('No se recibió el identificador único del usuario (UserSub) desde Cognito.');
  }
  return response.UserSub;
};

/**
 * Inicia sesión de un usuario en AWS Cognito y retorna sus tokens.
 */
export const loginUserInCognito = async (email: string, password: string): Promise<{ token: string; idToken: string }> => {
  if (!isCognitoConfigured()) {
    throw new Error('AWS Cognito no está configurado.');
  }

  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  });

  const response = await client.send(command);
  const authResult = response.AuthenticationResult;

  if (!authResult || !authResult.AccessToken || !authResult.IdToken) {
    throw new Error('Credenciales inválidas o error en la respuesta de Cognito.');
  }

  // Retornamos el AccessToken (para autorizar endpoints) y el IdToken (que contiene claims del usuario)
  return {
    token: authResult.AccessToken,
    idToken: authResult.IdToken
  };
};
