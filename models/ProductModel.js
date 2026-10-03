const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الصنف مطلوب'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'سعر البيع مطلوب'],
    min: 0
  },
  quantity: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);