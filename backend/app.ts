 // app.ts
//  express is used to build web server, helps to handle req, and send response, Application is type to represent express app, req is for incoming req,res is for incoming res, if removed everyhting work just, type check err come.
import express, { Application, Request, Response } from "express";
// cross origin resource sharing, these decides which frontend origin are allowed to make req, to our backend.
import cors from "cors";
// used to load environment variable, from .env file.
import dotenv from "dotenv";
// for limiting many reqs comming from one client.
import rateLimit from "express-rate-limit";
// middleware to add several security http header.
import helmet from "helmet";
//a nodejs module for handling and resolving file paths.
import path from "path";
// imports middleware to parse cookies from incoming http reqs.
import cookieParser from "cookie-parser";

 
// Import route modules
import roleRoutes from "./src/routes/role.route";
import cmsRoutes from "./src/routes/cms.route";
import emailTemplateRoutes from "./src/routes/emailTemplate.route";
import faqRoutes from "./src/routes/faq.route";
import auditRoutes from "./src/routes/audit.route";
import configRoutes from "./src/routes/config.route";
import userRoutes from "./src/routes/user.route";
import passwordRoutes from "./src/routes/password.route";
import permissionRoutes from "./src/routes/permission.route";
 
// to load .env file variable.
dotenv.config();
 
// just a instance of react application.
const app: Application = express();
 
/* ---------------------------
   🧱 Core Middleware Setup
---------------------------- */
 
// Parse cookies FIRST, to every req.
app.use(cookieParser());
 
//  CORS
app.use(
  cors({
    // origin which frontend url allowed to make req,
    origin: "http://localhost:5173",
    // allows everytime to add cooki, or authntication headers to be sent.
    credentials: true,
    // allowed http methods
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // allow req header, important for API whcih sends token or json
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Requested-With",
    ],
  })
);
 
// JSON body parsing, then json body is accessible, through req.body.
app.use(express.json());
//  security header, to allow serving static files(like images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, 
  })
);
 
/* ---------------------------
   🧱 Static Files - after helmet
---------------------------- */

// your_project_folder/assets/images/logo.png
app.use(
  "/assets/images",
  express.static(path.resolve(__dirname, "assets/images"))
);
 
/* ---------------------------
   🧱 Rate Limiter
---------------------------- */
 
const authLimiter = rateLimit({
  // define rate limiting, 60 * 1000 = 60,000 milliseconds = 1 min, means cnt req over 1 min period.
  windowMs: 60 * 1000,
  // sets maximum no. of req allowed per IP, in 1 min window.
  max: 10,
  message: "Too many requests, please try again later.",
});
 
/* ---------------------------
   🧱 Health Check
---------------------------- */
app.get("/", (req: Request, res: Response) => {
  res.send("✅ Admin Panel Backend Running");
});
 
/* ---------------------------
   🧱 Mount Routes
---------------------------- */



app.use("/api/permissions", permissionRoutes);
// rate limiting for the password route, 
app.use("/api/password", authLimiter, passwordRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/email-templates", emailTemplateRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/config", configRoutes);

 
/* ---------------------------
   🚀 Start Server
---------------------------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
 
});