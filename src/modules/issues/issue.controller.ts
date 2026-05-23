import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";


const createIssue = async (req: Request, res: Response) => {

    try {
        const reporterId = req.user?.id;
        const result = await issueService.createIssueService(req.body, reporterId as number)

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue created successfully",
            data: result
        })
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "Failed to create issue",
        })
    }

}

export const issuesController = {
    createIssue
}