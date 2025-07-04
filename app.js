const express = require("express");
const app = express();
const serverless = require("serverless-http");

// JSON PARSE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// env
require("dotenv").config();

// Security Headers (Helmet)
app.use(require("helmet")());

// Prevent Http Param Pollution (HPP)
app.use(require("hpp")());

// Rate Limiting
app.use(
  require("express-rate-limit")({
    windowMs: 10 * 60 * 1000, // Ten Minutes
    max: 200,
  })
);

// Prevent XSS (Cross Site Scripting) Attacks
app.use(require("express-xss-sanitizer").xss());

// Cors Policy
app.use(require("cors")({ origin: process.env.CLIENT_DOMAIN || "*" }));

// Use Morgan Package Only When you in develop Mode
if (process.env.NODE_ENV === "development") {
  app.use(require("morgan")("dev"));
}

// Database Connection
require("./config/connection.mongo.db")();
// Static pages
app.use("/api", express.static("./images"));

// Routes
// User Routes //
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/password", require("./routes/password.route"));

// Other Routes //
app.use("/api/posts", require("./routes/posts.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use("/api/categories", require("./routes/categories.routes"));

app.use((request, _, next) => {
  next(
    new Error(`this: ${request.originalUrl}  is not found"`, { cause: "404" })
  );
});
// End Routes

// Error Middleware
app.use(require("./middlewares/errorHandle"));

const PORT = process.env.PORT || 3010;
app.listen(PORT, (error) => {
  if (error) return console.error("Out Error: ", error);
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
