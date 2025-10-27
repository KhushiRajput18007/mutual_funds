@echo off
echo ============================================================================
echo                      COMPREHENSIVE ACTIVE FUNDS TESTING
echo                    Testing ALL Active Funds (No Limits)
echo ============================================================================
echo.

echo [STEP 1] Starting development server...
echo Starting server in background...
start /B npm run dev
echo Waiting for server to initialize...
timeout /t 15 /nobreak > nul
echo.

echo [STEP 2] Analyzing MFAPI data structure...
echo Making request to analyze endpoint...
curl -s http://localhost:3000/api/analyze-mfapi > analysis-output.json
if %ERRORLEVEL% EQU 0 (
    echo ✅ MFAPI analysis completed successfully
    echo 📊 Analysis saved to analysis-output.json
    echo.
    echo Key statistics from analysis:
    findstr /C:"totalFunds" /C:"withValidIsinGrowth" /C:"activePercentage" analysis-output.json 2>nul
    echo.
) else (
    echo ❌ MFAPI analysis failed
    echo.
)

echo [STEP 3] Testing activeFunds endpoint (cache preferred)...
curl -s http://localhost:3000/api/activeFunds > active-funds-cache.json
if %ERRORLEVEL% EQU 0 (
    echo ✅ ActiveFunds endpoint responded successfully
    findstr /C:"count" /C:"dataSource" /C:"fromCache" active-funds-cache.json 2>nul
    echo.
) else (
    echo ❌ ActiveFunds endpoint failed
    echo.
)

echo [STEP 4] Testing activeFunds endpoint (force refresh)...
echo This will fetch ALL active funds directly from MFAPI...
curl -s "http://localhost:3000/api/activeFunds?refresh=true" > active-funds-fresh.json
if %ERRORLEVEL% EQU 0 (
    echo ✅ Fresh data fetch completed
    findstr /C:"count" /C:"dataSource" /C:"fromCache" active-funds-fresh.json 2>nul
    echo.
) else (
    echo ❌ Fresh data fetch failed
    echo.
)

echo [STEP 5] Manually triggering cron job...
curl -X POST -s http://localhost:3000/api/cron/trigger-active-funds > cron-trigger.json
if %ERRORLEVEL% EQU 0 (
    echo ✅ Cron job triggered successfully
    findstr /C:"success" /C:"totalFunds" /C:"activeFunds" cron-trigger.json 2>nul
    echo.
) else (
    echo ❌ Cron job trigger failed
    echo.
)

echo [STEP 6] Checking cache file status...
if exist "data\activeFunds.json" (
    echo ✅ Cache file exists at: data\activeFunds.json
    echo.
    echo 📄 Cache file contents (first few lines):
    powershell -Command "Get-Content 'data\activeFunds.json' -TotalCount 10"
    echo.
    echo 📊 Cache statistics:
    findstr /C:"count" /C:"lastUpdated" /C:"source" data\activeFunds.json 2>nul
    echo.
) else (
    echo ❌ Cache file not found at data\activeFunds.json
    echo.
)

echo [STEP 7] Checking for any error logs...
if exist "data\activeFunds-errors.json" (
    echo ⚠️  Error log found:
    type "data\activeFunds-errors.json"
    echo.
) else (
    echo ✅ No error logs found
    echo.
)

echo [STEP 8] Summary and verification...
echo.
echo 📋 SUMMARY OF RESULTS:
echo =====================
echo.

if exist "analysis-output.json" (
    echo 🔍 MFAPI Analysis Results:
    for /f "tokens=*" %%i in ('powershell -Command "(Get-Content 'analysis-output.json' | ConvertFrom-Json).totalFunds"') do echo    Total funds in MFAPI: %%i
    for /f "tokens=*" %%i in ('powershell -Command "(Get-Content 'analysis-output.json' | ConvertFrom-Json).isinGrowthAnalysis.withValidIsinGrowth"') do echo    Active funds available: %%i
    for /f "tokens=*" %%i in ('powershell -Command "(Get-Content 'analysis-output.json' | ConvertFrom-Json).isinGrowthAnalysis.activePercentage"') do echo    Active percentage: %%i%%
    echo.
)

if exist "active-funds-fresh.json" (
    echo 🎯 ActiveFunds API Results:
    for /f "tokens=*" %%i in ('powershell -Command "(Get-Content 'active-funds-fresh.json' | ConvertFrom-Json).count"') do echo    Active funds returned: %%i
    for /f "tokens=*" %%i in ('powershell -Command "(Get-Content 'active-funds-fresh.json' | ConvertFrom-Json).dataSource"') do echo    Data source: %%i
    echo.
)

if exist "data\activeFunds.json" (
    echo 💾 Cache Status:
    for /f "tokens=*" %%i in ('powershell -Command "(Get-Content 'data\activeFunds.json' | ConvertFrom-Json).count"') do echo    Cached active funds: %%i
    for /f "tokens=*" %%i in ('powershell -Command "(Get-Content 'data\activeFunds.json' | ConvertFrom-Json).lastUpdated"') do echo    Last updated: %%i
    echo.
)

echo 🎉 VERIFICATION COMPLETE!
echo.
echo 📂 Generated files for review:
echo    - analysis-output.json (MFAPI structure analysis)
echo    - active-funds-cache.json (Cache-preferred results)  
echo    - active-funds-fresh.json (Fresh data results)
echo    - cron-trigger.json (Cron job results)
echo    - data\activeFunds.json (Cache file)
echo.

echo ============================================================================
echo If you see different counts between analysis and API results,
echo please check the console logs for detailed filtering information.
echo ============================================================================

echo.
echo Press any key to open the results in notepad for detailed review...
pause > nul

if exist "analysis-output.json" start notepad analysis-output.json
if exist "active-funds-fresh.json" start notepad active-funds-fresh.json

echo.
echo Test completed! Check the opened files for detailed results.
pause