const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Criar usuário
router.post("/", async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Nome e email são obrigatórios" });
    }

    const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
    const [result] = await pool.query(sql, [name, email]);

    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    next(err);
  }
});

// Listar usuários
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email FROM users");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
