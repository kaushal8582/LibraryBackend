"use strict";

const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");
const validateRequest = require("../middleware/validateRequest");
const {
  createStudentSchema,
  updateStudentSchema,
} = require("../validators/student.validator");
const {
  protect,
  adminOrLibrarianOnly,
} = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  protect,
  adminOrLibrarianOnly,
  validateRequest(createStudentSchema),
  studentController.createStudent
);

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: libraryId
 *         schema:
 *           type: string
 *         description: Library ID to filter students
 *     responses:
 *       200:
 *         description: List of students
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  protect,
  adminOrLibrarianOnly,
  studentController.getAllStudents
);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  protect,
  adminOrLibrarianOnly,
  studentController.getStudentById
);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentUpdate'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  protect,
//   validateRequest(updateStudentSchema),
  upload.fields([
    {
      name: "profileImg",
      maxCount: 1,
    },
  ]),
  studentController.updateStudent
);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  protect,
  adminOrLibrarianOnly,
  studentController.deleteStudent
);

module.exports = router;
