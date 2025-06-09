@echo off
echo ================================================
echo MusikMadness Load Test - 500 Users for 2 Minutes
echo ================================================
echo.

REM Check if k6 exists
if not exist "k6-v0.53.0-windows-amd64\k6.exe" (
    echo ERROR: k6.exe not found!
    echo Please make sure k6 is downloaded and extracted.
    pause
    exit /b 1
)

REM Check if load test script exists
if not exist "load-test-script.js" (
    echo ERROR: load-test-script.js not found!
    echo Please make sure the load test script is in the current directory.
    pause
    exit /b 1
)

echo Starting load test...
echo Target: 500 virtual users
echo Duration: 2 minutes
echo.

REM Set the base URL (change this if your server runs on different port/host)
set BASE_URL=http://localhost:5000

echo Testing server: %BASE_URL%
echo.

REM Run k6 load test with output to both console and file
k6-v0.53.0-windows-amd64\k6.exe run --out json=load-test-results.json load-test-script.js

echo.
echo ================================================
echo Load test completed!
echo Results saved to: load-test-results.json
echo ================================================
echo.

REM Keep the window open to see results
pause 