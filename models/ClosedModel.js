const mongoose = require('mongoose');

const ClosedSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // معرف الجلسة الأصلي
  deviceName: { type: String, required: true }, // اسم الطاولة أو الجهاز
  deviceType: { type: String, required: true }, // نوع الجهاز (بلياردو، بلايستيشن، إلخ)
  customer: {
    name: { type: String, default: "" },
    phone: { type: String, default: "" }
  },
  timeMode: { type: String, enum: ["OPEN", "FIXED"], required: true },
  durationFormatted: { type: String }, // الوقت المنقضي أو المستهلك
  timeCost: { type: Number, required: true }, // تكلفة الوقت
  products: [
    {
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number }
    }
  ],
  productsTotal: { type: Number, required: true }, // إجمالي المنتجات
  discountPercent: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true }, // المبلغ الإجمالي النهائي المدفوع
  paymentMethod: { type: String, enum: ["كاش", "فيزا", "تحويل", "طباعة فورية"], required: true }, // طريقة الدفع
  closedAt: { type: Date, default: Date.now } // وقت إغلاق العملية وتاريخها
}, { timestamps: true });

module.exports = mongoose.model('ClosedSession', ClosedSessionSchema);