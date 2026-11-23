const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  patientName: {
    type: String,
    default: null,
  },
  patientPhone: {
    type: String,
    default: null,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    clinicName: {
      type: String,
      default: 'عيادة بيطرية',
    },
    location: {
      type: String,
      default: 'دمشق',
    },
    price: {
      type: Number,
      default: 0,
    },
    workingHours: {
      type: String,
      default: '9 -> 5',
    },
    workingDays: {
      type: [String],
      default: ['الأحد', 'الثلاثاء', 'الخميس'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    timeSlots: {
      type: [timeSlotSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);