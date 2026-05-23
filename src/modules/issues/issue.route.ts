import { Router } from "express";
import { issuesController } from "./issue.controller";
import auth from "../../middleware/auth.middleware";


const router = Router();

router.post("/issues", auth, issuesController.createIssue)


export const issueRouter = router;