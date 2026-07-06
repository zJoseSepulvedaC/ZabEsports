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
  setShowCommModal
}) {
  return (
    <div>
      <header className="header">
        <h1>{t.welcome}, {currentUser?.username}!</h1>
        <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
          🌐 {t.connectAzure}
        </span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>{t.feedTitle}</h2>
          {loadingPosts && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              ⏳ Cargando...
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
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', background: 'rgba(139,92,246,0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' }}>
                    {post.community_name}
                  </span>
                )}
              </h3>
              <div className="post-meta">
                Publicado por @{post.author_username} • {new Date(post.created_at).toLocaleDateString('es-CL')}
              </div>
              <div className="post-body">{post.content}</div>
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
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>⏳ Cargando...</p>
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
                      <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
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
  );
}
