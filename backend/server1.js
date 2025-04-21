const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors")
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

PORT = process.env.PORT;
JWT_SECRET = process.env.JWT_SECRET;

user_db = {
  id: 100,
  username: "shangesh",
  password: "123",
};

app.get("/", (req, res) => {
  return res.status(200).json({ message: "helllo server is running..." });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  try {
    if (username === user_db.username && password === user_db.password) {
      const token = jwt.sign({ username, password }, JWT_SECRET, {
        expiresIn: "15m",
      });

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 1000 * 15,
        path: "/",
      });

      return res.status(200).json({ message: "Login successful", username });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.get("/dashboard", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  } else {
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      const { username, password } = verified;

      return res.status(200).json({
        message: "Welcome to your dashbaord!",
        username,
        password
      });
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
});

app.listen(PORT,()=>{
    console.log(`server is running --> ${PORT}`)
})
