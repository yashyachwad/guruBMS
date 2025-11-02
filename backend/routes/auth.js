const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// ✅ Register (updated to return new userId)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "Missing fields" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashed], (err, result) => {
      if (err) {
        // duplicate email
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ success: false, message: "Email already registered" });
        }
        console.error("DB Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      // ✅ Return the inserted user ID so frontend can store it in localStorage
      res.json({
        success: true,
        message: "User registered successfully!",
        userId: result.insertId,
      });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

// ✅ Login (unchanged)
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing email or password" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, name: user.name, balance: user.balance },
    });
  });
});

module.exports = router;
