import mongoose, { Schema, models } from 'mongoose';

const CommissionSlabSchema = new Schema({
  threshold: { type: Number, required: true }, // AUM threshold in rupees
  rate: { type: Number, required: true } // annual rate e.g., 0.02
}, { _id: false });

const CompanySchema = new Schema({
  headId: { type: Schema.Types.ObjectId, required: true, index: true },
  commissionSlabs: { type: [CommissionSlabSchema], default: [] },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

CompanySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Company = models.Company || mongoose.model('Company', CompanySchema);
