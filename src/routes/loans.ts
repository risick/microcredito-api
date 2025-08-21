import { Router } from "express"

const router = Router()

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of loans
 */
router.get("/", (req, res) => {
  res.json({ message: "Loans endpoint - to be implemented" })
})

export default router
