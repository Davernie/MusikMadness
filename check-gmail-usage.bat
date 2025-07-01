@echo off
REM Gmail Usage Tracker - Easy Windows Script
REM Usage: check-gmail-usage.bat [command]
REM Commands: report, test-send, log-email, reset, help

if "%1"=="" (
    echo 📊 Running Gmail Usage Report...
    echo.
    node Backend/check-gmail-usage.js report
) else (
    node Backend/check-gmail-usage.js %1 %2 %3
)

echo.
echo 💡 Quick Commands:
echo    check-gmail-usage.bat          - Show usage report
echo    check-gmail-usage.bat help     - Show all commands
echo    check-gmail-usage.bat log-email - Log an email sent
echo    check-gmail-usage.bat reset    - Reset usage data
pause 