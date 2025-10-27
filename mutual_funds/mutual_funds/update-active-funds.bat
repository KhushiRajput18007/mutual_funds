@echo off
echo 🚀 Starting Active Funds Cache Update...
echo.
echo ✅ Using CORRECT filtering logic:
echo   - Fund is ACTIVE only if isinGrowth has valid data (not null)
echo   - Fund is INACTIVE if isinGrowth is null or empty
echo.

curl -X POST "http://localhost:3000/api/activeFunds" -H "Content-Type: application/json" --max-time 300 --progress-bar

echo.
echo ✨ Cache update completed!
echo 📊 Visit http://localhost:3000/active-funds to see results
echo 🧪 Test endpoint: http://localhost:3000/api/test-mfapi
pause