/**
 * Databricks SQL Warehouse Connection Manager
 * 
 * Provides:
 * - Connection pooling to Databricks SQL Warehouse
 * - Query execution against Unity Catalog tables
 * - Error handling and retry logic
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class DatabricksConnector {
  constructor() {
    this.host = process.env.DATABRICKS_HOST;
    this.token = process.env.DATABRICKS_TOKEN;
    this.warehouseId = process.env.DATABRICKS_WAREHOUSE_ID;
    this.connected = false;
    this.client = null;
  }

  /**
   * Initialize connection to Databricks SQL Warehouse
   */
  async connect() {
    try {
      // Validate credentials
      if (!this.host || !this.token || !this.warehouseId) {
        throw new Error(
          'Missing Databricks credentials. Required: DATABRICKS_HOST, DATABRICKS_TOKEN, DATABRICKS_WAREHOUSE_ID'
        );
      }

      // Create axios client with Databricks API base URL
      this.client = axios.create({
        baseURL: `https://${this.host}/api/2.0`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      // Verify connection by fetching warehouse details
      await this.client.get(`/sql/warehouses/${this.warehouseId}`);
      
      this.connected = true;
      console.log(`✓ Connected to Databricks SQL Warehouse: ${this.warehouseId}`);
      
      return this;
    } catch (error) {
      console.error('Failed to connect to Databricks:', error.message);
      throw new Error(`Databricks connection failed: ${error.message}`);
    }
  }

  /**
   * Execute a SQL query against the warehouse
   * @param {string} sql - SQL query to execute
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(sql) {
    if (!this.connected) {
      throw new Error('Not connected to Databricks. Call connect() first.');
    }

    try {
      const response = await this.client.post('/sql/statements', {
        warehouse_id: this.warehouseId,
        statement: sql,
        timeout_seconds: 60,
      });

      // Poll for statement completion
      const statementId = response.data.statement_id;
      let result = await this._pollStatement(statementId);

      // Extract result data
      if (result.state === 'SUCCEEDED') {
        return this._parseResults(result);
      } else if (result.state === 'FAILED') {
        throw new Error(`Query failed: ${result.error?.message || 'Unknown error'}`);
      }

      return [];
    } catch (error) {
      console.error('Query execution error:', error.message);
      throw error;
    }
  }

  /**
   * Poll statement execution status
   * @private
   */
  async _pollStatement(statementId, maxRetries = 30) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.client.get(
          `/sql/statements/${statementId}`
        );

        const state = response.data.state;
        if (state === 'SUCCEEDED' || state === 'FAILED') {
          return response.data;
        }

        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Poll attempt ${i + 1} failed:`, error.message);
        if (i === maxRetries - 1) throw error;
      }
    }

    throw new Error('Query execution timeout');
  }

  /**
   * Parse query results
   * @private
   */
  _parseResults(result) {
    const rows = result.result?.data_array || [];
    const columns = result.result?.column_info?.map((c) => c.name) || [];

    return rows.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }

  /**
   * Disconnect from Databricks
   */
  async disconnect() {
    this.connected = false;
    this.client = null;
  }
}

// Export singleton instance
export default new DatabricksConnector();
