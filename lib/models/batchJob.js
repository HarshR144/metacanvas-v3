// lib/models/batchJob.js
import mongoose from 'mongoose';

const batchJobSchema = new mongoose.Schema({
  jobId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  jobType: { 
    type: String, 
    enum: ['recommendation_generation', 'nft_sync'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'running', 'completed', 'failed'], 
    default: 'pending' 
  },
  
  // For staggered processing
  usersToProcess: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  processedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  failedUsers: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    error: String
  }],
  
  startTime: Date,
  endTime: Date,
  
  // Processing stats
  totalUsers: Number,
  processedCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  
  // Configuration
  batchSize: { type: Number, default: 50 }, // Process 50 users at a time
  delayBetweenBatches: { type: Number, default: 5000 }, // 5 seconds delay
  
  metadata: mongoose.Schema.Types.Mixed
}, { 
  timestamps: true 
});

const BatchJob = mongoose.models.BatchJob || mongoose.model('BatchJob', batchJobSchema);
export default BatchJob;