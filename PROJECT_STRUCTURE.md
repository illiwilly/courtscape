# Courtscape Project Structure Guide

## Directory Organization

```
courtscape/
│
├── server/                          # Backend (Express.js)
│   ├── config/
│   │   └── database.js              # Databricks connection setup
│   ├── db/
│   │   ├── connection.js            # Connection pooling and utilities
│   │   └── queries/                 # SQL query builders
│   ├── routes/
│   │   ├── search.js                # Search endpoints (judges, attorneys)
│   │   ├── lawfirms.js              # Law firm endpoints
│   │   └── analytics.js             # Analytics endpoints
│   └── index.js                     # Express server entry point
│
├── src/                             # Frontend (React)
│   ├── components/
│   │   ├── Navigation.jsx           # Main navigation
│   │   ├── SearchFilters.jsx        # Search filter component
│   │   ├── ResultsList.jsx          # Results display component
│   │   └── AnalyticsChart.jsx       # Chart components
│   ├── pages/
│   │   ├── SearchPage.jsx           # Judge/Attorney search page
│   │   ├── LawFirmsPage.jsx         # Law firms directory page
│   │   └── AnalyticsPage.jsx        # Analytics dashboard page
│   ├── hooks/
│   │   └── useApi.js                # Custom hook for API calls
│   ├── services/
│   │   ├── searchService.js         # Search API client
│   │   ├── lawfirmsService.js       # Law firms API client
│   │   └── analyticsService.js      # Analytics API client
│   ├── App.jsx                      # Root component
│   ├── main.jsx                     # Entry point
│   └── App.css                      # Global styles
│
├── public/                          # Static assets
│   └── index.html                   # HTML template
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Project dependencies
├── vite.config.js                   # Vite build configuration
├── server.config.js                 # Server configuration
├── setup.bat                        # Windows setup script
├── setup.sh                         # Unix setup script
└── README.md                        # Project documentation
```

## File Descriptions

### Backend Structure (server/)

- **server/index.js**: Main Express server, route setup, middleware
- **server/config/database.js**: Databricks SQL Warehouse connection initialization
- **server/db/connection.js**: Connection pooling, query execution utilities
- **server/db/queries/**: Query builders and SQL helpers for Unity Catalog
- **server/routes/search.js**: GET /api/search/judges, GET /api/search/attorneys
- **server/routes/lawfirms.js**: GET /api/law-firms, GET /api/law-firms/:id
- **server/routes/analytics.js**: GET /api/analytics/case-summary, /case-trends

### Frontend Structure (src/)

- **src/main.jsx**: React DOM render entry point
- **src/App.jsx**: Root router and layout
- **src/components/**: Reusable UI components
- **src/pages/**: Full-page components for routing
- **src/hooks/**: Custom React hooks (useApi for centralized fetch)
- **src/services/**: API client services (abstracts fetch calls)
- **src/App.css**: Global styling and layout

## Setup Instructions

1. Run `setup.bat` (Windows) or `setup.sh` (Unix)
   - Creates directories
   - Installs npm dependencies

2. Copy `.env.example` to `.env`
   - Update with Databricks credentials

3. Development:
   ```bash
   npm run dev
   ```
   - Starts Express server on port 3000
   - Vite dev server on port 5173 with proxy to API

4. Production build:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

Required:
- `DATABRICKS_HOST`: Workspace host (e.g., abc-123.cloud.databricks.com)
- `DATABRICKS_TOKEN`: Personal access token
- `DATABRICKS_WAREHOUSE_ID`: SQL Warehouse ID

Optional:
- `DATABRICKS_CATALOG`: Unity Catalog name (default: 'main')
- `DATABRICKS_SCHEMA`: Schema name (default: 'default')
- `NODE_ENV`: 'development' or 'production'
- `PORT`: Server port (default: 3000)

## Development Workflow

1. **Backend API development**: Modify `server/routes/*.js` and `server/db/*.js`
2. **Frontend development**: Modify `src/components/`, `src/pages/`, `src/services/`
3. **Styling**: Add CSS files alongside components (component-scoped styles)
4. **Testing**: Add test files next to source files with `.test.js` extension

## Build & Deployment

- Vite bundles React into `dist/` directory
- Express serves static files from `dist/`
- Single-page app fallback: unmatched routes serve `dist/index.html`
- Ready for Databricks App deployment (containerized)
