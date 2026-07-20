import React, { useState } from 'react';

export default function Tournaments({
  tournaments,
  loadingTournaments,
  setShowTourneyModal,
  setRegisteringTourney,
  translations,
  lang,
  t,
  currentUser,
  token,
  onLeaveTournament,
  onDeleteTournament,
}) {
  const [expandedTourneyId, setExpandedTourneyId] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [matches, setMatches] = useState({});
  const [riotLoading, setRiotLoading] = useState(false);

  const API_URL = 'https://zabesports-api-aje2efc6adawfyh0.eastus2-01.azurewebsites.net';

  const handleLinkRiot = async (tourneyId) => {
    try {
      setRiotLoading(true);
      const res = await fetch(`${API_URL}/api/tournaments/${tourneyId}/register-riot`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Torneo vinculado exitosamente con Riot Games!');
        window.location.reload(); // Para refrescar el estado del torneo
      } else {
        alert(data.error || 'Error al vincular con Riot');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setRiotLoading(false);
    }
  };

  const handleGenerateMatch = async (tourneyId, team1_name, team2_name) => {
    if (!team1_name || !team2_name) return alert('Debes seleccionar 2 equipos');
    try {
      setRiotLoading(true);
      const res = await fetch(`${API_URL}/api/tournaments/${tourneyId}/generate-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ team1_name, team2_name })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Código de torneo generado!');
        toggleExpand(tourneyId); // recargar
      } else {
        alert(data.error || 'Error al generar código');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setRiotLoading(false);
    }
  };


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
      const resMatches = await fetch(`${API_URL}/api/tournaments/${tourneyId}/matches`);
      if (resMatches.ok) {
        const mData = await resMatches.json();
        setMatches(prev => ({...prev, [tourneyId]: mData}));
      }
    } catch (err) {
      console.error('Error al obtener datos del torneo:', err);
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
                  {/* Botón Anular Inscripción */}
                  {tourney.organizer_username === currentUser?.username && onDeleteTournament && (
                    <button
                      className="btn-primary"
                      style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                      onClick={() => onDeleteTournament(tourney.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                  {tourney.organizer_username !== currentUser?.username && onLeaveTournament && (
                    <button
                      className="btn-primary"
                      style={{ background: 'none', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                      onClick={() => onLeaveTournament(tourney.id)}
                    >
                      🚪 Anular Inscripción
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

                  {/* SECCION RIOT TOURNAMENT API (Panel del Organizador y Partidas) */}
                  <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(235, 20, 76, 0.05)', border: '1px solid rgba(235, 20, 76, 0.3)', borderRadius: '8px' }}>
                    <h5 style={{ fontSize: '1rem', color: '#eb144c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>👊</span> Riot Games Tournament API
                    </h5>
                    
                    {tourney.organizer_username === currentUser?.username && (
                      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                          Como organizador, puedes vincular este torneo a Riot Games para generar Tournament Codes oficiales.
                        </p>
                        {!tourney.riot_tournament_id ? (
                          <button 
                            className="btn-primary" 
                            style={{ background: '#eb144c', border: 'none' }}
                            onClick={() => handleLinkRiot(tourney.id)}
                            disabled={riotLoading}
                          >
                            {riotLoading ? 'Vinculando...' : '🔗 Vincular con Riot Games'}
                          </button>
                        ) : (
                          <div>
                            <span style={{ display: 'inline-block', marginBottom: '1rem', padding: '0.3rem 0.6rem', background: 'rgba(0, 255, 100, 0.1)', color: '#00ff64', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #00ff64' }}>
                              ✅ Torneo Vinculado (Riot ID: {tourney.riot_tournament_id})
                            </span>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <select id={`team1-${tourney.id}`} style={{ padding: '0.5rem', background: 'var(--bg-darker)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                <option value="">Selecciona Equipo 1</option>
                                {registeredTeams.map(t => <option key={t.team_id} value={t.team_name}>{t.team_name}</option>)}
                              </select>
                              <span style={{ color: 'var(--text-muted)' }}>VS</span>
                              <select id={`team2-${tourney.id}`} style={{ padding: '0.5rem', background: 'var(--bg-darker)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                <option value="">Selecciona Equipo 2</option>
                                {registeredTeams.map(t => <option key={t.team_id} value={t.team_name}>{t.team_name}</option>)}
                              </select>
                              <button 
                                className="btn-primary"
                                style={{ background: 'linear-gradient(135deg, #eb144c, #ff4b72)', border: 'none' }}
                                disabled={riotLoading}
                                onClick={() => {
                                  const t1 = document.getElementById(`team1-${tourney.id}`).value;
                                  const t2 = document.getElementById(`team2-${tourney.id}`).value;
                                  handleGenerateMatch(tourney.id, t1, t2);
                                }}
                              >
                                {riotLoading ? 'Generando...' : '⚔️ Generar Código de Torneo'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <h6 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '1rem' }}>Llaves y Códigos Activos</h6>
                      {!matches[tourney.id] || matches[tourney.id].length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay partidas generadas con código de Riot aún.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {matches[tourney.id].map(match => (
                            <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.8rem 1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ fontWeight: '500', color: '#fff' }}>
                                {match.team1_name} <span style={{ color: '#eb144c', margin: '0 0.5rem' }}>VS</span> {match.team2_name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontFamily: 'monospace', background: '#000', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #333', color: '#00ff64', userSelect: 'all' }}>
                                  {match.tournament_code}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{match.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
