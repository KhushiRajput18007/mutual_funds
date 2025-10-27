import { NextResponse } from 'next/server';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const CACHE_DURATION = 8 * 60 * 1000; // 8 minutes
const MARKET_DATA_CACHE_DURATION = 8 * 60 * 1000; // 8 minutes

// In-memory caches to avoid repeated live calls
let NOTIF_CACHE = { data: null, at: 0 };
let MARKET_CACHE = { data: null, at: 0 };

export async function GET() {
  try {
    // Serve cached notifications if fresh
    if (NOTIF_CACHE.data && Date.now() - NOTIF_CACHE.at < CACHE_DURATION) {
      return NextResponse.json(NOTIF_CACHE.data);
    }

    console.log('Generating fresh notifications with live market data...');

    const marketData = await getMarketData();
    const notifications = await generateNotifications(marketData);
    
    const notificationsWithTimestamp = notifications.map(notification => ({
      ...notification,
      timestamp: Date.now(),
      createdAt: new Date()
    }));

    // Cache and return
    NOTIF_CACHE = { data: notificationsWithTimestamp, at: Date.now() };
    return NextResponse.json(NOTIF_CACHE.data);
  } catch (error) {
    console.error('Error generating notifications:', error);
    // Fallback to a small static set so UI doesn't break
    const fallback = [
      { id: 'fallback_mkt', title: 'Market Pulse', message: 'Markets mixed today; SIP remains a steady approach for long-term goals.', type: 'info', icon: '📊', time: 'Just now' },
      { id: 'fallback_sip', title: 'SIP Tip', message: 'Consider setting up SIPs in diversified equity funds to average costs over time.', type: 'success', icon: '💰', time: '1 min ago' }
    ];
    return NextResponse.json(fallback);
  }
}

async function getMarketData() {
  // Serve cached market data if still fresh
  if (MARKET_CACHE.data && Date.now() - MARKET_CACHE.at < MARKET_DATA_CACHE_DURATION) {
    return MARKET_CACHE.data;
  }

  console.log('Fetching live market data from MFAPI.in...');

  try {
    // Add timeout + small retry for resilience
    const listUrl = 'https://api.mfapi.in/mf';
    const maxRetries = 3;
    const timeoutMs = 15000; // 15s
    let allFunds = [];
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const fundsResponse = await axios.get(listUrl, { signal: controller.signal, timeout: timeoutMs, headers: { Accept: 'application/json' } });
        clearTimeout(timer);
        if (!fundsResponse || fundsResponse.status < 200 || fundsResponse.status >= 300) {
          console.warn('MFAPI list non-OK:', fundsResponse?.status);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
            continue;
          } else {
            return MARKET_CACHE.data || null;
          }
        }
        allFunds = fundsResponse.data;
        break;
      } catch (e) {
        console.warn('MFAPI list fetch error attempt', attempt + 1, e?.code || '', e?.message || '');
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
        } else {
          return MARKET_CACHE.data || null;
        }
      }
    }
    
    const sampleFunds = Array.isArray(allFunds) ? allFunds.slice(0, 12) : [];
    const fundPerformance = [];
    
    for (const fund of sampleFunds) {
      try {
        const perfController = new AbortController();
        const perfTimer = setTimeout(() => perfController.abort(), timeoutMs);
        const perfResponse = await axios.get(`https://api.mfapi.in/mf/${fund.schemeCode}`, { signal: perfController.signal, timeout: timeoutMs, headers: { Accept: 'application/json' } });
        clearTimeout(perfTimer);
        if (perfResponse && perfResponse.status >= 200 && perfResponse.status < 300) {
          const perfData = perfResponse.data;
          if (perfData.data && perfData.data.length > 1) {
            const latest = parseFloat(perfData.data[0].nav);
            const previous = parseFloat(perfData.data[1].nav);
            const change = ((latest - previous) / previous * 100).toFixed(2);
            
            fundPerformance.push({
              name: perfData.meta.scheme_name,
              category: perfData.meta.scheme_category,
              fundHouse: perfData.meta.fund_house,
              change: parseFloat(change),
              nav: latest
            });
          }
        }
      } catch (error) {
        console.warn(`Error fetching performance for ${fund.schemeName}:`, error?.message || error);
      }
    }
    
    const market = {
      topPerformers: fundPerformance.filter(f => f.change > 0).sort((a, b) => b.change - a.change).slice(0, 5),
      underPerformers: fundPerformance.filter(f => f.change < 0).sort((a, b) => a.change - b.change).slice(0, 3),
      categories: [...new Set(fundPerformance.map(f => f.category))],
      fundHouses: [...new Set(fundPerformance.map(f => f.fundHouse))],
      avgChange: fundPerformance.length > 0 ? (fundPerformance.reduce((sum, f) => sum + f.change, 0) / fundPerformance.length).toFixed(2) : 0,
      volatileCategories: [...new Set(fundPerformance.filter(f => Math.abs(f.change) > 2).map(f => f.category))],
      stablePerformers: fundPerformance.filter(f => f.change > 0 && f.change < 1).slice(0, 3)
    };
    MARKET_CACHE = { data: market, at: Date.now() };
    return market;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return MARKET_CACHE.data || null;
  }
}

async function generateNotifications(marketData) {
  const notifications = [];
  const prompts = [];
  const notificationTypes = [];
  
  // Market Performance Alerts
  if (marketData?.topPerformers?.length > 0) {
    const topFund = marketData.topPerformers[0];
    prompts.push(`${topFund.name} from ${topFund.fundHouse} surged ${topFund.change}% in ${topFund.category}. Generate a market alert about this exceptional performance and investment implications. Keep under 45 words.`);
    notificationTypes.push({ title: 'Top Performer Alert', type: 'success', icon: '🚀' });
  }
  
  // Volatility Warnings
  if (marketData?.volatileCategories?.length > 0) {
    const volatileCategory = marketData.volatileCategories[0];
    prompts.push(`${volatileCategory} funds showing high volatility with significant price swings. Generate a risk management alert for investors in this category. Keep under 45 words.`);
    notificationTypes.push({ title: 'Volatility Alert', type: 'warning', icon: '⚡' });
  }
  
  // SIP Opportunities
  if (marketData?.underPerformers?.length > 0) {
    const underPerformer = marketData.underPerformers[0];
    prompts.push(`${underPerformer.category} funds like ${underPerformer.name} declined ${Math.abs(underPerformer.change)}%. Generate a SIP opportunity alert for value investing. Keep under 45 words.`);
    notificationTypes.push({ title: 'SIP Opportunity', type: 'info', icon: '💎' });
  }
  
  // Sector Rotation Insights
  if (marketData?.categories?.length > 2) {
    const categories = marketData.categories.slice(0, 3).join(', ');
    prompts.push(`Current market showing activity in ${categories} sectors. Generate sector rotation strategy for mutual fund investors. Keep under 45 words.`);
    notificationTypes.push({ title: 'Sector Insight', type: 'info', icon: '🔄' });
  }
  
  // Fund House Performance
  if (marketData?.fundHouses?.length > 0) {
    const topFundHouse = marketData.fundHouses[Math.floor(Math.random() * marketData.fundHouses.length)];
    prompts.push(`${topFundHouse} showing consistent performance across multiple fund categories. Generate an analysis of fund house strength and investment potential. Keep under 45 words.`);
    notificationTypes.push({ title: 'Fund House Focus', type: 'success', icon: '🏢' });
  }
  
  // Market Sentiment Analysis
  if (marketData?.avgChange) {
    const sentiment = parseFloat(marketData.avgChange) > 0 ? 'positive' : 'negative';
    prompts.push(`Overall market sentiment is ${sentiment} with average fund change of ${marketData.avgChange}%. Generate market sentiment analysis and investment strategy. Keep under 45 words.`);
    notificationTypes.push({ title: 'Market Sentiment', type: parseFloat(marketData.avgChange) > 0 ? 'success' : 'warning', icon: '📊' });
  }
  
  // Stable Investment Options
  if (marketData?.stablePerformers?.length > 0) {
    const stableFund = marketData.stablePerformers[0];
    prompts.push(`${stableFund.name} showing steady growth of ${stableFund.change}% with low volatility. Generate conservative investment recommendation. Keep under 45 words.`);
    notificationTypes.push({ title: 'Stable Growth', type: 'info', icon: '🛡️' });
  }
  
  // Tax Saving Reminders (seasonal)
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 10 || currentMonth <= 2) { // Nov-Feb (tax season)
    prompts.push('Tax saving season approaching. Generate ELSS mutual fund investment reminder with tax benefits and investment strategy. Keep under 45 words.');
    notificationTypes.push({ title: 'Tax Saving Alert', type: 'warning', icon: '💰' });
  }
  
  // Goal-based Investment Tips
  const goalTypes = ['retirement', 'child education', 'house purchase', 'emergency fund'];
  const randomGoal = goalTypes[Math.floor(Math.random() * goalTypes.length)];
  prompts.push(`Generate a goal-based investment tip for ${randomGoal} using mutual funds. Include specific fund categories and time horizon. Keep under 45 words.`);
  notificationTypes.push({ title: 'Goal Planning', type: 'info', icon: '🎯' });
  
  // Add fallback prompts if no market data
  if (prompts.length === 0) {
    prompts.push(
      'Generate a market update about Indian mutual fund performance trends. Keep under 45 words.',
      'Create a SIP investment strategy for current market conditions. Keep under 45 words.',
      'Generate portfolio rebalancing advice for mutual fund investors. Keep under 45 words.'
    );
    notificationTypes.push(
      { title: 'Market Update', type: 'info', icon: '📈' },
      { title: 'SIP Strategy', type: 'success', icon: '💰' },
      { title: 'Portfolio Tip', type: 'warning', icon: '⚖️' }
    );
  }
  
  // Generate notifications with variety
  const selectedPrompts = prompts.slice(0, 6);
  const selectedTypes = notificationTypes.slice(0, 6);
  
  const canCallGemini = typeof GEMINI_API_KEY === 'string' && GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_API_KEY';
  for (let i = 0; i < selectedPrompts.length; i++) {
    if (!canCallGemini) {
      // Fallback: synthesize short messages locally when API key missing
      notifications.push({
        id: `notif_local_${Date.now()}_${i}`,
        title: selectedTypes[i]?.title || 'Market Update',
        message: selectedPrompts[i].slice(0, 90).replace(/Generate .*?\./, '').trim() || 'Market update available.',
        type: selectedTypes[i]?.type || 'info',
        icon: selectedTypes[i]?.icon || '📈',
        time: `${Math.floor(Math.random() * 45) + 5} mins ago`
      });
      continue;
    }
    try {
      const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        contents: [{ parts: [{ text: selectedPrompts[i] }] }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });

      if (response && response.status >= 200 && response.status < 300) {
        const data = response.data;
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (content) {
          notifications.push({
            id: `notif_${Date.now()}_${i}`,
            title: selectedTypes[i]?.title || 'Market Update',
            message: content.trim(),
            type: selectedTypes[i]?.type || 'info',
            icon: selectedTypes[i]?.icon || '📈',
            time: `${Math.floor(Math.random() * 45) + 5} mins ago`
          });
        }
      }
    } catch (error) {
      console.error(`Error generating notification ${i}:`, error);
    }
  }

  // Add real-time portfolio insights
  if (marketData?.topPerformers?.length > 1) {
    const secondBest = marketData.topPerformers[1];
    notifications.push({
      id: `portfolio_insight_${Date.now()}`,
      title: 'Portfolio Insight',
      message: `${secondBest.fundHouse} ${secondBest.category} funds gaining momentum (+${secondBest.change}%). Consider portfolio allocation review.`,
      type: 'success',
      icon: '💡',
      time: '3 mins ago'
    });
  }
  
  // Add market timing notifications
  if (marketData?.avgChange && Math.abs(parseFloat(marketData.avgChange)) > 1) {
    const direction = parseFloat(marketData.avgChange) > 0 ? 'bullish' : 'bearish';
    notifications.push({
      id: `timing_${Date.now()}`,
      title: 'Market Timing',
      message: `Market showing ${direction} trend (${marketData.avgChange}% avg). ${direction === 'bearish' ? 'SIP opportunities emerging' : 'Consider profit booking'}.`,
      type: direction === 'bullish' ? 'success' : 'warning',
      icon: direction === 'bullish' ? '📈' : '📉',
      time: '8 mins ago'
    });
  }

  // Ensure minimum notifications
  if (notifications.length === 0) {
    notifications.push({
      id: 'fallback_1',
      title: 'Market Pulse',
      message: 'Indian mutual fund markets showing mixed signals. Diversified SIP approach recommended for steady wealth creation.',
      type: 'info',
      icon: '📊',
      time: '12 mins ago'
    });
  }

  return notifications.slice(0, 8); // Limit to 8 notifications
}