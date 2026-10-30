import React, { useEffect, useState } from 'react';
import StepTimer from './StepTimer';
import api from '../api';

export default function RecipeCard({ recipe, onSave, isSaved = false, onDelete, savedId }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [cookingComplete, setCookingComplete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const currentStep = steps[activeStep];

  useEffect(() => {
    setActiveStep(0);
    setCompletedSteps([]);
    setCookingComplete(false);
  }, [recipe]);

  const advanceStep = () => {
    setCompletedSteps(current => current.includes(activeStep)
      ? current
      : [...current, activeStep]);
    if (activeStep < steps.length - 1) {
      setActiveStep(current => current + 1);
    } else {
      setCookingComplete(true);
    }
  };

  const handleSave = async () => {
    if (saved) return;
    setSaving(true);
    setActionError('');
    try {
      await onSave(recipe);
      setSaved(true);
    } catch (e) {
      setActionError(e.response?.data?.message || e.message || 'Could not save this recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!savedId) return;
    setDeleting(true);
    setActionError('');
    try {
      await api.delete(`/api/recipes/${savedId}`);
      onDelete && onDelete(savedId);
    } catch (e) {
      setActionError(e.response?.data?.message || e.message || 'Could not delete this recipe. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const diffColor = { Easy: 'var(--success)', Medium: 'var(--warning)', Hard: 'var(--danger)' }[recipe.difficulty] || 'var(--accent-blue)';

  return (
    <div className="glass slide-up" style={{
      borderRadius: 'var(--radius)', padding: 28,
      border: '1px solid var(--border-glow)',
      boxShadow: 'var(--shadow-glow)',
      maxWidth: 680, width: '100%',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{
              fontSize: 24, fontWeight: 800, fontFamily: 'Nunito, sans-serif',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              marginBottom: 6,
            }}>{recipe.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>{recipe.description}</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {!savedId && (
              <button className={saved ? 'btn-ghost' : 'btn-primary'} onClick={handleSave} disabled={saving || saved}>
                {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '🔖 Save Recipe'}
              </button>
            )}
            {savedId && (
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? '⏳' : '🗑 Delete'}
              </button>
            )}
          </div>
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          {[
            { icon: '⏱', label: `${recipe.totalTimeMinutes} min` },
            { icon: '🔥', label: `${recipe.calories} kcal` },
            { icon: '👥', label: `${recipe.servings} servings` },
            { icon: '🌍', label: recipe.cuisine },
            { icon: '🍽', label: recipe.mealType },
          ].map(({ icon, label }) => (
            <span key={label} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '4px 12px', fontSize: 12,
              color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {icon} {label}
            </span>
          ))}
          <span style={{
            background: 'transparent', border: `1px solid ${diffColor}`,
            borderRadius: 20, padding: '4px 12px', fontSize: 12,
            color: diffColor, fontWeight: 700,
          }}>
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {actionError && (
        <div role="alert" style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          {actionError}
        </div>
      )}

      {/* Nutrition */}
      {recipe.nutritionFacts && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
          background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, marginBottom: 20,
        }}>
          {Object.entries(recipe.nutritionFacts).map(([key, val]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-cyan)' }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 2 }}>{key}</div>
            </div>
          ))}
        </div>
      )}

      {/* Ingredients */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: 6 }}>
          🛒 Ingredients
        </h3>
        <div style={{ columns: '2 200px', gap: 8 }}>
          {(Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map((ing, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 0', borderBottom: '1px solid var(--border)',
              breakInside: 'avoid', fontSize: 14, color: 'var(--text-secondary)',
            }}>
              <span style={{ color: 'var(--accent-cyan)', fontSize: 10 }}>◆</span>
              {ing}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: 6 }}>
          👨‍🍳 Guided cooking
        </h3>
        {currentStep ? (
          <div style={{
              background: 'var(--accent-glow)',
              border: '1px solid var(--border-glow)',
              borderRadius: 14,
              padding: 18,
          }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>
                  Step {activeStep + 1} of {steps.length}
                </span>
                {completedSteps.includes(activeStep) && (
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>✓ Completed</span>
                )}
              </div>
              <div style={{ height: 5, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{
                  width: `${(completedSteps.length / steps.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
                  transition: 'width 0.25s ease',
                }} />
              </div>
              <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                {currentStep.instruction}
              </p>
              {currentStep.timerSeconds > 0 ? (
                <StepTimer
                  key={`${activeStep}-${currentStep.timerSeconds}`}
                  seconds={currentStep.timerSeconds}
                  label={`Timer for step ${activeStep + 1}`}
                />
              ) : (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                  No timer needed for this step.
                </p>
              )}
              {cookingComplete && (
                <p role="status" style={{ marginTop: 12, color: 'var(--success)', fontWeight: 700 }}>
                  🎉 Recipe complete. Enjoy your meal!
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 18 }}>
                <button
                  className="btn-ghost"
                  onClick={() => { setActiveStep(current => current - 1); setCookingComplete(false); }}
                  disabled={activeStep === 0}
                >
                  ← Previous step
                </button>
                <button
                  className="btn-primary"
                  onClick={advanceStep}
                  disabled={cookingComplete}
                >
                  {activeStep === steps.length - 1 ? 'Finish recipe ✓' : 'Next step →'}
                </button>
              </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No cooking steps are available for this recipe.</p>
        )}
      </div>

      {/* Chef Tip */}
      {recipe.chefTip && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,179,237,0.1), rgba(118,228,247,0.05))',
          border: '1px solid var(--border-glow)',
          borderRadius: 12, padding: 14,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 22 }}>👨‍🍳</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 4 }}>
              CHEF ZARA'S TIP
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{recipe.chefTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
