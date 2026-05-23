import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const signUp = async (req: Request, res: Response) => {
    const result = await authService.signUpUser(req.body);

    try {
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User registered successfully",
            data: result
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "User Not Found",
            error: error
        })
    }
}

const login = async (req: Request, res: Response) => {
    const user = await authService.loginUser(req.body);

    try {
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User login successfully",
            data: user
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "User Not Found",
            error: error
        })
    }
}


export const authController = {
    signUp,
    login
}