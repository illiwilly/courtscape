import dotenv from 'dotenv';

dotenv.config();

export const config = {
  databricks: {
    host: process.env.DATABRICKS_HOST,
    token: process.env.DATABRICKS_TOKEN,
    warehouseId: process.env.DATABRICKS_WAREHOUSE_ID,
    catalog: process.env.DATABRICKS_CATALOG || 'main',
    schema: process.env.DATABRICKS_SCHEMA || 'default',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// Validate required environment variables
const requiredVars = [
  'DATABRICKS_HOST',
  'DATABRICKS_TOKEN',
  'DATABRICKS_WAREHOUSE_ID',
];

const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0 && config.server.nodeEnv === 'production') {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}

export default config;
