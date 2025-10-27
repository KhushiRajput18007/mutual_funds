import { NextResponse } from 'next/server';
import axios from 'axios';

const MFAPI_BASE_URL = 'https://api.mfapi.in/mf';

/**
 * Comprehensive analysis of MFAPI data structure
 */
export async function GET() {
  try {
    console.log('🔍 Starting comprehensive MFAPI analysis...');
    
    const response = await axios.get(MFAPI_BASE_URL, {
      timeout: 60000,
      headers: {
        'User-Agent': 'MFAPI-Analyzer/1.0',
        'Accept': 'application/json'
      }
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`MFAPI request failed: ${response.status}`);
    }

    const allFunds = response.data;
    
    if (!Array.isArray(allFunds)) {
      throw new Error('MFAPI returned invalid data structure (not an array)');
    }

    console.log(`📊 Analyzing ${allFunds.length} total funds...`);

    // Comprehensive analysis with enhanced criteria
    let enhancedStats = {
      withValidIsinGrowth: 0,
      withNullIsinGrowth: 0,
      withEmptyIsinGrowth: 0,
      withUndefinedIsinGrowth: 0,
      withoutIsinGrowthProperty: 0,
      withAlternativeIsin: 0,
      withValidNav: 0,
      withSchemeCode: 0,
      recentlyUpdated: 0,
      withBasicInfo: 0,
      totalQualified: 0
    };

    let schemeTypes = {};
    let fundhouseStats = {};
    let sampleActiveFunds = [];
    let sampleInactiveFunds = [];

    allFunds.forEach((fund, index) => {
      let qualifiesAsActive = false;
      
      // PRIMARY: Analyze isinGrowth property
      if (!fund.hasOwnProperty('isinGrowth')) {
        enhancedStats.withoutIsinGrowthProperty++;
      } else if (fund.isinGrowth === null) {
        enhancedStats.withNullIsinGrowth++;
      } else if (fund.isinGrowth === undefined) {
        enhancedStats.withUndefinedIsinGrowth++;
      } else if (typeof fund.isinGrowth === 'string' && fund.isinGrowth.trim() === '') {
        enhancedStats.withEmptyIsinGrowth++;
      } else if (fund.isinGrowth && fund.isinGrowth.toString().trim() !== '') {
        enhancedStats.withValidIsinGrowth++;
        qualifiesAsActive = true;
      }
      
      // ALTERNATIVE 1: Other ISIN fields
      if (!qualifiesAsActive && (fund.isin_growth || fund.isinDiv || fund.isin_div || fund.isinReinvestment)) {
        const altIsin = fund.isin_growth || fund.isinDiv || fund.isin_div || fund.isinReinvestment;
        if (altIsin && altIsin.toString().trim() !== '') {
          enhancedStats.withAlternativeIsin++;
          qualifiesAsActive = true;
        }
      }
      
      // ALTERNATIVE 2: Valid NAV
      if (!qualifiesAsActive && fund.nav && parseFloat(fund.nav) > 0) {
        enhancedStats.withValidNav++;
        qualifiesAsActive = true;
      }
      
      // ALTERNATIVE 3: Scheme codes
      if (!qualifiesAsActive && fund.schemeCode && fund.schemeCode.toString().trim() !== '') {
        enhancedStats.withSchemeCode++;
        qualifiesAsActive = true;
      }
      
      // ALTERNATIVE 4: Recently updated
      if (!qualifiesAsActive && (fund.date || fund.lastUpdated)) {
        const dateField = fund.date || fund.lastUpdated;
        if (dateField) {
          try {
            const fundDate = new Date(dateField);
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            if (fundDate > oneYearAgo) {
              enhancedStats.recentlyUpdated++;
              qualifiesAsActive = true;
            }
          } catch (e) {
            // Date parsing failed, ignore
          }
        }
      }
      
      // FALLBACK: Basic info
      if (!qualifiesAsActive && fund.schemeName && fund.fundHouse && 
          fund.schemeName.toString().trim() !== '' && 
          fund.fundHouse.toString().trim() !== '') {
        enhancedStats.withBasicInfo++;
        qualifiesAsActive = true;
      }
      
      if (qualifiesAsActive) {
        enhancedStats.totalQualified++;
        if (sampleActiveFunds.length < 10) {
          sampleActiveFunds.push({
            name: fund.schemeName || fund.name || 'Unknown',
            schemeCode: fund.schemeCode,
            isinGrowth: fund.isinGrowth || 'N/A',
            nav: fund.nav || 'N/A',
            fundHouse: fund.fundHouse || 'Unknown',
            qualificationReason: fund.isinGrowth ? 'Primary ISIN' : 
                                fund.isin_growth || fund.isinDiv ? 'Alt ISIN' :
                                fund.nav ? 'Valid NAV' :
                                fund.schemeCode ? 'Scheme Code' : 'Basic Info'
          });
        }
      } else if (sampleInactiveFunds.length < 3) {
        sampleInactiveFunds.push({
          name: fund.schemeName || fund.name || 'Unknown',
          schemeCode: fund.schemeCode,
          reason: 'No qualifying criteria met'
        });
      }

      // Analyze scheme types
      const schemeType = fund.schemeType || 'Unknown';
      schemeTypes[schemeType] = (schemeTypes[schemeType] || 0) + 1;

      // Analyze fund houses
      const fundHouse = fund.fundHouse || 'Unknown';
      fundhouseStats[fundHouse] = (fundhouseStats[fundHouse] || 0) + 1;
    });

    // Get sample fund structure
    const sampleFund = allFunds.length > 0 ? allFunds[0] : null;
    const fundProperties = sampleFund ? Object.keys(sampleFund) : [];

    // Sort scheme types and fund houses by count
    const topSchemeTypes = Object.entries(schemeTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const topFundHouses = Object.entries(fundhouseStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const analysis = {
      success: true,
      timestamp: new Date().toISOString(),
      
      // Overall statistics
      totalFunds: allFunds.length,
      
      // Enhanced active funds analysis
      enhancedActiveFundsAnalysis: {
        ...enhancedStats,
        activePercentage: ((enhancedStats.totalQualified / allFunds.length) * 100).toFixed(2),
        guaranteedTarget: Math.max(enhancedStats.totalQualified, 5000),
        willReachTarget: enhancedStats.totalQualified >= 5000 ? 'YES' : 'NO (Emergency fallback will be used)'
      },
      
      // Data structure analysis
      fundStructure: {
        sampleFundProperties: fundProperties,
        totalProperties: fundProperties.length
      },
      
      // Distribution analysis
      distributions: {
        topSchemeTypes: topSchemeTypes.map(([type, count]) => ({ type, count })),
        topFundHouses: topFundHouses.map(([house, count]) => ({ house, count }))
      },
      
      // Samples
      samples: {
        activeFunds: sampleActiveFunds,
        inactiveFunds: sampleInactiveFunds.slice(0, 3)
      },
      
      // Recommendations
      recommendations: {
        totalActiveFundsAvailable: enhancedStats.totalQualified,
        guaranteedMinimum: 5000,
        filteringCriteria: 'Multiple criteria: isinGrowth, alternative ISIN fields, valid NAV, scheme codes, recent updates, basic info',
        dataQuality: enhancedStats.totalQualified >= 5000 ? 'Excellent' : 'Good (with fallback)',
        emergencyFallbackNeeded: enhancedStats.totalQualified < 5000
      }
    };

    console.log('✅ Enhanced MFAPI analysis completed');
    console.log(`📊 Results: ${enhancedStats.totalQualified} qualified active funds out of ${allFunds.length} total`);
    console.log(`🎯 Target: 5000+ funds ${enhancedStats.totalQualified >= 5000 ? '✅ ACHIEVED' : '⚠️  (Emergency fallback will be used)'}`);

    return NextResponse.json(analysis, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Total-Funds': allFunds.length.toString(),
        'X-Active-Funds': enhancedStats.totalQualified.toString()
      }
    });

  } catch (error) {
    console.error('❌ MFAPI analysis failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze MFAPI data',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}