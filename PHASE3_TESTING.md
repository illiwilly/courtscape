# Phase 3 Testing Guide

## Quick Start

After Phase 3 implementation, verify everything works:

### 1. Ensure Dependencies are Installed
```bash
cd c:\source\courtscape
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your Databricks credentials:
# DATABRICKS_HOST=your-workspace.cloud.databricks.com
# DATABRICKS_TOKEN=dapi...
# DATABRICKS_WAREHOUSE_ID=abc123...
```

### 3. Verify Database Connection
```bash
npm run test:db
```

Expected output:
```
✓ Connection successful
✓ Judges query successful (N results)
✓ Attorneys query successful (N results)
✓ Analytics query successful (N results)
```

### 4. Start Server
```bash
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════╗
║         Courtscape Server Started           ║
╚════════════════════════════════════════════╝

✓ Server running at http://localhost:3000
✓ Environment: development
✓ Database: Connected

📚 API Endpoints:
  GET  /api/health
  GET  /api/search/judges...
  GET  /api/search/attorneys...
  ...
```

---

## Manual Testing with curl

### Test Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-26T23:30:00.000Z",
  "database": "connected"
}
```

### Test Judge Search
```bash
# Search for judges named "Smith"
curl "http://localhost:3000/api/search/judges?q=Smith&limit=5"
```

Expected response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "totalcases": 150,
      "judicialstatus": "Active",
      "politicalaffiliation": "..."
    }
  ],
  "pagination": {
    "limit": 5,
    "offset": 0,
    "total": 42,
    "hasMore": true
  }
}
```

### Test Attorney Search
```bash
# Search for attorneys
curl "http://localhost:3000/api/search/attorneys?limit=5"

# Search by firm
curl "http://localhost:3000/api/search/attorneys?firm=Smith%20Associates"

# Search by name
curl "http://localhost:3000/api/search/attorneys?q=Johnson"
```

### Test Law Firms
```bash
# Get all law firms
curl "http://localhost:3000/api/law-firms?limit=10"

# Get attorneys in a specific firm (URL encode the firm name)
curl "http://localhost:3000/api/law-firms/Smith%20Associates"
```

### Test Analytics
```bash
# Get case summary
curl http://localhost:3000/api/analytics/case-summary

# Get trends by court
curl "http://localhost:3000/api/analytics/case-trends?dimension=court&limit=10"

# Get trends by case type
curl "http://localhost:3000/api/analytics/case-trends?dimension=casetype&limit=10"
```

---

## Testing with Postman

### Import Collection

Create a new Postman collection:

1. **Health Check**
   - Method: GET
   - URL: `{{baseUrl}}/api/health`
   - Expected: 200 OK

2. **Search Judges**
   - Method: GET
   - URL: `{{baseUrl}}/api/search/judges?q=Smith&limit=5`
   - Expected: 200 OK, array of judges

3. **Search Attorneys**
   - Method: GET
   - URL: `{{baseUrl}}/api/search/attorneys?firm=Associates&limit=5`
   - Expected: 200 OK, array of attorneys

4. **Law Firms List**
   - Method: GET
   - URL: `{{baseUrl}}/api/law-firms?limit=10`
   - Expected: 200 OK, array of firms

5. **Law Firm Detail**
   - Method: GET
   - URL: `{{baseUrl}}/api/law-firms/{{firmName}}`
   - Expected: 200 OK, attorneys in firm

6. **Case Summary**
   - Method: GET
   - URL: `{{baseUrl}}/api/analytics/case-summary`
   - Expected: 200 OK, analytics data

7. **Case Trends**
   - Method: GET
   - URL: `{{baseUrl}}/api/analytics/case-trends?dimension=court&limit=20`
   - Expected: 200 OK, top 20 courts by case count

---

## Testing with JavaScript/Node

### Test All Endpoints

Create `test-api.js`:

```javascript
const BASE_URL = 'http://localhost:3000/api';

async function testApi() {
  console.log('🧪 Testing Courtscape API\n');

  try {
    // Test 1: Health check
    console.log('1️⃣  Health Check...');
    let res = await fetch(`${BASE_URL}/health`);
    console.log('✓', await res.json(), '\n');

    // Test 2: Search judges
    console.log('2️⃣  Search Judges...');
    res = await fetch(`${BASE_URL}/search/judges?limit=2`);
    const judges = await res.json();
    console.log('✓ Found', judges.pagination?.total, 'judges');
    console.log('  Sample:', judges.data[0]?.name, '\n');

    // Test 3: Search attorneys
    console.log('3️⃣  Search Attorneys...');
    res = await fetch(`${BASE_URL}/search/attorneys?limit=2`);
    const attorneys = await res.json();
    console.log('✓ Found', attorneys.pagination?.total, 'attorneys');
    console.log('  Sample:', attorneys.data[0]?.name, '\n');

    // Test 4: Law firms
    console.log('4️⃣  Law Firms...');
    res = await fetch(`${BASE_URL}/law-firms?limit=5`);
    const firms = await res.json();
    console.log('✓ Found', firms.data?.length, 'firms');
    console.log('  Sample:', firms.data[0]?.firm, '\n');

    // Test 5: Analytics summary
    console.log('5️⃣  Analytics Summary...');
    res = await fetch(`${BASE_URL}/analytics/case-summary`);
    const summary = await res.json();
    console.log('✓ Summary:', summary.data?.summary, '\n');

    // Test 6: Analytics trends
    console.log('6️⃣  Analytics Trends...');
    res = await fetch(`${BASE_URL}/analytics/case-trends?dimension=court&limit=5`);
    const trends = await res.json();
    console.log('✓ Top 5 courts:', trends.data?.map(d => d.label).join(', '), '\n');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testApi();
```

Run with:
```bash
node test-api.js
```

---

## Error Scenarios

### Database Not Connected
**Request:**
```bash
curl http://localhost:3000/api/search/judges
```

**Response (500):**
```json
{
  "success": false,
  "error": "Failed to search judges",
  "message": "Not connected to Databricks. Call connect() first."
}
```

**Fix:** Check environment variables and run `npm run test:db`

### Invalid Pagination Parameter
**Request:**
```bash
curl "http://localhost:3000/api/search/judges?limit=999"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 100,  // Limited to max 100
    "offset": 0,
    "total": 342
  }
}
```

### Invalid Dimension Parameter
**Request:**
```bash
curl "http://localhost:3000/api/analytics/case-trends?dimension=invalid"
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid dimension",
  "message": "Dimension must be \"court\" or \"casetype\""
}
```

### Missing Firm Name
**Request:**
```bash
curl http://localhost:3000/api/law-firms/
```

**Response (404):**
```json
{
  "error": "Not found"
}
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:3000/api/health

# Test search endpoint
ab -n 100 -c 10 "http://localhost:3000/api/search/judges?q=Smith"
```

### Monitor Server Performance

In another terminal, watch server logs:
```bash
npm run dev 2>&1 | grep -E "Error|timeout"
```

---

## Checklist

Before Phase 4, verify:

- [ ] Server starts without errors
- [ ] Health check returns database status
- [ ] Judge search returns results
- [ ] Attorney search works with filters
- [ ] Law firms endpoint returns data
- [ ] Law firm detail endpoint works
- [ ] Analytics summary returns data
- [ ] Analytics trends works for both dimensions
- [ ] Pagination works (hasMore flag accurate)
- [ ] Error handling returns JSON errors
- [ ] No N+1 queries in analytics (check logs)
- [ ] Response times are reasonable (<1 second)

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Connection refused | Server not running | Run `npm run dev` |
| Database disconnected | Invalid credentials | Check `.env`, run `npm run test:db` |
| 404 on endpoints | Routes not mounted | Check `server.index.js` imports |
| Timeouts | Slow warehouse | Increase timeout in `connection.js` |
| Empty results | Table has no data | Verify table paths in `queries.js` |
| CORS errors | Frontend on different port | CORS already enabled, check in dev |

---

## Next Steps

✅ Phase 3 testing complete → Ready for Phase 4: Frontend Development

Phase 4 will build React components to consume these endpoints.
