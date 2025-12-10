"use strict";

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const validateRequest = require("../middleware/validateRequest");
const {
  createPaymentSchema,
  verifyPaymentSchema,
} = require("../validators/payment.validator");
const { protect,adminOrLibrarianOnly } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create a new payment order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayment'
 *     responses:
 *       201:
 *         description: Payment order created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/create-order",
  protect,
  validateRequest(createPaymentSchema),
  paymentController.createPaymentOrder
);

/**
 * @swagger
 * /api/payments/verify-payment:
 *   post:
 *     summary: Verify payment signature
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPayment'
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/verify-payment",
  protect,
  validateRequest(verifyPaymentSchema),
  paymentController.verifyPayment
);

/**
 * @swagger
 * /api/payments/student/{studentId}:
 *   get:
 *     summary: Get payments by student ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No payments found
 */
router.get(
  "/student/:studentId",
  protect,
  paymentController.getPaymentsByStudent
);

/**
 * @swagger
 * /api/payments/library/{libraryId}:
 *   get:
 *     summary: Get payments by library ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: libraryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Library ID
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No payments found
 */
router.get(
  "/library/:libraryId",
  protect,
  paymentController.getPaymentsByLibrary
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get("/:id", protect, paymentController.getPaymentById);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Process refund for a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Refund amount (optional, defaults to full amount)
 *               reason:
 *                 type: string
 *                 description: Reason for refund
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.post("/:id/refund", protect, paymentController.processRefund);

/**
 * @swagger
 * /api/payments/cash:
 *   post:
 *     summary: Process payment in cash
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MakePaymentInCash'
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/cash", protect, paymentController.makePaymentInCash);
router.post(
  "/razorpay/webhook",
  express.raw({ type: "application/json" }),
  paymentController.razorpayWebhook
);

/**
 * @swagger
 * /api/payments/test-razorpay-setup:
 *   post:
 *     summary: Test Razorpay setup
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Razorpay setup tested successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/test-razorpay-setup",
  protect,
  adminOrLibrarianOnly,
  paymentController.testRazorPaySetup
);

module.exports = router;
