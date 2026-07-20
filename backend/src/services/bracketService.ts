import pool from '../db/pool';
import { generateTournamentCodes } from './riotTournamentService';

/** Builds the bracket structure for an elimination tournament */
export function buildEliminationBracket(teams: Array<{id: string; name: string}>): Array<{ round: number; matchNum: number; team1: {id: string; name: string} | null; team2: {id: string; name: string} | null }> {
  const n = teams.length;
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)));
  const byes = nextPow2 - n;

  // Pad with BYE slots
  const seeded: (typeof teams[0] | null)[] = [...teams];
  for (let i = 0; i < byes; i++) seeded.push(null);

  const matches: Array<{ round: number; matchNum: number; team1: typeof teams[0] | null; team2: typeof teams[0] | null }> = [];
  let matchNum = 1;
  for (let i = 0; i < seeded.length; i += 2) {
    matches.push({ round: 1, matchNum: matchNum++, team1: seeded[i], team2: seeded[i + 1] });
  }
  return matches;
}

/** Builds round-robin matches (every team vs every other) */
export function buildRoundRobinBracket(teams: Array<{id: string; name: string}>): Array<{ round: number; matchNum: number; team1: {id: string; name: string}; team2: {id: string; name: string} }> {
  const matches: Array<{ round: number; matchNum: number; team1: typeof teams[0]; team2: typeof teams[0] }> = [];
  let matchNum = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ round: 1, matchNum: matchNum++, team1: teams[i], team2: teams[j] });
    }
  }
  return matches;
}

export async function generateBracketsForTournament(tournamentId: string) {
  const tourneyResult = await pool.query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
  if (tourneyResult.rows.length === 0) throw new Error('Tournament not found');
  const tourney = tourneyResult.rows[0];

  const teamsResult = await pool.query(`
    SELECT DISTINCT t.id, t.name AS team_name
    FROM tournament_registrations tr
    JOIN teams t ON t.id = tr.team_id
    WHERE tr.tournament_id = $1
  `, [tournamentId]);

  if (teamsResult.rows.length < 2) {
    throw new Error('Se necesitan al menos 2 equipos para generar brackets.');
  }

  const teamList = teamsResult.rows.map((r: { id: string; team_name: string }) => ({ id: r.id, name: r.team_name }));
  for (let i = teamList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teamList[i], teamList[j]] = [teamList[j], teamList[i]];
  }

  await pool.query('DELETE FROM tournament_matches WHERE tournament_id = $1', [tournamentId]);

  let matchRows: Array<{ round: number; matchNum: number; team1: {id: string, name: string} | null; team2: {id: string, name: string} | null }> = [];
  const bracketType = tourney.bracket_type || 'elimination';
  if (bracketType === 'round_robin') {
    matchRows = buildRoundRobinBracket(teamList);
  } else {
    matchRows = buildEliminationBracket(teamList);
  }

  const checkinDeadline = new Date(Date.now() + 15 * 60000);

  const insertedMatches = [];
  for (const m of matchRows) {
    const isBye = !m.team2;
    const status = isBye ? 'BYE' : 'PENDIENTE';
    const matchResult = await pool.query(`
      INSERT INTO tournament_matches
        (tournament_id, team1_id, team1_name, team2_id, team2_name, status, round_num, match_num, checkin_deadline, tournament_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [tournamentId, m.team1?.id || null, m.team1?.name || null, m.team2?.id || null, m.team2?.name || null, status, m.round, m.matchNum, checkinDeadline, '']);
    insertedMatches.push(matchResult.rows[0]);
  }

  await pool.query(`UPDATE tournaments SET status = 'ONGOING', updated_at = NOW() WHERE id = $1`, [tournamentId]);
  return insertedMatches;
}
