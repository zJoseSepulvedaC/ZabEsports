import React, { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import Feed from './components/Feed';
import TeamBuilder from './components/TeamBuilder';
import Tournaments from './components/Tournaments';
import Profile from './components/Profile';
import Moderation from './components/Moderation';
import AdminPanel from './components/AdminPanel';

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
    carry: "Carrileo",
    notifTitle: "Invitaciones de Reclutamiento",
    notifEmpty: "No tienes invitaciones pendientes.",
    notifReceived: "te invita a unirte a su escuadra:",
    notifAccept: "Aceptar",
    notifDecline: "Rechazar",
    recruitModalTitle: "Enviar Solicitud de Reclutamiento",
    recruitSelectTeam: "Selecciona tu Escuadra",
    recruitMessagePlaceholder: "¡Hola! Queremos que seas parte de nuestra escuadra...",
    recruitSend: "Enviar Invitación",
    rank_iron: "Hierro",
    rank_bronze: "Bronce",
    rank_silver: "Plata",
    rank_gold: "Oro",
    rank_platinum: "Platino",
    rank_emerald: "Esmeralda",
    rank_diamond: "Diamante",
    rank_master: "Maestro",
    rank_grandmaster: "Grand Maestro",
    rank_challenger: "Retador"
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
    carry: "Carry",
    notifTitle: "Recruitment Invitations",
    notifEmpty: "No pending invitations.",
    notifReceived: "invites you to join their squad:",
    notifAccept: "Accept",
    notifDecline: "Decline",
    recruitModalTitle: "Send Recruitment Request",
    recruitSelectTeam: "Select your Squad",
    recruitMessagePlaceholder: "Hey! We want you to be part of our squad...",
    recruitSend: "Send Invitation",
    rank_iron: "Iron",
    rank_bronze: "Bronze",
    rank_silver: "Silver",
    rank_gold: "Gold",
    rank_platinum: "Platinum",
    rank_emerald: "Emerald",
    rank_diamond: "Diamond",
    rank_master: "Master",
    rank_grandmaster: "Grand Master",
    rank_challenger: "Challenger"
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
  const [selectedTeamStatus, setSelectedTeamStatus] = useState('ALL');

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

  // Notificaciones & Reclutamiento
  const [invitations, setInvitations] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [recruitingPlayer, setRecruitingPlayer] = useState(null);
  const [recruitTeamId, setRecruitTeamId] = useState('');
  const [recruitMessage, setRecruitMessage] = useState('');
  
  const [registeringTourney, setRegisteringTourney] = useState(null);
  const [registeringTeamId, setRegisteringTeamId] = useState('');

  const [editingPost, setEditingPost] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');

  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCommunityId, setNewPostCommunityId] = useState('');
  const [newPostTournamentId, setNewPostTournamentId] = useState('');

  const [filterCommunityId, setFilterCommunityId] = useState('');
  const [filterTournamentId, setFilterTournamentId] = useState('');

  // Modales personalizados de comentarios
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  const [showViewCommentsModal, setShowViewCommentsModal] = useState(false);
  const [viewingCommentsPostId, setViewingCommentsPostId] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Modal personalizado de reportes
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState(''); // 'post', 'community', 'tournament'
  const [reportTargetId, setReportTargetId] = useState(null);
  const [reportReason, setReportReason] = useState('');

  const fetchInvitations = () => {
    if (!token) return;
    fetch(`${API_URL}/api/players/invitations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setInvitations(Array.isArray(data) ? data : []))
      .catch(() => setInvitations([]));
  };

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

  const fetchMyTeams = () => {
    if (!token) return;
    fetch(`${API_URL}/api/teams/mine`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setMyTeams(Array.isArray(data) ? data : []))
      .catch(() => setMyTeams([]));
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchCommunities();
    fetchTournaments();
    fetchPosts();
    fetchPlayers();
    fetchInvitations();
    fetchMyTeams();
  }, [isLoggedIn, token]);

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

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newTeamName })
      });
      if (res.ok) {
        setNewTeamName('');
        fetchMyTeams();
        alert('¡Equipo creado exitosamente!');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al crear equipo');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRecruit = async (e) => {
    e.preventDefault();
    if (!token || !recruitingPlayer) return;
    try {
      const res = await fetch(`${API_URL}/api/players/recruit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: recruitingPlayer.id,
          team_id: recruitTeamId,
          message: recruitMessage
        })
      });
      if (res.ok) {
        setShowRecruitModal(false);
        setRecruitingPlayer(null);
        setRecruitTeamId('');
        setRecruitMessage('');
        alert('¡Invitación de reclutamiento enviada con éxito!');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al enviar invitación.');
      }
    } catch (err) {
      console.error('Error al enviar invitación:', err);
    }
  };

  const handleRegisterTournament = async (e) => {
    e.preventDefault();
    if (!token || !registeringTourney) return;
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${registeringTourney}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ team_id: registeringTeamId })
      });
      if (res.ok) {
        setRegisteringTourney(null);
        setRegisteringTeamId('');
        fetchTournaments();
        alert('¡Inscripción exitosa al torneo!');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al inscribirse');
      }
    } catch (err) {
      console.error('Error al inscribirse:', err);
    }
  };

  const handleAcceptInvitation = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/players/invitations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'ACEPTADO' })
      });
      if (res.ok) {
        fetchInvitations();
        alert('Invitación aceptada. ¡Te has unido al equipo!');
      }
    } catch (err) {
      console.error('Error al aceptar invitación:', err);
    }
  };

  const handleDeclineInvitation = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/players/invitations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'RECHAZADO' })
      });
      if (res.ok) {
        fetchInvitations();
      }
    } catch (err) {
      console.error('Error al rechazar invitación:', err);
    }
  };

  const handleDeletePost = async (id) => {
    if (!token) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta publicación?')) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Error al eliminar post:', err);
    }
  };

  const handleEditPostSubmit = async (e) => {
    e.preventDefault();
    if (!token || !editingPost) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editPostTitle, content: editPostContent })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => p.id === editingPost.id ? { ...p, title: data.post.title, content: data.post.content } : p));
        setEditingPost(null);
      }
    } catch (err) {
      console.error('Error al editar post:', err);
    }
  };

  const openEditPost = (post) => {
    setEditingPost(post);
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          community_id: newPostCommunityId || null,
          tournament_id: newPostTournamentId || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Insertar el nuevo post arriba en la lista
        setPosts([data.post, ...posts]);
        setShowPostModal(false);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCommunityId('');
        setNewPostTournamentId('');
        // Recargar posts para traer nombres mapeados
        fetchPosts();
      }
    } catch (err) {
      console.error('Error al crear post:', err);
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
    
    // Obtener valor previo por si falla la llamada
    const previousPosts = [...posts];
    
    // Actualización optimista inmediata en interfaz
    setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Sincronizar con el valor oficial del servidor
        setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, likes: data.post.likes } : p));
      } else {
        // Revertir si el servidor responde con error (ej: ya dio like antes)
        setPosts(previousPosts);
      }
    } catch {
      // Revertir si hay error de red
      setPosts(previousPosts);
    }
  };

  const handleOpenAddComment = (postId) => {
    setCommentingPostId(postId);
    setNewCommentContent('');
    setShowAddCommentModal(true);
  };

  const handleAddCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token || !commentingPostId || !newCommentContent) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/${commentingPostId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newCommentContent })
      });
      if (res.ok) {
        setShowAddCommentModal(false);
        setNewCommentContent('');
        handleOpenViewComments(commentingPostId);
      }
    } catch (err) {
      console.error('Error al comentar:', err);
    }
  };

  const handleOpenViewComments = async (postId) => {
    setViewingCommentsPostId(postId);
    setCommentsList([]);
    setLoadingComments(true);
    setShowViewCommentsModal(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data);
      }
    } catch (err) {
      console.error('Error al obtener comentarios:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const [reportSuccess, setReportSuccess] = useState(false);

  const handleOpenReport = (args) => {
    if (!args) return;
    const { postId, communityId, tournamentId } = args;
    if (postId) {
      setReportType('post');
      setReportTargetId(postId);
    } else if (communityId) {
      setReportType('community');
      setReportTargetId(communityId);
    } else if (tournamentId) {
      setReportType('tournament');
      setReportTargetId(tournamentId);
    }
    setReportReason('');
    setReportSuccess(false);
    setShowReportModal(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!token || !reportTargetId || !reportReason) return;
    try {
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reported_post_id: reportType === 'post' ? reportTargetId : null,
          reported_community_id: reportType === 'community' ? reportTargetId : null,
          reported_tournament_id: reportType === 'tournament' ? reportTargetId : null,
          reason: reportReason
        })
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportReason('');
          setReportSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error al reportar:', err);
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
    let matchTeam = true;
    if (selectedTeamStatus === 'HAS_TEAM') matchTeam = !!player.team_name;
    if (selectedTeamStatus === 'FREE_AGENT') matchTeam = !player.team_name;
    return matchRole && matchRank && matchTeam;
  });

  const userRole = currentUser?.role || 'usuario';

  // ============================================================
  // PANTALLA LOGIN Y REGISTRO
  // ============================================================
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '0.4rem 0.8rem', background: 'var(--card-bg)', color: 'var(--text-light)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>
        <LoginForm 
          authMode={authMode}
          setAuthMode={setAuthMode}
          emailInput={emailInput}
          setEmailInput={setEmailInput}
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          usernameInput={usernameInput}
          setUsernameInput={setUsernameInput}
          authError={authError}
          authSuccess={authSuccess}
          handleLoginSubmit={handleLoginSubmit}
          handleRegisterSubmit={handleRegisterSubmit}
          t={t}
        />
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
            {userRole === 'admin' && (
              <li className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', color: 'var(--primary-color)' }}>👑 Administración</li>
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
        {/* Selector de idioma y campana de notificaciones en la barra superior */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
          
          {/* Campana de Notificaciones */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            {invitations.length > 0 && (
              <span className="notification-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '50%', padding: '0.15rem 0.35rem', lineHeights: '1' }}>
                {invitations.length}
              </span>
            )}
            
            {/* Panel Desplegable (Dropdown) */}
            {showNotifDropdown && (
              <div className="notif-dropdown" style={{ position: 'absolute', right: 0, top: '35px', width: '320px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', zIndex: 999, padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-light)' }}>
                  {t.notifTitle}
                </h4>
                {invitations.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                    {t.notifEmpty}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {invitations.map((inv) => (
                      <div key={inv.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.3' }}>
                          <strong style={{ color: 'var(--accent-purple)' }}>@{inv.sender_username}</strong> {t.notifReceived}
                          <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>{inv.team_name}</div>
                        </div>
                        {inv.message && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                            "{inv.message}"
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <button className="btn-small btn-approve" onClick={() => handleAcceptInvitation(inv.id)} style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem' }}>
                            {t.notifAccept}
                          </button>
                          <button className="btn-small" onClick={() => handleDeclineInvitation(inv.id)} style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem', backgroundColor: '#374151', color: '#fff', border: 'none' }}>
                            {t.notifDecline}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selector de idioma */}
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '0.4rem 0.8rem', background: 'var(--card-bg)', color: 'var(--text-light)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>

        {activeTab === 'dashboard' && (
          <Feed 
            currentUser={currentUser}
            t={t}
            lang={lang}
            translations={translations}
            loadingPosts={loadingPosts}
            posts={posts}
            handleLike={handleLike}
            handleComment={handleOpenAddComment}
            handleViewComments={handleOpenViewComments}
            handleReport={handleOpenReport}
            openEditPost={openEditPost}
            handleDeletePost={handleDeletePost}
            loadingCommunities={loadingCommunities}
            communities={communities}
            tournaments={tournaments}
            setShowCommModal={setShowCommModal}
            setShowPostModal={setShowPostModal}
            newPostCommunityId={newPostCommunityId}
            setNewPostCommunityId={setNewPostCommunityId}
            newPostTournamentId={newPostTournamentId}
            setNewPostTournamentId={setNewPostTournamentId}
            filterCommunityId={filterCommunityId}
            setFilterCommunityId={setFilterCommunityId}
            filterTournamentId={filterTournamentId}
            setFilterTournamentId={setFilterTournamentId}
          />
        )}

        {activeTab === 'recruitment' && (
          <TeamBuilder 
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            selectedRank={selectedRank}
            setSelectedRank={setSelectedRank}
            selectedTeamStatus={selectedTeamStatus}
            setSelectedTeamStatus={setSelectedTeamStatus}
            filteredPlayers={filteredPlayers}
            setSelectedPlayerProfile={setSelectedPlayerProfile}
            setRecruitingPlayer={setRecruitingPlayer}
            setShowRecruitModal={setShowRecruitModal}
            setActiveTab={setActiveTab}
            t={t}
          />
        )}

        {activeTab === 'tournaments' && (
          <Tournaments 
            tournaments={tournaments}
            loadingTournaments={loadingTournaments}
            setShowTourneyModal={setShowTourneyModal}
            setRegisteringTourney={setRegisteringTourney}
            translations={translations}
            lang={lang}
            t={t}
          />
        )}

        {activeTab === 'profile' && (
          <Profile 
            currentUser={currentUser}
            riotGameName={riotGameName}
            setRiotGameName={setRiotGameName}
            riotTagLine={riotTagLine}
            setRiotTagLine={setRiotTagLine}
            riotRegion={riotRegion}
            setRiotRegion={setRiotRegion}
            linkingState={linkingState}
            setLinkingState={setLinkingState}
            linkInfo={linkInfo}
            setLinkInfo={setLinkInfo}
            linkError={linkError}
            setLinkError={setLinkError}
            myTeams={myTeams}
            newTeamName={newTeamName}
            setNewTeamName={setNewTeamName}
            handleRiotLinkStart={handleRiotLinkStart}
            handleRiotLinkVerify={handleRiotLinkVerify}
            handleCreateTeam={handleCreateTeam}
            t={t}
          />
        )}

        {activeTab === 'moderation' && (
          <Moderation 
            communities={communities}
            tournaments={tournaments}
            handleApproveCommunity={handleApproveCommunity}
            handleApproveTournament={handleApproveTournament}
            t={t}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel
            token={token}
            API_URL={API_URL}
          />
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

      {/* MODAL DE RECLUTAMIENTO */}
      {showRecruitModal && recruitingPlayer && (
        <div className="modal-overlay" onClick={() => setShowRecruitModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{t.recruitModalTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Reclutar a <strong style={{ color: 'var(--accent-purple)' }}>{recruitingPlayer.username}</strong>
            </p>
            <form onSubmit={handleSendRecruit}>
              <div className="input-group">
                <label>{t.recruitSelectTeam || "Selecciona tu Escuadra"}</label>
                <select 
                  className="select-filter" 
                  style={{ width: '100%', padding: '0.75rem' }} 
                  required 
                  value={recruitTeamId} 
                  onChange={(e) => setRecruitTeamId(e.target.value)}
                >
                  <option value="">-- {t.recruitSelectTeam || "Selecciona tu Escuadra"} --</option>
                  {myTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>{t.descLabel}</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '80px' }} 
                  placeholder={t.recruitMessagePlaceholder}
                  value={recruitMessage} 
                  onChange={(e) => setRecruitMessage(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{t.recruitSend}</button>
                <button type="button" className="btn-primary" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={() => setShowRecruitModal(false)}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE INSCRIPCIÓN A TORNEO */}
      {registeringTourney && (
        <div className="modal-overlay" onClick={() => setRegisteringTourney(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Inscripción Oficial a Torneo</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Selecciona con qué escuadra quieres participar. (Solo las escuadras de las que eres capitán).
            </p>
            <form onSubmit={handleRegisterTournament}>
              <div className="input-group">
                <label>Tu Escuadra Competitiva</label>
                <select 
                  className="select-filter" 
                  style={{ width: '100%', padding: '0.75rem' }} 
                  required 
                  value={registeringTeamId} 
                  onChange={(e) => setRegisteringTeamId(e.target.value)}
                >
                  <option value="">-- Seleccionar Escuadra --</option>
                  {myTeams.filter(t => t.captain_id === currentUser?.id).map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirmar Inscripción</button>
                <button type="button" className="btn-primary" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={() => setRegisteringTourney(null)}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE POST */}
      {editingPost && (
        <div className="modal-overlay" onClick={() => setEditingPost(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Publicación</h2>
            <form onSubmit={handleEditPostSubmit}>
              <div className="input-group">
                <label>{t.nameLabel || 'Título'}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={editPostTitle} 
                  onChange={(e) => setEditPostTitle(e.target.value)}
                />
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>{t.descLabel || 'Contenido'}</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '120px' }} 
                  required 
                  value={editPostContent} 
                  onChange={(e) => setEditPostContent(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Cambios</button>
                <button type="button" className="btn-primary" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={() => setEditingPost(null)}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN DE POST */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nueva Publicación</h2>
            <form onSubmit={handleCreatePostSubmit}>
              <div className="input-group">
                <label>{t.nameLabel || 'Título'}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Escribe el título de tu publicación"
                  required 
                  value={newPostTitle} 
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>{t.descLabel || 'Contenido'}</label>
                <textarea 
                  className="input-field" 
                  placeholder="¿Qué quieres compartir hoy?"
                  style={{ minHeight: '120px' }} 
                  required 
                  value={newPostContent} 
                  onChange={(e) => setNewPostContent(e.target.value)} 
                />
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Vincular a Comunidad (Opcional)</label>
                <select 
                  className="select-filter" 
                  style={{ width: '100%', padding: '0.75rem' }} 
                  value={newPostCommunityId}
                  onChange={(e) => {
                    setNewPostCommunityId(e.target.value);
                    setNewPostTournamentId(''); // Limpiar torneo si selecciona comunidad
                  }}
                >
                  <option value="">-- Publicación General (Sin comunidad) --</option>
                  {communities.filter(c => c.is_approved).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Vincular a Torneo (Opcional)</label>
                <select 
                  className="select-filter" 
                  style={{ width: '100%', padding: '0.75rem' }} 
                  value={newPostTournamentId}
                  onChange={(e) => {
                    setNewPostTournamentId(e.target.value);
                    setNewPostCommunityId(''); // Limpiar comunidad si selecciona torneo
                  }}
                >
                  <option value="">-- Sin vincular a torneo --</option>
                  {tournaments.filter(t => t.is_approved).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Publicar</button>
                <button type="button" className="btn-primary" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={() => setShowPostModal(false)}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE AGREGAR COMENTARIO */}
      {showAddCommentModal && (
        <div className="modal-overlay" onClick={() => setShowAddCommentModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Comentario</h2>
            <form onSubmit={handleAddCommentSubmit}>
              <div className="input-group">
                <label>Tu Comentario</label>
                <textarea 
                  className="input-field" 
                  placeholder="Escribe un comentario respetuoso..."
                  style={{ minHeight: '100px' }} 
                  required 
                  value={newCommentContent} 
                  onChange={(e) => setNewCommentContent(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Enviar Comentario</button>
                <button type="button" className="btn-primary" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={() => setShowAddCommentModal(false)}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE VER COMENTARIOS */}
      {showViewCommentsModal && (
        <div className="modal-overlay" onClick={() => setShowViewCommentsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Comentarios de la Publicación</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto', margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loadingComments && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>⏳ Cargando comentarios...</p>}
              {!loadingComments && commentsList.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hay comentarios aún. ¡Sé el primero!</p>
              )}
              {!loadingComments && commentsList.map(c => (
                <div key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                    @{c.author_username}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', whiteSpace: 'pre-wrap' }}>
                    {c.content}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {new Date(c.created_at).toLocaleString('es-CL')}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ flex: 1 }} 
                onClick={() => {
                  setShowViewCommentsModal(false);
                  handleOpenAddComment(viewingCommentsPostId);
                }}
              >
                + Comentar
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} 
                onClick={() => setShowViewCommentsModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REPORTAR */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✅</span>
                <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>¡Reporte Enviado!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>El equipo de moderación lo revisará a la brevedad.</p>
              </div>
            ) : (
              <>
                <h2>Reportar Contenido</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Ayúdanos a mantener la comunidad limpia. Por favor indica la razón del reporte.
                </p>
                <form onSubmit={handleReportSubmit}>
                  <div className="input-group">
                    <label>Motivo del Reporte</label>
                    <textarea 
                      className="input-field" 
                      placeholder="Ej: Lenguaje ofensivo, spam, etc."
                      style={{ minHeight: '100px' }} 
                      required 
                      value={reportReason} 
                      onChange={(e) => setReportReason(e.target.value)} 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1, backgroundColor: '#ef4444' }}>Enviar Reporte</button>
                    <button type="button" className="btn-primary" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={() => setShowReportModal(false)}>{t.cancelBtn}</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
