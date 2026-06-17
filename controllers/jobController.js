const axios = require('axios');
const SavedJob = require('../models/SavedJob');

// @desc    Proxy search for Remotive API
// @route   GET /api/jobs/search
exports.searchJobs = async (req, res) => {
  try {
    const { search, category } = req.query;
    let url = 'https://remotive.com/api/remote-jobs';
    
    // Add query params if present
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching from Remotive API' });
  }
};

// @desc    Get saved jobs for user
// @route   GET /api/jobs/saved
exports.getSavedJobs = async (req, res) => {
  try {
    const jobs = await SavedJob.find({ user: req.user.id }).sort({ savedAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save a job
// @route   POST /api/jobs/saved
exports.saveJob = async (req, res) => {
  try {
    // Check if already saved
    const exists = await SavedJob.findOne({ 
      user: req.user.id, 
      jobId: req.body.id.toString() 
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Job already saved' });
    }

    // Map Remotive fields to our model
    const jobData = {
      user: req.user.id,
      jobId: req.body.id.toString(),
      ...req.body
    };

    const savedJob = await SavedJob.create(jobData);
    res.status(201).json({ success: true, data: savedJob });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Remove a saved job
// @route   DELETE /api/jobs/saved/:id
exports.deleteSavedJob = async (req, res) => {
  try {
    const job = await SavedJob.findOne({ 
      user: req.user.id, 
      jobId: req.params.id 
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
