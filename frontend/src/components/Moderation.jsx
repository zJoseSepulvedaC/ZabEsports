import React from 'react';

export default function Moderation({
  communities,
  tournaments,
  handleApproveCommunity,
  handleApproveTournament,
  t
}) {
  return (
    <div>
      <header className="header">
        <h1>{t.moderationPanel}</h1>
      </header>

      <div className="card">
        <h3>{t.pendingComms}</h3>
        <table className="moderation-table">
          <thead>
            <tr>
              <th>{t.nameLabel}</th>
              <th>{t.gameLabel}</th>
              <th>Owner</th>
              <th>{t.members}</th>
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
                    {c.is_approved ? t.statusApproved : t.statusPending}
                  </span>
                </td>
                <td>
                  {!c.is_approved ? (
                    <>
                      <button className="btn-small btn-approve" onClick={() => handleApproveCommunity(c.id)}>
                        {t.approve}
                      </button>
                      <button className="btn-small btn-reject">{t.reject}</button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.completed}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>{t.pendingTourneys}</h3>
        <table className="moderation-table">
          <thead>
            <tr>
              <th>Torneo</th>
              <th>Organizador</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map(tData => (
              <tr key={tData.id}>
                <td>{tData.name}</td>
                <td>@{tData.organizer_username}</td>
                <td>{new Date(tData.start_date).toLocaleDateString('es-CL')}</td>
                <td>
                  <span className={`badge-status ${tData.is_approved ? 'badge-approved' : 'badge-pending'}`}>
                    {tData.is_approved ? t.statusApproved : t.statusPending}
                  </span>
                </td>
                <td>
                  {!tData.is_approved ? (
                    <>
                      <button className="btn-small btn-approve" onClick={() => handleApproveTournament(tData.id)}>
                        {t.approve}
                      </button>
                      <button className="btn-small btn-reject">{t.reject}</button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.completed}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
