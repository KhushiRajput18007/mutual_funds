import mongoose, { Schema, models } from 'mongoose';

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, required: true, index: true },
  fundId: { type: String, required: true },
  type: { type: String, enum: ['virtual_sip'], required: true },
  amount: { type: Number, required: true },
  units: { type: Number, required: true },
  nav: { type: Number, required: true },
  date: { type: Date, default: () => new Date(), index: true }
});

export const Transaction = models.Transaction || mongoose.model('Transaction', TransactionSchema);
