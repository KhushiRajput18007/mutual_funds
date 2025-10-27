import mongoose, { Schema, models } from 'mongoose';

const VirtualSipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, required: true, index: true },
  fundId: { type: String, required: true }, // schemeCode or identifier
  amount: { type: Number, required: true, min: 1 },
  frequency: { type: String, enum: ['monthly'], default: 'monthly' },
  dayOfMonth: { type: Number, min: 1, max: 28, default: 5 },
  status: { type: String, enum: ['active', 'paused', 'stopped'], default: 'active' },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

VirtualSipSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const VirtualSip = models.VirtualSip || mongoose.model('VirtualSip', VirtualSipSchema);
