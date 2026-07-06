import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import https from 'https';
import { query } from '../db/pool';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const REGION = process.env.COGNITO_REGION || 'us-east-1';

// Cache para almacenar las llaves públicas de Cognito y evitar llamadas recurrentes
let cognitoKeysCache: any[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Obtiene las llaves públicas (JWKS) desde los servidores de AWS Cognito.
 */
const fetchCognitoKeys = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (cognitoKeysCache.length > 0 && (Date.now() - cacheTimestamp < CACHE_TTL)) {
      resolve(cognitoKeysCache);
      return;
    }

    const jwksUri = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
    https.get(jwksUri, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const { keys } = JSON.parse(data);
          if (Array.isArray(keys)) {
            cognitoKeysCache = keys;
            cacheTimestamp = Date.now();
            resolve(keys);
          } else {
            reject(new Error('Formato JWKS inválido recibido desde Cognito.'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => reject(err));
  });
};

/**
 * Obtiene la clave pública correspondiente en formato PEM utilizando el módulo nativo crypto de Node.js.
 */
const getPublicKeyPem = async (kid: string): Promise<string> => {
  const keys = await fetchCognitoKeys();
  const jwk = keys.find(k => k.kid === kid);
  if (!jwk) {
    throw new Error(`Llave pública con kid ${kid} no encontrada en el JWKS de Cognito.`);
  }

  // Importar el JWK nativamente
  const publicKey = crypto.createPublicKey({
    format: 'jwk',
    key: jwk
  });

  return publicKey.export({ type: 'spki', format: 'pem' }) as string;
};

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    return;
  }

  // Si Cognito está configurado, verificamos su JWT RS256 de manera nativa
  if (USER_POOL_ID && process.env.COGNITO_CLIENT_ID) {
    try {
      const decodedToken: any = jwt.decode(token, { complete: true });
      if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
        res.status(403).json({ error: 'Token de Cognito malformado.' });
        return;
      }

      const kid = decodedToken.header.kid;
      const pem = await getPublicKeyPem(kid);

      jwt.verify(token, pem, { algorithms: ['RS256'] }, async (err, decoded: any) => {
        if (err || !decoded) {
          res.status(403).json({ error: 'Token de Cognito inválido o expirado.' });
          return;
        }

        try {
          const sub = decoded.sub; // ID único del usuario en Cognito (UserSub)
          const result = await query(
            'SELECT id, username, email, role FROM users WHERE id = $1',
            [sub]
          );

          if (result.rows.length === 0) {
            res.status(403).json({ error: 'Usuario autenticado en Cognito, pero no registrado en base de datos local.' });
            return;
          }

          req.user = result.rows[0];
          next();
        } catch (dbErr) {
          console.error('Error al verificar usuario de Cognito en base de datos:', dbErr);
          res.status(500).json({ error: 'Error interno del servidor.' });
        }
      });
    } catch (err) {
      console.error('Error en middleware de autenticación Cognito:', err);
      res.status(403).json({ error: 'Token de Cognito inválido o expirado.' });
    }
  } else {
    // Fallback local con JWT simétrico (HMAC)
    try {
      const secret = process.env.JWT_SECRET || 'zabesports_dev_secret';
      const decoded = jwt.verify(token, secret) as AuthRequest['user'];
      req.user = decoded;
      next();
    } catch {
      res.status(403).json({ error: 'Token inválido o expirado.' });
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'No tienes permisos para esta acción.' });
      return;
    }
    next();
  };
};
