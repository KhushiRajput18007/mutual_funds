/**
 * Commission Calculation Logic
 * Annual Rate: 2% per year on customer's ongoing investment value
 * Monthly Payout: 0.1667% per month (2% ÷ 12) to each stakeholder
 */

const ANNUAL_RATE = 0.02;        // 2% yearly
const MONTHLY_RATE = ANNUAL_RATE / 12;  // 0.001667 (0.1667%)
const SHARE_ANNUAL_RATE = 0.005;     // 0.5% yearly per stakeholder
const SHARE_MONTHLY_RATE = SHARE_ANNUAL_RATE / 12; // 0.00004167 (0.04167%)

/**
 * Calculate monthly commission for a portfolio
 * @param {number} portfolioValue - Current portfolio value in rupees
 * @returns {Object} Commission breakdown
 */
export const calculateMonthlyCommission = (portfolioValue) => {
  if (!portfolioValue || portfolioValue < 0) {
    return {
      portfolioValue: 0,
      annualRate: ANNUAL_RATE,
      monthlyRate: MONTHLY_RATE,
      totalMonthly: 0,
      breakdown: {
        company: 0,
        admin: 0,
        seller: 0,
        mutualFund: 0
      }
    };
  }

  const totalMonthlyCommission = portfolioValue * MONTHLY_RATE;
  const shareAmount = portfolioValue * SHARE_MONTHLY_RATE;

  return {
    portfolioValue,
    annualRate: ANNUAL_RATE,
    monthlyRate: MONTHLY_RATE,
    totalMonthly: Math.round(totalMonthlyCommission * 100) / 100, // Round to 2 decimals
    breakdown: {
      company: Math.round(shareAmount * 100) / 100,
      admin: Math.round(shareAmount * 100) / 100,
      seller: Math.round(shareAmount * 100) / 100,
      mutualFund: Math.round(shareAmount * 100) / 100
    }
  };
};

/**
 * Calculate annual projection based on current portfolio value
 * @param {number} portfolioValue - Current portfolio value
 * @param {string} role - 'seller', 'admin', 'company', 'mutualFund'
 * @returns {number} Annual projection for the role
 */
export const calculateAnnualProjection = (portfolioValue, role = 'seller') => {
  if (!portfolioValue || portfolioValue < 0) return 0;
  
  const annualAmount = portfolioValue * SHARE_ANNUAL_RATE;
  return Math.round(annualAmount * 100) / 100;
};

/**
 * Calculate total AUM commission for multiple customers
 * @param {Array} portfolios - Array of portfolio values
 * @returns {Object} Aggregated commission data
 */
export const calculateAggregatedCommission = (portfolios = []) => {
  const totalAUM = portfolios.reduce((sum, value) => sum + (value || 0), 0);
  const monthlyCommission = calculateMonthlyCommission(totalAUM);
  
  return {
    totalAUM,
    customerCount: portfolios.length,
    ...monthlyCommission,
    annualProjections: {
      company: calculateAnnualProjection(totalAUM, 'company'),
      admin: calculateAnnualProjection(totalAUM, 'admin'),
      seller: calculateAnnualProjection(totalAUM, 'seller'),
      mutualFund: calculateAnnualProjection(totalAUM, 'mutualFund')
    }
  };
};

/**
 * Get withdrawal date (5th of next month)
 * @param {Date} forDate - Base date (defaults to current date)
 * @returns {Date} Withdrawal date
 */
export const getWithdrawalDate = (forDate = new Date()) => {
  const nextMonth = new Date(forDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(5);
  nextMonth.setHours(9, 0, 0, 0); // 9:00 AM
  return nextMonth;
};

/**
 * Get current period (month/year)
 * @param {Date} date - Date to get period for (defaults to current)
 * @returns {Object} {month, year}
 */
export const getCurrentPeriod = (date = new Date()) => {
  return {
    month: date.getMonth() + 1, // 1-12
    year: date.getFullYear()
  };
};

/**
 * Check if commissions are available for withdrawal (after 5th of month)
 * @param {Date} date - Date to check (defaults to current)
 * @returns {boolean} True if withdrawals are available
 */
export const isWithdrawalAvailable = (date = new Date()) => {
  return date.getDate() >= 5;
};