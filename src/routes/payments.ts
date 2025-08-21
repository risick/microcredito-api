import { Router } from "express"

const router = Router()

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get("/", (req, res) => {
  res.json({ message: "Payments endpoint - to be implemented" })
})

export default router
