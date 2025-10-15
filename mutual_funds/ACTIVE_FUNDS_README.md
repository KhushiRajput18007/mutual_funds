# Active Funds Filtering Implementation

This document explains how the mutual funds application identifies and filters active funds using the `isinGrowth` field from the MFAPI.

## Overview

Our application implements a sophisticated filtering system to identify **active mutual funds** by analyzing data from the MFAPI (`https://api.mfapi.in/mf`). The key criterion for determining if a fund is active is the presence of valid `isinGrowth` data.

## How It Works

### 1. Data Source
- **Primary API**: `https://api.mfapi.in/mf` - Returns all mutual fund schemes
- **Detail API**: `https://api.mfapi.in/mf/{schemeCode}` - Returns detailed information for each scheme

### 2. Active Fund Criteria
A mutual fund is considered **ACTIVE** if:
- The `isinGrowth` field is **not null**
- The `isinGrowth` field is **not empty**
- The `isinGrowth` field contains a valid ISIN code

A mutual fund is considered **INACTIVE** if:
- The `isinGrowth` field is **null**
- The `isinGrowth` field is **empty**

### 3. Implementation Details

#### Core Filtering Logic
```javascript
const meta = detailData?.meta || {};
const isinGrowth = meta.isin_growth || meta.isinGrowth || null;

if (isinGrowth && isinGrowth.trim() !== '') {
  // Fund is ACTIVE - has valid isinGrowth
  activeFunds.push({
    schemeCode: scheme.schemeCode,
    schemeName: scheme.schemeName,
    isinGrowth: isinGrowth,
    category: meta.scheme_category || 'Unknown',
    nav: latestNav ? parseFloat(latestNav.nav) : null,
    // ... other metadata
  });
} else {
  // Fund is INACTIVE - missing or null isinGrowth
  inactiveFunds++;
}
```

## API Endpoints

### 1. `/api/activeFunds`
- **Purpose**: Cached active funds using file-based cache
- **Features**: Automatic cache management, concurrency control
- **Implementation**: `src/lib/activeFundsCache.js`

### 2. `/api/active-funds`
- **Purpose**: Database-backed active funds with MongoDB fallback
- **Features**: Database persistence, fallback to live computation
- **Implementation**: `src/app/api/active-funds/route.js`

### 3. `/api/funds/active-funds-info` (Demo)
- **Purpose**: Detailed demonstration of filtering logic with statistics
- **Features**: Live filtering, detailed stats, cache management
- **Implementation**: `src/app/api/funds/active-funds-info/route.js`

## Frontend Components

### 1. Funds Explorer (`/funds`)
- Uses active funds API as primary data source
- Falls back to all funds if active funds unavailable
- Location: `src/app/funds/page.js`

### 2. Active Funds Demo (`/demo/active-funds`)
- Interactive demonstration of filtering logic
- Shows real-time statistics and examples
- Location: `src/app/demo/active-funds/page.js`

### 3. Trending Active Page (`/trending-active`)
- Displays trending and active funds side by side
- Location: `src/app/trending-active/page.js`

## Key Features

### Performance Optimizations
- **Caching**: Multiple levels of caching (file-based, in-memory)
- **Concurrency Control**: Parallel processing with configurable limits
- **Timeout Handling**: Request timeouts to prevent hanging
- **Retry Logic**: Automatic retry with exponential backoff

### Error Handling
- Graceful fallbacks when APIs are unavailable
- Comprehensive error logging
- User-friendly error messages
- Automatic recovery mechanisms

### Statistics Tracking
- Total schemes processed
- Active vs inactive fund counts
- Success rates and error counts
- Processing time metrics

## Configuration

### Environment Variables
```bash
ACTIVE_FUNDS_MAX_SCHEMES=1000  # Limit processing for performance
MONGODB_URI=mongodb://...       # Database connection for persistence
```

### Cache Configuration
- **TTL**: 5 minutes for API responses
- **Concurrency**: 8 parallel requests (configurable)
- **Timeout**: 45 seconds per request
- **Retries**: 2 attempts with exponential backoff

## Example Data Structure

### Active Fund Object
```javascript
{
  schemeCode: "100033",
  schemeName: "Aditya Birla Sun Life Large & Mid Cap Fund - Regular Growth",
  isinGrowth: "INF209K01165",
  isinDivReinvestment: null,
  category: "Hybrid: Aggressive Hybrid Fund",
  nav: 52.34,
  navDate: "2025-10-13",
  fundHouse: "Aditya Birla Sun Life Mutual Fund",
  schemeType: "Open Ended Schemes"
}
```

### Statistics Object
```javascript
{
  totalSchemes: 37166,
  processedSchemes: 100,
  activeFunds: 45,
  inactiveFunds: 55,
  errorCount: 0
}
```

## Usage Examples

### Basic API Call
```javascript
// Get active funds
const response = await fetch('/api/activeFunds');
const data = await response.json();
const activeFunds = data.activeFunds;
```

### Demo Page with Statistics
```javascript
// Get detailed info with statistics
const response = await fetch('/api/funds/active-funds-info?sample=50');
const result = await response.json();
console.log(`Found ${result.stats.activeFunds} active funds`);
```

### Frontend Integration
```javascript
// React component usage
const [schemes, setSchemes] = useState([]);

useEffect(() => {
  const fetchActiveSchemes = async () => {
    const response = await fetch('/api/active-funds');
    const data = await response.json();
    setSchemes(Array.isArray(data) ? data : []);
  };
  
  fetchActiveSchemes();
}, []);
```

## Testing the Implementation

### 1. Live Demo
Visit `/demo/active-funds` to see the filtering in action with:
- Real-time statistics
- Live API data
- Interactive examples
- Technical implementation details

### 2. API Testing
```bash
# Test basic active funds endpoint
curl http://localhost:3002/api/activeFunds

# Test detailed info endpoint
curl http://localhost:3002/api/funds/active-funds-info?sample=10

# Force refresh cache
curl -X POST http://localhost:3002/api/funds/active-funds-info
```

### 3. Browser Console
```javascript
// Test from browser console
fetch('/api/funds/active-funds-info?sample=10')
  .then(r => r.json())
  .then(data => {
    console.log('Statistics:', data.stats);
    console.log('Active Funds:', data.data);
  });
```

## Maintenance

### Monitoring
- Check logs for API failures
- Monitor cache hit rates
- Track processing performance
- Review error patterns

### Updates
- MFAPI schema changes
- Performance optimizations
- Cache strategy improvements
- Error handling enhancements

## Troubleshooting

### Common Issues
1. **Empty Results**: Check MFAPI availability and network connectivity
2. **Slow Performance**: Reduce sample size or increase concurrency limits
3. **Cache Issues**: Clear cache files or restart application
4. **Database Errors**: Check MongoDB connection and credentials

### Debugging
```javascript
// Enable debug logging
process.env.NODE_ENV = 'development';

// Check cache status
const cacheFile = path.join(process.cwd(), 'data', 'activeFunds.json');
const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
console.log('Cache info:', {
  count: cacheData.activeFunds?.length,
  generated: cacheData.generatedAt
});
```

---

This implementation provides a robust, scalable solution for identifying and serving active mutual funds while maintaining excellent performance and user experience.