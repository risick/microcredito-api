import { Router } from "express"
import { BorrowerController } from "@/controllers/borrower.controller"
import { authenticateToken, authorizeRoles } from "@/middleware/auth"

const router = Router()

/**
 * @swagger
 * /api/borrowers:
 *   post:
 *     summary: Create borrower profile
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bi
 *               - phone
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *               - birthDate
 *               - income
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (Admin only)
 *               bi:
 *                 type: string
 *                 pattern: ^\d{11}$
 *               phone:
 *                 type: string
 *                 pattern: ^\d{10,11}$
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *                 maxLength: 2
 *               zipCode:
 *                 type: string
 *                 pattern: ^\d{8}$
 *               birthDate:
 *                 type: string
 *                 format: date-time
 *               income:
 *                 type: number
 *                 minimum: 0
 *               creditScore:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000
 *     responses:
 *       201:
 *         description: Borrower profile created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: BI already exists
 */
router.post("/", authenticateToken, BorrowerController.createBorrower)

/**
 * @swagger
 * /api/borrowers:
 *   get:
 *     summary: Get all borrowers (Admin/Loan Officer only)
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: minIncome
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxIncome
 *         schema:
 *           type: number
 *       - in: query
 *         name: minCreditScore
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxCreditScore
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of borrowers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", authenticateToken, authorizeRoles("ADMIN", "LOAN_OFFICER", 'MANAGER'), BorrowerController.getBorrowers)

/**
 * @swagger
 * /api/borrowers/me:
 *   get:
 *     summary: Get my borrower profile
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My borrower profile
 *       404:
 *         description: Profile not found
 */
router.get("/me", authenticateToken, BorrowerController.getMyProfile)

/**
 * @swagger
 * /api/borrowers/me:
 *   put:
 *     summary: Update my borrower profile
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               income:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 */
router.put("/me", authenticateToken, BorrowerController.updateMyProfile)

/**
 * @swagger
 * /api/borrowers/stats:
 *   get:
 *     summary: Get borrower statistics (Admin/Loan Officer only)
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Borrower statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/stats", authenticateToken, authorizeRoles("ADMIN", "LOAN_OFFICER", "MANAGER"), BorrowerController.getBorrowerStats)

/**
 * @swagger
 * /api/borrowers/{id}:
 *   get:
 *     summary: Get borrower by ID (Admin/Loan Officer only)
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrower data
 *       404:
 *         description: Borrower not found
 */
router.get("/:id", authenticateToken, authorizeRoles("ADMIN", "LOAN_OFFICER", "MANAGER"), BorrowerController.getBorrowerById)

/**
 * @swagger
 * /api/borrowers/{id}:
 *   put:
 *     summary: Update borrower (Admin/Loan Officer only)
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               income:
 *                 type: number
 *               creditScore:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Borrower updated successfully
 *       404:
 *         description: Borrower not found
 */
router.put("/:id", authenticateToken, authorizeRoles("ADMIN", "LOAN_OFFICER", "MANAGER"), BorrowerController.updateBorrower)

/**
 * @swagger
 * /api/borrowers/{id}:
 *   delete:
 *     summary: Deactivate borrower (Admin only)
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrower deactivated successfully
 *       404:
 *         description: Borrower not found
 *       400:
 *         description: Cannot delete borrower with active loans
 */
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), BorrowerController.deleteBorrower)

/**
 * @swagger
 * /api/borrowers/{id}/recalculate-score:
 *   post:
 *     summary: Recalculate credit score (Admin/Loan Officer only)
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit score recalculated successfully
 *       404:
 *         description: Borrower not found
 */
router.post(
  "/:id/recalculate-score",
  authenticateToken,
  authorizeRoles("ADMIN", "LOAN_OFFICER", "MANAGER"),
  BorrowerController.recalculateCreditScore,
)

export default router
