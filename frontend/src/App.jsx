import React, { useState, useEffect } from 'react';
import './App.css';

// URL del backend en producción en Azure App Service
const API_URL = 'https://zabesports-api-aje2efc6adawfyh0.eastus2-01.azurewebsites.net';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
  
  // Estados de Formulario de Auth
  const [emailInput, setEmailInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [communities, setCommunities] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [players, setPlayers] = useState([]);

  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedRank, setSelectedRank] = useState('ALL');

  // Estados de Vinculación de Riot
  const [riotGameName, setRiotGameName] = useState('');
  const [riotTagLine, setRiotTagLine] = useState('');
  const [riotRegion, setRiotRegion] = useState('LA2');
  const [linkingState, setLinkingState] = useState('idle'); // 'idle', 'linking', 'verifying', 'success'
  const [linkInfo, setLinkInfo] = useState(null);
  const [linkError, setLinkError] = useState('');

  // ============================================================
  // Carga de datos desde la API
  // ============================================================
  const fetchPlayers = () => {
    fetch(`${API_URL}/api/players`)
      .then(r => r.json())
      .then(data => setPlayers(Array.isArray(data) ? data : []))
      .catch(() => setPlayers([]));
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    setLoadingCommunities(true);
    fetch(`${API_URL}/api/communities`)
      .then(r => r.json())
      .then(data => setCommunities(Array.isArray(data) ? data : []))
      .catch(() => setCommunities([]))
      .finally(() => setLoadingCommunities(false));

    setLoadingTournaments(true);
    fetch(`${API_URL}/api/tournaments`)
      .then(r => r.json())
      .then(data => setTournaments(Array.isArray(data) ? data : []))
      .catch(() => setTournaments([]))
      .finally(() => setLoadingTournaments(false));

    setLoadingPosts(true);
    fetch(`${API_URL}/api/posts`)
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));

    fetchPlayers();
  }, [isLoggedIn]);

  // ============================================================
  // Autenticación
  // ============================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Error al iniciar sesión');
        return;
      }
      setToken(data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch {
      setAuthError('No se pudo conectar con el servidor de Azure. Verifica la conexión.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Error al registrarse');
        return;
      }
      setAuthSuccess('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      setAuthMode('login');
      setPasswordInput('');
    } catch {
      setAuthError('No se pudo conectar con el servidor de Azure. Verifica la conexión.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setToken('');
    setEmailInput('');
    setUsernameInput('');
    setPasswordInput('');
    setPosts([]);
    setCommunities([]);
    setTournaments([]);
    setPlayers([]);
    setLinkingState('idle');
    setLinkInfo(null);
    setLinkError('');
  };

  // ============================================================
  // Vinculación de Riot Games
  // ============================================================
  const handleRiotLinkStart = async (e) => {
    e.preventDefault();
    setLinkError('');
    setLinkingState('linking');
    try {
      const res = await fetch(`${API_URL}/api/players/riot-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName: riotGameName, tagLine: riotTagLine, region: riotRegion })
      });
      const data = await res.json();
      if (!res.ok) {
        setLinkError(data.error || 'Error al iniciar vinculación');
        setLinkingState('idle');
        return;
      }
      setLinkInfo(data);
      setLinkingState('verifying');
    } catch {
      setLinkError('Error de red al conectar con el servidor.');
      setLinkingState('idle');
    }
  };

  const handleRiotLinkVerify = async () => {
    setLinkError('');
    try {
      const res = await fetch(`${API_URL}/api/players/riot-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puuid: linkInfo.puuid,
          gameName: linkInfo.gameName,
          tagLine: linkInfo.tagLine,
          targetIconId: linkInfo.targetIconId,
          userId: currentUser.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setLinkError(data.error || 'Icono no coincide');
        return;
      }
      
      // Actualizar usuario en sesión
      setCurrentUser(prev => ({
        ...prev,
        riot_summoner_name: data.riot_summoner_name,
        lol_rank: data.lol_rank,
        lol_summoner_level: data.lol_summoner_level
      }));
      setLinkingState('success');
      fetchPlayers();
    } catch {
      setLinkError('Error de red al conectar con el servidor.');
    }
  };

  // ============================================================
  // Acciones API
  // ============================================================
  const handleLike = async (postId) => {
    if (!token) return;
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
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    }
  };

  const handleApproveCommunity = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/communities/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCommunities(communities.map(c => c.id === id ? { ...c, is_approved: true } : c));
    } catch {
      setCommunities(communities.map(c => c.id === id ? { ...c, is_approved: true } : c));
    }
  };

  const handleApproveTournament = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTournaments(tournaments.map(t => t.id === id ? { ...t, is_approved: true } : t));
    } catch {
      setTournaments(tournaments.map(t => t.id === id ? { ...t, is_approved: true } : t));
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchRole = selectedRole === 'ALL' || player.position === selectedRole;
    const matchRank = selectedRank === 'ALL' || (player.rank && player.rank.toUpperCase().includes(selectedRank.toUpperCase()));
    return matchRole && matchRank;
  });

  const userRole = currentUser?.role || 'usuario';

  // ============================================================
  // PANTALLA LOGIN Y REGISTRO
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

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
            {authMode === 'login' ? 'BIENVENIDO DE VUELTA' : 'CREA TU CUENTA'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            {authMode === 'login' ? 'Inicia sesión para continuar' : 'Únete a la mayor red de esports competitiva'}
          </p>

          {authError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>
              ⚠️ {authError}
            </div>
          )}

          {authSuccess && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#34d399', fontSize: '0.85rem' }}>
              ✅ {authSuccess}
            </div>
          )}

          {authMode === 'login' ? (
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input type="email" className="input-field" placeholder="ejemplo@correo.com" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" className="input-field" placeholder="••••••••" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
              </div>
              <button type="submit" className="btn-login">INICIAR SESIÓN</button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <label>Nombre de Usuario</label>
                <input type="text" className="input-field" placeholder="Tu username" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input type="email" className="input-field" placeholder="ejemplo@correo.com" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" className="input-field" placeholder="Mínimo 6 caracteres" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
              </div>
              <button type="submit" className="btn-login" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>REGISTRARSE</button>
            </form>
          )}

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
            {authMode === 'login' ? (
              <>¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('register'); setAuthError(''); }} style={{ color: 'var(--accent-purple)', fontWeight: 'bold', textDecoration: 'none' }}>Registrarse</a></>
            ) : (
              <>¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setAuthError(''); }} style={{ color: 'var(--accent-purple)', fontWeight: 'bold', textDecoration: 'none' }}>Iniciar Sesión</a></>
            )}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // APLICACIÓN PRINCIPAL (LOGUEADO)
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
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>🏠 Home (Feed)</li>
            <li className={`nav-item ${activeTab === 'recruitment' ? 'active' : ''}`} onClick={() => setActiveTab('recruitment')}>🤝 Team Builder</li>
            <li className={`nav-item ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>🏆 Torneos</li>
            <li className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Mi Perfil</li>
            {(userRole === 'moderador' || userRole === 'admin') && (
              <li className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>🛡️ Moderación</li>
            )}
          </ul>
        </nav>
        <div className="user-profile-summary">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{currentUser?.username}</div>
              <span className="role-badge" style={{ marginTop: '0.1rem', display: 'inline-block' }}>{userRole}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="action-btn" style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.75rem', border: 'none', background: 'none', cursor: 'pointer' }}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">

        {/* HOME / FEED */}
        {activeTab === 'dashboard' && (
          <div>
            <header className="header">
              <h1>Welcome back, {currentUser?.username}!</h1>
              <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                🟢 Conectado a Azure Cloud
              </span>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Community Feed</h2>
                {loadingPosts && <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>⏳ Cargando posts desde la API...</div>}
                {!loadingPosts && posts.length === 0 && (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay posts disponibles. ¡Sé el primero en publicar!</div>
                )}
                {posts.map(post => (
                  <article key={post.id} className="card">
                    <h3>
                      {post.title}
                      {post.community_name && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', background: 'rgba(139,92,246,0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' }}>
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
                  {loadingCommunities ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>⏳ Cargando...</p> : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {communities.filter(c => c.is_approved).map(c => (
                        <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>🎮 {c.name}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.member_count} Miembros • {c.game}</span>
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

        {/* TEAM BUILDER (RECLUTAMIENTO REAL) */}
        {activeTab === 'recruitment' && (
          <div>
            <header className="header">
              <h1>TEAM BUILDER</h1>
              <button className="btn-primary" onClick={() => setActiveTab('profile')}>Postularme (Vincular Riot)</button>
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
                <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rango:</label>
                <select className="select-filter" value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)}>
                  <option value="ALL">All Ranks</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Master">Master</option>
                  <option value="Grandmaster">Grandmaster</option>
                  <option value="Challenger">Challenger</option>
                </select>
              </div>
            </div>
            <div className="player-grid">
              {filteredPlayers.map(player => (
                <div key={player.id} className="player-card">
                  <span className="player-role-banner">{player.position}</span>
                  <div className="player-avatar-container">
                    <div className="player-avatar-inner" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                      Lvl {player.level}
                    </div>
                  </div>
                  <h4>{player.username}</h4>
                  <div className="summoner-name" style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                    🎮 {player.riot_name}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '4px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
                    🏆 {player.rank}
                  </div>
                  <div className="player-stats">
                    <div className="stat-item"><span className="stat-label">Win Rate</span><span className="stat-val" style={{ color: 'var(--success)' }}>{player.winrate}</span></div>
                    <div className="stat-item"><span className="stat-label">KDA</span><span className="stat-val">{player.kda}</span></div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Availability: {player.availability}</div>
                  <button className="btn-primary" style={{ width: '100%' }}>RECRUIT TO TEAM</button>
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  No hay jugadores vinculados en este rango/posición todavía. Vincula tu cuenta en 'Mi Perfil' para aparecer aquí.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TORNEOS */}
        {activeTab === 'tournaments' && (
          <div>
            <header className="header">
              <h1>Global Elite Showdown</h1>
              <button className="btn-primary">+ Crear Torneo</button>
            </header>
            {loadingTournaments && <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>⏳ Cargando torneos...</div>}
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
                      <span>📅 {new Date(t.start_date).toLocaleDateString('es-CL')}</span>
                      <span>👥 {t.registered_teams}/{t.max_teams} equipos</span>
                      {t.prize_pool && <span>🏆 {t.prize_pool}</span>}
                    </div>
                  </div>
                  <div>
                    {t.is_approved
                      ? <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>Inscribir Escuadra</button>
                      : <button className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>Bloqueado</button>
                    }
                  </div>
                </div>
              ))}
              {!loadingTournaments && tournaments.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay torneos registrados aún.</div>
              )}
            </div>
          </div>
        )}

        {/* MI PERFIL & VINCULACIÓN RIOT */}
        {activeTab === 'profile' && (
          <div>
            <header className="header">
              <h1>Mi Perfil de Invocador</h1>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
              {/* Información actual del perfil */}
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{currentUser?.username}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{currentUser?.email}</p>
                
                <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />
                
                {currentUser?.riot_summoner_name ? (
                  <div>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      ✓ Cuenta Riot Vinculada
                    </span>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RIOT ID</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>🎮 {currentUser.riot_summoner_name}</div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>RANGO LOL</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>🏆 {currentUser.lol_rank}</div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>NIVEL</div>
                      <div style={{ fontSize: '0.9rem' }}>⭐ {currentUser.lol_summoner_level}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      ⚠️ Sin Cuenta Riot Vinculada
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Vincula tu cuenta para obtener tu rango oficial de Riot Games y postularte en el Team Builder.
                    </p>
                  </div>
                )}
              </div>

              {/* Proceso de Vinculación */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Vincular con Riot Games API</h3>
                
                {linkError && (
                  <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#f87171', fontSize: '0.85rem' }}>
                    ⚠️ {linkError}
                  </div>
                )}

                {linkingState === 'idle' && (
                  <form onSubmit={handleRiotLinkStart}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                      Ingresa tu Riot ID de League of Legends. El sistema se conectará a la API oficial de Riot para validar la cuenta y sincronizar tu rango y nivel.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1rem' }}>
                      <div className="input-group">
                        <label>Nombre de Invocador (Game Name)</label>
                        <input type="text" className="input-field" placeholder="Ej: Zabat" required value={riotGameName} onChange={(e) => setRiotGameName(e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>Etiqueta (Tagline)</label>
                        <input type="text" className="input-field" placeholder="Ej: sun (sin #)" required value={riotTagLine} onChange={(e) => setRiotTagLine(e.target.value)} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Región del Servidor</label>
                      <select className="select-filter" style={{ width: '100%', padding: '0.75rem' }} value={riotRegion} onChange={(e) => setRiotRegion(e.target.value)}>
                        <option value="LA2">LAS (Latin America South)</option>
                        <option value="LA1">LAN (Latin America North)</option>
                        <option value="NA1">NA (North America)</option>
                        <option value="BR1">BR (Brazil)</option>
                        <option value="EUW1">EUW (Europe West)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}>
                      CONECTAR CUENTA
                    </button>
                  </form>
                )}

                {linkingState === 'linking' && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳ Conectando con Riot Games...</div>
                    <p style={{ color: 'var(--text-muted)' }}>Estamos buscando el PUUID en el cluster de América.</p>
                  </div>
                )}

                {linkingState === 'verifying' && (
                  <div>
                    <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>✓ Cuenta encontrada: {linkInfo?.gameName}#{linkInfo?.tagLine}</h4>
                    <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                        🔒 Paso de Validación de Identidad:
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1rem' }}>
                        Para verificar que eres el dueño de la cuenta, abre tu cliente de League of Legends (o TFT Mobile) y cambia temporalmente tu icono de perfil al siguiente:
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <img 
                          src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${linkInfo?.targetIconId}.png`} 
                          alt={linkInfo?.targetIconName} 
                          style={{ width: '64px', height: '64px', borderRadius: '8px', border: '2px solid var(--accent-purple)' }} 
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{linkInfo?.targetIconName}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID de Icono: {linkInfo?.targetIconId}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                        * Nota: Si eres el dueño de Zabat#sun, el backend detectará tu icono actual de forma directa para facilitar la demo en clase.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn-primary" onClick={handleRiotLinkVerify} style={{ flex: 1, padding: '0.75rem' }}>
                        VERIFICAR ICONO
                      </button>
                      <button className="btn-primary" onClick={() => setLinkingState('idle')} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {linkingState === 'success' && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>¡Vinculación Completa!</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      Tu rango de LoL ha sido importado con éxito y ya figuras en la lista de reclutamiento competitivo.
                    </p>
                    <button className="btn-primary" onClick={() => setLinkingState('idle')}>
                      Vincular otra cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODERACIÓN */}
        {activeTab === 'moderation' && (
          <div>
            <header className="header"><h1>Panel de Moderación &amp; Aprobación</h1></header>
            <div className="card">
              <h3>Comunidades Pendientes</h3>
              <table className="moderation-table">
                <thead><tr><th>Nombre</th><th>Juego</th><th>Creador</th><th>Miembros</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {communities.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td><td>{c.game}</td><td>@{c.owner_username}</td><td>{c.member_count}</td>
                      <td><span className={`badge-status ${c.is_approved ? 'badge-approved' : 'badge-pending'}`}>{c.is_approved ? 'APROBADO' : 'PENDIENTE'}</span></td>
                      <td>
                        {!c.is_approved
                          ? <><button className="btn-small btn-approve" onClick={() => handleApproveCommunity(c.id)}>Aprobar</button><button className="btn-small btn-reject">Rechazar</button></>
                          : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completado</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>Torneos Pendientes</h3>
              <table className="moderation-table">
                <thead><tr><th>Torneo</th><th>Organizador</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {tournaments.map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td><td>@{t.organizer_username}</td><td>{new Date(t.start_date).toLocaleDateString('es-CL')}</td>
                      <td><span className={`badge-status ${t.is_approved ? 'badge-approved' : 'badge-pending'}`}>{t.is_approved ? 'APROBADO' : 'PENDIENTE'}</span></td>
                      <td>
                        {!t.is_approved
                          ? <><button className="btn-small btn-approve" onClick={() => handleApproveTournament(t.id)}>Aprobar</button><button className="btn-small btn-reject">Rechazar</button></>
                          : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completado</span>
                        }
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
