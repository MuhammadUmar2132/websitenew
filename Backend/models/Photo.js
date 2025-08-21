const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String, required: true },
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Photo', PhotoSchema);
