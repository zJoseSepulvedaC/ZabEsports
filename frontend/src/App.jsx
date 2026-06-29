import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://zabesports-api-aje2efc6adawfyh0.eastus2-01.azurewebsites.net';

// Diccionario de Traducción (Español / Inglés)
const translations = {
  es: {
    welcome: "Bienvenido de vuelta",
    connectAzure: "Conectado a Azure Cloud",
    home: "Home (Feed)",
    teambuilder: "Team Builder",
    tournaments: "Torneos",
    profile: "Mi Perfil",
    moderation: "Moderación",
    logout: "Cerrar Sesión",
    loginTitle: "BIENVENIDO DE VUELTA",
    loginSubtitle: "Inicia sesión para continuar",
    registerTitle: "CREA TU CUENTA",
    registerSubtitle: "Únete a la mayor red de esports competitiva",
    email: "Correo Electrónico",
    password: "Contraseña",
    username: "Nombre de Usuario",
    loginBtn: "INICIAR SESIÓN",
    registerBtn: "REGISTRARSE",
    noAccount: "¿No tienes cuenta?",
    haveAccount: "¿Ya tienes cuenta?",
    allRoles: "Todos los Roles",
    allRanks: "Todos los Rangos",
    positionLabel: "Posición",
    rankLabel: "Rango",
    recruitBtn: "RECLUTAR AL EQUIPO",
    postulateBtn: "Postularme (Vincular Riot)",
    noPlayers: "No hay jugadores vinculados todavía. Vincula tu cuenta en 'Mi Perfil' para aparecer aquí.",
    createTournament: "+ Crear Torneo",
    createCommunity: "+ Crear Comunidad",
    noTournaments: "No hay torneos registrados aún.",
    noCommunities: "No perteneces a ninguna comunidad aún. ¡Crea una!",
    riotLinkTitle: "Vincular con Riot Games API",
    riotLinkDesc: "Ingresa tu Riot ID de League of Legends para sincronizar tu rango y nivel.",
    riotNameInput: "Nombre de Invocador (Game Name)",
    riotTagInput: "Etiqueta (Tagline)",
    riotRegionLabel: "Región del Servidor",
    connectBtn: "CONECTAR CUENTA",
    verifyIconTitle: "Paso de Validación de Identidad",
    verifyIconDesc: "Para verificar que eres dueño de la cuenta, cambia tu icono de LoL al siguiente:",
    verifyBtn: "VERIFICAR ICONO",
    cancelBtn: "Cancelar",
    linkSuccess: "¡Vinculación Completa!",
    linkSuccessDesc: "Tu rango de LoL ha sido importado con éxito.",
    linkAnother: "Vincular otra cuenta",
    riotLinkedStatus: "✓ Cuenta Riot Vinculada",
    riotUnlinkedStatus: "⚠️ Sin Cuenta Riot Vinculada",
    riotUnlinkedDesc: "Vincula tu cuenta para obtener tu rango oficial de Riot Games y postularte en el Team Builder.",
    feedTitle: "Feed de la Comunidad",
    activeComms: "Comunidades Activas",
    upcomingEvents: "Próximos Eventos",
    members: "Miembros",
    registeredTeams: "equipos",
    statusApproved: "APROBADO",
    statusPending: "PENDIENTE",
    statusOpen: "ABIERTO",
    enrollTeam: "Inscribir Escuadra",
    locked: "Bloqueado",
    moderationPanel: "Panel de Moderación & Aprobación",
    pendingComms: "Comunidades Pendientes",
    pendingTourneys: "Torneos Pendientes",
    approve: "Aprobar",
    reject: "Rechazar",
    completed: "Completado",
    modalCreateTourney: "Crear Nuevo Torneo",
    modalCreateComm: "Crear Nueva Comunidad",
    nameLabel: "Nombre",
    descLabel: "Descripción",
    gameLabel: "Juego",
    startDateLabel: "Fecha de Inicio",
    maxTeamsLabel: "Límite de Equipos",
    prizePoolLabel: "Premio / Prize Pool",
    saveBtn: "Crear",
    recentMatches: "Partidas recientes",
    mostPlayedChamps: "Campeones más jugados",
    winrate: "Win Rate",
    kda: "KDA",
    killParticipation: "C/Kill",
    level: "Nivel",
    registeredAt: "Registrado el",
    win: "Victoria",
    loss: "Derrota",
    doubleKill: "Asesinato Doble",
    carry: "Carrileo"
  },
  en: {
    welcome: "Welcome back",
    connectAzure: "Connected to Azure Cloud",
    home: "Home (Feed)",
    teambuilder: "Team Builder",
    tournaments: "Tournaments",
    profile: "My Profile",
    moderation: "Moderation",
    logout: "Log Out",
    loginTitle: "WELCOME BACK",
    loginSubtitle: "Sign in to continue",
    registerTitle: "CREATE YOUR ACCOUNT",
    registerSubtitle: "Join the largest competitive esports network",
    email: "Email Address",
    password: "Password",
    username: "Username",
    loginBtn: "LOG IN",
    registerBtn: "REGISTER",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    allRoles: "All Roles",
    allRanks: "All Ranks",
    positionLabel: "Position",
    rankLabel: "Rank",
    recruitBtn: "RECRUIT TO TEAM",
    postulateBtn: "Join (Link Riot)",
    noPlayers: "No linked players yet. Link your account under 'My Profile' to show up here.",
    createTournament: "+ Create Tournament",
    createCommunity: "+ Create Community",
    noTournaments: "No tournaments registered yet.",
    noCommunities: "You do not belong to any communities yet. Create one!",
    riotLinkTitle: "Link with Riot Games API",
    riotLinkDesc: "Enter your League of Legends Riot ID to sync your rank and level.",
    riotNameInput: "Summoner Name (Game Name)",
    riotTagInput: "Tagline",
    riotRegionLabel: "Server Region",
    connectBtn: "CONNECT ACCOUNT",
    verifyIconTitle: "Identity Verification Step",
    verifyIconDesc: "To verify you own the account, change your LoL icon to the following:",
    verifyBtn: "VERIFY ICON",
    cancelBtn: "Cancel",
    linkSuccess: "Linking Complete!",
    linkSuccessDesc: "Your LoL rank has been successfully imported.",
    linkAnother: "Link another account",
    riotLinkedStatus: "✓ Riot Account Linked",
    riotUnlinkedStatus: "⚠️ No Riot Account Linked",
    riotUnlinkedDesc: "Link your account to get your official Riot Games rank and apply to the Team Builder.",
    feedTitle: "Community Feed",
    activeComms: "Active Communities",
    upcomingEvents: "Upcoming Events",
    members: "Members",
    registeredTeams: "teams",
    statusApproved: "APPROVED",
    statusPending: "PENDING",
    statusOpen: "OPEN",
    enrollTeam: "Enroll Squad",
    locked: "Locked",
    moderationPanel: "Moderation & Approval Panel",
    pendingComms: "Pending Communities",
    pendingTourneys: "Pending Tournaments",
    approve: "Approve",
    reject: "Reject",
    completed: "Completed",
    modalCreateTourney: "Create New Tournament",
    modalCreateComm: "Create New Community",
    nameLabel: "Name",
    descLabel: "Description",
    gameLabel: "Game",
    startDateLabel: "Start Date",
    maxTeamsLabel: "Max Teams",
    prizePoolLabel: "Prize Pool",
    saveBtn: "Create",
    recentMatches: "Recent matches",
    mostPlayedChamps: "Most played champions",
    winrate: "Win Rate",
    kda: "KDA",
    killParticipation: "K/P",
    level: "Level",
    registeredAt: "Registered on",
    win: "Victory",
    loss: "Defeat",
    doubleKill: "Double Kill",
    carry: "Carry"
  }
};

// Data mockeada premium estilo OP.GG para los perfiles vinculados
const mockOpggData = {
  champions: [
    { name: "Kennen", img: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Kennen.png", winrate: "62%", games: 60, kda: "2.89:1 KDA", kdaDetails: "7.1 / 4.7 / 6.5" },
    { name: "Rumble", img: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Rumble.png", winrate: "61%", games: 49, kda: "2.97:1 KDA", kdaDetails: "7.2 / 4.9 / 7.4" },
    { name: "Brand", img: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Brand.png", winrate: "53%", games: 19, kda: "2.15:1 KDA", kdaDetails: "4.1 / 7.2 / 11.3" },
    { name: "Fiora", img: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Fiora.png", winrate: "28%", games: 18, kda: "1.86:1 KDA", kdaDetails: "6.5 / 5.7 / 4.1" },
    { name: "Aatrox", img: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Aatrox.png", winrate: "29%", games: 17, kda: "1.62:1 KDA", kdaDetails: "5.6 / 6.5 / 5.0" }
  ],
  matches: [
    { id: 1, type: "Clasificatoria solo/dúo", time: "hace 21 horas", result: "loss", duration: "28 min 08 s", champName: "Ryze", champImg: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Ryze.png", score: "10 / 4 / 0", kdaRatio: "2.50:1 KDA", kp: "71%", items: [3001, 3020, 3040, 3135], badge: "Asesinato Doble", team: ["Haru", "Relenus", "Zabat", "Ghost", "asphyxia"] },
    { id: 2, type: "Clasificatoria solo/dúo", time: "hace 21 horas", result: "loss", duration: "26 min 49 s", champName: "Renekton", champImg: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Renekton.png", score: "7 / 8 / 0", kdaRatio: "0.88:1 KDA", kp: "58%", items: [3071, 3111, 3053, 3026], badge: null, team: ["UC Reine", "UC Neptune", "Cookie", "chovski", "mijoyy"] },
    { id: 3, type: "Clasificatoria solo/dúo", time: "hace 24 horas", result: "win", duration: "34 min 21 s", champName: "Diana", champImg: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Diana.png", score: "11 / 6 / 8", kdaRatio: "3.17:1 KDA", kp: "76%", items: [3089, 3157, 3020, 4633], badge: "Carrileo 76", team: ["Dibujee", "Zell", "High Court", "szK", "pretty lies"] },
    { id: 4, type: "Clasificatoria solo/dúo", time: "hace 1 día", result: "win", duration: "19 min 34 s", champName: "Shen", champImg: "https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/Shen.png", score: "7 / 2 / 5", kdaRatio: "6.00:1 KDA", kp: "60%", items: [3068, 3001, 3111], badge: "Asesinato Doble", team: ["Noblezas", "GAP SEL", "Garras", "blz", "tomi t"] }
  ]
};

function App() {
  const [lang, setLang] = useState('es'); // Idioma global
  const t = translations[lang];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  
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

  // Modales CRUD
  const [showTourneyModal, setShowTourneyModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);
  
  // Estados de los formularios de creación
  const [newTourneyName, setNewTourneyName] = useState('');
  const [newTourneyDesc, setNewTourneyDesc] = useState('');
  const [newTourneyGame, setNewTourneyGame] = useState('League of Legends');
  const [newTourneyDate, setNewTourneyDate] = useState('');
  const [newTourneyMaxTeams, setNewTourneyMaxTeams] = useState(16);
  const [newTourneyPrize, setNewTourneyPrize] = useState('');

  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommGame, setNewCommGame] = useState('League of Legends');

  // Modal de Detalle de Perfil (OP.GG)
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState(null);

  // Estados de Vinculación de Riot
  const [riotGameName, setRiotGameName] = useState('');
  const [riotTagLine, setRiotTagLine] = useState('');
  const [riotRegion, setRiotRegion] = useState('LA2');
  const [linkingState, setLinkingState] = useState('idle'); 
  const [linkInfo, setLinkInfo] = useState(null);
  const [linkError, setLinkError] = useState('');

  const fetchPlayers = () => {
    fetch(`${API_URL}/api/players`)
      .then(r => r.json())
      .then(data => setPlayers(Array.isArray(data) ? data : []))
      .catch(() => setPlayers([]));
  };

  const fetchTournaments = () => {
    setLoadingTournaments(true);
    fetch(`${API_URL}/api/tournaments`)
      .then(r => r.json())
      .then(data => setTournaments(Array.isArray(data) ? data : []))
      .catch(() => setTournaments([]))
      .finally(() => setLoadingTournaments(false));
  };

  const fetchCommunities = () => {
    setLoadingCommunities(true);
    fetch(`${API_URL}/api/communities`)
      .then(r => r.json())
      .then(data => setCommunities(Array.isArray(data) ? data : []))
      .catch(() => setCommunities([]))
      .finally(() => setLoadingCommunities(false));
  };

  const fetchPosts = () => {
    setLoadingPosts(true);
    fetch(`${API_URL}/api/posts`)
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchCommunities();
    fetchTournaments();
    fetchPosts();
    fetchPlayers();
  }, [isLoggedIn]);

  // ============================================================
  // Acciones de Creación (CRUD)
  // ============================================================
  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tournaments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newTourneyName,
          description: newTourneyDesc,
          game: newTourneyGame,
          start_date: newTourneyDate,
          max_teams: Number(newTourneyMaxTeams),
          prize_pool: newTourneyPrize
        })
      });
      if (res.ok) {
        setShowTourneyModal(false);
        setNewTourneyName('');
        setNewTourneyDesc('');
        setNewTourneyPrize('');
        fetchTournaments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/communities`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCommName,
          description: newCommDesc,
          game: newCommGame
        })
      });
      if (res.ok) {
        setShowCommModal(false);
        setNewCommName('');
        setNewCommDesc('');
        fetchCommunities();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '0.4rem 0.8rem', background: 'var(--card-bg)', color: 'var(--text-light)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>

        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-box">ZE</div>
            <span className="login-logo-text">ZabEsports</span>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>E-sports Hub &amp; Communities</div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
            {authMode === 'login' ? t.loginTitle : t.registerTitle}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            {authMode === 'login' ? t.loginSubtitle : t.registerSubtitle}
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
                <label>{t.email}</label>
                <input type="email" className="input-field" placeholder="ejemplo@correo.com" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t.password}</label>
                <input type="password" className="input-field" placeholder="••••••••" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
              </div>
              <button type="submit" className="btn-login">{t.loginBtn}</button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <label>{t.username}</label>
                <input type="text" className="input-field" placeholder="Tu username" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t.email}</label>
                <input type="email" className="input-field" placeholder="ejemplo@correo.com" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t.password}</label>
                <input type="password" className="input-field" placeholder="Mínimo 6 caracteres" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
              </div>
              <button type="submit" className="btn-login" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>{t.registerBtn}</button>
            </form>
          )}

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
            {authMode === 'login' ? (
              <>{t.noAccount} <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('register'); setAuthError(''); }} style={{ color: 'var(--accent-purple)', fontWeight: 'bold', textDecoration: 'none' }}>{t.registerBtn}</a></>
            ) : (
              <>{t.haveAccount} <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setAuthError(''); }} style={{ color: 'var(--accent-purple)', fontWeight: 'bold', textDecoration: 'none' }}>{t.loginBtn}</a></>
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
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>🏠 {t.home}</li>
            <li className={`nav-item ${activeTab === 'recruitment' ? 'active' : ''}`} onClick={() => setActiveTab('recruitment')}>🤝 {t.teambuilder}</li>
            <li className={`nav-item ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>🏆 {t.tournaments}</li>
            <li className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 {t.profile}</li>
            {(userRole === 'moderador' || userRole === 'admin') && (
              <li className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>🛡️ {t.moderation}</li>
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
            🚪 {t.logout}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {/* Selector de idioma en la parte superior derecha de la aplicación */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '0.4rem 0.8rem', background: 'var(--card-bg)', color: 'var(--text-light)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>

        {/* HOME / FEED */}
        {activeTab === 'dashboard' && (
          <div>
            <header className="header">
              <h1>{t.welcome}, {currentUser?.username}!</h1>
              <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                🟢 {t.connectAzure}
              </span>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>{t.feedTitle}</h2>
                {loadingPosts && <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>⏳ Cargando...</div>}
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
                    </div>
                  </article>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t.activeComms}</h2>
                  <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowCommModal(true)}>{t.createCommunity}</button>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                  {loadingCommunities ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>⏳ Cargando...</p> : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {communities.filter(c => c.is_approved || c.owner_username === currentUser?.username).map(c => (
                        <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>🎮 {c.name}</span>
                              {!c.is_approved && (
                                <span style={{ fontSize: '0.65rem', background: 'rgba(255,184,0,0.15)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                  {translations[lang].statusPending}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.member_count} {t.members} • {c.game}</span>
                          </div>
                          <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Ver</button>
                        </li>
                      ))}
                      {communities.filter(c => c.is_approved || c.owner_username === currentUser?.username).length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.noCommunities}</p>
                      )}
                    </ul>
                  )}
                </div>
                <h2 style={{ fontSize: '1.25rem', margin: '2rem 0 1.25rem' }}>{t.upcomingEvents}</h2>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tournaments.filter(t => t.is_approved && t.status === 'OPEN').slice(0, 3).map(t => (
                      <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>• {t.name.substring(0, 28)}...</span>
                        <span>{new Date(t.start_date).toLocaleDateString('es-CL')}</span>
                      </li>
                    ))}
                    {tournaments.filter(t => t.is_approved && t.status === 'OPEN').length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay eventos activos.</p>
                    )}
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
              <button className="btn-primary" onClick={() => setActiveTab('profile')}>{t.postulateBtn}</button>
            </header>
            <div className="filters-bar" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.positionLabel}:</label>
                <select className="select-filter" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="ALL">{t.allRoles}</option>
                  <option value="TOP">Top</option>
                  <option value="JUNGLE">Jungle</option>
                  <option value="MID">Mid</option>
                  <option value="ADC">ADC</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
              <div>
                <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.rankLabel}:</label>
                <select className="select-filter" value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)}>
                  <option value="ALL">{t.allRanks}</option>
                  <option value="Iron">Iron</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Emerald">Emerald</option>
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
                  {/* Nombre clickeable para abrir el Modal de OP.GG */}
                  <h4 
                    onClick={() => setSelectedPlayerProfile(player)} 
                    style={{ cursor: 'pointer', color: 'var(--text-light)', textDecoration: 'underline' }}
                    title="Ver estadísticas en OP.GG"
                  >
                    {player.username}
                  </h4>
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
                  <button className="btn-primary" style={{ width: '100%' }}>{t.recruitBtn}</button>
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  {t.noPlayers}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TORNEOS (CRUD REAL) */}
        {activeTab === 'tournaments' && (
          <div>
            <header className="header">
              <h1>Global Elite Showdown</h1>
              <button className="btn-primary" onClick={() => setShowTourneyModal(true)}>{t.createTournament}</button>
            </header>
            {loadingTournaments && <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>⏳ Cargando...</div>}
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
                      <span>👥 {t.registered_teams}/{t.max_teams} {translations[lang].registeredTeams}</span>
                      {t.prize_pool && <span>🏆 {t.prize_pool}</span>}
                    </div>
                  </div>
                  <div>
                    {t.is_approved
                      ? <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>{translations[lang].enrollTeam}</button>
                      : <button className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>{translations[lang].locked}</button>
                    }
                  </div>
                </div>
              ))}
              {!loadingTournaments && tournaments.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t.noTournaments}</div>
              )}
            </div>
          </div>
        )}

        {/* MI PERFIL & VINCULACIÓN RIOT */}
        {activeTab === 'profile' && (
          <div>
            <header className="header">
              <h1>{t.profile}</h1>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
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
                      {t.riotLinkedStatus}
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
                      {t.riotUnlinkedStatus}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {t.riotUnlinkedDesc}
                    </p>
                  </div>
                )}
              </div>

              {/* Proceso de Vinculación */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>{t.riotLinkTitle}</h3>
                
                {linkError && (
                  <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#f87171', fontSize: '0.85rem' }}>
                    ⚠️ {linkError}
                  </div>
                )}

                {linkingState === 'idle' && (
                  <form onSubmit={handleRiotLinkStart}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                      {t.riotLinkDesc}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1rem' }}>
                      <div className="input-group">
                        <label>{t.riotNameInput}</label>
                        <input type="text" className="input-field" placeholder="Ej: Zabat" required value={riotGameName} onChange={(e) => setRiotGameName(e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>{t.riotTagInput}</label>
                        <input type="text" className="input-field" placeholder="Ej: sun" required value={riotTagLine} onChange={(e) => setRiotTagLine(e.target.value)} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>{t.riotRegionLabel}</label>
                      <select className="select-filter" style={{ width: '100%', padding: '0.75rem' }} value={riotRegion} onChange={(e) => setRiotRegion(e.target.value)}>
                        <option value="LA2">LAS (Latin America South)</option>
                        <option value="LA1">LAN (Latin America North)</option>
                        <option value="NA1">NA (North America)</option>
                        <option value="BR1">BR (Brazil)</option>
                        <option value="EUW1">EUW (Europe West)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}>
                      {t.connectBtn}
                    </button>
                  </form>
                )}

                {linkingState === 'linking' && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳ Conectando...</div>
                  </div>
                )}

                {linkingState === 'verifying' && (
                  <div>
                    <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>✓ {t.connectBtn}: {linkInfo?.gameName}#{linkInfo?.tagLine}</h4>
                    <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                        🔒 {t.verifyIconTitle}:
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1rem' }}>
                        {t.verifyIconDesc}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <img 
                          src={`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${linkInfo?.targetIconId}.png`} 
                          alt={linkInfo?.targetIconName} 
                          style={{ width: '64px', height: '64px', borderRadius: '8px', border: '2px solid var(--accent-purple)' }} 
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{linkInfo?.targetIconName}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {linkInfo?.targetIconId}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn-primary" onClick={handleRiotLinkVerify} style={{ flex: 1, padding: '0.75rem' }}>
                        {t.verifyBtn}
                      </button>
                      <button className="btn-primary" onClick={() => setLinkingState('idle')} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        {t.cancelBtn}
                      </button>
                    </div>
                  </div>
                )}

                {linkingState === 'success' && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>{t.linkSuccess}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      {t.linkSuccessDesc}
                    </p>
                    <button className="btn-primary" onClick={() => setLinkingState('idle')}>
                      {t.linkAnother}
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
            <header className="header"><h1>{t.moderationPanel}</h1></header>
            <div className="card">
              <h3>{t.pendingComms}</h3>
              <table className="moderation-table">
                <thead><tr><th>{t.nameLabel}</th><th>{t.gameLabel}</th><th>Owner</th><th>{t.members}</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {communities.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td><td>{c.game}</td><td>@{c.owner_username}</td><td>{c.member_count}</td>
                      <td><span className={`badge-status ${c.is_approved ? 'badge-approved' : 'badge-pending'}`}>{c.is_approved ? t.statusApproved : t.statusPending}</span></td>
                      <td>
                        {!c.is_approved
                          ? <><button className="btn-small btn-approve" onClick={() => handleApproveCommunity(c.id)}>{t.approve}</button><button className="btn-small btn-reject">{t.reject}</button></>
                          : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.completed}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>{t.pendingTourneys}</h3>
              <table className="moderation-table">
                <thead><tr><th>Torneo</th><th>Organizador</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {tournaments.map(tData => (
                    <tr key={tData.id}>
                      <td>{tData.name}</td><td>@{tData.organizer_username}</td><td>{new Date(tData.start_date).toLocaleDateString('es-CL')}</td>
                      <td><span className={`badge-status ${tData.is_approved ? 'badge-approved' : 'badge-pending'}`}>{tData.is_approved ? t.statusApproved : t.statusPending}</span></td>
                      <td>
                        {!tData.is_approved
                          ? <><button className="btn-small btn-approve" onClick={() => handleApproveTournament(tData.id)}>{t.approve}</button><button className="btn-small btn-reject">{t.reject}</button></>
                          : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.completed}</span>
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

      {/* ============================================================
          MODALES DE CREACIÓN (CRUD REAL)
      ============================================================ */}
      
      {/* CREAR TORNEO */}
      {showTourneyModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{t.modalCreateTourney}</h2>
            <form onSubmit={handleCreateTournament}>
              <div className="input-group">
                <label>{t.nameLabel}</label>
                <input type="text" className="input-field" required value={newTourneyName} onChange={(e) => setNewTourneyName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t.descLabel}</label>
                <textarea className="input-field" style={{ minHeight: '80px' }} value={newTourneyDesc} onChange={(e) => setNewTourneyDesc(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t.gameLabel}</label>
                <select className="select-filter" style={{ width: '100%', padding: '0.75rem' }} value={newTourneyGame} onChange={(e) => setNewTourneyGame(e.target.value)}>
                  <option value="League of Legends">League of Legends</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Counter-Strike 2">Counter-Strike 2</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>{t.startDateLabel}</label>
                  <input type="date" className="input-field" required value={newTourneyDate} onChange={(e) => setNewTourneyDate(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>{t.maxTeamsLabel}</label>
                  <input type="number" className="input-field" required value={newTourneyMaxTeams} onChange={(e) => setNewTourneyMaxTeams(e.target.value)} />
                </div>
              </div>
              <div className="input-group">
                <label>{t.prizePoolLabel}</label>
                <input type="text" className="input-field" placeholder="Ej: $500 USD" value={newTourneyPrize} onChange={(e) => setNewTourneyPrize(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{t.saveBtn}</button>
                <button type="button" className="btn-primary" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={() => setShowTourneyModal(false)}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREAR COMUNIDAD */}
      {showCommModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{t.modalCreateComm}</h2>
            <form onSubmit={handleCreateCommunity}>
              <div className="input-group">
                <label>{t.nameLabel}</label>
                <input type="text" className="input-field" required value={newCommName} onChange={(e) => setNewCommName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t.descLabel}</label>
                <textarea className="input-field" style={{ minHeight: '80px' }} value={newCommDesc} onChange={(e) => setNewCommDesc(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t.gameLabel}</label>
                <select className="select-filter" style={{ width: '100%', padding: '0.75rem' }} value={newCommGame} onChange={(e) => setNewCommGame(e.target.value)}>
                  <option value="League of Legends">League of Legends</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Counter-Strike 2">Counter-Strike 2</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{t.saveBtn}</button>
                <button type="button" className="btn-primary" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={() => setShowCommModal(false)}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DE DETALLE DE PERFIL ESTILO OP.GG (VER EN GRANDE)
      ============================================================ */}
      {selectedPlayerProfile && (
        <div className="modal-overlay" onClick={() => setSelectedPlayerProfile(null)}>
          <div className="opgg-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="opgg-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 'bold' }}>
                  {selectedPlayerProfile.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selectedPlayerProfile.riot_name || selectedPlayerProfile.username}
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    LAS | {t.level} {selectedPlayerProfile.level} | 🏆 {selectedPlayerProfile.rank}
                  </span>
                </div>
              </div>
              <button className="opgg-close-btn" onClick={() => setSelectedPlayerProfile(null)}>×</button>
            </div>

            <div className="opgg-body">
              {/* IZQUIERDA: CAMPEONES MÁS JUGADOS */}
              <div className="opgg-column-left">
                <h3>🔥 {t.mostPlayedChamps}</h3>
                <ul className="opgg-champ-list">
                  {mockOpggData.champions.map((champ, index) => (
                    <li key={index} className="opgg-champ-row">
                      <img src={champ.img} alt={champ.name} className="opgg-champ-icon" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{champ.name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{champ.games} Juegos</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.9rem' }}>{champ.winrate} WR</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{champ.kda}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DERECHA: HISTORIAL DE PARTIDAS RECIENTES */}
              <div className="opgg-column-right">
                <h3>🎮 {t.recentMatches} (20P 9V 11D - 45% WR)</h3>
                <div className="opgg-matches-container">
                  {mockOpggData.matches.map((match) => (
                    <div key={match.id} className={`opgg-match-card ${match.result}`}>
                      <div className="match-status-indicator" />
                      <div className="match-info">
                        <div style={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'var(--text-light)' }}>{match.type}</div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{match.time}</span>
                        <div className="match-badge" style={{ color: match.result === 'win' ? 'var(--success)' : '#ef4444' }}>
                          {match.result === 'win' ? t.win : t.loss}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{match.duration}</span>
                      </div>
                      
                      <div className="match-champ-details">
                        <img src={match.champImg} alt={match.champName} className="match-champ-avatar" />
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{match.champName}</div>
                      </div>

                      <div className="match-kda">
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-light)' }}>{match.score}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{match.kdaRatio}</span>
                        {match.badge && (
                          <span className="match-kda-badge">{match.badge}</span>
                        )}
                      </div>

                      <div className="match-kp">
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.killParticipation}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#f87171' }}>{match.kp}</div>
                      </div>

                      <div className="match-team">
                        {match.team.map((teammate, tIndex) => (
                          <div key={tIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: teammate === selectedPlayerProfile.username ? 'var(--accent-cyan)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span>•</span> {teammate}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
