@echo off
echo 🚀 Testing Real MFAPI Data Fetching...
echo.
echo 🧪 Step 1: Testing basic MFAPI connectivity
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/quick-test' -TimeoutSec 30; Write-Host 'Quick test result:'; $response.Content } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo 🔍 Step 2: Testing detailed fund processing
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/temp-active-funds' -TimeoutSec 120; Write-Host 'Temp active funds result:'; $response.Content } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo ✅ Test completed! Check results above.
echo 📝 If you see active funds data, your MFAPI connection is working.
echo 🌐 Visit http://localhost:3000/active-funds to see the results.
echo.
pause