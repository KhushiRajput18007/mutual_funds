import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: { type: String, required: true, enum: ['companyHead', 'admin', 'seller', 'customer'] },
  parentId: { type: Schema.Types.ObjectId, default: null, index: true }, // e.g., seller->admin, admin->companyHead
  kycStatus: { type: String, default: 'none', enum: ['none', 'pending', 'verified', 'rejected'] },
  permissions: { type: [String], default: [] },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = models.User || mongoose.model('User', UserSchema);
