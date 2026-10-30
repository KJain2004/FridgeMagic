const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  ingredients: { type: [String], default: [] },
  steps: {
    type: [{
      stepNumber: Number,
      instruction: String,
      timerSeconds: { type: Number, default: 0 },
    }],
    default: [],
  },
  totalTimeMinutes: Number,
  calories: Number,
  cuisine: String,
  mealType: String,
  dietType: String,
  servings: { type: Number, default: 2 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  chefTip: String,
  nutritionFacts: { protein: String, carbs: String, fat: String, fiber: String },
  preferences: {
    mealType: String,
    cuisine: String,
    calories: Number,
    diet: String,
    ingredients: [String],
  },
  savedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
