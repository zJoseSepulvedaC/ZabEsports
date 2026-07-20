import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'https://zabesports-api-aje2efc6adawfyh0.eastus2-01.azurewebsites.net';

// ============================================================
// GAMES CATALOG (like Battlefy's Select a Game)
// ============================================================
const GAMES_CATALOG = [
  { name: 'League of Legends', icon: '⚔️', color: '#C8A84B' },
  { name: 'Valorant',          icon: '🎯', color: '#FF4655' },
  { name: '2XKO',              icon: '👊', color: '#5A4FFF' },
  { name: 'Teamfight Tactics', icon: '♟️', color: '#88DFEF' },
  { name: 'Apex Legends',      icon: '🔫', color: '#FF6B35' },
  { name: 'Clash Royale',      icon: '🏆', color: '#F59E0B' },
  { name: 'Overwatch 2',       icon: '🛡️', color: '#F99E1A' },
  { name: 'Hearthstone',       icon: '🃏', color: '#8B5CF6' },
  { name: 'EA Sports FC 26',   icon: '⚽', color: '#10B981' },
  { name: 'Fortnite',          icon: '🏗️', color: '#06B6D4' },
  { name: 'Dota 2',            icon: '🗡️', color: '#DC2626' },
  { name: 'Counter-Strike 2',  icon: '💣', color: '#6B7280' },
];

const REGIONS = ['Latin America South', 'Latin America North', 'North America', 'Europe West', 'Brazil', 'OCE', 'Korea', 'Japan'];
const MAPS = ['Summoners Rift', 'ARAM - Howling Abyss', 'Teamfight Tactics'];
const GAME_FORMATS = ['Tournament Draft', 'All Random All Mid', 'Blind Pick', 'Draft Pick'];
const TOURNEY_FORMATS = ['Pre-Made Teams', '1v1', 'Free Agent Draft', 'Pre-Mades & Free Agents'];

// ============================================================
// MULTI-STEP WIZARD COMPONENT
// ============================================================
function TournamentWizard({ token, communities, currentUser, onClose, onCreated }) {
  const STEPS = ['SELECT GAME', 'BASICS', 'INFO', 'SETTINGS', 'BRACKETS', 'PUBLISH'];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null); // tournament result after creation
  const [gameSearch, setGameSearch] = useState('');

  const [form, setForm] = useState({
    // BASICS
    game: '', name: '', start_date: '', start_time: '19:00', community_id: '',
    // INFO
    contact_method: '', contact_details: '', critical_rules: '', rules: '', prizes: '', schedule: '',
    // SETTINGS
    game_region: 'Latin America South', game_map: 'Summoners Rift', game_format: 'Tournament Draft',
    tournament_format: 'Pre-Made Teams', min_players_per_team: 5, max_teams: 16,
    check_in_enabled: false, check_in_start_time: 60,
    match_score_reporting: 'Admins & Players', require_screenshots: false,
    max_team_size: null, registration_limit: null,
    // BRACKETS
    bracket_type: 'elimination',
    // PUBLISH
    is_published: false, visibility: 'public', use_join_code: false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k) => setForm(f => ({ ...f, [k]: !f[k] }));

  const today = new Date().toISOString().split('T')[0];

  const canNext = () => {
    if (step === 0) return !!form.game;
    if (step === 1) return form.name.trim() && form.start_date && form.start_date >= today;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body = { ...form };
      if (!body.use_join_code) body.visibility = 'public';
      const res = await fetch(`${API_URL}/api/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        // Override invite_link with the real app URL (backend hardcodes zabesports.com)
        const realInviteLink = `${window.location.origin}/torneos/${data.tournament.slug}`;
        setCreated({ ...data, invite_link: realInviteLink });
        setStep(6); // show result screen
        onCreated && onCreated(data.tournament);
      } else {
        alert(data.error || 'Error al crear torneo');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = GAMES_CATALOG.filter(g =>
    g.name.toLowerCase().includes(gameSearch.toLowerCase())
  );

  return (
    <div className="wizard-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wizard-container">
        {/* Sidebar */}
        <div className="wizard-sidebar">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              {step === 6 ? 'SHARE' : 'CREATE'}
            </div>
            {step === 6 ? (
              <>
                <div className="wizard-sidebar-link active">Setup</div>
                <div className="wizard-sidebar-link active">Brackets</div>
                <div className="wizard-sidebar-link active">Publish</div>
              </>
            ) : (
              <>
                <div className={`wizard-sidebar-link ${[1,2,3].includes(step) ? 'active' : ''}`} onClick={() => step > 1 && setStep(1)}>Setup</div>
                <div className={`wizard-sidebar-link ${step === 4 ? 'active' : ''}`} onClick={() => step > 4 && setStep(4)}>Brackets</div>
                <div className={`wizard-sidebar-link ${step === 5 ? 'active' : ''}`} onClick={() => step > 5 && setStep(5)}>Publish</div>
              </>
            )}
          </div>
          {step === 6 && (
            <>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', marginTop: '1rem' }}>SHARE</div>
              <div className="wizard-sidebar-link active">Invite Players</div>
              <div className="wizard-sidebar-link">Embed Codes</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', marginTop: '1.5rem' }}>MANAGE</div>
              <div className="wizard-sidebar-link">Participants</div>
              <div className="wizard-sidebar-link">Match Dashboard</div>
              <div className="wizard-sidebar-link">Activity Feed</div>
            </>
          )}
        </div>

        {/* Main content */}
        <div className="wizard-main">
          {/* Tabs (steps 1-5) */}
          {step > 0 && step < 6 && (
            <div className="wizard-tabs">
              {['BASICS', 'INFO', 'SETTINGS', 'BRACKETS', 'PUBLISH'].map((tab, i) => (
                <button
                  key={tab}
                  className={`wizard-tab ${step === i + 1 ? 'active' : ''}`}
                  onClick={() => i + 1 < step && setStep(i + 1)}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* STEP 0: SELECT GAME */}
          {step === 0 && (
            <div className="wizard-step">
              <h2 className="wizard-title">SELECT A GAME</h2>
              <div style={{ margin: '1.5rem 0' }}>
                <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                  <input
                    type="text" placeholder="Search the catalog"
                    value={gameSearch} onChange={e => setGameSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>Popular Games</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {filteredGames.map(g => (
                  <div
                    key={g.name}
                    onClick={() => { set('game', g.name); setStep(1); }}
                    className={`game-card ${form.game === g.name ? 'selected' : ''}`}
                    style={{ '--game-color': g.color }}
                  >
                    <div className="game-card-icon">{g.icon}</div>
                    <div className="game-card-name">{g.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="wizard-step">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>SELECTED GAME</div>
                  <div style={{ color: '#fff', fontWeight: '600' }}>{form.game}</div>
                </div>
              </div>

              <h3 className="wizard-section-title">REQUIRED FIELDS</h3>
              <div className="wizard-field">
                <label className="wizard-label">Tournament Name</label>
                <input className="wizard-input" placeholder="Tournament Name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="wizard-field">
                  <label className="wizard-label">Start Date</label>
                  <input
                    className="wizard-input"
                    type="date"
                    value={form.start_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => set('start_date', e.target.value)}
                  />
                  {form.start_date && form.start_date < new Date().toISOString().split('T')[0] && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem' }}>⚠️ La fecha no puede ser en el pasado.</div>
                  )}
                </div>
                <div className="wizard-field">
                  <label className="wizard-label">Start Time</label>
                  <input className="wizard-input" type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
                </div>
              </div>

              {communities && communities.length > 0 && (
                <div className="wizard-field">
                  <label className="wizard-label">Organization (Comunidad)</label>
                  <select className="wizard-select" value={form.community_id} onChange={e => set('community_id', e.target.value)}>
                    <option value="">Sin comunidad</option>
                    {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="wizard-field">
                <label className="wizard-label">Max Teams</label>
                <input className="wizard-input" type="number" min="2" max="256" value={form.max_teams} onChange={e => set('max_teams', parseInt(e.target.value))} />
              </div>

              <h3 className="wizard-section-title" style={{ marginTop: '2rem' }}>OPTIONAL FIELDS</h3>
              <div className="wizard-field">
                <div className="wizard-accordion-header" onClick={() => {}}>
                  <span>About</span><span>+</span>
                </div>
              </div>
              <div className="wizard-field">
                <label className="wizard-label">Header Banner URL</label>
                <input className="wizard-input" placeholder="https://..." value={form.header_banner_url || ''} onChange={e => set('header_banner_url', e.target.value)} />
                {form.header_banner_url && (
                  <img src={form.header_banner_url} alt="banner" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem', border: '1px solid var(--border-color)' }} />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: INFO */}
          {step === 2 && (
            <div className="wizard-step">
              <div className="wizard-field">
                <label className="wizard-label">HOW WILL YOUR PLAYERS CONTACT YOU?</label>
                <select className="wizard-select" value={form.contact_method} onChange={e => set('contact_method', e.target.value)}>
                  <option value="">Select a contact option</option>
                  <option value="discord">Discord</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="twitter">Twitter/X</option>
                </select>
              </div>

              {[
                { key: 'contact_details', label: 'Contact Details' },
                { key: 'critical_rules', label: 'Critical Rules' },
                { key: 'rules', label: 'Rules' },
                { key: 'prizes', label: 'Prizes' },
                { key: 'schedule', label: 'Schedule' },
              ].map(({ key, label }) => (
                <div key={key} className="wizard-field">
                  <div
                    className="wizard-accordion-header"
                    onClick={e => {
                      const ta = e.currentTarget.nextSibling;
                      if (ta) ta.style.display = ta.style.display === 'none' ? 'block' : 'none';
                    }}
                  >
                    <span>{label}</span><span>+</span>
                  </div>
                  <textarea
                    className="wizard-textarea"
                    style={{ display: 'none' }}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    rows={4}
                  />
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: SETTINGS */}
          {step === 3 && (
            <div className="wizard-step">
              <h3 className="wizard-section-title">REQUIRED FIELDS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="wizard-field">
                  <label className="wizard-label">Game Region/Server</label>
                  <select className="wizard-select" value={form.game_region} onChange={e => set('game_region', e.target.value)}>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="wizard-field">
                  <label className="wizard-label">Game Map</label>
                  <select className="wizard-select" value={form.game_map} onChange={e => set('game_map', e.target.value)}>
                    {MAPS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="wizard-field">
                  <label className="wizard-label">Game Format</label>
                  <select className="wizard-select" value={form.game_format} onChange={e => set('game_format', e.target.value)}>
                    {GAME_FORMATS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="wizard-field">
                <label className="wizard-label">Tournament Format</label>
                <select className="wizard-select" value={form.tournament_format} onChange={e => set('tournament_format', e.target.value)}>
                  {TOURNEY_FORMATS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="wizard-field">
                  <label className="wizard-label">Minimum Players Per Team</label>
                  <input className="wizard-input" type="number" min="1" max="10" value={form.min_players_per_team} onChange={e => set('min_players_per_team', parseInt(e.target.value))} />
                </div>
              </div>

              <div className="wizard-field">
                <label className="wizard-label">Check-In</label>
                <div className="wizard-toggle-group">
                  <button className={`wizard-toggle-btn ${!form.check_in_enabled ? 'active' : ''}`} onClick={() => set('check_in_enabled', false)}>Disabled</button>
                  <button className={`wizard-toggle-btn ${form.check_in_enabled ? 'active' : ''}`} onClick={() => set('check_in_enabled', true)}>Enabled</button>
                </div>
                {form.check_in_enabled && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select className="wizard-select" style={{ width: 'auto' }} value={form.check_in_start_time} onChange={e => set('check_in_start_time', parseInt(e.target.value))}>
                      {[15, 30, 45, 60, 90, 120].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>minutes before registration close.</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="wizard-field">
                  <label className="wizard-label">Match Score Reporting</label>
                  <div className="wizard-toggle-group">
                    <button className={`wizard-toggle-btn ${form.match_score_reporting === 'Admins Only' ? 'active' : ''}`} onClick={() => set('match_score_reporting', 'Admins Only')}>Admins Only</button>
                    <button className={`wizard-toggle-btn ${form.match_score_reporting === 'Admins & Players' ? 'active' : ''}`} onClick={() => set('match_score_reporting', 'Admins & Players')}>Admins & Players</button>
                  </div>
                </div>
                <div className="wizard-field">
                  <label className="wizard-label">Require Screenshots</label>
                  <div className="wizard-toggle-group">
                    <button className={`wizard-toggle-btn ${!form.require_screenshots ? 'active' : ''}`} onClick={() => set('require_screenshots', false)}>Not Required</button>
                    <button className={`wizard-toggle-btn ${form.require_screenshots ? 'active' : ''}`} onClick={() => set('require_screenshots', true)}>Required</button>
                  </div>
                </div>
              </div>

              <h3 className="wizard-section-title" style={{ marginTop: '2rem' }}>ADVANCED FIELDS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="wizard-field">
                  <label className="wizard-label">Maximum Team Size</label>
                  <div className="wizard-toggle-group">
                    <button className={`wizard-toggle-btn ${!form.max_team_size ? 'active' : ''}`} onClick={() => set('max_team_size', null)}>None</button>
                    <button className={`wizard-toggle-btn ${form.max_team_size ? 'active' : ''}`} onClick={() => set('max_team_size', form.min_players_per_team + 2)}>Capped</button>
                  </div>
                </div>
                <div className="wizard-field">
                  <label className="wizard-label">Registration Participant Limit</label>
                  <div className="wizard-toggle-group">
                    <button className={`wizard-toggle-btn ${!form.registration_limit ? 'active' : ''}`} onClick={() => set('registration_limit', null)}>Unlimited</button>
                    <button className={`wizard-toggle-btn ${form.registration_limit ? 'active' : ''}`} onClick={() => set('registration_limit', 32)}>Limited</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BRACKETS */}
          {step === 4 && (
            <div className="wizard-step">
              <h2 className="wizard-title">FORMATO DE BRACKETS</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Selecciona el tipo de bracket para tu torneo. Los brackets se generarán <strong style={{ color: 'var(--accent-cyan)' }}>automáticamente</strong> al cerrarse el período de inscripción (<strong style={{ color: '#fff' }}>{/* start_date */}</strong>fecha y hora del torneo). Solo los equipos inscritos participarán.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {[
                  { key: 'elimination', label: 'Eliminación Directa', desc: 'El equipo perdedor queda eliminado. Ideal para torneos rápidos con muchos equipos.' },
                  { key: 'round_robin', label: 'Round Robin (Todos vs Todos)', desc: 'Cada equipo juega contra todos los demás. Más juego, mejor clasificación.' },
                  { key: 'swiss', label: 'Sistema Suizo', desc: 'Emparejamiento dinámico según rendimiento. Ideal para torneos largos.' },
                ].map(b => (
                  <div
                    key={b.key}
                    onClick={() => set('bracket_type', b.key)}
                    className={`bracket-type-card ${form.bracket_type === b.key ? 'selected' : ''}`}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ color: form.bracket_type === b.key ? 'var(--accent-cyan)' : '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>{b.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{b.desc}</div>
                    </div>
                    <span style={{ fontSize: '1.5rem', color: form.bracket_type === b.key ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      {form.bracket_type === b.key ? '✓' : '+'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          )}

          {/* STEP 5: PUBLISH */}
          {step === 5 && (
            <div className="wizard-step">
              <h2 className="wizard-title">PUBLISH TOURNAMENT</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Publishing this tournament will enable registration and allow players to join.
              </p>
              <div className="wizard-field">
                <div className="wizard-toggle-group">
                  <button className={`wizard-toggle-btn ${!form.is_published ? 'active' : ''}`} onClick={() => set('is_published', false)}>Draft</button>
                  <button className={`wizard-toggle-btn ${form.is_published ? 'active' : ''}`} onClick={() => set('is_published', true)}>Published</button>
                </div>
              </div>
              {form.is_published && (
                <>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '1rem 0 0.75rem' }}>Public tournaments are eligible to appear in search results.</p>
                  <div className="wizard-field">
                    <div className="wizard-toggle-group">
                      <button className={`wizard-toggle-btn ${form.visibility === 'private' ? 'active' : ''}`} onClick={() => set('visibility', 'private')}>Private</button>
                      <button className={`wizard-toggle-btn ${form.visibility === 'public' ? 'active' : ''}`} onClick={() => set('visibility', 'public')}>Public</button>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '1rem 0 0.5rem' }}>You can control who enters your tournament with join codes.</p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: '#fff' }}>
                    <input type="checkbox" checked={form.use_join_code} onChange={() => toggle('use_join_code')} />
                    Use Join Codes
                  </label>
                </>
              )}
            </div>
          )}

          {/* STEP 6: RESULT - INVITE PLAYERS */}
          {step === 6 && created && (
            <div className="wizard-step">
              <div style={{ background: 'rgba(0,255,100,0.05)', border: '1px solid rgba(0,255,100,0.3)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                <h3 style={{ color: '#00ff64', fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                  {created.tournament.is_published ? '¡Torneo Publicado!' : '¡Torneo Creado!'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {created.tournament.is_published ? 'Los jugadores ya pueden encontrarlo y unirse.' : 'Torneo guardado en modo borrador.'}
                </p>
              </div>

              <h3 className="wizard-title" style={{ fontSize: '1.2rem' }}>INVITE PLAYERS</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Help players find your tournament by sharing this link with them.
              </p>
              <div className="wizard-field">
                <label className="wizard-label">Invite Link</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="wizard-input"
                    readOnly
                    value={created.invite_link}
                    style={{ cursor: 'text' }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => { navigator.clipboard.writeText(created.invite_link); }}
                    style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem' }}
                  >
                    📋 Copiar
                  </button>
                </div>
              </div>

              {created.join_code && (
                <div className="wizard-field" style={{ marginTop: '1rem' }}>
                  <label className="wizard-label">Join Code</label>
                  <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(139,92,246,0.15)', border: '1px solid var(--accent-purple)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1.5rem', color: 'var(--accent-purple)', letterSpacing: '0.25em' }}>
                    {created.join_code}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=¡Únete a mi torneo en ZabEsports! ${created.invite_link}`}
                  target="_blank" rel="noreferrer"
                  className="btn-primary"
                  style={{ background: '#1DA1F2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  🐦 Twitter
                </a>
                <button className="btn-primary" style={{ background: '#5865F2' }}
                  onClick={() => { navigator.clipboard.writeText(`¡Únete a mi torneo en ZabEsports! ${created.invite_link}`); }}>
                  💬 Discord
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            {step > 0 && step < 6 && (
              <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            {step === 6 && (
              <button className="btn-secondary" onClick={onClose}>✕ Cerrar</button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {step < 5 && step > 0 && (
                <button
                  className="btn-primary"
                  disabled={!canNext()}
                  onClick={() => setStep(s => s + 1)}
                  style={{ opacity: canNext() ? 1 : 0.5 }}
                >
                  Next →
                </button>
              )}
              {step === 5 && (
                <button
                  className="btn-primary"
                  disabled={loading}
                  onClick={handleSubmit}
                  style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}
                >
                  {loading ? 'Creando...' : 'Finish ✓'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MATCH DETAILS MODAL (Check-in & Chat)
// ============================================================
function MatchDetailsModal({ match, tournamentId, token, currentUser, onClose, onMatchUpdated }) {
  const [loading, setLoading] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(true);

  // Fetch chat
  const loadChat = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${tournamentId}/matches/${match.id}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMsgs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
    // Refresh chat every 5s while open
    const interval = setInterval(loadChat, 5000);
    return () => clearInterval(interval);
  }, [match.id]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${tournamentId}/matches/${match.id}/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Check-in exitoso!');
        onMatchUpdated && onMatchUpdated();
      } else {
        alert(data.error || 'Error en check-in');
      }
    } catch (err) {
      alert('Error de conexión');
    }
    setLoading(false);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${tournamentId}/matches/${match.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: newMsg })
      });
      if (res.ok) {
        setNewMsg('');
        loadChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#fff', margin: 0 }}>Detalles de Partida</h2>
          <button className="btn-secondary" onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', padding: '0 0.5rem' }}>✕</button>
        </div>

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: match.team1_name ? '#fff' : 'var(--text-muted)' }}>
                {match.team1_name || 'TBD'}
              </div>
              <div style={{ fontSize: '0.8rem', color: match.team1_checkin ? '#00ff64' : 'var(--text-muted)', marginTop: '0.5rem' }}>
                {match.team1_checkin ? '✅ CHECK-IN LISTO' : 'Esperando check-in...'}
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)', padding: '0 1rem', fontWeight: '900' }}>VS</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: match.team2_name ? '#fff' : 'var(--text-muted)' }}>
                {match.team2_name || 'TBD'}
              </div>
              <div style={{ fontSize: '0.8rem', color: match.team2_checkin ? '#00ff64' : 'var(--text-muted)', marginTop: '0.5rem' }}>
                {match.team2_checkin ? '✅ CHECK-IN LISTO' : 'Esperando check-in...'}
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            {match.status === 'PENDIENTE' && match.team1_name && match.team2_name && (
              <button 
                className="btn-primary" 
                onClick={handleCheckIn}
                disabled={loading}
                style={{ background: 'var(--accent-purple)', padding: '0.75rem 2rem' }}
              >
                {loading ? 'Cargando...' : 'DAR CHECK-IN'}
              </button>
            )}
            
            {match.tournament_code && (
              <div style={{ marginTop: '1.5rem', background: 'rgba(139,92,246,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent-purple)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>CÓDIGO DE TORNEO (RIOT GAMES)</div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '4px', letterSpacing: '1px', color: '#fff' }}>
                    {match.tournament_code}
                  </code>
                  <button 
                    className="btn-secondary" 
                    onClick={() => navigator.clipboard.writeText(match.tournament_code)}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
            
            {match.winner_team_name && (
              <div style={{ marginTop: '1rem', color: '#f59e0b', fontWeight: 'bold', fontSize: '1.1rem' }}>
                🏆 GANADOR: {match.winner_team_name}
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: '600' }}>
            💬 Match Chat
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {chatLoading ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Cargando chat...</div>
            ) : chatMsgs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>No hay mensajes aún. ¡Saluda a tus oponentes!</div>
            ) : (
              chatMsgs.map(msg => (
                <div key={msg.id} style={{ 
                  background: msg.user_id === currentUser.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                  alignSelf: msg.user_id === currentUser.id ? 'flex-end' : 'flex-start',
                  padding: '0.5rem 0.75rem', 
                  borderRadius: '8px', 
                  maxWidth: '80%' 
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    {msg.username} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{msg.message}</div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendChat} style={{ display: 'flex', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-color)' }}>
            <input 
              type="text" 
              value={newMsg} 
              onChange={e => setNewMsg(e.target.value)} 
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem 0.75rem', color: '#fff' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BRACKET VISUALIZER
// ============================================================
function BracketVisualizer({ matches, tournamentId, token, currentUser, organizer, onWinnerDeclared, onMatchClick }) {
  const [declaringMatch, setDeclaringMatch] = useState(null);

  if (!matches || matches.length === 0) return null;

  const rounds = {};
  matches.forEach(m => {
    if (!rounds[m.round_num]) rounds[m.round_num] = [];
    rounds[m.round_num].push(m);
  });
  const roundKeys = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  const getRoundName = (roundNum, totalRounds) => {
    const diff = totalRounds - roundNum;
    if (diff === 0) return 'FINAL';
    if (diff === 1) return 'SEMIFINAL';
    if (diff === 2) return 'CUARTOS DE FINAL';
    return `RONDA ${roundNum}`;
  };

  const handleDeclareWinner = async (matchId, winnerName) => {
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${tournamentId}/declare-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ match_id: matchId, winner_team_name: winnerName })
      });
      const data = await res.json();
      if (res.ok) {
        setDeclaringMatch(null);
        onWinnerDeclared && onWinnerDeclared();
      } else {
        alert(data.error || 'Error al declarar ganador');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="bracket-container">
      {roundKeys.map(roundNum => (
        <div key={roundNum} className="bracket-round">
          <div className="bracket-round-title">{getRoundName(roundNum, roundKeys.length)}</div>
          <div className="bracket-matches">
            {rounds[roundNum].map(match => (
              <div key={match.id} className={`bracket-match ${match.status}`} onClick={() => onMatchClick && onMatchClick(match)} style={{ cursor: 'pointer' }}>
                <div className={`bracket-team ${match.winner_team_name === match.team1_name ? 'winner' : ''} ${!match.team1_name ? 'bye' : ''}`}>
                  <span>{match.team1_name || 'TBD'}</span>
                  {isOrganizer(organizer, currentUser) && match.status === 'PENDIENTE' && match.team1_name && (
                    <button className="bracket-win-btn" onClick={() => handleDeclareWinner(match.id, match.team1_name)}>W</button>
                  )}
                </div>
                <div className="bracket-vs">VS</div>
                <div className={`bracket-team ${match.winner_team_name === match.team2_name ? 'winner' : ''} ${!match.team2_name || match.status === 'BYE' ? 'bye' : ''}`}>
                  <span>{match.status === 'BYE' ? 'BYE' : (match.team2_name || 'TBD')}</span>
                  {isOrganizer(organizer, currentUser) && match.status === 'PENDIENTE' && match.team2_name && (
                    <button className="bracket-win-btn" onClick={() => handleDeclareWinner(match.id, match.team2_name)}>W</button>
                  )}
                </div>
                {match.tournament_code && (
                  <div
                    className="bracket-code"
                    title="Click para copiar código de Riot"
                    onClick={() => { navigator.clipboard.writeText(match.tournament_code); }}
                  >
                    🎮 {match.tournament_code.substring(0, 12)}...
                  </div>
                )}
                {match.winner_team_name && (
                  <div className="bracket-winner-badge">🏆 {match.winner_team_name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function isOrganizer(organizer_username, currentUser) {
  return currentUser && (currentUser.username === organizer_username || currentUser.role === 'admin');
}

// ============================================================
// TOURNAMENT DETAIL VIEW (public page, like Battlefy)
// ============================================================
function TournamentDetail({ tourney, token, currentUser, teams, matches, onBack, onRegister, onGenerateBrackets, onTourneyUpdated }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingBrackets, setGeneratingBrackets] = useState(false);
  const [localMatches, setLocalMatches] = useState(matches || []);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const manageRef = useRef(null);

  // Close manage menu on outside click
  useEffect(() => {
    const handler = (e) => { if (manageRef.current && !manageRef.current.contains(e.target)) setShowManageMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTogglePublish = async () => {
    if (!token) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${tourney.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_published: !tourney.is_published })
      });
      if (res.ok) {
        onTourneyUpdated && onTourneyUpdated();
      } else {
        const d = await res.json();
        alert(d.error || 'Error al actualizar');
      }
    } finally {
      setPublishing(false);
      setShowManageMenu(false);
    }
  };

  const refreshMatches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${tourney.id}/matches`);
      if (res.ok) setLocalMatches(await res.json());
    } catch {}
  };

  useEffect(() => { setLocalMatches(matches || []); }, [matches]);

  const handleGenerateBrackets = async () => {
    setShowConfirmModal(false);
    setGeneratingBrackets(true);
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${tourney.id}/generate-brackets`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Brackets generados! ${data.matches.length} partidas en Ronda 1.`);
        await refreshMatches();
        onGenerateBrackets && onGenerateBrackets();
        setActiveTab('brackets');
      } else {
        alert(data.error || 'Error al generar brackets');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setGeneratingBrackets(false);
    }
  };

  const tabs = ['overview', 'participants', 'brackets', 'announcements'];

  return (
    <div className="tournament-detail">
      {/* Header */}
      <div className="td-header">
        {tourney.header_banner_url && (
          <img src={tourney.header_banner_url} alt="banner" className="td-banner" />
        )}
        <div className="td-header-content">
          <button className="btn-secondary" style={{ marginBottom: '1rem', fontSize: '0.85rem' }} onClick={onBack}>
            ← Volver a Torneos
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>{tourney.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>👥 {tourney.registered_teams} seguidores</span>
                <span style={{ color: 'var(--border-color)' }}>|</span>
                <span>{tourney.organizer_username}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isOrganizer(tourney.organizer_username, currentUser) && (
                <div style={{ position: 'relative' }} ref={manageRef}>
                  <button
                    className="btn-primary"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color)' }}
                    onClick={() => setShowManageMenu(m => !m)}
                  >
                    ⚙️ Manage ▾
                  </button>
                  {showManageMenu && (
                    <div style={{
                      position: 'absolute', right: 0, top: '110%', minWidth: '210px',
                      background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                      borderRadius: '10px', zIndex: 100, overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                    }}>
                      <button
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                        onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.target.style.background='none'}
                        onClick={handleTogglePublish}
                        disabled={publishing}
                      >
                        {tourney.is_published ? '🔒 Cambiar a Borrador' : '🚀 Publicar Torneo'}
                      </button>
                      <div style={{ height: '1px', background: 'var(--border-color)' }} />
                      <button
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                        onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.target.style.background='none'}
                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/torneos/${tourney.slug}`); setShowManageMenu(false); }}
                      >
                        🔗 Copiar Invite Link
                      </button>
                    </div>
                  )}
                </div>
              )}
              {tourney.is_approved && tourney.status === 'OPEN' && !isOrganizer(tourney.organizer_username, currentUser) && (
                <button className="btn-primary" onClick={onRegister} style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>
                  + Join Tournament
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="td-info-cards">
        <div className="td-info-card">
          <div className="td-info-card-label">Game</div>
          <div className="td-info-card-value">{tourney.game || 'League of Legends'}</div>
        </div>
        <div className="td-info-card">
          <div className="td-info-card-label">Date & Time</div>
          <div className="td-info-card-value">
            {(() => {
              // Parse date as local noon to avoid UTC-offset day shift
              const raw = tourney.start_date ? tourney.start_date.split('T')[0] : null;
              const dateStr = raw ? new Date(`${raw}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
              return <span style={{ textTransform: 'capitalize' }}>{dateStr}</span>;
            })()}
            {tourney.start_time && <><br /><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tourney.start_time}</span></>}
          </div>
        </div>
        <div className="td-info-card">
          <div className="td-info-card-label">Format</div>
          <div className="td-info-card-value">{tourney.tournament_format || 'Pre-Made Teams'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Player Registration is allowed</div>
        </div>
        <div className="td-info-card">
          <div className="td-info-card-label">Game Map & Type</div>
          <div className="td-info-card-value">{tourney.game_map || 'Summoners Rift'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{tourney.game_format || 'Tournament Draft'}</div>
        </div>
        <div className="td-info-card">
          <div className="td-info-card-label">Region</div>
          <div className="td-info-card-value" style={{ fontSize: '0.95rem' }}>{tourney.game_region || 'Latin America South'}</div>
        </div>
      </div>

      {/* Draft warning */}
      {!tourney.is_published && isOrganizer(tourney.organizer_username, currentUser) && (
        <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '6px', padding: '0.75rem 1.25rem', margin: '1rem 0', fontSize: '0.9rem', color: '#f0c040', textAlign: 'center' }}>
          ⚠️ This tournament is currently in draft mode. Publish it to enable registration.
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Main content */}
        <div style={{ flex: 1 }}>
          {/* Tabs */}
          <div className="td-tabs">
            {tabs.map(tab => (
              <button key={tab} className={`td-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="td-sub-tabs">
                {['DETAILS', 'RULES', 'PRIZES', 'SCHEDULE', 'CONTACT'].map(t => (
                  <button key={t} className="td-sub-tab">{t}</button>
                ))}
              </div>
              <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                {tourney.description && <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{tourney.description}</p>}
                {tourney.rules && (
                  <div>
                    <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>📋 Reglas</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{tourney.rules}</p>
                  </div>
                )}
                {tourney.prizes && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>🏆 Premios</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{tourney.prizes}</p>
                  </div>
                )}
                {tourney.schedule && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>📅 Cronograma</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{tourney.schedule}</p>
                  </div>
                )}
                {tourney.contact_method && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ color: 'var(--accent-pink)', marginBottom: '0.5rem' }}>📬 Contacto ({tourney.contact_method})</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tourney.contact_details}</p>
                  </div>
                )}
                {!tourney.rules && !tourney.prizes && !tourney.description && (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>No hay detalles adicionales aún.</p>
                )}
              </div>
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
              <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '1.25rem' }}>🛡️ Equipos Inscritos ({teams?.length || 0})</h4>
              {!teams || teams.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay equipos inscritos aún.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {teams.map(team => (
                    <div key={team.team_id} className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ fontWeight: '700', color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🛡️ {team.team_name}</span>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.2)', color: 'var(--accent-purple)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Cap: {team.captain_username}</span>
                      </div>
                      {team.members?.map(m => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.2rem 0' }}>
                          <span>👤 {m.riot_game_name ? `${m.riot_game_name}#${m.riot_tag_line}` : m.username}</span>
                          <span style={{ color: 'var(--accent-cyan)' }}>{m.lol_rank || 'UNRANKED'}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Generate brackets button */}
              {isOrganizer(tourney.organizer_username, currentUser) && tourney.status === 'OPEN' && teams && teams.length >= 2 && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px' }}>
                  <h5 style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>⚡ Panel del Organizador</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {teams.length} equipos inscritos. Cuando estés listo, cierra las inscripciones y genera los brackets automáticamente.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={generatingBrackets}
                    style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}
                  >
                    {generatingBrackets ? '⏳ Generando...' : '🏆 Cerrar Inscripciones y Generar Brackets'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Brackets Tab */}
          {activeTab === 'brackets' && (
            <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#fff' }}>
                  🏆 {tourney.bracket_type === 'round_robin' ? 'Round Robin' : tourney.bracket_type === 'swiss' ? 'Swiss' : 'Elimination'} Bracket
                </h4>
                <span style={{ fontSize: '0.8rem', background: 'rgba(0,255,100,0.1)', color: '#00ff64', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid #00ff64' }}>
                  {localMatches.length} partidas
                </span>
              </div>
              {localMatches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                  <p>Los brackets aún no han sido generados.</p>
                  {isOrganizer(tourney.organizer_username, currentUser) && (
                    <button
                      className="btn-primary"
                      style={{ marginTop: '1rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}
                      onClick={() => { setActiveTab('participants'); }}
                    >
                      Ir a Participantes para generar brackets
                    </button>
                  )}
                </div>
              ) : (
                <BracketVisualizer
                  matches={localMatches}
                  tournamentId={tourney.id}
                  token={token}
                  currentUser={currentUser}
                  organizer={tourney.organizer_username}
                  onWinnerDeclared={refreshMatches}
                  onMatchClick={setSelectedMatch}
                />
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="card" style={{ padding: '1.5rem', marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📢</div>
              <p>No hay anuncios aún.</p>
            </div>
          )}
        </div>

        {/* Right sidebar - Registration panel */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              {tourney.status === 'OPEN' ? 'REGISTRATION OPEN' : tourney.status === 'ONGOING' ? 'REGISTRATION CLOSED' : 'FINISHED'}
            </div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              {tourney.registered_teams} / {tourney.max_teams}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Teams Registered</div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {tourney.status === 'OPEN' ? 'REGISTRATION OPEN' : 'REGISTRATION CLOSED'}
            </div>
            {tourney.is_approved && tourney.status === 'OPEN' && !isOrganizer(tourney.organizer_username, currentUser) ? (
              <button className="btn-primary" onClick={onRegister} style={{ width: '100%', background: 'var(--accent-purple)', justifyContent: 'center' }}>
                Join Tournament
              </button>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {tourney.status === 'ONGOING' ? 'El torneo ya está en curso.' : 'Las inscripciones están cerradas.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN TOURNAMENTS COMPONENT
// ============================================================
export default function Tournaments({
  tournaments, loadingTournaments, setShowTourneyModal, setRegisteringTourney,
  translations, lang, t, currentUser, token, onLeaveTournament, onDeleteTournament,
  communities, onCreated, myTeams
}) {
  const [showWizard, setShowWizard] = useState(false);
  const [detailTourney, setDetailTourney] = useState(null);
  const [detailTeams, setDetailTeams] = useState([]);
  const [detailMatches, setDetailMatches] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const openDetail = async (tourney) => {
    setDetailTourney(tourney);
    setLoadingDetail(true);
    try {
      const [teamsRes, matchesRes] = await Promise.all([
        fetch(`${API_URL}/api/tournaments/${tourney.id}/teams`),
        fetch(`${API_URL}/api/tournaments/${tourney.id}/matches`)
      ]);
      if (teamsRes.ok) setDetailTeams(await teamsRes.json());
      if (matchesRes.ok) setDetailMatches(await matchesRes.json());
    } catch {}
    setLoadingDetail(false);
  };

  const closeDetail = () => { setDetailTourney(null); setDetailTeams([]); setDetailMatches([]); };

  const filtered = tournaments.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.game || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (detailTourney) {
    return (
      <TournamentDetail
        tourney={detailTourney}
        token={token}
        currentUser={currentUser}
        teams={detailTeams}
        matches={detailMatches}
        onBack={closeDetail}
        onRegister={() => setRegisteringTourney(detailTourney.id)}
        onGenerateBrackets={() => openDetail(detailTourney)}
        onTourneyUpdated={onCreated}
      />
    );
  }

  return (
    <div>
      {/* WIZARD */}
      {showWizard && (
        <TournamentWizard
          token={token}
          communities={communities}
          currentUser={currentUser}
          onClose={() => setShowWizard(false)}
          onCreated={() => {}}
        />
      )}

      {/* Header */}
      <header className="header">
        <h1>Tournaments</h1>
        <button className="btn-primary" onClick={() => setShowWizard(true)}>
          + {t.createTournament || 'Create Tournament'}
        </button>
      </header>

      {/* Search + View Toggle */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Search Tournaments"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
          />
        </div>
        <button
          onClick={() => setViewMode('grid')}
          style={{ padding: '0.6rem 0.8rem', background: viewMode === 'grid' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
        >⊞</button>
        <button
          onClick={() => setViewMode('list')}
          style={{ padding: '0.6rem 0.8rem', background: viewMode === 'list' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
        >☰</button>
      </div>

      {loadingTournaments && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          ⏳ Loading tournaments...
        </div>
      )}

      {!loadingTournaments && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>You don't have any tournaments scheduled!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Grow your organization with regular competitions and build a loyal playerbase.
          </p>
          <button className="btn-primary" onClick={() => setShowWizard(true)} style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>
            + Create Your Tournament
          </button>
        </div>
      )}

      {/* Tournament List */}
      <div className={viewMode === 'grid' ? 'tournament-grid' : 'tournament-list-view'}>
        {filtered.map(tourney => (
          <div
            key={tourney.id}
            className="tournament-card"
            onClick={() => openDetail(tourney)}
          >
            {tourney.header_banner_url && (
              <div className="tournament-card-banner">
                <img src={tourney.header_banner_url} alt="banner" />
              </div>
            )}
            <div className="tournament-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 className="tournament-card-title">{tourney.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tourney.game || 'League of Legends'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className={`status-badge ${tourney.is_approved ? 'open' : 'badge-pending'}`}>
                    {tourney.is_approved ? (tourney.status === 'ONGOING' ? 'EN CURSO' : 'ABIERTO') : 'PENDIENTE'}
                  </span>
                  {!tourney.is_published && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(234,179,8,0.15)', color: '#f0c040', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(234,179,8,0.4)' }}>
                      BORRADOR
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>📅 {tourney.start_date ? new Date(`${tourney.start_date.split('T')[0]}T12:00:00`).toLocaleDateString('es-CL') : '—'}</span>
                <span>👥 {tourney.registered_teams}/{tourney.max_teams}</span>
                {tourney.prize_pool && <span>🏆 {tourney.prize_pool}</span>}
                {tourney.game_region && <span>🌍 {tourney.game_region}</span>}
              </div>

              {tourney.tournament_format && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>⚔️</span> {tourney.tournament_format} • {tourney.bracket_type || 'Elimination'}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }} onClick={e => e.stopPropagation()}>
                {tourney.is_approved && tourney.status === 'OPEN' && (
                  <button
                    onClick={() => setRegisteringTourney(tourney.id)}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}
                  >
                    Inscribir Escuadra
                  </button>
                )}
                {tourney.organizer_username === currentUser?.username && onDeleteTournament && (
                  <button
                    className="btn-primary"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => onDeleteTournament(tourney.id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
