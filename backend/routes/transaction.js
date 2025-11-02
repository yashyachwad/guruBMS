// backend/routes/transaction.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Add a transaction (deposit or withdrawal)
router.post("/:type", (req, res) => {
  const { user_id, amount } = req.body;
  const { type } = req.params;

  if (!user_id || !amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  if (type !== "deposit" && type !== "withdrawal") {
    return res.status(400).json({ error: "Invalid transaction type" });
  }

  // Check user balance for withdrawal
  const balanceCheckQuery = "SELECT balance FROM users WHERE id = ?";
  db.query(balanceCheckQuery, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ error: "User not found" });

    let newBalance = parseFloat(results[0].balance);
    const amt = parseFloat(amount);

    if (type === "withdrawal" && newBalance < amt) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update balance
    newBalance = type === "deposit" ? newBalance + amt : newBalance - amt;
    const updateBalanceQuery = "UPDATE users SET balance = ? WHERE id = ?";
    db.query(updateBalanceQuery, [newBalance, user_id], (err2) => {
      if (err2) return res.status(500).json({ error: "Database error while updating balance" });

      // Add transaction record
      const insertQuery =
        "INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, ?)";
      db.query(insertQuery, [user_id, amount, type], (err3) => {
        if (err3) return res.status(500).json({ error: "Database error while inserting transaction" });

        return res.json({ message: `${type} successful`, balance: newBalance });
      });
    });
  });
});

// Get transaction history
router.get("/history/:user_id", (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: "User ID missing" });

  const query = "SELECT id, amount, type, date FROM transactions WHERE user_id = ? ORDER BY date DESC";
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("❌ DB History Error:", err);
      return res.status(500).json({ error: "Database error while fetching history" });
    }
    res.json(results);
  });
});

module.exports = router;
