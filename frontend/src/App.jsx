import React, { useState } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Usuario'); // Cambia el rol simulado para pruebas

  // Datos simulados/API
  const [communities, setCommunities] = useState([
    { id: '1', name: 'The Gladiators Clan', description: 'Comunidad principal de reclutamiento y torneos.', owner: 'JoseSepulveda', is_approved: true, members: 2400 },
    { id: '2', name: 'FNatic Fan Club', description: 'Club oficial de fanáticos de FNatic en Latinoamérica.', owner: 'ZabPlayer', is_approved: true, members: 3100 },
    { id: '3', name: 'Apex Legends Competitive', description: 'Comunidad para coordinar escuadras competitivas de Apex.', owner: 'GamerGirl99', is_approved: false, members: 18 }
  ]);

  const [tournaments, setTournaments] = useState([
    { id: '1', name: 'VCT: Masters Madrid - Grand Final', description: 'Evento final presencial retransmitido. 5v5 oficial.', start_date: '2026-07-10', max_teams: 16, status: 'OPEN', is_approved: true, registered: 16 },
    { id: '2', name: 'FNatic Qualifier: Semi-Finals', description: 'Clasificatorias para representar al club de fans de FNatic.', start_date: '2026-06-28', max_teams: 8, status: 'OPEN', is_approved: true, registered: 4 },
    { id: '3', name: 'Apex Legends Global Series (ALGS)', description: 'Torneo clasificatorio amateur de Apex Legends para escuadras de 3.', start_date: '2026-07-20', max_teams: 20, status: 'OPEN', is_approved: false, registered: 2 }
  ]);

  const [players, setPlayers] = useState([
    { id: 1, name: 'knghtfyre', summoner: 'Duoc Jose #LAS', rank: 'Diamond I', position: 'TOP', availability: 'Tardes/Noches', winrate: '82.5%', kda: '3.7 / 1.2' },
    { id: 2, name: 'Lunar_Void', summoner: 'ZabLoL #LAS', rank: 'Master', position: 'JUNGLE', availability: 'Fines de semana', winrate: '99.7%', kda: '4.3 / 3.1' },
    { id: 3, name: 'EclipsePro', summoner: 'Eclipse #LAS', rank: 'Challenger', position: 'MID', availability: 'Lunes a Viernes', winrate: '85.3%', kda: '5.3 / 1.4' },
    { id: 4, name: 'SwiftShot', summoner: 'ShadowWalk #LAS', rank: 'Diamond II', position: 'ADC', availability: 'Noche', winrate: '50.5%', kda: '4.3 / 2.0' }
  ]);

  const [posts, setPosts] = useState([
    { id: 1, author: 'Alex R.', title: 'VCT: Masters Madrid - Grand Final', content: '¡Espectacular final este fin de semana! Los esperamos a todos en la sala principal de Discord para la retransmisión oficial y las reacciones en directo.', target: 'The Gladiators Clan', likes: 142 },
    { id: 2, author: 'knghtfyre', title: 'Buscamos Mid Laner suplente para ALGS', content: 'De preferencia rango Diamante o superior para completar la alineación titular. Buena comunicación por Discord y disponibilidad en las noches.', target: 'Apex Legends Competitive', likes: 28 }
  ]);

  // Filtros de reclutamiento
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedRank, setSelectedRank] = useState('ALL');

  // Control de login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

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

  // RENDER PANTALLA DE INICIO DE SESIÓN (Mockup 1)
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-box">ZE</div>
            <span className="login-logo-text">ZabEsports</span>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>E-sports Hub & Communities</div>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>BIENVENIDO</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Inicia sesión para continuar</p>

          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <label>Correo Electrónico / Nombre de Usuario</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="ejemplo@correo.com" 
                required 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                required 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
              <a href="#" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btn-login">INICIAR SESIÓN</button>
          </form>

          <div className="sso-divider">O continúa con</div>

          <div className="sso-buttons">
            <button className="sso-btn" onClick={() => setIsLoggedIn(true)}>
              <span style={{ color: '#ff9900', fontWeight: 'bold' }}>aws</span> Ingresar con AWS Cognito
            </button>
            <button className="sso-btn" onClick={() => setIsLoggedIn(true)}>
              🎮 Iniciar con Discord
            </button>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
            ¿No tienes cuenta? <a href="#" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>Registrarse</a>
          </p>
        </div>
      </div>
    );
  }

  // RENDER APLICACIÓN PRINCIPAL (Mockups 2, 3 y 4)
  return (
    <div className="app-container">
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">ZE</div>
          <span className="logo-text">ZabEsports</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              🏠 Home (Feed)
            </li>
            <li className={`nav-item ${activeTab === 'recruitment' ? 'active' : ''}`} onClick={() => setActiveTab('recruitment')}>
              🤝 Reclutamiento
            </li>
            <li className={`nav-item ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
              🏆 Torneos
            </li>
            {(userRole === 'Moderador' || userRole === 'Admin') && (
              <li className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                🛡️ Moderación
              </li>
            )}
          </ul>
        </nav>

        <div className="user-profile-summary">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>J</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>José Sepúlveda</div>
              <span className="role-badge" style={{ marginTop: '0.1rem', display: 'inline-block' }}>{userRole}</span>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cambiar Rol (Demo):</label>
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value)}
              className="select-filter" 
              style={{ fontSize: '0.75rem', width: '100%', padding: '0.3rem', marginTop: '0.2rem' }}
            >
              <option value="Usuario">Usuario Final</option>
              <option value="Moderador">Moderador</option>
              <option value="Admin">Administrador</option>
            </select>
          </div>
          
          <button onClick={() => setIsLoggedIn(false)} className="action-btn" style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.5rem' }}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        
        {/* VISTA: HOME/FEED (Mockup 2) */}
        {activeTab === 'dashboard' && (
          <div>
            <header className="header">
              <h1>Welcome back, José!</h1>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Próxima Partida: 18:30 BST</span>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Community Feed</h2>
                
                {posts.map(post => (
                  <article key={post.id} className="card">
                    <h3>
                      {post.title} 
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>{post.target}</span>
                    </h3>
                    <div className="post-meta">Publicado por @{post.author} • Hace 10 min</div>
                    <div className="post-body">{post.content}</div>
                    <div className="post-actions">
                      <button className="action-btn" onClick={() => handleLike(post.id)}>❤️ Reacciones ({post.likes})</button>
                      <button className="action-btn">💬 Comentar</button>
                      <button className="action-btn report" style={{ marginLeft: 'auto' }}>⚠️ Reportar</button>
                    </div>
                  </article>
                ))}
              </div>

              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Active Communities</h2>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {communities.filter(c => c.is_approved).map(c => (
                      <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>🎮 {c.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.members >= 1000 ? `${(c.members/1000).toFixed(1)}k` : c.members} Miembros • Activos</span>
                        </div>
                        <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Ver</button>
                      </li>
                    ))}
                  </ul>
                </div>

                <h2 style={{ fontSize: '1.25rem', margin: '2rem 0 1.25rem' }}>Upcoming Events</h2>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>• VCT: Masters Madrid</span>
                      <span>18:30</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--accent-purple)' }}>• CS2 Masters Duoc</span>
                      <span>19:00</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: RECLUTAMIENTO / TEAM BUILDER (Mockup 3) */}
        {activeTab === 'recruitment' && (
          <div>
            <header className="header">
              <h1>TEAM BUILDER</h1>
              <button className="btn-primary">Postularme</button>
            </header>

            <div className="filters-bar" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Posición:</label>
                <select className="select-filter" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="ALL">All Ranks</option>
                  <option value="TOP">Top</option>
                  <option value="JUNGLE">Jungle</option>
                  <option value="MID">Mid</option>
                  <option value="ADC">ADC</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>

              <div>
                <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rango (Elo):</label>
                <select className="select-filter" value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)}>
                  <option value="ALL">All Ranks</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Master">Master</option>
                  <option value="Challenger">Challenger</option>
                </select>
              </div>
            </div>

            <div className="player-grid">
              {filteredPlayers.map(player => (
                <div key={player.id} className="player-card">
                  <span className="player-role-banner">{player.position}</span>
                  <div className="player-avatar-container">
                    <div className="player-avatar-inner">👤</div>
                  </div>
                  <h4>{player.name}</h4>
                  <div className="summoner-name">{player.summoner}</div>
                  
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-label">Win Rate</span>
                      <span className="stat-val" style={{ color: 'var(--success)' }}>{player.winrate}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">KDA</span>
                      <span className="stat-val">{player.kda}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    🕒 Disponibilidad: {player.availability}
                  </div>

                  <button className="btn-primary" style={{ width: '100%' }}>RECRUIT TO TEAM</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA: TORNEOS (Mockup 4) */}
        {activeTab === 'tournaments' && (
          <div>
            <header className="header">
              <h1>Global Elite Showdown</h1>
              <button className="btn-primary">+ Crear Torneo</button>
            </header>

            <div className="tournament-list">
              {tournaments.map(t => (
                <div key={t.id} className="tournament-row">
                  <div className="tournament-info">
                    <h4>
                      {t.name}
                      <span className={`status-badge ${t.is_approved ? 'open' : 'badge-pending'}`} style={{ marginLeft: '1rem' }}>
                        {t.is_approved ? 'APROBADO' : 'PENDIENTE'}
                      </span>
                    </h4>
                    <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.description}</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>📅 Fecha: {t.start_date}</span>
                      <span>👥 Slots: {t.registered}/{t.max_teams}</span>
                    </div>
                  </div>
                  <div>
                    {t.is_approved ? (
                      <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>Inscribir Escuadra</button>
                    ) : (
                      <button className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>Bloqueado</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA: PANEL MODERACIÓN */}
        {activeTab === 'moderation' && (
          <div>
            <header className="header">
              <h1>Panel de Moderación & Aprobación</h1>
            </header>

            <div className="card">
              <h3>Comunidades Pendientes</h3>
              <table className="moderation-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Creador</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>@{c.owner}</td>
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
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>Torneos Pendientes</h3>
              <table className="moderation-table">
                <thead>
                  <tr>
                    <th>Torneo</th>
                    <th>Fecha Inicio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.start_date}</td>
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
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completado</span>
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
