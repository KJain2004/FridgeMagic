import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ChefCharacter from '../components/ChefCharacter';
import SpeechBubble from '../components/SpeechBubble';
import ThemeToggle from '../components/ThemeToggle';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const chefLines = {
    login: "Welcome back, Chef! Ready to cook up something amazing? 🍳",
    signup: "Hello there! I'm Chef Zara — let's get you set up for a delicious journey! 🌟",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.username.trim()) throw new Error('Username is required');
        await signup(form.username, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative', zIndex: 1,
    }}>
      {/* Theme toggle top right */}
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div style={{ marginBottom: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
          VIRTUAL KITCHEN
        </div>
        <h1 style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 42,
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan), var(--accent-purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          lineHeight: 1.1, marginBottom: 0,
        }}>
          FridgeMagic
        </h1>
      </div>

      {/* Chef + speech bubble */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ChefCharacter size={140} speaking={false} />
        <div style={{ paddingBottom: 30 }}>
          <SpeechBubble text={chefLines[mode]} />
        </div>
      </div>

      {/* Auth card */}
      <div className="glass" style={{
        borderRadius: 'var(--radius)', padding: '32px 36px',
        width: '100%', maxWidth: 420,
        border: '1px solid var(--border-glow)',
        boxShadow: 'var(--shadow-glow)',
      }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--bg-secondary)',
          borderRadius: 10, padding: 4, marginBottom: 28,
        }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '8px 0',
                background: mode === m
                  ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                  : 'transparent',
                border: 'none', borderRadius: 8,
                color: mode === m ? '#fff' : 'var(--text-muted)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.25s ease',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
              {m === 'login' ? '🔑 Login' : '✨ Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Username
              </label>
              <input className="input" type="text" placeholder="Your chef name" value={form.username}
                onChange={update('username')} required={mode === 'signup'} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Email
            </label>
            <input className="input" type="email" placeholder="your@email.com" value={form.email}
              onChange={update('email')} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'}
                placeholder="Min 6 characters" value={form.password}
                onChange={update('password')} required style={{ paddingRight: 48 }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: 'var(--text-muted)', lineHeight: 1,
                }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(252, 129, 129, 0.1)', border: '1px solid var(--danger)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
              color: 'var(--danger)', fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ marginTop: 4, padding: '14px', fontSize: 16, borderRadius: 10 }}>
            {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Enter the Kitchen' : '🎉 Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "New here? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            style={{ color: 'var(--accent-blue)', fontWeight: 700, cursor: 'pointer' }}>
            {mode === 'login' ? 'Sign up free' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
}
