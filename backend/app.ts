// import express, { Application, Request, Response } from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import path from "path";
// import rateLimit from "express-rate-limit";

// // Routes
// import userRoutes from "./src/routes/user.route";
// import roleRoutes from "./src/routes/role.route";
// import cmsRoutes from "./src/routes/cms.route";
// import emailTemplateRoutes from "./src/routes/emailTemplate.route";
// import faqRoutes from "./src/routes/faq.route";
// import auditRoutes from "./src/routes/audit.route";
// import configRoutes from "./src/routes/config.route";
// import passwordRoutes from "./src/routes/password.route";

// dotenv.config();

// const app: Application = express();

// // ----------------------
// // ✅ Core Middleware
// // ----------------------
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );
// app.use(express.json());
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   })
// );

// // ----------------------
// // ✅ Static files
// // ----------------------
// app.use("/assets/images", express.static(path.join(__dirname, "assets/images")));

// // ----------------------
// // ✅ Rate limiter (for auth routes)
// // ----------------------
// const authLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 10,
//   message: "Too many requests, try again later",
// });

// // ----------------------
// // ✅ Health check
// // ----------------------
// app.get("/", (req: Request, res: Response) => {
//   res.send("✅ Admin Panel Backend Running");
// });

// // ----------------------
// // ✅ Routes
// // ----------------------
// app.use("/api/password", authLimiter, passwordRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/roles", roleRoutes);
// app.use("/api/cms", cmsRoutes);
// app.use("/api/email-templates", emailTemplateRoutes);
// app.use("/api/faq", faqRoutes);
// app.use("/api/audit", auditRoutes);
// app.use("/api/config", configRoutes);

// // ----------------------
// // 🚀 Start server
// // ----------------------
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });






// // app.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import cookieParser from "cookie-parser";
import fs from "fs";
 
// Import route modules
import roleRoutes from "./src/routes/role.route";
import cmsRoutes from "./src/routes/cms.route";
import emailTemplateRoutes from "./src/routes/emailTemplate.route";
import faqRoutes from "./src/routes/faq.route";
import auditRoutes from "./src/routes/audit.route";
import configRoutes from "./src/routes/config.route";
import userRoutes from "./src/routes/user.route";
import passwordRoutes from "./src/routes/password.route";
 
dotenv.config();
 
const app: Application = express();
 
/* ---------------------------
   🧱 Core Middleware Setup
---------------------------- */
 
// ✅ Parse cookies FIRST
app.use(cookieParser());
 
// ✅ CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Requested-With",
    ],
  })
);
 
// ✅ JSON body parsing
app.use(express.json());
 
// ✅ Helmet - Configure करो to allow static files
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // ⬅️ IMPORTANT!
  })
);
 
/* ---------------------------
   🧱 Static Files - Helmet के BAAD
---------------------------- */


app.use(
  "/assets/images",
  express.static(path.resolve(__dirname, "assets/images"))
);
 
/* ---------------------------
   🧱 Rate Limiter
---------------------------- */
 
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
 
});