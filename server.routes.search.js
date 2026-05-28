/**
 * Search Routes - Judge and Attorney Search Endpoints
 * 
 * GET /api/search/judges - Search judges with pagination
 * GET /api/search/attorneys - Search attorneys with filters
 */

import express from 'express';
import db from '../server.db.connection.js';
import queries from '../server.db.queries.js';

const router = express.Router();

/**
 * GET /api/search/judges
 * Search judges by name
 * 
 * Query Parameters:
 * - q: Search term (optional, searches in name field)
 * - limit: Result limit (default 50, max 100)
 * - offset: Result offset for pagination (default 0)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [{ id, name, totalcases, judicialstatus, politicalaffiliation }, ...],
 *   pagination: { limit, offset, total }
 * }
 */
router.get('/judges', async (req, res) => {
  try {
    const { q = '', limit = 50, offset = 0 } = req.query;

    // Validate and sanitize parameters
    const parsedLimit = Math.min(parseInt(limit) || 50, 100); // Max 100 per request
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);

    // Execute search query
    const searchSql = queries.searchJudges(q, parsedLimit, parsedOffset);
    const results = await db.executeQuery(searchSql);

    // Get total count
    const countSql = queries.countJudges(q);
    const countResult = await db.executeQuery(countSql);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: results,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        total,
        hasMore: parsedOffset + parsedLimit < total,
      },
    });
  } catch (error) {
    console.error('Judge search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search judges',
      message: error.message,
    });
  }
});

/**
 * GET /api/search/attorneys
 * Search attorneys by name and/or law firm
 * 
 * Query Parameters:
 * - q: Search term for attorney name (optional)
 * - firm: Filter by law firm name (optional)
 * - limit: Result limit (default 50, max 100)
 * - offset: Result offset for pagination (default 0)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [{ id, name, totalcases, status, firm }, ...],
 *   pagination: { limit, offset, total }
 * }
 */
router.get('/attorneys', async (req, res) => {
  try {
    const { q = '', firm = '', limit = 50, offset = 0 } = req.query;

    // Validate and sanitize parameters
    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);

    // Execute search query
    const searchSql = queries.searchAttorneys(q, firm, parsedLimit, parsedOffset);
    const results = await db.executeQuery(searchSql);

    // Get total count
    const countSql = queries.countAttorneys(q, firm);
    const countResult = await db.executeQuery(countSql);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: results,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        total,
        hasMore: parsedOffset + parsedLimit < total,
      },
    });
  } catch (error) {
    console.error('Attorney search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search attorneys',
      message: error.message,
    });
  }
});

export default router;
