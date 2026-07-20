import cron from 'node-cron';
import pool from '../db/pool';
import { generateBracketsForTournament } from './bracketService';

// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    // 1. Auto-start tournaments: 
    // Find tournaments that are OPEN, published, and start_date + 15 minutes has passed.
    // In our DB start_date holds both date and time as a TIMESTAMP.
    // But wait, the front-end sends start_date and start_time separately? Let's check tournaments table.
    // Actually, start_date is a TIMESTAMP WITH TIME ZONE.
    // Let's assume start_date contains the full timestamp.

    const tournamentsToStart = await pool.query(`
      SELECT id, name
      FROM tournaments
      WHERE status = 'OPEN' 
        AND is_published = TRUE
        AND is_approved = TRUE
        AND (start_date + INTERVAL '15 minutes') <= NOW()
    `);

    for (const t of tournamentsToStart.rows) {
      console.log(`[Cron] Auto-starting tournament: ${t.name} (ID: ${t.id})`);
      try {
        await generateBracketsForTournament(t.id);
      } catch (e: any) {
        console.error(`[Cron] Failed to auto-start tournament ${t.id}:`, e.message);
      }
    }

    // 2. Auto-forfeit matches:
    // Find matches that are PENDIENTE, have a checkin_deadline that has passed,
    // and where one team checked in but the other didn't.
    const expiredMatches = await pool.query(`
      SELECT id, tournament_id, team1_id, team2_id, team1_checkin, team2_checkin
      FROM tournament_matches
      WHERE status = 'PENDIENTE'
        AND checkin_deadline <= NOW()
        AND (team1_checkin = TRUE OR team2_checkin = TRUE)
        AND NOT (team1_checkin = TRUE AND team2_checkin = TRUE)
    `);

    for (const m of expiredMatches.rows) {
      console.log(`[Cron] Auto-forfeiting match ${m.id}`);
      
      let winnerId = null;
      let winnerName = null;
      
      if (m.team1_checkin && !m.team2_checkin) {
        winnerId = m.team1_id;
        const teamRes = await pool.query('SELECT name FROM teams WHERE id = $1', [winnerId]);
        winnerName = teamRes.rows[0]?.name;
      } else if (m.team2_checkin && !m.team1_checkin) {
        winnerId = m.team2_id;
        const teamRes = await pool.query('SELECT name FROM teams WHERE id = $1', [winnerId]);
        winnerName = teamRes.rows[0]?.name;
      }

      if (winnerId && winnerName) {
        await pool.query(`
          UPDATE tournament_matches
          SET status = 'COMPLETADO', winner_team_id = $1, winner_team_name = $2
          WHERE id = $3
        `, [winnerId, winnerName, m.id]);
        
        // Advance winner if there is a next_match_id logic implemented
        // (Currently next_match_id isn't fully utilized in our basic bracket builder, 
        // so we'll just set it to COMPLETADO).
      }
    }
  } catch (err) {
    console.error('[Cron] Error running periodic tasks:', err);
  }
});
