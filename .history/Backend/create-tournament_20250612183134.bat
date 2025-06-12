@echo off
echo 🎵 Test Tournament Creator
echo.

if "%1"=="help" goto help
if "%1"=="--help" goto help
if "%1"=="-h" goto help
if "%1"=="clean" goto clean
if "%1"=="cleanup" goto clean

cd /d "%~dp0"

echo Creating test tournament...
echo.

if "%1"=="" (
    node scripts\create-test-tournament.mjs 8
) else if "%2"=="" (
    node scripts\create-test-tournament.mjs %1
) else if "%3"=="" (
    node scripts\create-test-tournament.mjs %1 "%2"
) else (
    node scripts\create-test-tournament.mjs %1 "%2" %3
)

echo.
pause
goto end

:clean
echo 🧹 Cleaning up test tournaments...
echo.
node scripts\cleanup-test-tournaments.js
echo.
pause
goto end

:help
echo.
echo Usage:
echo   create-tournament.bat [size] [name] [begin]
echo   create-tournament.bat clean     - Clean up test data
echo   create-tournament.bat help      - Show this help
echo.
echo Parameters:
echo   size   - Number of participants (default: 8)
echo   name   - Tournament name (optional)
echo   begin  - Auto-begin tournament: true/false (default: false)
echo.
echo Examples:
echo   create-tournament.bat 16
echo   create-tournament.bat 32 "Big Test Tournament"
echo   create-tournament.bat 8 "Quick Test" true
echo   create-tournament.bat clean
echo.
echo Recommended sizes: 2, 4, 8, 16, 32, 64
echo.
pause

:end
