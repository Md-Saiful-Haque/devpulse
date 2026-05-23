import { Router } from "express";
import { issuesController } from "./issue.controller";
import auth from "../../middleware/auth.middleware";
import authorizeRole from "../../middleware/role.middleware";


const router = Router();

router.post("/issues", auth, issuesController.createIssue)
router.get("/issues", issuesController.getAllIssues)
router.get("/issues/:id", issuesController.getSingleIssue)
router.put("/issues/:id", auth, issuesController.updateIssues)
router.delete("/issues/:id", auth, authorizeRole("maintainer"), issuesController.deleteIssue)


export const issueRouter = router;