# MongoDB Integration - API Testing Guide

## Working APIs to Test in Postman

### 1. Test MongoDB Connection
```
GET http://localhost:3000/api/test-db
```
**Expected Response:**
```json
{
  "success": true,
  "message": "MongoDB connection successful",
  "ping": { "ok": 1 }
}
```

### 2. Enhanced Schemes API (with MongoDB caching)
```
GET http://localhost:3000/api/mf
```
**Features:**
- Caches all schemes in MongoDB for 24 hours
- Stores individual scheme records
- Improves performance on subsequent calls

### 3. Enhanced Scheme Details API (with NAV storage)
```
GET http://localhost:3000/api/scheme/120503
```
**Features:**
- Caches scheme data for 12 hours
- Stores NAV history in separate collection
- Enables historical analysis

### 4. Enhanced Notifications API (with MongoDB caching)
```
GET http://localhost:3000/api/notifications
```
**Features:**
- Caches notifications for 8 minutes
- Stores market data cache
- Auto-cleans old notifications

## MongoDB Collections Created

1. **schemes** - All mutual fund schemes
2. **scheme_data** - Cached scheme details
3. **nav_history** - NAV records for analysis
4. **notifications** - AI-generated alerts
5. **market_data_cache** - Market performance data

## Database Information

- **URI**: `mongodb+srv://mutualFunds:mutualFunds161992@cluster0.xfx6oyr.mongodb.net/`
- **Database**: `mutualfunds`
- **Connection**: Dynamic import for better compatibility

## Testing Workflow

1. **Test Connection**: `GET /api/test-db`
2. **Load Schemes**: `GET /api/mf` (populates schemes collection)
3. **Get Scheme Data**: `GET /api/scheme/120503` (stores NAV history)
4. **Generate Notifications**: `GET /api/notifications` (creates alerts)

## Performance Benefits

- **Caching**: Reduces external API calls
- **Storage**: Permanent NAV history for analysis
- **Speed**: Faster response times on cached data
- **Analytics**: Data available for insights

## Next Steps

The other APIs (portfolio, users, calculations, analytics) can be implemented once the basic MongoDB connection is stable. The current implementation focuses on enhancing existing functionality with MongoDB caching and storage.