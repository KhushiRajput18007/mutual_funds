@echo off
echo ============================================
echo Testing Active Funds System
echo ============================================
echo.

echo 1. Starting development server...
start /B npm run dev
echo Waiting for server to start...
timeout /t 10 /nobreak > nul

echo.
echo 2. Testing cron status endpoint...
curl -s http://localhost:3000/api/cron/trigger-active-funds
echo.

echo.
echo 3. Manually triggering cron job...
curl -X POST -s http://localhost:3000/api/cron/trigger-active-funds
echo.

echo.
echo 4. Testing activeFunds endpoint...
curl -s http://localhost:3000/api/activeFunds
echo.

echo.
echo 5. Testing with force refresh...
curl -s "http://localhost:3000/api/activeFunds?refresh=true"
echo.

echo.
echo 6. Checking if cache file was created...
if exist "data\activeFunds.json" (
    echo ✅ Cache file exists
    type "data\activeFunds.json"
) else (
    echo ❌ Cache file not found
)

echo.
echo ============================================
echo Test completed
echo ============================================
pause