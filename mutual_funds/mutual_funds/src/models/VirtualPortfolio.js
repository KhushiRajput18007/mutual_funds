import mongoose, { Schema, models } from 'mongoose';

const HoldingSchema = new Schema({
  fundId: { type: String, required: true },
  units: { type: Number, required: true, min: 0 },
  avgCost: { type: Number, required: true, min: 0 }
}, { _id: false });

const VirtualPortfolioSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, index: true },
  holdings: { type: [HoldingSchema], default: [] },
  updatedAt: { type: Date, default: () => new Date() }
});

VirtualPortfolioSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const VirtualPortfolio = models.VirtualPortfolio || mongoose.model('VirtualPortfolio', VirtualPortfolioSchema);
