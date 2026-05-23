import express, { type Application, type Request, type Response } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { authRoute } from "./modules/auth/auth.route";
import { issueRouter } from "./modules/issues/issue.route";

const app: Application = express()

app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req: Request, res: Response) => {
    
    res.send("I'm Express")
})

app.use("/api/auth", authRoute)
app.use("/api", issueRouter)



// Global Error Handling Middleware
app.use(globalErrorHandler)

export default app;