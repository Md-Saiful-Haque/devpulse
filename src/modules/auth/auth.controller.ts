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
        })
    }
}


export const authController = {
    signUp
}