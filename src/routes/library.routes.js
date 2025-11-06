'use strict';

const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/library.controller');
const validateRequest = require('../middleware/validateRequest');
const { createLibrarySchema, updateLibrarySchema } = require('../validators/library.validator');
const { protect, adminOnly } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/libraries:
 *   post:
 *     summary: Create a new library
 *     tags: [Libraries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Library'
 *     responses:
 *       201:
 *         description: Library created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, adminOnly, validateRequest(createLibrarySchema), libraryController.createLibrary);

/**
 * @swagger
 * /api/libraries:
 *   get:
 *     summary: Get all libraries
 *     tags: [Libraries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Libraries retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, libraryController.getAllLibraries);

/**
 * @swagger
 * /api/libraries/{id}:
 *   get:
 *     summary: Get library by ID
 *     tags: [Libraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Library ID
 *     responses:
 *       200:
 *         description: Library retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Library not found
 */
router.get('/:id', protect, libraryController.getLibraryById);

/**
 * @swagger
 * /api/libraries/{id}:
 *   put:
 *     summary: Update library
 *     tags: [Libraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Library ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LibraryUpdate'
 *     responses:
 *       200:
 *         description: Library updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Library not found
 */
router.put('/:id', protect, adminOnly, validateRequest(updateLibrarySchema), libraryController.updateLibrary);

/**
 * @swagger
 * /api/libraries/{id}:
 *   delete:
 *     summary: Delete library
 *     tags: [Libraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Library ID
 *     responses:
 *       200:
 *         description: Library deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Library not found
 */
router.delete('/:id', protect, adminOnly, libraryController.deleteLibrary);

module.exports = router;