import React from 'react';

export default function Feed({
  currentUser,
  t,
  lang,
  translations,
  loadingPosts,
  posts,
  handleLike,
  openEditPost,
  handleDeletePost,
  loadingCommunities,
  communities,
  tournaments,
  setShowCommModal,
  setShowPostModal,
  setNewPostCommunityId,
  setNewPostTournamentId,
  filterCommunityId,
  setFilterCommunityId,
  filterTournamentId,
  setFilterTournamentId
}) {
  
  // Filtrar posts según comunidad o torneo seleccionado
  const filteredPosts = posts.filter(post => {
    if (filterCommunityId) {
      return post.community_id === filterCommunityId;
    }
    if (filterTournamentId) {
      return post.tournament_id === filterTournamentId;
    }
    return true;
  });

  // Obtener nombre del filtro actual
  const activeFilterName = () => {
    if (filterCommunityId) {
      const comm = communities.find(c => c.id === filterCommunityId);
      return comm ? `Comunidad: ${comm.name}` : 'Comunidad seleccionada';
    }
    if (filterTournamentId) {
      const tourney = tournaments.find(t => t.id === filterTournamentId);
      return tourney ? `Torneo: ${tourney.name}` : 'Torneo seleccionado';
    }
    return '';
  };

  const handleOpenCreatePost = () => {
    // Si hay un filtro activo, pre-vincular al crear
    if (filterCommunityId) {
      setNewPostCommunityId(filterCommunityId);
      setNewPostTournamentId('');
    } else if (filterTournamentId) {
      setNewPostTournamentId(filterTournamentId);
      setNewPostCommunityId('');
    } else {
      setNewPostCommunityId('');
      setNewPostTournamentId('');
    }
    setShowPostModal(true);
  };

  return (
    <div>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{t.welcome}, {currentUser?.username}!</h1>
          <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
            🌐 {t.connectAzure}
          </span>
        </div>
        <button 
          className="btn-primary" 
          style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', padding: '0.6rem 1.2rem' }}
          onClick={handleOpenCreatePost}
        >
          + Crear Publicación
        </button>
      </header>

      {/* BANNER DE FILTRO ACTIVO */}
      {(filterCommunityId || filterTournamentId) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', padding: '0.75rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', color: 'var(--text-light)' }}>
          <span> Filtrado por <strong>{activeFilterName()}</strong></span>
          <button 
            className="btn-primary" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            onClick={() => {
              setFilterCommunityId('');
              setFilterTournamentId('');
            }}
          >
            Ver Todas
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        {/* COLUMNA IZQUIERDA: FEED DE POSTS */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>{t.feedTitle}</h2>
          {loadingPosts && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              ⏳ Cargando publicaciones...
            </div>
          )}
          {!loadingPosts && filteredPosts.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No hay publicaciones disponibles en esta sección. ¡Sé el primero en publicar!
            </div>
          )}
          {filteredPosts.map(post => (
            <article key={post.id} className="card">
              <h3>
                {post.title}
                {post.community_name && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', background: 'rgba(139,92,246,0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' }}>
                    👥 {post.community_name}
                  </span>
                )}
                {post.tournament_name && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-pink)', background: 'rgba(236,72,153,0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' }}>
                    🏆 {post.tournament_name}
                  </span>
                )}
              </h3>
              <div className="post-meta">
                Publicado por @{post.author_username} • {new Date(post.created_at).toLocaleDateString('es-CL')}
              </div>
              <div className="post-body" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
              <div className="post-actions">
                <button className="action-btn" onClick={() => handleLike(post.id)}>
                  👍 Reacciones ({post.likes})
                </button>
                <button className="action-btn">💬 Comentar</button>
                {post.author_username === currentUser?.username && (
                  <>
                    <button className="action-btn" onClick={() => openEditPost(post)}>
                      ✏️ Editar
                    </button>
                    <button 
                      className="action-btn" 
                      style={{ color: '#ef4444' }} 
                      onClick={() => handleDeletePost(post.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* COLUMNA DERECHA: SIDEBAR DE COMUNIDADES Y EVENTOS */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t.activeComms}</h2>
            <button 
              className="btn-primary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} 
              onClick={() => setShowCommModal(true)}
            >
              {t.createCommunity}
            </button>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            {loadingCommunities ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>⏳ Cargando comunidades...</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {communities
                  .filter(c => c.is_approved || c.owner_username === currentUser?.username)
                  .map(c => (
                    <li 
                      key={c.id} 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🎮 {c.name}</span>
                          {!c.is_approved && (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(255,184,0,0.15)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 'bold' }}>
                              {translations[lang].statusPending}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.member_count} {t.members} • {c.game}
                        </span>
                      </div>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: filterCommunityId === c.id ? 'var(--accent-purple)' : '' }}
                        onClick={() => {
                          setFilterCommunityId(c.id);
                          setFilterTournamentId('');
                        }}
                      >
                        Ver
                      </button>
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
              {tournaments
                .filter(t => t.is_approved && t.status === 'OPEN')
                .slice(0, 3)
                .map(t => (
                  <li 
                    key={t.id} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}
                  >
                    <span 
                      style={{ color: 'var(--accent-cyan)', cursor: 'pointer', textDecoration: 'underline' }} 
                      title="Hacer clic para ver publicaciones del torneo"
                      onClick={() => {
                        setFilterTournamentId(t.id);
                        setFilterCommunityId('');
                      }}
                    >
                      • {t.name.substring(0, 24)}...
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(t.start_date).toLocaleDateString('es-CL')}
                    </span>
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
  );
}
