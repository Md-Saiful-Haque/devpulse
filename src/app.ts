import express, { type Application, type Request, type Response } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { authRoute } from "./modules/auth/auth.route";
import { issueRouter } from "./modules/issues/issue.route";
import cors from "cors"

const app: Application = express()

app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: ["https://devpulse-ecru.vercel.app", "http://localhost:3000"],
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
    
    res.send("Hello! DevPulse API")
})

app.use("/api/auth", authRoute)
app.use("/api", issueRouter)



// Global Error Handling Middleware
app.use(globalErrorHandler)

export default app;