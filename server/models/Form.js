const mongoose = require('mongoose');


mongoose.connection.once('open', async () => {
  try {
    await mongoose.connection.db.collection('forms').dropIndexes();
    console.log('Dropped all indexes on forms collection');
  } catch (err) {
    console.error('Error dropping indexes:', err);
  }
});

const formSchema = new mongoose.Schema({
  formType: {
    type: String,
    required: true,
    enum: ['samuhLagan', 'studentAwards', 'teamRegistration'],
    unique: true
  },
  active: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  eventDate: {
    type: Date,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

formSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  
  
  if (!this.active) return false;
  
 
  if (!this.startTime && !this.endTime) return true;
  
 
  const isAfterStart = !this.startTime || now >= this.startTime;
  const isBeforeEnd = !this.endTime || now <= this.endTime;
  
  return isAfterStart && isBeforeEnd;
};

module.exports = mongoose.model('Form', formSchema); 