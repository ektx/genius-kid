import { pinyinModel } from '../models/pinyinModel.js';

export const pinyinController = {
  saveRecord: async (req, res) => {
    try {
      const { id, score, mode, date } = req.body;
      const userId = req.user.id;

      await pinyinModel.createRecord(userId, { id, score, mode, date });
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving pinyin record:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getRecords: async (req, res) => {
    try {
      const userId = req.user.id;
      const records = await pinyinModel.getRecordsByUserId(userId);
      res.json({ success: true, data: records });
    } catch (err) {
      console.error('Error getting pinyin records:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};
