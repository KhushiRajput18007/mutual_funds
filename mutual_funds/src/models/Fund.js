import mongoose, { Schema, models } from 'mongoose';

const FundSchema = new Schema({
  name: { type: String, required: true, index: true },
  schemeCode: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, index: true },
  nav: { type: Number, required: true, default: 0 },
  navChangePercent: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, required: true, default: () => new Date() },
  isTrending: { type: Boolean, required: true, default: false, index: true },
  isActive: { type: Boolean, required: true, default: false, index: true },
  userViews: { type: Number, required: true, default: 0 },
});

FundSchema.index({ isTrending: 1, navChangePercent: -1 });
FundSchema.index({ isActive: 1, lastUpdated: -1 });

export const Fund = models.Fund || mongoose.model('Fund', FundSchema);
