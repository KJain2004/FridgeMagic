const express = require('express');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    res.json(await Recipe.find({ userId: req.userId }).sort({ savedAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { _id, id, userId, ...data } = req.body || {};
  if (
    typeof data.title !== 'string' || !data.title.trim() ||
    !Array.isArray(data.ingredients) || data.ingredients.length === 0 ||
    data.ingredients.some(item => typeof item !== 'string' || !item.trim()) ||
    !Array.isArray(data.steps) || data.steps.length === 0 ||
    data.steps.some(step => !step || typeof step.instruction !== 'string' || !step.instruction.trim())
  ) {
    return res.status(400).json({ message: 'A recipe title, at least one ingredient and at least one instruction are required.' });
  }

  try {
    const recipe = await Recipe.create({ ...data, userId: req.userId });
    res.status(201).json(recipe);
  } catch (err) {
    const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
