const express = require('express');
const { 
  searchJobs, 
  getSavedJobs, 
  saveJob, 
  deleteSavedJob 
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public search route
router.get('/search', searchJobs);

// Protected routes (require JWT)
router.get('/saved', protect, getSavedJobs);
router.post('/saved', protect, saveJob);
router.delete('/saved/:id', protect, deleteSavedJob);

module.exports = router;
