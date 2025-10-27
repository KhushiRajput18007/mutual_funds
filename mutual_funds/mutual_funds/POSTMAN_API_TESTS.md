# MongoDB Integration - Postman API Testing Guide

## Prerequisites
1. Install MongoDB dependencies: `npm install mongodb`
2. Initialize database: `POST http://localhost:3000/api/init-db`

## API Endpoints to Test

### 1. Database Initialization
**Initialize MongoDB indexes and collections**
```
POST http://localhost:3000/api/init-db
Content-Type: application/json
```

### 2. Schemes API (Enhanced with MongoDB)
**Get all mutual fund schemes**
```
GET http://localhost:3000/api/mf
```

### 3. Scheme Details API (Enhanced with MongoDB)
**Get specific scheme details and NAV history**
```
GET http://localhost:3000/api/scheme/120503
```

### 4. Portfolio Management APIs

#### Get User Portfolios
```
GET http://localhost:3000/api/portfolio?userId=user123
```

#### Create Portfolio Entry
```
POST http://localhost:3000/api/portfolio
Content-Type: application/json

{
  "userId": "user123",
  "schemeCode": "120503",
  "schemeName": "HDFC Top 100 Fund",
  "units": 100.5,
  "avgPrice": 650.25,
  "investedAmount": 65350
}
```

#### Update Portfolio Entry
```
PUT http://localhost:3000/api/portfolio
Content-Type: application/json

{
  "_id": "PORTFOLIO_ID_HERE",
  "units": 150.5,
  "avgPrice": 645.50,
  "investedAmount": 97200
}
```

#### Delete Portfolio Entry
```
DELETE http://localhost:3000/api/portfolio?id=PORTFOLIO_ID_HERE
```

### 5. User Management APIs

#### Get User Profile
```
GET http://localhost:3000/api/users?userId=user123
```

#### Create/Update User
```
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "userId": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "preferences": {
    "theme": "dark",
    "riskProfile": "moderate",
    "investmentGoals": ["retirement", "tax-saving"]
  }
}
```

#### Update User Preferences
```
PUT http://localhost:3000/api/users
Content-Type: application/json

{
  "userId": "user123",
  "preferences": {
    "theme": "light",
    "riskProfile": "aggressive",
    "notifications": true
  }
}
```

### 6. Calculations Storage APIs

#### Get Saved Calculations
```
GET http://localhost:3000/api/calculations?userId=user123
GET http://localhost:3000/api/calculations?userId=user123&type=sip
GET http://localhost:3000/api/calculations?schemeCode=120503
```

#### Save Calculation Result
```
POST http://localhost:3000/api/calculations
Content-Type: application/json

{
  "userId": "user123",
  "schemeCode": "120503",
  "schemeName": "HDFC Top 100 Fund",
  "type": "sip",
  "parameters": {
    "amount": 5000,
    "frequency": "monthly",
    "from": "2020-01-01",
    "to": "2024-01-01"
  },
  "results": {
    "totalInvestment": 240000,
    "finalValue": 285000,
    "totalReturns": 45000,
    "annualizedReturn": 4.2
  }
}
```

#### Delete Calculation
```
DELETE http://localhost:3000/api/calculations?id=CALCULATION_ID_HERE&userId=user123
```

### 7. Analytics APIs

#### General Analytics
```
GET http://localhost:3000/api/analytics
```

#### Popular Schemes
```
GET http://localhost:3000/api/analytics?type=popular-schemes
```

#### Top Performers
```
GET http://localhost:3000/api/analytics?type=top-performers
```

#### User Activity Stats
```
GET http://localhost:3000/api/analytics?type=user-activity
```

#### Portfolio Summary
```
GET http://localhost:3000/api/analytics?type=portfolio-summary
```

### 8. Enhanced Notifications API (MongoDB Cached)
**Get AI-generated market notifications**
```
GET http://localhost:3000/api/notifications
```

### 9. Existing APIs (Now Enhanced with MongoDB)

#### SIP Calculator
```
POST http://localhost:3000/api/scheme/120503/sip
Content-Type: application/json

{
  "amount": 5000,
  "frequency": "monthly",
  "from": "2020-01-01",
  "to": "2024-01-01"
}
```

#### Returns Calculator
```
GET http://localhost:3000/api/scheme/120503/returns?period=1y
GET http://localhost:3000/api/scheme/120503/returns?from=2023-01-01&to=2024-01-01
```

#### Step-up SIP Calculator
```
POST http://localhost:3000/api/scheme/120503/stepup-sip
Content-Type: application/json

{
  "initialAmount": 5000,
  "stepUpPercentage": 10,
  "frequency": "monthly",
  "from": "2020-01-01",
  "to": "2024-01-01"
}
```

#### Step-up SWP Calculator
```
POST http://localhost:3000/api/scheme/120503/stepup-swp
Content-Type: application/json

{
  "initialAmount": 1000000,
  "withdrawalAmount": 5000,
  "stepUpPercentage": 5,
  "frequency": "monthly",
  "from": "2020-01-01",
  "to": "2024-01-01"
}
```

#### Peer Comparison
```
GET http://localhost:3000/api/peer-comparison
GET http://localhost:3000/api/peer-comparison?filter=high-returns
GET http://localhost:3000/api/peer-comparison?filter=new-funds
```

## MongoDB Collections Created

1. **schemes** - All mutual fund schemes with metadata
2. **scheme_data** - Cached scheme details and NAV history
3. **nav_history** - Individual NAV records for each scheme
4. **portfolios** - User portfolio holdings
5. **users** - User profiles and preferences
6. **calculations** - Saved calculation results
7. **notifications** - AI-generated market notifications
8. **market_data_cache** - Cached market performance data

## Testing Workflow

1. **Initialize Database**: Run init-db API first
2. **Load Schemes**: Call /api/mf to populate schemes collection
3. **Get Scheme Details**: Call /api/scheme/[code] to populate NAV history
4. **Create User**: Use users API to create test user
5. **Add Portfolio**: Use portfolio API to add holdings
6. **Save Calculations**: Use calculations API to store results
7. **Check Analytics**: Use analytics API to verify data aggregation
8. **Test Notifications**: Call notifications API to generate and cache alerts

## Sample Test Data

### User Profile
```json
{
  "userId": "test_user_001",
  "name": "Test User",
  "email": "test@example.com",
  "preferences": {
    "theme": "dark",
    "riskProfile": "moderate",
    "investmentGoals": ["retirement", "child-education"],
    "notifications": true
  }
}
```

### Portfolio Entry
```json
{
  "userId": "test_user_001",
  "schemeCode": "120503",
  "schemeName": "HDFC Top 100 Fund - Direct Plan - Growth",
  "units": 150.75,
  "avgPrice": 642.50,
  "investedAmount": 96906.875
}
```

### SIP Calculation
```json
{
  "userId": "test_user_001",
  "schemeCode": "120503",
  "schemeName": "HDFC Top 100 Fund",
  "type": "sip",
  "parameters": {
    "amount": 10000,
    "frequency": "monthly",
    "from": "2019-01-01",
    "to": "2024-01-01"
  },
  "results": {
    "totalInvestment": 600000,
    "finalValue": 750000,
    "totalReturns": 150000,
    "annualizedReturn": 4.8
  }
}
```

## Expected Database Growth

- **Schemes**: ~40,000 records
- **NAV History**: ~2M+ records (50 schemes × 1000 NAV records each)
- **Portfolios**: User-dependent
- **Calculations**: User-dependent
- **Notifications**: ~100 recent notifications (auto-cleaned)

## Performance Monitoring

Monitor these metrics:
- API response times
- Database query performance
- Cache hit rates
- Memory usage
- Storage growth

All APIs now store data in MongoDB for persistence, analytics, and improved performance through intelligent caching.