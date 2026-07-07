import React from 'react';

export default function LoginForm({
  authMode,
  setAuthMode,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  usernameInput,
  setUsernameInput,
  authError,
  authSuccess,
  handleLoginSubmit,
  handleRegisterSubmit,
  t
}) {
  return (
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
            <input 
              type="email" 
              className="input-field" 
              placeholder="ejemplo@correo.com" 
              required 
              value={emailInput} 
              onChange={(e) => setEmailInput(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label>{t.password}</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              required 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn-login">{t.loginBtn}</button>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleRegisterSubmit}>
          <div className="input-group">
            <label>{t.username}</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Tu username" 
              required 
              value={usernameInput} 
              onChange={(e) => setUsernameInput(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label>{t.email}</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="ejemplo@correo.com" 
              required 
              value={emailInput} 
              onChange={(e) => setEmailInput(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label>{t.password}</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Mínimo 6 caracteres" 
              required 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            className="btn-login" 
            style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}
          >
            {t.registerBtn}
          </button>
        </form>
      )}

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
        {authMode === 'login' ? (
          <>
            {t.noAccount}{' '}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setAuthMode('register'); }} 
              style={{ color: 'var(--accent-purple)', fontWeight: 'bold', textDecoration: 'none' }}
            >
              {t.registerBtn}
            </a>
          </>
        ) : (
          <>
            {t.haveAccount}{' '}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setAuthMode('login'); }} 
              style={{ color: 'var(--accent-purple)', fontWeight: 'bold', textDecoration: 'none' }}
            >
              {t.loginBtn}
            </a>
          </>
        )}
      </p>
    </div>
  );
}
