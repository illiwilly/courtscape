# Courtscape API Documentation - Phase 3

## Base URL
```
http://localhost:3000/api
```

## Health Check

### `GET /api/health`
Check server and database connection status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-26T23:25:08.660Z",
  "database": "connected"
}
```

---

## Search API

### `GET /api/search/judges`
Search for judges with pagination support.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | (empty) | Search term - matches judge name |
| `limit` | number | 50 | Results per page (max 100) |
| `offset` | number | 0 | Result offset for pagination |

**Example:**
```
GET /api/search/judges?q=Smith&limit=20&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "J001",
      "name": "Jane Smith",
      "totalcases": 150,
      "judicialstatus": "Active",
      "politicalaffiliation": "Independent"
    },
    {
      "id": "J002",
      "name": "John Smith",
      "totalcases": 127,
      "judicialstatus": "Active",
      "politicalaffiliation": "Democratic"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 42,
    "hasMore": true
  }
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to search judges",
  "message": "Connection to Databricks failed"
}
```

---

### `GET /api/search/attorneys`
Search for attorneys with optional law firm filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | (empty) | Search term - matches attorney name |
| `firm` | string | (empty) | Filter by law firm name |
| `limit` | number | 50 | Results per page (max 100) |
| `offset` | number | 0 | Result offset for pagination |

**Examples:**
```
GET /api/search/attorneys?q=Johnson&limit=20
GET /api/search/attorneys?firm=Smith%20%26%20Associates
GET /api/search/attorneys?q=Mary&firm=Johnson%20Law
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "A001",
      "name": "Mary Johnson",
      "totalcases": 87,
      "status": "Active",
      "firm": "Johnson & Associates"
    },
    {
      "id": "A002",
      "name": "Michael Johnson",
      "totalcases": 65,
      "status": "Active",
      "firm": "Johnson & Associates"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 156,
    "hasMore": true
  }
}
```

---

## Law Firms API

### `GET /api/law-firms`
List all law firms with aggregated statistics.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Results per page (max 100) |
| `offset` | number | 0 | Result offset for pagination |

**Example:**
```
GET /api/law-firms?limit=50&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "firm": "Johnson & Associates",
      "attorneyCount": 45,
      "totalCases": 3200
    },
    {
      "firm": "Smith & Partners",
      "attorneyCount": 38,
      "totalCases": 2840
    },
    {
      "firm": "Legal Solutions LLC",
      "attorneyCount": 52,
      "totalCases": 3950
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

---

### `GET /api/law-firms/:firm`
Get all attorneys in a specific law firm.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `firm` | string | Law firm name (URL encoded) |

**Example:**
```
GET /api/law-firms/Johnson%20%26%20Associates
```

**Response (200 OK):**
```json
{
  "success": true,
  "firm": "Johnson & Associates",
  "count": 45,
  "data": [
    {
      "id": "A001",
      "name": "Mary Johnson",
      "totalcases": 87,
      "status": "Active",
      "firm": "Johnson & Associates"
    },
    {
      "id": "A003",
      "name": "Robert Brown",
      "totalcases": 72,
      "status": "Active",
      "firm": "Johnson & Associates"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid firm name",
  "message": "Firm parameter is required"
}
```

---

## Analytics API

### `GET /api/analytics/case-summary`
Get aggregated case statistics by court and case type.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "byCourt": [
      {
        "courtId": "C001",
        "courtName": "Supreme Court",
        "caseCount": 5000
      },
      {
        "courtId": "C002",
        "courtName": "Court of Appeals",
        "caseCount": 3500
      }
    ],
    "byCaseType": [
      {
        "caseTypeId": "CT001",
        "areaOfLaw": "Criminal",
        "caseCount": 4200
      },
      {
        "caseTypeId": "CT002",
        "areaOfLaw": "Civil",
        "caseCount": 3800
      }
    ],
    "summary": {
      "totalCases": 8000,
      "totalCourts": 2,
      "totalCaseTypes": 2
    }
  }
}
```

---

### `GET /api/analytics/case-trends`
Get case count trends by court or case type.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `dimension` | string | "court" | Trend dimension: "court" or "casetype" |
| `limit` | number | 20 | Top N results to return (max 100) |

**Examples:**
```
GET /api/analytics/case-trends?dimension=court&limit=20
GET /api/analytics/case-trends?dimension=casetype&limit=15
```

**Response (200 OK) - By Court:**
```json
{
  "success": true,
  "dimension": "court",
  "label": "Court",
  "data": [
    {
      "id": "C001",
      "label": "Supreme Court",
      "value": 5000
    },
    {
      "id": "C002",
      "label": "Court of Appeals",
      "value": 3500
    },
    {
      "id": "C003",
      "label": "District Court",
      "value": 2800
    }
  ],
  "total": 45
}
```

**Response (200 OK) - By Case Type:**
```json
{
  "success": true,
  "dimension": "casetype",
  "label": "Case Type",
  "data": [
    {
      "id": "CT001",
      "label": "Criminal",
      "value": 4200
    },
    {
      "id": "CT002",
      "label": "Civil",
      "value": 3800
    }
  ],
  "total": 15
}
```

**Error Response (400) - Invalid Dimension:**
```json
{
  "success": false,
  "error": "Invalid dimension",
  "message": "Dimension must be \"court\" or \"casetype\""
}
```

---

## Pagination

All list endpoints support cursor-based pagination using `limit` and `offset`:

- **`limit`**: Number of results per page (default 50, max 100)
- **`offset`**: Number of results to skip (default 0)

**Example - Get second page of 20 judges:**
```
GET /api/search/judges?limit=20&offset=20
```

The response includes:
```json
{
  "pagination": {
    "limit": 20,
    "offset": 20,
    "total": 342,
    "hasMore": true
  }
}
```

Calculate next page:
```
next_offset = current_offset + limit
```

---

## Error Handling

All endpoints return consistent error responses:

**Format:**
```json
{
  "success": false,
  "error": "Error title",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 500 | Server error (database or processing error) |

---

## Rate Limiting

Currently no rate limiting is implemented. This should be added in Phase 4+ for production deployment.

Recommended: 100 requests per minute per IP address.

---

## CORS

CORS is enabled for all origins. For production, restrict to specific domains in `server.index.js`:

```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
```

---

## Testing Endpoints

### Using curl

```bash
# Health check
curl http://localhost:3000/api/health

# Search judges
curl "http://localhost:3000/api/search/judges?q=Smith&limit=10"

# Search attorneys
curl "http://localhost:3000/api/search/attorneys?firm=Johnson%20%26%20Associates"

# Get law firms
curl "http://localhost:3000/api/law-firms?limit=10"

# Get attorneys in firm
curl "http://localhost:3000/api/law-firms/Johnson%20%26%20Associates"

# Get analytics summary
curl http://localhost:3000/api/analytics/case-summary

# Get case trends
curl "http://localhost:3000/api/analytics/case-trends?dimension=court&limit=10"
```

### Using JavaScript (fetch)

```javascript
// Search judges
fetch('/api/search/judges?q=Smith&limit=20')
  .then(r => r.json())
  .then(data => console.log(data));

// Get analytics
fetch('/api/analytics/case-summary')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## Response Format

All successful responses follow this pattern:

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "pagination": { /* if applicable */ }
}
```

All error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed message"
}
```
