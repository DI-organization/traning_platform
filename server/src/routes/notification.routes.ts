import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List the current user's notifications
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema: { type: string, enum: ["true"] }
 *         description: Pass unread=true to return only unread notifications
 *     responses:
 *       200:
 *         description: Notifications and the current unread count
 */
router.get("/", notificationController.listNotifications);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all of the current user's notifications as read
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All notifications marked as read }
 */
router.patch("/read-all", notificationController.markAllAsRead);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Notification marked as read }
 */
router.patch("/:id/read", notificationController.markAsRead);

export default router;
