const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());

const port = 3000;
const SECRET_KEY = "shangesh";

const users = [
  { id: "001", username: "user", password: "user123", role: "user" },
  { id: "002", username: "admin", password: "admin123", role: "admin" },
];

// Root route
app.get("/", (req, res) => {
  return res.json({
    message: "Hello, web server is running...."
  });
});

// Login route
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = users.find((u) => {
      return (
        u.username === username &&
        u.password === password &&
        u.role === role
      );
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username: user.username, id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: "15m" }
    );

    console.log("Token:", token);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/"
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Profile route
app.get("/profile", (req, res) => {
  const token = req.cookies.auth_token;
  console.log("Profile token:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    return res.status(200).json({
      message: "Welcome to your profile!",
      user: verified.username
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

// Admin-only route
app.get("/admin-login", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    if (verified.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    return res.status(200).json({
      message: "Welcome to the admin dashboard!"
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
