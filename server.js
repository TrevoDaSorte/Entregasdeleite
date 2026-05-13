const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/* SERVE SEU HTML */
app.use(express.static(__dirname));

const BANCO = path.join(__dirname, "banco.json");

/* CRIA BANCO SE NÃO EXISTIR */
if (!fs.existsSync(BANCO)) {
    fs.writeFileSync(BANCO, "[]");
}

/* LER BANCO */
function lerBanco() {
    return JSON.parse(fs.readFileSync(BANCO, "utf8"));
}

/* SALVAR BANCO */
function salvarBanco(dados) {
    fs.writeFileSync(BANCO, JSON.stringify(dados, null, 2));
}

/* PEGAR DADOS */
app.get("/dados", (req, res) => {
    res.json(lerBanco());
});

/* SALVAR DADOS */
app.post("/salvar", (req, res) => {
    const banco = lerBanco();

    banco.push(req.body);

    salvarBanco(banco);

    res.json({
        sucesso: true,
        mensagem: "Dados salvos!"
    });
});

/* EDITAR ITEM */
app.put("/editar/:id", (req, res) => {
    const banco = lerBanco();

    const id = parseInt(req.params.id);

    banco[id] = req.body;

    salvarBanco(banco);

    res.json({
        sucesso: true
    });
});

/* EXCLUIR ITEM */
app.delete("/excluir/:id", (req, res) => {
    const banco = lerBanco();

    const id = parseInt(req.params.id);

    banco.splice(id, 1);

    salvarBanco(banco);

    res.json({
        sucesso: true
    });
});

/* INICIAR SERVIDOR */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});