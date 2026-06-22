import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Usuario'); // Simula cambio de rol para pruebas

  // Estados de datos simulados/API
  const [communities, setCommunities] = useState([
    { id: '1', name: 'League of Legends Chile', description: 'Comunidad principal para coordinar torneos amateur y scrims.', owner: 'JoseSepulveda', is_approved: true, members: 142 },
    { id: '2', name: 'Valorant VAV', description: 'Reclutamiento de equipos de Valorant y análisis de juego táctico.', owner: 'ZabPlayer', is_approved: false, members: 8 }
  ]);

  const [tournaments, setTournaments] = useState([
    { id: '1', name: 'Copa ZabEsports Invierno', description: 'Torneo 5v5 en la Grieta del Invocador. Inscripciones abiertas.', start_date: '2026-07-10', max_teams: 16, status: 'OPEN', is_approved: true, registered: 8 },
    { id: '2', name: 'Scrims Tier 1 Clash', description: 'Torneo express de fin de semana para escuadras Diamante+.', start_date: '2026-06-28', max_teams: 8, status: 'OPEN', is_approved: false, registered: 2 }
  ]);

  const [players, setPlayers] = useState([
    { id: 1, name: 'JoseSepulveda', summoner: 'Duoc Jose #LAS', rank: 'Diamond II', position: 'MID', availability: 'Tardes/Noches' },
    { id: 2, name: 'ZabPlayer', summoner: 'ZabLoL #LAS', rank: 'Gold I', position: 'ADC', availability: 'Fines de semana' },
    { id: 3, name: 'GamerGirl99', summoner: 'SupportQueen #LAS', rank: 'Platinum IV', position: 'SUPPORT', availability: 'Lunes a Viernes' },
    { id: 4, name: 'ShadowJungle', summoner: 'ShadowWalk #LAS', rank: 'Master', position: 'JUNGLE', availability: 'Noche' }
  ]);

  const [posts, setPosts] = useState([
    { id: 1, author: 'JoseSepulveda', title: 'Buscamos Mid Laner suplente', content: 'Para jugar el torneo de la próxima semana. De preferencia rango Platino o superior con buena comunicación.', target: 'League of Legends Chile', likes: 12 },
    { id: 2, author: 'ZabPlayer', title: 'Torneo Apertura lanzado!', content: 'Ya están abiertas las inscripciones para el torneo oficial. Revisen la sección de Torneos en el menú lateral.', target: 'Copa ZabEsports Invierno', likes: 25 }
  ]);

  // Filtros de reclutamiento
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedRank, setSelectedRank] = useState('ALL');

  // Acciones
  const handleLike = (postId) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, likes: post.likes + 1 } : post));
  };

  const handleApproveCommunity = (id) => {
    setCommunities(communities.map(c => c.id === id ? { ...c, is_approved: true } : c));
  };

  const handleApproveTournament = (id) => {
    setTournaments(tournaments.map(t => t.id === id ? { ...t, is_approved: true } : t));
  };

  const filteredPlayers = players.filter(player => {
    const matchRole = selectedRole === 'ALL' || player.position === selectedRole;
    const matchRank = selectedRank === 'ALL' || player.rank.includes(selectedRank);
    return matchRole && matchRank;
  });

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">Z</div>
          <span className="logo-text">ZabEsports</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              📰 Novedades (Feed)
            </li>
            <li className={`nav-item ${activeTab === 'recruitment' ? 'active' : ''}`} onClick={() => setActiveTab('recruitment')}>
              🔍 Reclutamiento
            </li>
            <li className={`nav-item ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
              🏆 Torneos Activos
            </li>
            {(userRole === 'Moderador' || userRole === 'Admin') && (
              <li className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                🛡️ Panel Moderación
              </li>
            )}
          </ul>
        </nav>

        <div className="user-profile-summary">
          <div style={{ fontWeight: 'bold' }}>JoseSepulveda</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duoc Jose #LAS</div>
          <span className="role-badge">{userRole}</span>
          
          {/* Selector de rol rápido para probar interfaces */}
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cambiar Rol (Demo):</label>
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value)}
              className="select-filter" 
              style={{ fontSize: '0.75rem', width: '100%', padding: '0.2rem' }}
            >
              <option value="Usuario">Usuario Final</option>
              <option value="Moderador">Moderador</option>
              <option value="Admin">Administrador</option>
            </select>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <header className="header">
              <h1>Novedades de la Comunidad</h1>
              <button className="btn-primary">+ Crear Publicación</button>
            </header>

            <div className="dashboard-grid">
              <div>
                {posts.map(post => (
                  <article key={post.id} className="card">
                    <h3>{post.title} <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{post.target}</span></h3>
                    <div className="post-meta">Publicado por @{post.author} • Hace unos momentos</div>
                    <p style={{ lineHeight: '1.6' }}>{post.content}</p>
                    <div className="post-actions">
                      <button className="action-btn" onClick={() => handleLike(post.id)}>👍 Reaccionar ({post.likes})</button>
                      <button className="action-btn">💬 Comentar</button>
                      <button className="action-btn" style={{ marginLeft: 'auto', color: 'var(--danger)' }}>⚠️ Reportar</button>
                    </div>
                  </article>
                ))}
              </div>

              <div>
                <div className="card">
                  <h3>Mis Comunidades</h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {communities.filter(c => c.is_approved).map(c => (
                      <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🎮 {c.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.members} miembros</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h3>Próximos Torneos</h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tournaments.filter(t => t.is_approved).map(t => (
                      <li key={t.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold' }}>🏆 {t.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Inicio: {t.start_date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: RECRUITMENT */}
        {activeTab === 'recruitment' && (
          <div>
            <header className="header">
              <h1>Agencia de Reclutamiento</h1>
              <button className="btn-primary">Postularme como Jugador</button>
            </header>

            <div className="filters-bar">
              <div>
                <label style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>Posición:</label>
                <select className="select-filter" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="ALL">Todas las posiciones</option>
                  <option value="MID">MID LANE</option>
                  <option value="ADC">ADC</option>
                  <option value="SUPPORT">SUPPORT</option>
                  <option value="JUNGLE">JUNGLE</option>
                  <option value="TOP">TOP LANE</option>
                </select>
              </div>

              <div>
                <label style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>Rango (Elo):</label>
                <select className="select-filter" value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)}>
                  <option value="ALL">Todos los Rangos</option>
                  <option value="Gold">Oro</option>
                  <option value="Platinum">Platino</option>
                  <option value="Diamond">Diamante</option>
                  <option value="Master">Maestro</option>
                </select>
              </div>
            </div>

            <div className="player-grid">
              {filteredPlayers.map(player => (
                <div key={player.id} className="player-card">
                  <div className="player-avatar">👤</div>
                  <h4>{player.name}</h4>
                  <div className="summoner-name">{player.summoner}</div>
                  
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-label">Posición</span>
                      <span className="stat-val">{player.position}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Rango</span>
                      <span className="stat-val">{player.rank}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    📅 Disponibilidad: {player.availability}
                  </div>

                  <button className="btn-primary" style={{ width: '100%', padding: '0.5rem' }}>Invitar a Escuadra</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: TOURNAMENTS */}
        {activeTab === 'tournaments' && (
          <div>
            <header className="header">
              <h1>Torneos Competitivos</h1>
              <button className="btn-primary">+ Organizar Torneo</button>
            </header>

            <div className="tournament-list">
              {tournaments.map(t => (
                <div key={t.id} className="tournament-row">
                  <div className="tournament-info">
                    <h4>{t.name} {!t.is_approved && <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>(Pendiente de Aprobación)</span>}</h4>
                    <p>{t.description}</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>📅 Fecha: {t.start_date}</span>
                      <span>👥 Equipos: {t.registered}/{t.max_teams}</span>
                      <span>⚡ Estado: <strong style={{ color: t.status === 'OPEN' ? 'var(--success)' : 'var(--text-muted)' }}>{t.status}</strong></span>
                    </div>
                  </div>
                  {t.is_approved ? (
                    <button className="btn-primary">Inscribirse</button>
                  ) : (
                    <button className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>Bloqueado</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MODERATION */}
        {activeTab === 'moderation' && (
          <div>
            <header className="header">
              <h1>Panel de Aprobación de Contenidos (Moderación)</h1>
            </header>

            <div className="card">
              <h3>Comunidades Pendientes de Aprobación</h3>
              <table className="moderation-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Creador</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>@{c.owner}</td>
                      <td>{c.description}</td>
                      <td>
                        <span className={`badge-status ${c.is_approved ? 'badge-approved' : 'badge-pending'}`}>
                          {c.is_approved ? 'APROBADO' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td>
                        {!c.is_approved ? (
                          <>
                            <button className="btn-small btn-approve" onClick={() => handleApproveCommunity(c.id)}>Aprobar</button>
                            <button className="btn-small btn-reject">Rechazar</button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ninguna acción pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>Torneos Pendientes de Aprobación</h3>
              <table className="moderation-table">
                <thead>
                  <tr>
                    <th>Torneo</th>
                    <th>Fecha Inicio</th>
                    <th>Cupos Máximos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.start_date}</td>
                      <td>{t.max_teams} Equipos</td>
                      <td>
                        <span className={`badge-status ${t.is_approved ? 'badge-approved' : 'badge-pending'}`}>
                          {t.is_approved ? 'APROBADO' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td>
                        {!t.is_approved ? (
                          <>
                            <button className="btn-small btn-approve" onClick={() => handleApproveTournament(t.id)}>Aprobar</button>
                            <button className="btn-small btn-reject">Rechazar</button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ninguna acción pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
