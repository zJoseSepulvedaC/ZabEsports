import React from 'react';

export default function Tournaments({
  tournaments,
  loadingTournaments,
  setShowTourneyModal,
  setRegisteringTourney,
  translations,
  lang,
  t
}) {
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
          ⏳ Cargando...
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
                <span>📅 {new Date(t.start_date).toLocaleDateString('es-CL')}</span>
                <span>👥 {t.registered_teams}/{t.max_teams} {translations[lang].registeredTeams}</span>
                {t.prize_pool && <span>🏆 {t.prize_pool}</span>}
              </div>
            </div>
            <div>
              {t.is_approved ? (
                <button 
                  onClick={() => setRegisteringTourney(t.id)} 
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
            </div>
          </div>
        ))}
        {!loadingTournaments && tournaments.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            {t.noTournaments}
          </div>
        )}
      </div>
    </div>
  );
}
