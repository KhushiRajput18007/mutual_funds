import mongoose, { Schema, models } from 'mongoose';

const CommissionSchema = new Schema({
  period: {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020 }
  },
  customerId: { type: Schema.Types.ObjectId, required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, required: true, index: true },
  adminId: { type: Schema.Types.ObjectId, required: true, index: true },
  companyId: { type: Schema.Types.ObjectId, required: true, index: true },
  
  portfolioValue: { type: Number, required: true, min: 0 },
  annualRate: { type: Number, required: true, default: 0.02 }, // 2%
  monthlyRate: { type: Number, required: true, default: 0.001667 }, // 2% ÷ 12
  totalCommission: { type: Number, required: true, min: 0 },
  
  breakdown: {
    company: { type: Number, required: true, min: 0 },
    admin: { type: Number, required: true, min: 0 },
    seller: { type: Number, required: true, min: 0 },
    mutualFund: { type: Number, required: true, min: 0 }
  },
  
  status: { 
    type: String, 
    required: true, 
    enum: ['accrued', 'available', 'withdrawn'], 
    default: 'accrued',
    index: true 
  },
  withdrawalDate: { type: Date }, // Day 5 of next month
  generatedAt: { type: Date, required: true, default: () => new Date() }
});

// Compound indexes for efficient queries
CommissionSchema.index({ sellerId: 1, 'period.year': -1, 'period.month': -1 });
CommissionSchema.index({ adminId: 1, 'period.year': -1, 'period.month': -1 });
CommissionSchema.index({ customerId: 1, 'period.year': -1, 'period.month': -1 });
CommissionSchema.index({ status: 1, withdrawalDate: 1 });
CommissionSchema.index({ 'period.year': 1, 'period.month': 1, status: 1 });

export const Commission = models.Commission || mongoose.model('Commission', CommissionSchema);