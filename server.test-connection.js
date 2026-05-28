/**
 * Databricks Connection Test & Validation Script
 * 
 * Tests connectivity to Databricks SQL Warehouse and validates table access
 * 
 * Usage: node server.test-connection.js
 * 
 * Requires .env file with:
 * - DATABRICKS_HOST
 * - DATABRICKS_TOKEN
 * - DATABRICKS_WAREHOUSE_ID
 */

import dotenv from 'dotenv';
import db from './server.db.connection.js';
import queries from './server.db.queries.js';

dotenv.config();

async function runTests() {
  console.log('🧪 Courtscape Database Connection Tests\n');

  try {
    // Test 1: Connect to Databricks
    console.log('📡 Test 1: Connecting to Databricks...');
    await db.connect();
    console.log('✓ Connection successful\n');

    // Test 2: Test judges table query
    console.log('📊 Test 2: Query judges table...');
    const judgesQuery = queries.searchJudges('', 5);
    console.log('Query:', judgesQuery.substring(0, 100) + '...\n');
    
    try {
      const judges = await db.executeQuery(judgesQuery);
      console.log(`✓ Judges query successful (${judges.length} results)`);
      if (judges.length > 0) {
        console.log('Sample:', JSON.stringify(judges[0], null, 2));
      }
    } catch (error) {
      console.log(`⚠ Judges query failed: ${error.message}`);
    }
    console.log();

    // Test 3: Test attorneys table query
    console.log('📊 Test 3: Query attorneys table...');
    const attorneysQuery = queries.searchAttorneys('', '', 5);
    console.log('Query:', attorneysQuery.substring(0, 100) + '...\n');
    
    try {
      const attorneys = await db.executeQuery(attorneysQuery);
      console.log(`✓ Attorneys query successful (${attorneys.length} results)`);
      if (attorneys.length > 0) {
        console.log('Sample:', JSON.stringify(attorneys[0], null, 2));
      }
    } catch (error) {
      console.log(`⚠ Attorneys query failed: ${error.message}`);
    }
    console.log();

    // Test 4: Test analytics by court query
    console.log('📊 Test 4: Query analytics by court...');
    const analyticsByCourtQuery = queries.getCaseAnalyticsByCourt();
    console.log('Query:', analyticsByCourtQuery.substring(0, 100) + '...\n');
    
    try {
      const analytics = await db.executeQuery(analyticsByCourtQuery);
      console.log(`✓ Analytics query successful (${analytics.length} results)`);
      if (analytics.length > 0) {
        console.log('Sample:', JSON.stringify(analytics[0], null, 2));
      }
    } catch (error) {
      console.log(`⚠ Analytics query failed: ${error.message}`);
    }
    console.log();

    // Test 5: Test analytics by case type query
    console.log('📊 Test 5: Query analytics by case type...');
    const analyticsByCaseTypeQuery = queries.getCaseAnalyticsByCaseType();
    console.log('Query:', analyticsByCaseTypeQuery.substring(0, 100) + '...\n');
    
    try {
      const analytics = await db.executeQuery(analyticsByCaseTypeQuery);
      console.log(`✓ Analytics query successful (${analytics.length} results)`);
      if (analytics.length > 0) {
        console.log('Sample:', JSON.stringify(analytics[0], null, 2));
      }
    } catch (error) {
      console.log(`⚠ Analytics query failed: ${error.message}`);
    }
    console.log();

    // Disconnect
    await db.disconnect();
    console.log('✓ All tests completed\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
