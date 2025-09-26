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
- **Charts**: Recharts, MUI X-Charts
- **Styling**: Material-UI components with responsive design
- **Data Source**: MFAPI.in public APIs
- **Caching**: In-memory caching for API responses

## API Endpoints

### Backend API Routes

1. **GET /api/mf** - List all mutual fund schemes
2. **GET /api/scheme/[code]** - Get scheme details and NAV history
3. **GET /api/scheme/[code]/returns** - Calculate returns for specific periods
4. **POST /api/scheme/[code]/sip** - Calculate SIP returns

### Query Parameters

- **Returns API**: `?period=1m|3m|6m|1y` or `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **SIP API**: POST body with `amount`, `frequency`, `from`, `to`

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── api/                    # API routes
│   ├── mf/                # List all schemes
│   └── scheme/            # Scheme-specific endpoints
│       └── [code]/
│           ├── route.js   # Scheme details
│           ├── returns/   # Returns calculation
│           └── sip/       # SIP calculation
├── app/                   # Next.js app directory
│   ├── funds/            # Fund listing page
│   ├── scheme/[code]/    # Scheme detail page
│   ├── compare/          # Fund comparison page
│   ├── portfolio/        # Portfolio tracker
│   ├── layout.js         # Root layout with MUI theme
│   └── page.js           # Home page
└── components/           # Reusable components
    ├── LumpsumCalculator.js
    └── SWPCalculator.js
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

## Data Caching

- Scheme list cached for 24 hours
- Individual scheme data cached for 12 hours
- Improves performance and reduces API calls

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