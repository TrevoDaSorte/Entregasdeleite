const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

const BANCO = path.join(__dirname, "banco.json");

// CRIA BANCO SE NÃO EXISTIR
if (!fs.existsSync(BANCO)) {

    fs.writeFileSync(BANCO, JSON.stringify({
        clientes: [],
        entregas: []
    }, null, 2));
}

// LER BANCO
function lerBanco() {

    try {

        const dados = fs.readFileSync(BANCO, "utf8");

        return JSON.parse(dados);

    } catch (erro) {

        return {
            clientes: [],
            entregas: []
        };
    }
}

// SALVAR BANCO
function salvarBanco(dados) {

    fs.writeFileSync(BANCO, JSON.stringify(dados, null, 2));
}

// ROTA PRINCIPAL
app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "index.html"));
});

// CARREGAR DADOS
app.get("/dados", (req, res) => {

    res.json(lerBanco());
});

// SALVAR DADOS
app.post("/salvar", (req, res) => {

    try {

        salvarBanco(req.body);

        res.json({
            sucesso: true
        });

    } catch (erro) {

        res.status(500).json({
            sucesso: false,
            erro: "Erro ao salvar banco"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("Servidor rodando na porta " + PORT);
});