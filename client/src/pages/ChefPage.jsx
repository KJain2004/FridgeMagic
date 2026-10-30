import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChefCharacter from '../components/ChefCharacter';
import SpeechBubble from '../components/SpeechBubble';
import RecipeCard from '../components/RecipeCard';
import ThemeToggle from '../components/ThemeToggle';

// ───── Question flow ─────
const QUESTIONS = [
  {
    id: 'mealType', label: 'What kind of meal are you planning?',
    type: 'choice',
    options: ['🌅 Breakfast', '☀️ Lunch', '🌙 Dinner', '🍿 Snack', '🎂 Dessert'],
  },
  {
    id: 'cuisine', label: 'Which regional cuisine are you craving?',
    type: 'choice',
    options: ['🇮🇳 Indian', '🇮🇹 Italian', '🇨🇳 Chinese', '🇲🇽 Mexican', '🫙 Continental', '🇯🇵 Japanese', '🇱🇧 Middle Eastern', '🌍 Any Cuisine'],
  },
  {
    id: 'calories', label: 'What\'s your calorie target for this meal?',
    type: 'slider', min: 100, max: 1200, default: 450, unit: 'kcal',
  },
  {
    id: 'diet', label: 'Do you follow any particular diet?',
    type: 'choice',
    options: ['🌱 Vegetarian', '🥩 Non-Vegetarian', '🌿 Vegan', '💪 High-Protein', '🥦 Low-Carb', '✨ Keto', '⚡ No Restriction'],
  },
  {
    id: 'ingredients', label: 'What ingredients do you have at home? (Even one counts!)',
    type: 'tags', placeholder: 'e.g. tomatoes, onion, rice...',
  },
];

const NAV_HEIGHT = 64;

export default function ChefPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sliderVal, setSliderVal] = useState(450);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [speaking, setSpeaking] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const question = QUESTIONS[step];

  // Simulate chef "speaking" animation when question changes
  useEffect(() => {
    setSpeaking(true);
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 900);
    const t2 = setTimeout(() => setSpeaking(false), 2500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [step]);

  const handleChoice = (option) => {
    setAnswers(prev => ({ ...prev, [question.id]: option }));
    setError('');
  };

  const handleSliderNext = () => {
    setAnswers(prev => ({ ...prev, calories: sliderVal }));
    setStep(s => s + 1);
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) setTags(t => [...t, val]);
    setTagInput('');
    inputRef.current?.focus();
  };

  const removeTag = (t) => setTags(ts => ts.filter(x => x !== t));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length) setTags(ts => ts.slice(0, -1));
  };

  const generateRecipe = async (preferences, excludeTitle = '') => {
    setError('');
    setGenerating(true);
    setSpeaking(true);
    setMsgIdx(0);
    try {
      const res = await api.post('/api/chef/generate', {
          ...preferences,
          ...(excludeTitle ? { excludeTitle } : {}),
        }, { timeout: 35000 });
      if (!res.data || typeof res.data.title !== 'string' || !Array.isArray(res.data.ingredients) || !Array.isArray(res.data.steps)) {
        throw new Error('The chef returned an incomplete recipe. Please try again.');
      }
      setRecipe({ ...res.data, preferences });
    } catch (err) {
      const message = err.code === 'ECONNABORTED'
        ? 'Recipe generation is taking too long. Please try again.'
        : err.response?.data?.message || err.message || 'Chef had a hiccup! Please try again.';
      setError(message);
    } finally {
      setGenerating(false);
      setSpeaking(false);
    }
  };

  const handleGenerate = async () => {
    const pendingIngredient = tagInput.trim();
    const ingredients = pendingIngredient && !tags.includes(pendingIngredient)
      ? [...tags, pendingIngredient]
      : tags;
    if (ingredients.length === 0) { setError('Please add at least one ingredient!'); return; }
    const preferences = { ...answers, ingredients };
    setTags(ingredients);
    setTagInput('');
    await generateRecipe(preferences);
  };

  const handleGenerateAnother = () => {
    if (recipe?.preferences) generateRecipe(recipe.preferences, recipe.title);
  };

  const handleUseNewIngredients = () => {
    setRecipe(null);
    setTags([]);
    setTagInput('');
    setError('');
    setStep(QUESTIONS.length - 1);
  };

  const handleSave = async (recipeData) => {
    await api.post('/api/recipes', recipeData);
  };

  const generatingMessages = [
    "Consulting my secret recipe vault... 📚",
    "Tasting the virtual ingredients... 😋",
    "Adjusting seasoning to perfection... 🧂",
    "Plating your masterpiece... 🍽",
  ];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    if (!generating) return;
    const t = setInterval(() => setMsgIdx(i => (i + 1) % generatingMessages.length), 1800);
    return () => clearInterval(t);
  }, [generating]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: NAV_HEIGHT,
        background: 'var(--bg-glass)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>👨‍🍳</span>
          <span style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 20,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>FridgeMagic</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hey, {user?.username}! 👋</span>
          <button className="btn-ghost" onClick={() => navigate('/saved')} style={{ fontSize: 13, padding: '6px 14px' }}>
            🔖 My Recipes
          </button>
          <ThemeToggle />
          <button className="btn-ghost" onClick={logout} style={{ fontSize: 13, padding: '6px 14px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ paddingTop: NAV_HEIGHT + 32, paddingBottom: 60, maxWidth: 760, margin: '0 auto', padding: `${NAV_HEIGHT + 32}px 20px 60px` }}>

        {/* Recipe generated view */}
        {recipe ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ChefCharacter size={120} speaking={generating} emotion={generating ? 'thinking' : 'happy'} />
              <div style={{ paddingBottom: 20 }}>
                <SpeechBubble text={generating ? generatingMessages[msgIdx] : `Voilà! Here's your ${recipe.title}! Bon appétit! 🎉`} />
              </div>
            </div>
            <RecipeCard recipe={recipe} onSave={handleSave} />
            {error && (
              <div role="alert" style={{ color: 'var(--danger)', fontWeight: 600, textAlign: 'center' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              <button className="btn-primary" onClick={handleGenerateAnother} disabled={generating}>
                {generating ? '⏳ Cooking another idea...' : '✨ Another recipe, same ingredients'}
              </button>
              <button className="btn-ghost" onClick={handleUseNewIngredients} disabled={generating}>
                🥕 Use different ingredients
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

            {/* Chef + Bubble */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ChefCharacter size={150} speaking={speaking || generating} emotion={generating ? 'thinking' : 'happy'} />
              <div style={{ paddingBottom: 28 }}>
                <SpeechBubble
                  text={generating ? generatingMessages[msgIdx] : question?.label}
                  isTyping={isTyping}
                />
              </div>
            </div>

            {/* Progress bar */}
            {!generating && (
              <div style={{ width: '100%', maxWidth: 560 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Question {step + 1} of {QUESTIONS.length}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--accent-blue)', fontWeight: 700 }}>
                    {Math.round(((step) / QUESTIONS.length) * 100)}% done
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${(step / QUESTIONS.length) * 100}%`,
                    background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            )}

            {/* Answer summary above */}
            {!generating && step > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 560, width: '100%' }}>
                {Object.entries(answers).map(([key, val]) => (
                  <span key={key} style={{
                    background: 'var(--accent-glow)', border: '1px solid var(--border-glow)',
                    borderRadius: 20, padding: '4px 12px', fontSize: 12,
                    color: 'var(--accent-cyan)', fontWeight: 600,
                  }}>
                    {val}{key === 'calories' ? ' kcal' : ''}
                  </span>
                ))}
              </div>
            )}

            {/* Question UI */}
            {!generating && (
              <div className="glass slide-up" style={{
                borderRadius: 'var(--radius)', padding: 28,
                border: '1px solid var(--border)', width: '100%', maxWidth: 560,
              }}>

                {/* CHOICE */}
                {question?.type === 'choice' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
                    {question.options.map(opt => {
                      const value = opt.replace(/^[^\p{L}\p{N}]+/u, '').trim();
                      const selected = answers[question.id] === value;
                      return (
                        <button key={opt} onClick={() => handleChoice(value)} aria-pressed={selected}
                          style={{
                            background: selected
                              ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                              : 'var(--bg-secondary)',
                            border: `1px solid ${selected ? 'var(--accent-blue)' : 'var(--border)'}`,
                            borderRadius: 12, padding: '14px 10px',
                            color: selected ? '#fff' : 'var(--text-primary)',
                            fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s ease', fontFamily: 'Space Grotesk, sans-serif',
                            textAlign: 'center',
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                    <button className="btn-primary" onClick={() => setStep(s => s + 1)}
                      disabled={!answers[question.id]} style={{ width: '100%', gridColumn: '1 / -1', marginTop: 8 }}>
                      Next →
                    </button>
                  </div>
                )}

                {/* SLIDER */}
                {question?.type === 'slider' && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <span style={{
                        fontSize: 52, fontWeight: 900, fontFamily: 'Nunito, sans-serif',
                        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}>{sliderVal}</span>
                      <span style={{ fontSize: 18, color: 'var(--text-muted)', marginLeft: 6 }}>kcal</span>
                    </div>
                    <input type="range" min={question.min} max={question.max} value={sliderVal}
                      onChange={e => setSliderVal(Number(e.target.value))}
                      style={{
                        width: '100%', accentColor: 'var(--accent-blue)',
                        height: 6, cursor: 'pointer',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: 20 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{question.min} kcal</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{question.max} kcal</span>
                    </div>
                    {/* Calorie presets */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                      {[{ label: 'Light', val: 300 }, { label: 'Balanced', val: 500 }, { label: 'Hearty', val: 700 }, { label: 'Fuel Up', val: 900 }].map(p => (
                        <button key={p.label} onClick={() => setSliderVal(p.val)}
                          style={{
                            flex: 1, minWidth: 70, padding: '8px 4px',
                            background: sliderVal === p.val ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                            border: `1px solid ${sliderVal === p.val ? 'var(--accent-blue)' : 'var(--border)'}`,
                            borderRadius: 8, color: sliderVal === p.val ? 'var(--accent-blue)' : 'var(--text-muted)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'Space Grotesk, sans-serif',
                          }}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <button className="btn-primary" onClick={handleSliderNext} style={{ width: '100%' }}>
                      Next →
                    </button>
                  </div>
                )}

                {/* TAGS */}
                {question?.type === 'tags' && (
                  <div>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: 8,
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: 10, minHeight: 52, marginBottom: 12,
                      cursor: 'text',
                    }} onClick={() => inputRef.current?.focus()}>
                      {tags.map(t => (
                        <span key={t} style={{
                          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                          color: '#fff', borderRadius: 20, padding: '4px 12px',
                          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          {t}
                          <button onClick={(e) => { e.stopPropagation(); removeTag(t); }}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                        </span>
                      ))}
                      <input ref={inputRef} className="input"
                        value={tagInput} onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder={tags.length === 0 ? question.placeholder : 'Add more...'}
                        style={{
                          border: 'none', background: 'transparent', padding: '4px 4px',
                          flex: 1, minWidth: 140, fontSize: 14, outline: 'none',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                      Press <kbd style={{ background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>Enter</kbd> or <kbd style={{ background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>,</kbd> to add each ingredient
                    </p>
                    {error && (
                      <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠️ {error}</div>
                    )}
                    <button className="btn-primary" onClick={handleGenerate}
                      disabled={tags.length === 0 && !tagInput.trim()}
                      style={{ width: '100%', fontSize: 16, padding: 14 }}>
                      🍳 Generate My Recipe!
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Generating spinner */}
            {generating && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--accent-cyan)',
                  animation: 'spin-slow 0.8s linear infinite',
                }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Preparing your dish...</p>
              </div>
            )}

            {/* Back button */}
            {!generating && step > 0 && (
              <button className="btn-ghost" onClick={() => setStep(s => s - 1)}
                style={{ fontSize: 13 }}>
                ← Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
