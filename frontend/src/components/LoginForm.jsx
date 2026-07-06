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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-ze">ZE</div>
          <h2>ZabEsports</h2>
          <p>E-sports Hub & Communities</p>
        </div>

        <h3 className="auth-title">
          {authMode === 'login' ? t.loginTitle : t.registerTitle}
        </h3>
        <p className="auth-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {authMode === 'login' ? t.loginSubtitle : t.registerSubtitle}
        </p>

        {authError && <div className="alert alert-danger">{authError}</div>}
        {authSuccess && <div className="alert alert-success">{authSuccess}</div>}

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

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem', textAlign: 'center' }}>
          {authMode === 'login' ? (
            <>
              {t.noAccount}{' '}
              <span 
                onClick={() => setAuthMode('register')} 
                style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                REGISTRARSE
              </span>
            </>
          ) : (
            <>
              {t.haveAccount}{' '}
              <span 
                onClick={() => setAuthMode('login')} 
                style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                INICIAR SESIÓN
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
