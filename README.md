# Stock Portfolio Tracker

A React Native mobile app for tracking your stock portfolio with real-time prices using the Alpha Vantage API.

## Features

- 📈 Add stocks to your portfolio by symbol (e.g., AAPL, TSLA, MSFT)
- 💰 Real-time stock prices using Alpha Vantage API
- 📊 Total portfolio value calculation
- 🌙 Dark/Light mode support
- 🔍 Search and filter stocks in your portfolio
- 💾 Persistent local storage using Zustand + AsyncStorage
- ⚡ Quantity management for each stock
- 📱 Works on both iOS and Android

## Screenshots

[Add your screenshots here]

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Studio (for emulator)
- Alpha Vantage API key (free)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd StockPortfolioTracker

# Install dependencies
npm install

# Install additional dependencies
npx expo install @react-native-async-storage/async-storage
```

### 3. Alpha Vantage API Setup

1. Visit [Alpha Vantage](https://finnhub.io/api/v1)
2. Sign up for a free account
3. Get your API key (it will be sent to your email)
4. Create `src/utils/api.ts`:

```typescript
export const ALPHA_VANTAGE_API_KEY = "YOUR_API_KEY_HERE";
```

### 4. Running the App

```bash
# Start the development server
npx expo start

# For iOS (Mac only)
npx expo start --ios

# For Android
npx expo start --android

# For web
npx expo start --web
```

Scan the QR code with the Expo Go app on your phone, or run on a simulator.

## Project Structure

```
src/

├── hooks/              # Custom React hooks
│   ├── useStocks.ts
│   └── useTheme.ts
├── services/           # API services
│   └── stockApi.ts
├── store/              # Zustand state management
│   └── usePortfolioStore.ts
├── types/              # TypeScript definitions
│   └── index.ts
├── screens/            # App screens
│   └── PortfolioScreen.tsx
└── utils/             # Configuration files
    └── api.ts
```

## API Choice: Alpha Vantage

**Why Alpha Vantage?**

- ✅ Free tier available (25 requests per day)
- ✅ Real-time and historical data
- ✅ Global stock coverage (US and international)
- ✅ Well-documented REST API
- ✅ No credit card required

**Free Tier Limits:**

- 25 API requests per day
- 5 requests per minute rate limit
- Real-time and historical data

**Example API Call:**

```javascript
// Get AAPL quote
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_API_KEY
```

## Design Decisions

### State Management

- **Zustand**: Chosen for its simplicity, minimal boilerplate, and excellent TypeScript support
- **Persistence**: AsyncStorage for cross-platform local storage
- **Partial Persistence**: Only stocks are persisted, not real-time quotes

### Architecture

- **Modular Structure**: Clear separation of concerns with dedicated folders
- **Custom Hooks**: Reusable logic for stock data and theme management
- **Component Composition**: Reusable UI components with consistent props
- **Type Safety**: Full TypeScript implementation throughout

### Performance Optimizations

- Batch API calls for multiple stocks
- 30-second price refresh intervals
- Efficient re-renders with Zustand's selective state updates
- Memoized portfolio value calculations

### UI/UX

- **Clean Design**: Minimalist interface focused on data
- **Dark/Light Mode**: System-consistent theme switching
- **Responsive Layout**: Works on various screen sizes
- **Loading States**: Clear feedback during API calls
- **Error Handling**: User-friendly error messages

## Key Components

### PortfolioScreen

Main screen that combines:

- Portfolio summary with total value
- Add stock form with validation
- Search functionality
- Stock list with real-time prices

### StockCard

Displays individual stock information:

- Symbol and company name
- Current price and daily change
- Quantity controls (+/- buttons)
- Current position value
- Remove stock functionality

### useStocks Hook

Manages stock data logic:

- Automatic quote fetching
- Loading and error states
- Portfolio value calculation
- Refresh intervals

## Testing

**Test not implemented yet!**

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Examples

- Store actions (add/remove/update stocks)
- Component rendering with mock data
- Portfolio value calculations
- Theme switching functionality

## Troubleshooting

### Common Issues

1. **API Limit Exceeded**

   ```
   Error: API call frequency exceeded
   ```

   Solution: Wait for rate limit reset or upgrade API plan

2. **Invalid Stock Symbol**

   ```
   Error: Invalid API call
   ```

   Solution: Verify stock symbol exists and is correctly formatted

3. **Network Errors**
   ```
   Error: Network request failed
   ```
   Solution: Check internet connection and API endpoint availability

### Alpha Vantage Specific Notes

- Symbols must be uppercase (AAPL, not aapl)
- Some symbols may require exchange prefixes (LON:TSCO for London stocks)
- Free tier has limited international coverage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Portfolio performance charts
- [ ] Stock news integration
- [ ] Watchlist functionality
- [ ] Portfolio diversification analytics
- [ ] Export portfolio data
- [ ] Multiple portfolios support
- [ ] Price alerts

---

**Note**: The free Alpha Vantage API has limited requests. For heavy usage, consider upgrading to their premium plan or exploring alternative data providers.
