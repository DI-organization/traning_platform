import { Router } from "express";
import * as githubController from "../controllers/github.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/lookup", githubController.lookupRepository);

export default router;
