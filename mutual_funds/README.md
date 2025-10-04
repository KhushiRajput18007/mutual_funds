# Mutual Fund Explorer

A comprehensive Next.js application for exploring mutual funds with advanced calculators and portfolio tracking features.

## Features

### Core Features
- **Fund Explorer**: Browse and search through thousands of mutual funds
- **Scheme Details**: View detailed information, NAV charts, and historical performance
- **SIP Calculator**: Calculate Systematic Investment Plan returns using historical NAV data
- **Returns Analysis**: View returns for different time periods (1M, 3M, 6M, 1Y)

### Advanced Features
- **Lumpsum Calculator**: Calculate returns for one-time investments
- **SWP Calculator**: Systematic Withdrawal Plan calculator for retirement planning
- **Fund Comparison**: Compare multiple funds side by side
- **Portfolio Tracker**: Track your mutual fund investments with real-time valuations
- **Interactive Charts**: Visualize NAV trends and portfolio allocation

## Technology Stack

- **Frontend**: Next.js 15, React 19, Material-UI (MUI)
- **Backend**: Node.js with Next.js API routes
- **Database**: MongoDB Atlas (Cloud)
- **Charts**: Recharts, MUI X-Charts
- **Styling**: Material-UI components with responsive design
- **Data Source**: MFAPI.in public APIs
- **Caching**: MongoDB-based intelligent caching
- **AI**: Google Gemini API for notifications

## API Endpoints

### Backend API Routes

#### Core APIs (Enhanced with MongoDB)
1. **GET /api/mf** - List all mutual fund schemes (cached in MongoDB)
2. **GET /api/scheme/[code]** - Get scheme details and NAV history (cached in MongoDB)
3. **GET /api/scheme/[code]/returns** - Calculate returns for specific periods
4. **POST /api/scheme/[code]/sip** - Calculate SIP returns
5. **POST /api/scheme/[code]/stepup-sip** - Calculate step-up SIP returns
6. **POST /api/scheme/[code]/stepup-swp** - Calculate step-up SWP returns

#### New MongoDB-Powered APIs
7. **GET/POST/PUT/DELETE /api/portfolio** - Portfolio management
8. **GET/POST/PUT /api/users** - User profile management
9. **GET/POST/DELETE /api/calculations** - Save/retrieve calculation history
10. **GET /api/analytics** - Dashboard analytics and insights
11. **GET /api/notifications** - AI-generated market notifications
12. **POST /api/init-db** - Initialize database indexes
13. **GET /api/peer-comparison** - Fund peer comparison

### Query Parameters

- **Returns API**: `?period=1m|3m|6m|1y` or `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **SIP API**: POST body with `amount`, `frequency`, `from`, `to`

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize MongoDB Database**
   ```bash
   # Start the development server first
   npm run dev
   
   # Then initialize the database (one-time setup)
   curl -X POST http://localhost:3000/api/init-db
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### MongoDB Configuration
- **Database**: MongoDB Atlas Cloud
- **Connection**: Automatically configured in `/src/lib/mongodb.js`
- **Collections**: Auto-created with proper indexes
- **Data**: Populated automatically from MFAPI.in

## Project Structure

```
src/
├── lib/                   # Database and utilities
│   ├── mongodb.js        # MongoDB connection
│   └── models.js         # Database models and indexes
├── app/
│   ├── api/              # API routes
│   │   ├── mf/           # List all schemes (MongoDB cached)
│   │   ├── scheme/[code]/ # Scheme-specific endpoints
│   │   ├── portfolio/    # Portfolio CRUD operations
│   │   ├── users/        # User management
│   │   ├── calculations/ # Calculation history
│   │   ├── analytics/    # Dashboard analytics
│   │   ├── notifications/ # AI-powered notifications
│   │   ├── peer-comparison/ # Fund comparison
│   │   └── init-db/      # Database initialization
│   ├── funds/            # Fund listing page
│   ├── scheme/[code]/    # Scheme detail page
│   ├── compare/          # Fund comparison page
│   ├── portfolio/        # Portfolio tracker
│   ├── peer-comparison/  # Peer comparison page
│   ├── layout.js         # Root layout with MUI theme
│   └── page.js           # Home page
└── components/           # Reusable components
    ├── LumpsumCalculator.js
    ├── SWPCalculator.js
    ├── StepUpSIPCalculator.js
    ├── StepUpSWPCalculator.js
    ├── Navigation.js
    └── ThemeProvider.js
```

## Key Features Explained

### SIP Calculator
- Uses historical NAV data to simulate actual SIP investments
- Supports monthly, quarterly, and yearly frequencies
- Calculates absolute and annualized returns
- Shows investment growth over time

### Portfolio Tracker
- Add and track multiple mutual fund holdings
- Real-time portfolio valuation using current NAV
- Visual portfolio allocation with pie charts
- Calculate total gains/losses across holdings

### Fund Comparison
- Compare up to 5 funds simultaneously
- Side-by-side returns comparison
- Interactive charts showing performance trends
- Tabular data for detailed analysis

### Advanced Calculators
- **Lumpsum**: One-time investment return calculation
- **SWP**: Systematic withdrawal planning for retirement
- **Returns**: Historical performance analysis

## Data Storage & Caching

### MongoDB Collections
- **schemes**: All mutual fund schemes with metadata
- **scheme_data**: Cached scheme details and NAV history
- **nav_history**: Individual NAV records for performance analysis
- **portfolios**: User portfolio holdings and transactions
- **users**: User profiles and investment preferences
- **calculations**: Saved SIP/Lumpsum/SWP calculation results
- **notifications**: AI-generated market alerts and insights

### Intelligent Caching Strategy
- Scheme list cached for 24 hours in MongoDB
- Individual scheme data cached for 12 hours
- Market data cached for 8 minutes for real-time notifications
- NAV history stored permanently for historical analysis
- Automatic cleanup of old notifications (keeps last 100)
- Improves performance and reduces external API calls

## Responsive Design

- Mobile-first approach using Material-UI
- Responsive grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

## Future Enhancements

- Redis caching for production
- User authentication and saved portfolios
- Email alerts for portfolio performance
- Advanced filtering and sorting options
- Export functionality for reports
- Integration with more data sources

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.