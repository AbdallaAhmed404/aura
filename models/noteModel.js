const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    // ربط الملاحظة بـ الـ Admin المسؤول عبر الـ ID الخاص به
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    noteText: {
        type: String,
        required: [true, 'محتوى الملاحظة مطلوب'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);