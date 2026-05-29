/**
 * Law Firms Routes
 * 
 * GET /api/law-firms - List law firms with attorney counts
 * GET /api/law-firms/:firm - Get attorneys in a specific law firm
 */

import express from 'express';
import db from '../db/connection.js';
import queries from '../db/queries.js';

const router = express.Router();

/**
 * GET /api/law-firms
 * List law firms with aggregated data
 * 
 * Query Parameters:
 * - limit: Result limit (default 50, max 100)
 * - offset: Result offset for pagination (default 0)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [{ firm, attorneyCount, totalCases }, ...],
 *   pagination: { limit, offset }
 * }
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Validate and sanitize parameters
    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);

    // Execute query
    const sql = queries.getLawFirms(parsedLimit, parsedOffset);
    const results = await db.executeQuery(sql);

    res.json({
      success: true,
      data: results,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
      },
    });
  } catch (error) {
    console.error('Law firms list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve law firms',
      message: error.message,
    });
  }
});

/**
 * GET /api/law-firms/:firm
 * Get all attorneys in a specific law firm
 * 
 * URL Parameters:
 * - firm: Law firm name (URL encoded)
 * 
 * Response:
 * {
 *   success: true,
 *   firm: "Law Firm Name",
 *   data: [{ id, name, totalcases, status, firm }, ...]
 * }
 */
router.get('/:firm', async (req, res) => {
  try {
    const { firm } = req.params;

    if (!firm || firm.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid firm name',
        message: 'Firm parameter is required',
      });
    }

    // Execute query
    const sql = queries.getAttorneysByFirm(firm);
    const results = await db.executeQuery(sql);

    res.json({
      success: true,
      firm: decodeURIComponent(firm),
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Law firm detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve law firm details',
      message: error.message,
    });
  }
});

export default router;
