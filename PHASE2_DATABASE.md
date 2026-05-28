# Phase 2: Database Connection & Data Schema - Implementation Guide

## Overview

Phase 2 establishes connection to Databricks SQL Warehouse and creates the query utilities layer for the application.

## Schema Overview

### Tables Available

#### Judges Table
- **Location**: `unicourt_judge.unicourt_3615c15a_aff8_4219_b2cc_1f645ab1a50a_samples.judge_940c070684b945d9b260e358b4a394df`
- **Primary Key**: `normjudgeid`
- **Key Columns**: `name`, `totalcases`, `judicialstatus`, `politicalaffiliation`

#### Attorneys Table
- **Location**: `unicourt_attorney.unicourt_31e3c59b_ecde_4bd7_8903_45c248111eee_samples.attorney_revised_fae7b5d3ada34800a5df90493ffb73ad`
- **Primary Key**: `normattorneyid`
- **Key Columns**: `name`, `totalcases`, `status`, `barlawfirm`

#### Analytics: Case Count by Court
- **Location**: `unicourt_analytics.unicourt_66713254_5e52_4a39_a700_a3179e821001_samples.casecountanalyticbycourt_0b0cd0feea674978ad6a5103d3ac3102`
- **Primary Key**: `courtcourtid`
- **Key Columns**: `courtname`, `casecount`

#### Analytics: Case Count by Case Type
- **Location**: `unicourt_analytics.unicourt_66713254_5e52_4a39_a700_a3179e821001_samples.casecountanalyticsbycasetype_2953ecc978a6472795583c285df69922`
- **Primary Key**: `casetypecaseclassid`
- **Key Columns**: `casetypeareaoflaw`, `casecount`

### Derived Data

**Law Firms** - Aggregated from attorney `barlawfirm` field
- Grouped by firm name
- Count of attorneys per firm
- Total cases per firm

## Implementation Files

### 1. `server.db.connection.js`
**Databricks SQL Warehouse Connector**

Provides:
- Connection initialization to Databricks workspace
- Query execution via Databricks SQL API
- Statement polling and result parsing
- Singleton pattern for connection reuse

```javascript
import db from './server.db.connection.js';

// Connect
await db.connect();

// Execute query
const results = await db.executeQuery('SELECT * FROM table');

// Disconnect
await db.disconnect();
```

### 2. `server.db.queries.js`
**Query Builders & SQL Utilities**

Provides prepared queries for:
- Judge search with pagination
- Attorney search with filters (name, firm)
- Law firm aggregation
- Case analytics queries

```javascript
import queries from './server.db.queries.js';

// Search judges
const sql = queries.searchJudges('Smith', limit=10, offset=0);

// Search attorneys
const sql = queries.searchAttorneys('John', firm='Johnson & Associates');

// Analytics
const sql = queries.getCaseAnalyticsByCourt();
```

### 3. `server.test-connection.js`
**Connection & Schema Validation**

Tests:
1. Databricks connection establishment
2. Judges table query
3. Attorneys table query
4. Analytics by court query
5. Analytics by case type query

## Environment Setup

Create `.env` file:

```bash
DATABRICKS_HOST=your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi1234567890abcdef
DATABRICKS_WAREHOUSE_ID=abc123xyz789
NODE_ENV=development
PORT=3000
```

## Testing & Validation

### Run Connection Tests

```bash
npm run test:db
```

This will:
- ✓ Verify Databricks connection
- ✓ Test all table queries
- ✓ Display sample results
- ✓ Report any errors

**Example output:**
```
🧪 Courtscape Database Connection Tests

📡 Test 1: Connecting to Databricks...
✓ Connection successful

📊 Test 2: Query judges table...
✓ Judges query successful (5 results)
Sample: { id: 'J001', name: 'Jane Smith', totalcases: 150, ... }
```

## Query Examples

### Judge Search
```javascript
// Search for judges named "Smith"
const query = queries.searchJudges('Smith', limit=20, offset=0);
const judges = await db.executeQuery(query);
```

Result:
```json
[
  {
    "id": "J001",
    "name": "Jane Smith",
    "totalcases": 150,
    "judicialstatus": "Active",
    "politicalaffiliation": "Independent"
  }
]
```

### Attorney Search by Firm
```javascript
// Find attorneys at "Johnson & Associates"
const query = queries.searchAttorneys('', firm='Johnson & Associates');
const attorneys = await db.executeQuery(query);
```

### Law Firms Aggregation
```javascript
// Get list of law firms with attorney counts
const query = queries.getLawFirms(limit=50);
const firms = await db.executeQuery(query);
```

Result:
```json
[
  {
    "firm": "Johnson & Associates",
    "attorneyCount": 45,
    "totalCases": 3200
  }
]
```

### Analytics by Court
```javascript
// Get case counts by court
const query = queries.getCaseAnalyticsByCourt();
const analytics = await db.executeQuery(query);
```

Result:
```json
[
  {
    "courtId": "C001",
    "courtName": "Supreme Court",
    "caseCount": 5000
  }
]
```

## Phase 2 Completion Checklist

- ✓ Databricks connector implemented (SQL API via axios)
- ✓ Query builders created for all data sources
- ✓ Connection pooling ready (singleton pattern)
- ✓ SQL injection prevention (parameterized strings)
- ✓ Error handling implemented
- ✓ Test script for validation
- ✓ Schema documented with table paths and columns

## Next Steps: Phase 3

- Build REST API endpoints that use these query utilities
- Add pagination handling
- Implement result caching for analytics
- Add request validation and error responses

## Troubleshooting

### Connection Fails
- Verify DATABRICKS_HOST includes workspace ID
- Check DATABRICKS_TOKEN is valid (not expired)
- Ensure DATABRICKS_WAREHOUSE_ID is correct
- Verify workspace network allows outbound HTTPS

### Query Timeouts
- Check warehouse is running and warmed up
- Verify query syntax (especially table path escaping)
- Check data volume in tables
- Increase timeout_seconds in connection.js if needed

### Missing Results
- Verify table paths in server.db.queries.js
- Check column names match actual schema
- Confirm tables have data (not empty)
- Run test:db script to validate table access
