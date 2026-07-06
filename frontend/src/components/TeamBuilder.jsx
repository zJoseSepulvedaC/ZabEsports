import React from 'react';

export default function TeamBuilder({
  selectedRole,
  setSelectedRole,
  selectedRank,
  setSelectedRank,
  selectedTeamStatus,
  setSelectedTeamStatus,
  filteredPlayers,
  setSelectedPlayerProfile,
  setRecruitingPlayer,
  setShowRecruitModal,
  setActiveTab,
  t
}) {
  return (
    <div>
      <header className="header">
        <h1>TEAM BUILDER</h1>
        <button className="btn-primary" onClick={() => setActiveTab('profile')}>
          {t.postulateBtn}
        </button>
      </header>

      <div className="filters-bar" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {t.positionLabel}:
          </label>
          <select 
            className="select-filter" 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="ALL">{t.allRoles}</option>
            <option value="TOP">Top</option>
            <option value="JUNGLE">Jungle</option>
            <option value="MID">Mid</option>
            <option value="ADC">ADC</option>
            <option value="SUPPORT">Support</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {t.rankLabel}:
          </label>
          <select 
            className="select-filter" 
            value={selectedRank} 
            onChange={(e) => setSelectedRank(e.target.value)}
          >
            <option value="ALL">{t.allRanks}</option>
            <option value="Iron">{t.rank_iron}</option>
            <option value="Bronze">{t.rank_bronze}</option>
            <option value="Silver">{t.rank_silver}</option>
            <option value="Gold">{t.rank_gold}</option>
            <option value="Platinum">{t.rank_platinum}</option>
            <option value="Emerald">{t.rank_emerald}</option>
            <option value="Diamond">{t.rank_diamond}</option>
            <option value="Master">{t.rank_master}</option>
            <option value="Grandmaster">{t.rank_grandmaster}</option>
            <option value="Challenger">{t.rank_challenger}</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Estado Equipo:
          </label>
          <select 
            className="select-filter" 
            value={selectedTeamStatus} 
            onChange={(e) => setSelectedTeamStatus(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="HAS_TEAM">Con Escuadra</option>
            <option value="FREE_AGENT">Agente Libre</option>
          </select>
        </div>
      </div>

      <div className="player-grid">
        {filteredPlayers.map(player => (
          <div key={player.id} className="player-card">
            <span className="player-role-banner">{player.position}</span>
            <div className="player-avatar-container">
              <div 
                className="player-avatar-inner" 
                style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}
              >
                Lvl {player.level}
              </div>
            </div>

            <h4 
              onClick={() => setSelectedPlayerProfile(player)} 
              style={{ cursor: 'pointer', color: 'var(--text-light)', textDecoration: 'underline' }}
              title="Ver estadísticas en OP.GG"
            >
              {player.username}
            </h4>

            <div className="summoner-name" style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>
              🎮 {player.riot_name || 'Sin vincular'}
            </div>

            <div style={{ margin: '0.5rem 0', fontSize: '0.85rem' }}>
              {player.team_name ? (
                <span style={{ color: 'var(--accent-cyan)', background: 'rgba(0, 240, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                  🛡️ Escuadra: {player.team_name}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  🏃 Agente Libre
                </span>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '4px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
              🏆 {player.rank}
            </div>

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
              Availability: {player.availability}
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%' }} 
              onClick={() => { 
                setRecruitingPlayer(player); 
                setShowRecruitModal(true); 
              }}
            >
              {t.recruitBtn}
            </button>
          </div>
        ))}

        {filteredPlayers.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
            {t.noPlayers}
          </div>
        )}
      </div>
    </div>
  );
}
