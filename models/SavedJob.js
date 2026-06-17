const mongoose = require('mongoose');

const SavedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: String,
    required: true
  },
  title: String,
  company_name: String,
  candidate_required_location: String,
  url: String,
  category: String,
  company_logo_url: String,
  job_type: String,
  description: String,
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can't save the same job twice
SavedJobSchema.index({ user: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', SavedJobSchema);
