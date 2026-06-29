import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ============================================================
// Tipos
// ============================================================
interface Community {
  id: string;
  name: string;
  description: string;
  game: string;
  is_approved: boolean;
  owner_username: string;
  member_count: number;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  game: string;
  start_date: string;
  max_teams: number;
  status: string;
  is_approved: boolean;
  prize_pool: string | null;
  registered_teams: number;
  organizer_username: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  likes: number;
  author_username: string;
  community_name: string;
  created_at: string;
}

interface Player {
  id: string;
  username: string;
  position: string;
  rank: string;
  winrate: string;
  kda: string;
  availability: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

// ============================================================
// Componente principal
// ============================================================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  const [activeTab, setActiveTab] = useState('dashboard');

  // Datos desde la API
  const [communities, setCommunities] = useState<Community[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  // Estados de carga
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Filtros de reclutamiento
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedRank, setSelectedRank] = useState('ALL');

  // ============================================================
  // Carga de datos desde la API
  // ============================================================
  useEffect(() => {
    if (!isLoggedIn) return;

    // Cargar comunidades
    setLoadingCommunities(true);
    fetch(`${API_URL}/api/communities`)
      .then(r => r.json())
      .then(data => { setCommunities(Array.isArray(data) ? data : []); })
      .catch(() => setCommunities([]))
      .finally(() => setLoadingCommunities(false));

    // Cargar torneos
    setLoadingTournaments(true);
    fetch(`${API_URL}/api/tournaments`)
      .then(r => r.json())
      .then(data => { setTournaments(Array.isArray(data) ? data : []); })
      .catch(() => setTournaments([]))
      .finally(() => setLoadingTournaments(false));

    // Cargar posts
    setLoadingPosts(true);
    fetch(`${API_URL}/api/posts`)
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); })
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));

    // Cargar jugadores
    fetch(`${API_URL}/api/players`)
      .then(r => r.json())
      .then(data => { setPlayers(Array.isArray(data) ? data : []); })
      .catch(() => setPlayers([]));
  }, [isLoggedIn]);

  // ============================================================
  // Autenticación
  // ============================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Error al iniciar sesión');
        return;
      }

      setToken(data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch {
      setLoginError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    }
  };

  const handleDemoLogin = (role: string) => {
    // Login de demostración sin servidor (para mostrar el profesor)
    setCurrentUser({ id: 'demo', username: 'JoseSepúlveda', email: 'jose@zabesports.cl', role });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setToken('');
    setEmailInput('');
    setPasswordInput('');
    setPosts([]);
    setCommunities([]);
    setTournaments([]);
    setPlayers([]);
  };

  // ============================================================
  // Acciones con la API
  // ============================================================
  const handleLike = async (postId: string) => {
    if (!token) {
      // Modo demo: solo actualizar estado local
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: data.post.likes } : p));
      }
    } catch {
      // Fallback local
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    }
  };

  const handleApproveCommunity = async (id: string) => {
    if (!token) {
      setCommunities(communities.map(c => c.id === id ? { ...c, is_approved: true } : c));
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/communities/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCommunities(communities.map(c => c.id === id ? { ...c, is_approved: true } : c));
      }
    } catch {
      setCommunities(communities.map(c => c.id === id ? { ...c, is_approved: true } : c));
    }
  };

  const handleApproveTournament = async (id: string) => {
    if (!token) {
      setTournaments(tournaments.map(t => t.id === id ? { ...t, is_approved: true } : t));
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTournaments(tournaments.map(t => t.id === id ? { ...t, is_approved: true } : t));
      }
    } catch {
      setTournaments(tournaments.map(t => t.id === id ? { ...t, is_approved: true } : t));
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchRole = selectedRole === 'ALL' || player.position === selectedRole;
    const matchRank = selectedRank === 'ALL' || (player.rank && player.rank.includes(selectedRank));
    return matchRole && matchRank;
  });

  const userRole = currentUser?.role || 'usuario';

  // ============================================================
  // PANTALLA LOGIN
  // ============================================================
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-box">ZE</div>
            <span className="login-logo-text">ZabEsports</span>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>E-sports Hub &amp; Communities</div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>BIENVENIDO</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Inicia sesión para continuar</p>

          {loginError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
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

          <div className="sso-divider">O ingresa en modo demo</div>

          <div className="sso-buttons">
            <button className="sso-btn" onClick={() => handleDemoLogin('admin')}>
              🛡️ Demo Admin (jose@zabesports.cl)
            </button>
            <button className="sso-btn" onClick={() => handleDemoLogin('usuario')}>
              🎮 Demo Usuario Final
            </button>
          </div>

          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', padding: '0.75rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--accent-purple)' }}>Credenciales DB:</strong> jose@zabesports.cl / password123
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
            ¿No tienes cuenta? <a href="#" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>Registrarse</a>
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // APLICACIÓN PRINCIPAL
  // ============================================================
  return (
    <div className="app-container">
      {/* SIDEBAR */}
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
            {(userRole === 'moderador' || userRole === 'admin') && (
              <li className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                🛡️ Moderación
              </li>
            )}
          </ul>
        </nav>

        <div className="user-profile-summary">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {currentUser?.username?.charAt(0).toUpperCase() || 'J'}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{currentUser?.username || 'José Sepúlveda'}</div>
              <span className="role-badge" style={{ marginTop: '0.1rem', display: 'inline-block' }}>{userRole}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="action-btn" style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.75rem' }}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">

        {/* VISTA: HOME/FEED */}
        {activeTab === 'dashboard' && (
          <div>
            <header className="header">
              <h1>Welcome back, {currentUser?.username || 'José'}!</h1>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {token ? '🟢 Conectado a la API' : '🟡 Modo Demo (sin DB)'}
              </span>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Community Feed</h2>

                {loadingPosts && (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    ⏳ Cargando posts desde la API...
                  </div>
                )}

                {!loadingPosts && posts.length === 0 && (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay posts disponibles. ¡Sé el primero en publicar!
                  </div>
                )}

                {posts.map(post => (
                  <article key={post.id} className="card">
                    <h3>
                      {post.title}
                      {post.community_name && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' }}>
                          {post.community_name}
                        </span>
                      )}
                    </h3>
                    <div className="post-meta">Publicado por @{post.author_username} • {new Date(post.created_at).toLocaleDateString('es-CL')}</div>
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
                  {loadingCommunities ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>⏳ Cargando...</p>
                  ) : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {communities.filter(c => c.is_approved).map(c => (
                        <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>🎮 {c.name}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {c.member_count >= 1000 ? `${(c.member_count/1000).toFixed(1)}k` : c.member_count} Miembros • {c.game}
                            </span>
                          </div>
                          <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Ver</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <h2 style={{ fontSize: '1.25rem', margin: '2rem 0 1.25rem' }}>Upcoming Events</h2>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tournaments.filter(t => t.is_approved && t.status === 'OPEN').slice(0, 3).map(t => (
                      <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>• {t.name.substring(0, 28)}...</span>
                        <span>{new Date(t.start_date).toLocaleDateString('es-CL')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: RECLUTAMIENTO */}
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
                  <option value="ALL">All Roles</option>
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
                  <h4>{player.username}</h4>
                  <div className="summoner-name">{player.rank}</div>

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
                    🕒 {player.availability}
                  </div>

                  <button className="btn-primary" style={{ width: '100%' }}>RECRUIT TO TEAM</button>
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No hay jugadores que coincidan con los filtros.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA: TORNEOS */}
        {activeTab === 'tournaments' && (
          <div>
            <header className="header">
              <h1>Global Elite Showdown</h1>
              <button className="btn-primary">+ Crear Torneo</button>
            </header>

            {loadingTournaments && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                ⏳ Cargando torneos desde la API...
              </div>
            )}

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
                      <span>📅 Fecha: {new Date(t.start_date).toLocaleDateString('es-CL')}</span>
                      <span>👥 Slots: {t.registered_teams}/{t.max_teams}</span>
                      {t.prize_pool && <span>🏆 Premio: {t.prize_pool}</span>}
                    </div>
                  </div>
                  <div>
                    {t.is_approved ? (
                      <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>
                        Inscribir Escuadra
                      </button>
                    ) : (
                      <button className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
                        Bloqueado
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!loadingTournaments && tournaments.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No hay torneos registrados aún.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA: MODERACIÓN */}
        {activeTab === 'moderation' && (
          <div>
            <header className="header">
              <h1>Panel de Moderación &amp; Aprobación</h1>
            </header>

            <div className="card">
              <h3>Comunidades Pendientes</h3>
              <table className="moderation-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Juego</th>
                    <th>Creador</th>
                    <th>Miembros</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.game}</td>
                      <td>@{c.owner_username}</td>
                      <td>{c.member_count}</td>
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
                    <th>Organizador</th>
                    <th>Fecha Inicio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>@{t.organizer_username}</td>
                      <td>{new Date(t.start_date).toLocaleDateString('es-CL')}</td>
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
