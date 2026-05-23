import { Router } from "express";
import { issuesController } from "./issue.controller";
import auth from "../../middleware/auth.middleware";


const router = Router();

router.post("/issues", auth, issuesController.createIssue)
router.get("/issues", issuesController.getAllIssues)


export const issueRouter = router;