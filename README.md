# Courtscape - Legal Data Search Application

A Node.js + React application for searching and navigating legal data spanning judges, attorneys, law firms, and court case records with analytics.

## Features

- Judge and Attorney Search with filters
- Law Firm Directory
- Case Analytics Dashboard
- Databricks SQL Warehouse Integration

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```
DATABRICKS_HOST=your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your-personal-access-token
DATABRICKS_WAREHOUSE_ID=your-warehouse-id
DATABRICKS_CATALOG=your-catalog
DATABRICKS_SCHEMA=your-schema
NODE_ENV=development
PORT=3000
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Architecture

- **Backend**: Express.js REST API
- **Frontend**: React with Vite
- **Database**: Databricks SQL Warehouse (Unity Catalog)
- **Deployment**: Databricks App

## Project Structure

```
courtscape/
├── server/
│   ├── index.js           # Express server entry point
│   ├── config/            # Configuration utilities
│   ├── db/                # Database connection and utilities
│   └── routes/            # API routes
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API client services
│   ├── App.jsx            # Root component
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── vite.config.js         # Vite configuration
├── .env.example           # Environment variables template
└── package.json           # Project dependencies
```

## License

MIT
