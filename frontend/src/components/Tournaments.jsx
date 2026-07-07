import React, { useState } from 'react';

export default function Tournaments({
  tournaments,
  loadingTournaments,
  setShowTourneyModal,
  setRegisteringTourney,
  translations,
  lang,
  t
}) {
  const [expandedTourneyId, setExpandedTourneyId] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const API_URL = 'https://zabesports-api-aje2efc6adawfyh0.eastus2-01.azurewebsites.net';

  const toggleExpand = async (tourneyId) => {
    if (expandedTourneyId === tourneyId) {
      setExpandedTourneyId(null);
      setRegisteredTeams([]);
      return;
    }
    
    setExpandedTourneyId(tourneyId);
    setLoadingTeams(true);
    setRegisteredTeams([]);
    
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${tourneyId}/teams`);
      if (res.ok) {
        const data = await res.json();
        setRegisteredTeams(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error al obtener equipos de Battlefy:', err);
    } finally {
      setLoadingTeams(false);
    }
  };

  return (
    <div>
      <header className="header">
        <h1>Global Elite Showdown</h1>
        <button className="btn-primary" onClick={() => setShowTourneyModal(true)}>
          {t.createTournament}
        </button>
      </header>

      {loadingTournaments && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          ⏳ Cargando torneos...
        </div>
      )}

      <div className="tournament-list">
        {tournaments.map(tourney => {
          const isExpanded = expandedTourneyId === tourney.id;
          return (
            <div key={tourney.id} className="card" style={{ padding: '1.5rem', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              <div className="tournament-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="tournament-info" style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {tourney.name}
                    <span className={`status-badge ${tourney.is_approved ? 'open' : 'badge-pending'}`}>
                      {tourney.is_approved ? 'APROBADO' : 'PENDIENTE'}
                    </span>
                  </h4>
                  <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{tourney.description}</p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>📅 {new Date(tourney.start_date).toLocaleDateString('es-CL')}</span>
                    <span>👥 {tourney.registered_teams}/{tourney.max_teams} {translations[lang].registeredTeams}</span>
                    {tourney.prize_pool && <span>🏆 {tourney.prize_pool}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => toggleExpand(tourney.id)}
                    className="btn-primary"
                    style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-light)' }}
                  >
                    {isExpanded ? '🔼 Ocultar Rosters' : '🛡️ Ver Equipos'}
                  </button>
                  {tourney.is_approved ? (
                    <button 
                      onClick={() => setRegisteringTourney(tourney.id)} 
                      className="btn-primary" 
                      style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}
                    >
                      Inscribir Escuadra
                    </button>
                  ) : (
                    <button className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
                      Bloqueado
                    </button>
                  )}
                </div>
              </div>

              {/* DETALLE DE EQUIPOS Y JUGADORES */}
              {isExpanded && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🛡️ Roster Oficial del Torneo
                  </h5>
                  {loadingTeams && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>⏳ Consultando escuadras de la Grieta del Invocador...</p>}
                  {!loadingTeams && registeredTeams.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      No hay equipos inscritos en este torneo todavía. ¡Inscribe tu escuadra arriba!
                    </p>
                  )}
                  {!loadingTeams && registeredTeams.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {registeredTeams.map(team => (
                        <div 
                          key={team.team_id} 
                          style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '1rem' }}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🛡️ {team.team_name}</span>
                            <span style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--accent-purple)' }}>
                              Capitán: {team.captain_username}
                            </span>
                          </div>
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {team.members.map(member => (
                              <li 
                                key={member.id} 
                                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}
                              >
                                <span>
                                  👤 {member.riot_game_name ? `${member.riot_game_name}#${member.riot_tag_line}` : member.username}
                                </span>
                                <span style={{ color: 'var(--accent-cyan)', fontWeight: '500' }}>
                                  {member.lol_rank || 'UNRANKED'} (Lv.{member.lol_summoner_level || 0})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!loadingTournaments && tournaments.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            {t.noTournaments}
          </div>
        )}
      </div>
    </div>
  );
}
