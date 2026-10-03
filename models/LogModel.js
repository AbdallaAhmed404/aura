const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // اسم نموذج الأدمن لديك لجلب الاسم
    required: true
  },
  action: {
    type: String,
    required: true, // العملية أو الإجراء الذي تم
  }
}, {
  timestamps: true // يقوم تلقائياً بإنشاء createdAt و updatedAt لتحديد التاريخ والوقت بدقة
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);