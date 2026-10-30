import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import ChefCharacter from '../components/ChefCharacter';
import SpeechBubble from '../components/SpeechBubble';

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const loadRecipes = () => {
    setLoading(true);
    setLoadError('');
    api.get('/api/recipes')
      .then(res => setRecipes(res.data))
      .catch(err => setLoadError(err.response?.data?.message || 'Could not load your saved recipes. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadRecipes, []);

  const handleDelete = (id) => {
    setRecipes(rs => rs.filter(r => r._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const deleteRecipe = async (id) => {
    setDeleteError('');
    try {
      await api.delete(`/api/recipes/${id}`);
      handleDelete(id);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Could not delete this recipe. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64,
        background: 'var(--bg-glass)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-ghost" onClick={() => navigate('/')} style={{ fontSize: 13, padding: '6px 14px' }}>
            ← Back to Chef
          </button>
          <span style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 20,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>My Recipe Book</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <button className="btn-ghost" onClick={logout} style={{ fontSize: 13, padding: '6px 14px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ paddingTop: 96, paddingBottom: 60, maxWidth: 1100, margin: '0 auto', padding: '96px 20px 60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
              border: '3px solid var(--border)', borderTopColor: 'var(--accent-cyan)',
              animation: 'spin-slow 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading your recipes...</p>
          </div>
        ) : loadError ? (
          <div role="alert" style={{ textAlign: 'center', padding: 60, color: 'var(--danger)' }}>
            <p style={{ marginBottom: 16 }}>{loadError}</p>
            <button className="btn-primary" onClick={loadRecipes}>Try again</button>
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
              <ChefCharacter size={130} />
              <div style={{ paddingBottom: 24 }}>
                <SpeechBubble text="Your recipe book is empty! Go cook something amazing first! 🍳" />
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigate('/')}>
              🚀 Start Cooking
            </button>
          </div>
        ) : (
          <div>
            {deleteError && (
              <div role="alert" style={{ color: 'var(--danger)', marginBottom: 16, fontWeight: 600 }}>
                {deleteError}
              </div>
            )}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>
                {recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {selected ? (
              <div>
                <button className="btn-ghost" onClick={() => setSelected(null)} style={{ marginBottom: 20 }}>
                  ← All Recipes
                </button>
                <RecipeCard
                  recipe={selected}
                  isSaved={true}
                  savedId={selected._id}
                  onDelete={(id) => { handleDelete(id); }}
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
                {recipes.map(r => (
                  <div key={r._id} className="glass"
                    style={{
                      borderRadius: 'var(--radius)', padding: 20,
                      border: '1px solid var(--border)', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setSelected(r)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <h3 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {r.title}
                      </h3>
                      <button
                        className="btn-danger"
                        onClick={e => { e.stopPropagation(); deleteRecipe(r._id); }}
                        style={{ fontSize: 12, padding: '4px 10px', flexShrink: 0, marginLeft: 8 }}
                      >
                        🗑
                      </button>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 12 }}>
                      {r.description?.slice(0, 90)}{r.description?.length > 90 ? '...' : ''}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[
                        `⏱ ${r.totalTimeMinutes}m`,
                        `🔥 ${r.calories} kcal`,
                        r.cuisine,
                      ].map(tag => (
                        <span key={tag} style={{
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          borderRadius: 20, padding: '3px 10px', fontSize: 11,
                          color: 'var(--text-muted)', fontWeight: 600,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
