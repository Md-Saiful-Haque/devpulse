
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env"),
  quiet: true
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
  jwt_secret: process.env.JWT_SECRET
  //   refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
    stack: config_default.node_env === "development" && err instanceof Error ? err.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'contributor' CHECK(role IN ('contributor', 'maintainer')),


          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    await pool.query(`
          CREATE TABLE IF NOT EXISTS issues (
          id SERIAL PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(30) NOT NULL CHECK(type IN ('bug', 'feature_request')),
          status VARCHAR(30) DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
          reporter_id INTEGER NOT NULL,

          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var signUpUser = async (payload) => {
  const { name, email, password, role } = payload;
  const existingUser = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);
  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at
        `, [name, email, hashPassword, role]);
  return result.rows[0];
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const result = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `, [email]);
  const user = result.rows[0];
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const token = jwt.sign(jwtPayload, config_default.jwt_secret, { expiresIn: "5d" });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var authService = {
  signUpUser,
  loginUser
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var signUp = async (req, res) => {
  const result = await authService.signUpUser(req.body);
  try {
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: "User Not Found",
      error
    });
  }
};
var login = async (req, res) => {
  const user = await authService.loginUser(req.body);
  try {
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User login successfully",
      data: user
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: "User Not Found",
      error
    });
  }
};
var authController = {
  signUp,
  login
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signUp);
router.post("/login", authController.login);
var authRoute = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssueService = async (payload, reporterId) => {
  const { title, description, type } = payload;
  const result = await pool.query(`
        INSERT INTO issues(title, description, type, reporter_id)
        VALUES($1, $2, $3, $4) RETURNING *
        `, [title, description, type, reporterId]);
  return result.rows[0];
};
var getAllIssueService = async (sort, type, status) => {
  let query = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  query += sort === "oldest" ? " ORDER BY created_at ASC" : " ORDER BY created_at DESC";
  const issueResult = await pool.query(
    query,
    values
  );
  const issues = issueResult.rows;
  const formattedIssues = [];
  for (const issue of issues) {
    const reporterResult = await pool.query(
      `
      SELECT id,name,role
      FROM users
      WHERE id=$1
      `,
      [issue.reporter_id]
    );
    formattedIssues.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporterResult.rows[0],
      created_at: issue.created_at,
      updated_at: issue.updated_at
    });
  }
  return formattedIssues;
};
var getSingleIssueService = async (issueId) => {
  const issueResult = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [issueId]);
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const reporterResult = await pool.query(`
    SELECT id,name,role FROM users WHERE id=$1
    `, [issue.reporter_id]);
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterResult.rows[0],
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssueService = async (issueId, payload, user) => {
  const issueResult = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [issueId]);
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (user.role === "contributor" && issue.reporter_id !== user.id) {
    throw new Error("You can update only your own issue");
  }
  if (user.role === "contributor" && issue.status !== "open") {
    throw new Error("Open issues only can be edited");
  }
  const title = payload.title || issue.title;
  const description = payload.description || issue.description;
  const type = payload.type || issue.type;
  const result = await pool.query(`
    UPDATE issues SET title=$1, description=$2, type=$3, updated_at=CURRENT_TIMESTAMP
    WHERE id=$4 RETURNING *
    `, [title, description, type, issueId]);
  return result.rows[0];
};
var deleteIssueService = async (issueId) => {
  const result = await pool.query(`
    DELETE FROM issues WHERE id=$1 RETURNING *
    `, [issueId]);
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return result;
};
var issueService = {
  createIssueService,
  getAllIssueService,
  getSingleIssueService,
  updateIssueService,
  deleteIssueService
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporterId = req.user?.id;
    const result = await issueService.createIssueService(req.body, reporterId);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: "Failed to create issue"
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const { sort = "newest", type, status } = req.query;
    const result = await issueService.getAllIssueService(
      sort,
      type,
      status
    );
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "All issues retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const result = await issueService.getSingleIssueService(Number(req.params.id));
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Single Issue retrieved",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message
    });
  }
};
var updateIssues = async (req, res) => {
  try {
    const result = await issueService.updateIssueService(
      Number(req.params.id),
      req.body,
      req.user
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const result = await issueService.deleteIssueService(Number(req.params.id));
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message
    });
  }
};
var issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssues,
  deleteIssue
};

// src/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const decoded = jwt2.verify(
      token,
      config_default.jwt_secret
    );
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
var auth_middleware_default = auth;

// src/middleware/role.middleware.ts
var authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }
    next();
  };
};
var role_middleware_default = authorizeRole;

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post("/issues", auth_middleware_default, issuesController.createIssue);
router2.get("/issues", issuesController.getAllIssues);
router2.get("/issues/:id", issuesController.getSingleIssue);
router2.put("/issues/:id", auth_middleware_default, issuesController.updateIssues);
router2.delete("/issues/:id", auth_middleware_default, role_middleware_default("maintainer"), issuesController.deleteIssue);
var issueRouter = router2;

// src/app.ts
import cors from "cors";
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://vercel.app", "http://localhost:3000"],
    credentials: true
  })
);
app.get("/", (req, res) => {
  res.send("Hello! DevPulse API");
});
app.use("/api/auth", authRoute);
app.use("/api", issueRouter);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map