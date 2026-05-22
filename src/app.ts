import express, { type Application, type Request, type Response } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express()

app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req: Request, res: Response) => {
    res.send("I'm Express")
})


// Global Error Handling Middleware
app.use(globalErrorHandler)

export default app;