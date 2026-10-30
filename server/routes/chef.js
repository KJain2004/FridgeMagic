const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const router = express.Router();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const model = genAI?.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    maxOutputTokens: 2600,
    temperature: 0.6,
  },
}, { timeout: 30000 });

router.post('/generate', auth, async (req, res) => {
  const { mealType, cuisine, calories, diet, ingredients, excludeTitle } = req.body || {};
  if (
    typeof mealType !== 'string' || !mealType.trim() ||
    typeof cuisine !== 'string' || !cuisine.trim() ||
    typeof diet !== 'string' || !diet.trim() ||
    !Number.isFinite(Number(calories)) || Number(calories) < 100 || Number(calories) > 1200 ||
    !Array.isArray(ingredients) || ingredients.length === 0 ||
    ingredients.some(item => typeof item !== 'string' || !item.trim()) ||
    (excludeTitle !== undefined && (typeof excludeTitle !== 'string' || excludeTitle.length > 200))
  ) {
    return res.status(400).json({ message: 'Choose a meal, cuisine, calorie target and diet, then add at least one ingredient.' });
  }
  if (!model) {
    return res.status(503).json({ message: 'Recipe generation is unavailable because GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const prompt = `Create a practical home-cooking recipe. Use the supplied ingredients and match the diet.
Meal: ${mealType}; cuisine: ${cuisine}; target: ${calories} kcal; diet: ${diet}.
Available ingredients: ${ingredients.join(', ')}.
${excludeTitle ? `Make it different from "${excludeTitle}".` : ''}
Return only JSON with this shape:
{"title":"name","description":"one sentence","servings":2,"totalTimeMinutes":30,"calories":450,"difficulty":"Easy","cuisine":"${cuisine}","mealType":"${mealType}","dietType":"${diet}","ingredients":["quantity and ingredient"],"steps":[{"stepNumber":1,"instruction":"concise instruction","timerSeconds":0}],"chefTip":"one short tip","nutritionFacts":{"protein":"25g","carbs":"45g","fat":"12g","fiber":"8g"}}
Use 3-5 concise steps. Set timerSeconds to 0 when a step needs no timer. Difficulty must be Easy, Medium, or Hard. Keep calories near the target and do not invent unavailable main ingredients.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const recipe = JSON.parse(cleaned);
    if (
      !recipe || typeof recipe.title !== 'string' || !recipe.title.trim() ||
      !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0 ||
      recipe.ingredients.some(item => typeof item !== 'string' || !item.trim()) ||
      !Array.isArray(recipe.steps) || recipe.steps.length === 0 ||
      recipe.steps.some(step => !step || typeof step.instruction !== 'string' || !step.instruction.trim())
    ) {
      throw new Error('The model returned an incomplete recipe.');
    }
    res.json(recipe);
  } catch (err) {
    console.error('Chef generation error:', err);
    if (err.status === 404) {
      return res.status(502).json({ message: 'The configured Gemini model is unavailable. Check the model name in server/routes/chef.js.' });
    }
    if (err.status === 429) {
      return res.status(503).json({ message: 'Gemini rate limit or quota reached. Please wait and try again, or check your API quota.' });
    }
    if (err.status === 503) {
      return res.status(503).json({ message: 'Gemini is temporarily busy. Please try again in a minute.' });
    }
    if (err.status === 401 || err.status === 403) {
      return res.status(503).json({ message: 'Gemini rejected the API key. Check GEMINI_API_KEY in server/.env.' });
    }
    if (/timeout|aborted/i.test(err.message || '')) {
      return res.status(504).json({ message: 'Recipe generation took too long. Please try again.' });
    }
    res.status(502).json({ message: 'Recipe generation failed. Check the server logs and try again.' });
  }
});

module.exports = router;
