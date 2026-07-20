import dotenv from 'dotenv';

dotenv.config();

const RIOT_API_KEY = process.env.llave;
const TOURNAMENT_URL = 'https://americas.api.riotgames.com/lol/tournament/v5';

// Headers necesarios para las peticiones a Riot
const getHeaders = () => {
    if (!RIOT_API_KEY) {
        throw new Error('La variable de entorno "llave" para Riot API no está configurada.');
    }
    return {
        'X-Riot-Token': RIOT_API_KEY,
        'Content-Type': 'application/json'
    };
};

/**
 * 1. Registra tu aplicación como proveedor de torneos.
 * Retorna el providerId. (En producción esto debería hacerse solo una vez).
 */
export const registerProvider = async (callbackUrl: string, region: string = 'LAS'): Promise<number> => {
    try {
        const response = await fetch(`${TOURNAMENT_URL}/providers`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ region, url: callbackUrl })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error de Riot: ${JSON.stringify(data)}`);
        }
        return data; // Devuelve un int (providerId)
    } catch (error: any) {
        console.error('Error registrando provider en Riot:', error.message);
        throw new Error('No se pudo registrar el proveedor de torneos.');
    }
};

/**
 * 2. Registra un torneo de tu plataforma en los servidores de Riot.
 * Retorna el tournamentId de Riot.
 */
export const registerTournament = async (providerId: number, name: string): Promise<number> => {
    try {
        const response = await fetch(`${TOURNAMENT_URL}/tournaments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ providerId, name })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error de Riot: ${JSON.stringify(data)}`);
        }
        return data; // Devuelve un int (tournamentId)
    } catch (error: any) {
        console.error('Error registrando torneo en Riot:', error.message);
        throw new Error('No se pudo registrar el torneo en Riot.');
    }
};

/**
 * 3. Genera códigos de torneo para una partida.
 */
interface GenerateCodeParams {
    tournamentId: number;
    teamSize: number;        // ej. 5
    mapType: string;         // ej. "SUMMONERS_RIFT"
    pickType: string;        // ej. "TOURNAMENT_DRAFT"
    spectatorType: string;   // ej. "ALL" o "LOBBYONLY"
    allowedParticipants?: string[]; // PUUIDs (opcional en Stub, vital en Prod)
}

export const generateTournamentCodes = async (params: GenerateCodeParams, count: number = 1): Promise<string[]> => {
    try {
        const url = `${TOURNAMENT_URL}/codes?tournamentId=${params.tournamentId}&count=${count}`;
        const body = {
            teamSize: params.teamSize,
            mapType: params.mapType,
            pickType: params.pickType,
            spectatorType: params.spectatorType,
            allowedParticipants: params.allowedParticipants || []
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error de Riot: ${JSON.stringify(data)}`);
        }
        return data; // Devuelve un array de strings (los códigos)
    } catch (error: any) {
        console.error('Error generando códigos de torneo:', error.message);
        throw new Error('No se pudieron generar los códigos de torneo.');
    }
};
