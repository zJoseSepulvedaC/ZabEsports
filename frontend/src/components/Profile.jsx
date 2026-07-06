import React from 'react';

export default function Profile({
  currentUser,
  riotGameName,
  setRiotGameName,
  riotTagLine,
  setRiotTagLine,
  riotRegion,
  setRiotRegion,
  linkingState,
  setLinkingState,
  linkInfo,
  linkError,
  myTeams,
  newTeamName,
  setNewTeamName,
  handleRiotLinkStart,
  handleRiotLinkVerify,
  handleCreateTeam,
  t
}) {
  return (
    <div>
      <header className="header">
        <h1>{t.profile}</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
        {/* Lado Izquierdo: Info del Usuario */}
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
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
                  🎮 {currentUser.riot_summoner_name}
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RANGO LOL</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>🏆 {currentUser.lol_rank}</div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NIVEL</div>
                <div style={{ fontSize: '0.9rem' }}>⭐ {currentUser.lol_summoner_level}</div>
              </div>
            </div>
          ) : (
            <div>
              <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {t.riotUnlinkedStatus}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {t.riotUnlinkedDesc}
              </p>
            </div>
          )}
        </div>

        {/* Lado Derecho: Vinculación con Riot Games */}
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
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ej: Zabat" 
                    required 
                    value={riotGameName} 
                    onChange={(e) => setRiotGameName(e.target.value)} 
                  />
                </div>
                <div className="input-group">
                  <label>{t.riotTagInput}</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ej: sun" 
                    required 
                    value={riotTagLine} 
                    onChange={(e) => setRiotTagLine(e.target.value)} 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>{t.riotRegionLabel}</label>
                <select 
                  className="select-filter" 
                  style={{ width: '100%', padding: '0.75rem' }} 
                  value={riotRegion} 
                  onChange={(e) => setRiotRegion(e.target.value)}
                >
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
              <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                ✓ {t.connectBtn}: {linkInfo?.gameName}#{linkInfo?.tagLine}
              </h4>
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
                <button 
                  className="btn-primary" 
                  onClick={() => setLinkingState('idle')} 
                  style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                >
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

      {/* MIS ESCUADRAS (TEAMS) */}
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Mis Escuadras</h3>
        <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Nombre de la nueva escuadra" 
            value={newTeamName} 
            onChange={(e) => setNewTeamName(e.target.value)} 
            required 
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>+ Crear Equipo</button>
        </form>

        {myTeams.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
            No tienes escuadras aún. ¡Crea una para empezar a reclutar jugadores!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {myTeams.map(team => (
              <div key={team.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
                <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.25rem' }}>{team.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  👥 {team.member_count} {String(team.member_count) === '1' ? 'Miembro' : 'Miembros'}
                </p>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {team.members && team.members.map((member, i) => (
                    <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                      @{member}
                    </span>
                  ))}
                </div>
                {team.captain_id === currentUser?.id && (
                  <span className="role-badge" style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.7rem' }}>
                    Capitán
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
