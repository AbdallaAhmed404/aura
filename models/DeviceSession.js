const mongoose = require('mongoose');

const deviceSessionSchema = new mongoose.Schema({
  deviceId: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['billiards', 'playstation', 'racing'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'PAUSED'],
    default: 'AVAILABLE',
  },
  timeMode: {
    type: String,
    enum: ['OPEN', 'FIXED'],
    default: 'OPEN',
  },
  hourlyRate: {
    type: Number,
    required: true,
    default: 2.000,
  },
  selectedHoursPrice: {
    type: Number,
    default: 2.000,
  },
  // أضف هذا الحقل هنا لحفظ المدة المختارة بالساعات
  selectedDurationHours: {
    type: Number,
    default: 1,
  },
  startTime: {
    type: Date,
    default: null,
  },
  // أضف هذا الحقل لتخزين الثواني المنقضية الفعليّة عند الإيقاف المؤقت أو التحديث
  elapsedSeconds: {
    type: Number,
    default: 0,
  },
  customer: {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  cart: [
    {
      productId: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1 },
    }
  ],
  paymentMethod: {
    type: String,
    enum: ['كاش', 'فيزا', 'تحويل', 'طباعة فورية', null],
    default: null,
  }
}, {
  timestamps: true
});

deviceSessionSchema.index({ deviceId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('DeviceSession', deviceSessionSchema);