import MathModel from '../models/mathModel.js';

const mathController = {
  getPracticeRecords: async (req, res) => {
    try {
      const { page, limit } = req.query;
      const data = await MathModel.getPracticeRecords(req.user.id, parseInt(page) || 1, parseInt(limit) || 10);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  addPracticeRecord: async (req, res) => {
    try {
      const record = { ...req.body, user_id: req.user.id };
      await MathModel.createPracticeRecord(record);
      res.status(201).json({ success: true, message: 'Record created' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getProgress: async (req, res) => {
    try {
      const data = await MathModel.getProgress(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateProgress: async (req, res) => {
    try {
      const { levelId, stars, unlocked } = req.body;
      await MathModel.updateProgress(req.user.id, levelId, stars, unlocked);
      res.json({ success: true, message: 'Progress updated' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getErrorAnalysis: async (req, res) => {
    try {
      const data = await MathModel.getErrorAnalysis(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default mathController;
