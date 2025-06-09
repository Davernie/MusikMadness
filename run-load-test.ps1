# MusikMadness Load Test Runner
# PowerShell script to run k6 load test with 500 users for 2 minutes

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MusikMadness Load Test - 500 Users for 2 Minutes" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$k6Path = "k6-v0.53.0-windows-amd64\k6.exe"
$scriptPath = "load-test-script.js"
$baseUrl = $env:BASE_URL
if (-not $baseUrl) {
    $baseUrl = "http://localhost:5000"
}

# Check if k6 exists
if (-not (Test-Path $k6Path)) {
    Write-Host "ERROR: k6.exe not found at $k6Path" -ForegroundColor Red
    Write-Host "Please make sure k6 is downloaded and extracted." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if load test script exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: $scriptPath not found!" -ForegroundColor Red
    Write-Host "Please make sure the load test script is in the current directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Target Users: 500 virtual users" -ForegroundColor White
Write-Host "  Duration: 2 minutes (4 stages of 30s each)" -ForegroundColor White
Write-Host "  Server URL: $baseUrl" -ForegroundColor White
Write-Host "  Output File: load-test-results.json" -ForegroundColor White
Write-Host ""

# Test server connectivity
Write-Host "Testing server connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Server is reachable" -ForegroundColor Green
    } else {
        Write-Host "✗ Server returned status $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Cannot reach server at $baseUrl" -ForegroundColor Red
    Write-Host "  Make sure your backend server is running!" -ForegroundColor Red
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Starting load test..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the test if needed" -ForegroundColor Yellow
Write-Host ""

# Set environment variable for the script
$env:BASE_URL = $baseUrl

# Run k6 load test
try {
    & $k6Path run --out json=load-test-results.json $scriptPath
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Load test completed!" -ForegroundColor Green
    Write-Host "Exit code: $exitCode" -ForegroundColor White
    Write-Host "Results saved to: load-test-results.json" -ForegroundColor White
    Write-Host "================================================" -ForegroundColor Cyan
    
    if ($exitCode -eq 0) {
        Write-Host "✓ Test completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Test completed with errors (exit code: $exitCode)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR running k6: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Yellow
Write-Host "- Check the output above for detailed metrics" -ForegroundColor White
Write-Host "- JSON results are saved in load-test-results.json" -ForegroundColor White
Write-Host "- Look for HTTP request duration, error rates, and throughput" -ForegroundColor White

Read-Host "Press Enter to exit" 