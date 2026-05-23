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

const getAllIssues = async (
    req: Request,
    res: Response
) => {
    try {
        const { sort = "newest", type, status } = req.query;

        const result = await issueService.getAllIssueService(
            sort as string,
            type as string,
            status as string
        );
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "All issues retrieved successfully",
            data: result
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: error.message,
        })
    }
};

const getSingleIssue = async (req: Request, res: Response) => {

    try {
        const result = await issueService.getSingleIssueService(Number(req.params.id));

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Single Issue retrieved",
            data: result
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: error.message,
        })
    }
}

const updateIssues = async (req: Request, res: Response) => {

    try {
        const result = await issueService.updateIssueService(
            Number(req.params.id),
            req.body,
            req.user!)

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue updated successfully",
            data: result
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: error.message,
        })
    }
}

export const issuesController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssues
}