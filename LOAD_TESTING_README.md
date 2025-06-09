# MusikMadness Load Testing Setup

This setup provides comprehensive load testing for your MusikMadness application using k6, simulating 500 concurrent users over 2 minutes.

## 📋 Prerequisites

1. **Your MusikMadness server must be running** before starting the load test
2. **k6 is already downloaded and extracted** in this directory
3. **Node.js backend** should be accessible (default: http://localhost:5000)

## 🚀 Quick Start

### Option 1: Using Batch Script (Simple)
```cmd
run-load-test.bat
```

### Option 2: Using PowerShell Script (Recommended)
```powershell
.\run-load-test.ps1
```

### Option 3: Manual k6 Command
```cmd
k6-v0.53.0-windows-amd64\k6.exe run --out json=load-test-results.json load-test-script.js
```

## ⚙️ Configuration

### Server URL
To test against a different server, set the BASE_URL environment variable:

**Windows Command Prompt:**
```cmd
set BASE_URL=https://your-production-server.com
run-load-test.bat
```

**PowerShell:**
```powershell
$env:BASE_URL = "https://your-production-server.com"
.\run-load-test.ps1
```

## 📊 Test Scenarios

The load test simulates realistic user behavior by testing:

### 🔓 Public Endpoints
- **Health Check** (`/health`) - Server status verification
- **Get Tournaments** (`/api/tournaments`) - Browse available tournaments
- **Get Users** (`/api/users`) - User directory
- **Get Tracks** (`/api/tracks`) - Music catalog

### 🔐 Authentication Flow
- **User Registration** (`/api/auth/signup`) - New account creation
- **User Login** (`/api/auth/login`) - User authentication
- **Get Profile** (`/api/auth/me`) - Authenticated user data

### ✍️ User Actions (Authenticated)
- **Create Track** (`/api/tracks`) - Adding new music tracks

## 📈 Load Test Profile

```
Stage 1: 0 → 100 users (30 seconds) - Gradual ramp-up
Stage 2: 100 → 300 users (30 seconds) - Moderate increase  
Stage 3: 300 → 500 users (30 seconds) - Peak load approach
Stage 4: 500 users sustained (30 seconds) - Peak load test
```

**Total Duration:** 2 minutes  
**Peak Concurrent Users:** 500

## 📋 Performance Thresholds

The test will **PASS** if:
- ✅ 95% of requests complete under 2 seconds
- ✅ Error rate stays below 10%
- ✅ Server remains responsive throughout

## 📄 Understanding Results

### Console Output
Look for these key metrics in the terminal:

```
✓ http_req_duration..........: avg=123ms min=45ms med=98ms max=2.1s p(90)=234ms p(95)=456ms
✓ http_req_failed............: 2.34% ✓ 1234 ✗ 30
✓ http_reqs..................: 12000 200.0/s
✓ vus........................: 500 min=0 max=500
```

**Key Metrics Explained:**
- **http_req_duration**: Response times (p(95) should be < 2000ms)
- **http_req_failed**: Error percentage (should be < 10%)
- **http_reqs**: Total requests and requests per second
- **vus**: Virtual users (concurrent connections)

### JSON Results File
Detailed metrics are saved to `load-test-results.json` for further analysis.

## 🔧 Troubleshooting

### Common Issues

**❌ "Cannot reach server"**
```
Solution: Make sure your backend is running on http://localhost:5000
Check: npm start or your server startup command
```

**❌ "k6.exe not found"**
```
Solution: Ensure k6 was properly downloaded and extracted
Check: k6-v0.53.0-windows-amd64\k6.exe should exist
```

**❌ High error rates**
```
Possible causes:
- Database connection issues
- Server resource limitations
- Network connectivity problems
- Rate limiting triggered
```

**❌ Slow response times**
```
Possible causes:
- Database query performance
- Insufficient server resources
- Network latency
- Lack of proper indexing
```

## 🔍 Analyzing Performance

### Good Performance Indicators
- Response times consistently under 1 second
- Error rate below 5%
- Consistent throughput throughout test
- No significant memory leaks

### Warning Signs
- Response times increasing over time
- Error rate above 5%
- Declining throughput
- Server resource exhaustion

## 🛡️ Security Considerations

The load test includes:
- **Rate limiting validation** - Tests your API rate limits
- **Authentication stress testing** - Validates login system under load
- **Error handling** - Ensures graceful failure under pressure

## 📊 Performance Optimization Tips

Based on load test results, consider:

1. **Database Optimization**
   - Add indexes for frequently queried fields
   - Optimize slow queries
   - Consider connection pooling

2. **Caching**
   - Implement Redis for session storage
   - Cache frequent API responses
   - Use CDN for static assets

3. **Server Scaling**
   - Monitor CPU and memory usage
   - Consider horizontal scaling
   - Implement load balancing

4. **API Optimization**
   - Optimize heavy endpoints
   - Implement pagination
   - Reduce payload sizes

## 🔄 Running Tests Regularly

Consider running load tests:
- Before major releases
- After performance optimizations
- When scaling infrastructure
- During CI/CD pipeline

## 📞 Need Help?

If you encounter issues:
1. Check server logs for errors
2. Verify database connectivity
3. Monitor system resources during test
4. Review the detailed JSON output file

---

**Happy Load Testing! 🚀** 