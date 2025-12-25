'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema, refreshTokenSchema, updatePasswordSchema, updateUsernameSchema } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, librarian]
 *               libraryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid token
 */
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);

router.get("/info",protect,authController.getInfo)
router.post("/update-password", validateRequest(updatePasswordSchema), protect,authController.updatePassword)
router.get("/check-username", protect, authController.checkUsernameAvailability)
router.post("/update-username", validateRequest(updateUsernameSchema), protect,authController.updateUsername)



router.post('/forgot-password',authController.forgetPassword)
router.post('/reset-password',authController.resetPassword)


module.exports = router;