import React, { useState, useEffect } from 'react';

export default function AdminPanel({ token, API_URL, onUserDeleted }) {
  const [activeTab, setActiveTab] = useState('users'); // users, communities, tournaments
  
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'communities') fetchCommunities();
    if (activeTab === 'tournaments') fetchTournaments();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCommunities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/communities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCommunities(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTournaments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tournaments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTournaments(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: '¿Seguro que deseas eliminar permanentemente a este usuario?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            setUsers(users => users.filter(u => u.id !== id));
            if (onUserDeleted) onUserDeleted();
          } else {
            const data = await res.json();
            alert(data.error || 'Error al eliminar usuario');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleUpdateRole = (id, newRole) => {
    setConfirmDialog({
      isOpen: true,
      message: `¿Cambiar el rol a ${newRole}?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ role: newRole })
          });
          if (res.ok) {
            setUsers(users => users.map(u => u.id === id ? { ...u, role: newRole } : u));
          } else {
            const data = await res.json();
            alert(data.error || 'Error al actualizar rol');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleDeleteCommunity = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: '¿Seguro que deseas eliminar esta comunidad y todo su contenido?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/api/communities/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            setCommunities(communities => communities.filter(c => c.id !== id));
          } else {
            const data = await res.json();
            alert(data.error || 'Error al eliminar comunidad');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleDeleteTournament = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: '¿Seguro que deseas eliminar este torneo?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/api/tournaments/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            setTournaments(tournaments => tournaments.filter(t => t.id !== id));
          } else {
            const data = await res.json();
            alert(data.error || 'Error al eliminar torneo');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div>
      <header className="header" style={{ marginBottom: '1rem', borderBottom: 'none' }}>
        <div>
          <h1 style={{ color: 'var(--primary-color)' }}>Panel de Administración Global</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Acceso exclusivo nivel Dios. Cuidado con lo que borras.
          </p>
        </div>
      </header>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          👤 Gestión de Usuarios
        </button>
        <button 
          className={`btn ${activeTab === 'communities' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('communities')}
        >
          👥 Gestión de Comunidades
        </button>
        <button 
          className={`btn ${activeTab === 'tournaments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tournaments')}
        >
          🏆 Gestión de Torneos
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="card">
          <h3>Usuarios Registrados ({users.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="moderation-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Riot Vinculado</th>
                  <th>Registro</th>
                  <th>Acciones Peligrosas</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>@{u.username}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        style={{
                          background: 'var(--bg-lighter)',
                          color: u.role === 'admin' ? 'var(--primary-color)' : u.role === 'moderador' ? '#10b981' : 'white',
                          border: '1px solid var(--border-color)',
                          padding: '0.3rem',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        <option style={{ background: '#1e1e28', color: 'white' }} value="usuario">Usuario</option>
                        <option style={{ background: '#1e1e28', color: 'white' }} value="moderador">Moderador</option>
                        <option style={{ background: '#1e1e28', color: 'white' }} value="admin">Administrador</option>
                      </select>
                    </td>
                    <td>
                      {u.riot_game_name ? (
                        <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                          ✓ {u.riot_game_name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-small btn-reject" 
                        onClick={() => handleDeleteUser(u.id)}
                        title="Eliminar usuario permanentemente"
                      >
                        <i className="fa-solid fa-trash"></i> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMMUNITIES TAB */}
      {activeTab === 'communities' && (
        <div className="card">
          <h3>Todas las Comunidades ({communities.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="moderation-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Juego</th>
                  <th>Owner</th>
                  <th>Miembros</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {communities.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.game}</td>
                    <td>@{c.owner_username}</td>
                    <td>{c.member_count || 0}</td>
                    <td>
                      <span className={`badge-status ${c.is_approved ? 'badge-approved' : 'badge-pending'}`}>
                        {c.is_approved ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-small btn-reject" 
                        onClick={() => handleDeleteCommunity(c.id)}
                      >
                        <i className="fa-solid fa-trash"></i> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOURNAMENTS TAB */}
      {activeTab === 'tournaments' && (
        <div className="card">
          <h3>Todos los Torneos ({tournaments.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="moderation-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Juego</th>
                  <th>Organizador</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.game}</td>
                    <td>@{t.organizer_username}</td>
                    <td>{new Date(t.start_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge-status ${t.is_approved ? 'badge-approved' : 'badge-pending'}`}>
                        {t.is_approved ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-small btn-reject" 
                        onClick={() => handleDeleteTournament(t.id)}
                      >
                        <i className="fa-solid fa-trash"></i> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmación customizado para Admin */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontWeight: 800, fontSize: '1.3rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Confirmación Requerida
            </h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
                }}
                style={{ background: 'var(--danger, #ef4444)', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.25)', color: 'white' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
