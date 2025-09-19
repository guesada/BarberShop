require("dotenv").config(); // para usar variáveis de ambiente do .env
const express = require("express");
const mysql = require("mysql2/promise"); // versão com promises, mais moderna
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Configuração da conexão com o MySQL (via Pool)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "barbershop_auth",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa a conexão logo na inicialização
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Conectado ao MySQL!");
    connection.release();
  } catch (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  }
})();

// Rota raiz
app.get("/", (req, res) => {
  res.send("API funcionando! Use /users para gerenciar usuários.");
});

// Rota para adicionar usuário
app.post("/users", async (req, res, next) => {
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

// Rota para listar usuários
app.get("/users", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email FROM users");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
