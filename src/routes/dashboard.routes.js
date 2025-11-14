'use strict';

const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect, adminOnly, adminOrLibrarianOnly } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/library/{libraryId}/summary:
 *   get:
 *     summary: Get library dashboard summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: libraryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Library ID
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}$'
 *         description: Month in YYYY-MM format (e.g., 2024-01)
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                       description: Total number of students in the library
 *                     totalPendingPayments:
 *                       type: integer
 *                       description: Total number of pending payments
 *                     totalPaidPayments:
 *                       type: integer
 *                       description: Total number of paid payments
 *                     totalRevenue:
 *                       type: number
 *                       description: Total revenue for the specified/current month
 *                     monthlyRevenue:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             description: Month name
 *                           revenue:
 *                             type: number
 *                             description: Revenue for that month
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Library not found
 *       500:
 *         description: Server error
 */
router.get('/library/:libraryId/summary', protect, adminOrLibrarianOnly, dashboardController.getLibrarySummary);

/**
 * @swagger
 * /api/dashboard/library/{libraryId}/analytics:
 *   get:
 *     summary: Get library analytics data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: libraryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Library ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           completed:
 *                             type: integer
 *                           pending:
 *                             type: integer
 *                           failed:
 *                             type: integer
 *                     revenueByMonth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                     studentGrowth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Library not found
 *       500:
 *         description: Server error
 */
router.get('/library/:libraryId/analytics', protect,adminOrLibrarianOnly, dashboardController.getLibraryAnalytics);

module.exports = router;