/* FIREBASE */

const firebaseConfig = {

apiKey:
"AIzaSyDnsa34KhQ3wOlt8QoBeSMCbjpnwC-d3w0",

authDomain:
"trevodasorte-23ef1.firebaseapp.com",

projectId:
"trevodasorte-23ef1"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

let banco = {

clientes: [],

entregas: [],

valorLitro: 0

};

// ======================
// CARREGAR BANCO
// ======================

async function carregarBanco(){

try{

const doc = await db
.collection("leite")
.doc("entregas")
.get();

if(doc.exists){

banco = doc.data().dados;

}else{

await salvarBanco();

}

if(!banco.clientes){
banco.clientes = [];
}

if(!banco.entregas){
banco.entregas = [];
}

if(!banco.valorLitro){
banco.valorLitro = 0;
}

atualizarClientes();

atualizarTabela();

atualizarValorAtual();

atualizarPendenciasMes();

}catch(erro){

console.log(erro);

}

}

// ======================
// SALVAR BANCO
// ======================

async function salvarBanco(){

await db
.collection("leite")
.doc("entregas")
.set({

dados:banco

});

}

// ======================
// VALOR DO LITRO
// ======================

async function gravarValorLitro(){

if(!pedirSenha()) return;

let valor =
document.getElementById("valorLitro").value;

if(valor == ""){
alert("Digite um valor");
return;
}

banco.valorLitro = Number(valor);

await salvarBanco();

atualizarValorAtual();

atualizarTabela();

document.getElementById("valorLitro").value = "";

alert("Valor do litro atualizado com sucesso!");

}

function atualizarValorAtual(){

document.getElementById("valorAtual").innerHTML =
"Valor atual: R$ " + banco.valorLitro.toFixed(2);

}

// ======================
// CLIENTES
// ======================

async function cadastrarCliente(){

if(!pedirSenha()) return;

let nome =
document.getElementById("novoCliente")
.value.trim();

if(nome == ""){
alert("Digite um nome");
return;
}

banco.clientes.push({

id:"cliente_" + Date.now(),

nome:nome

});

await salvarBanco();

atualizarClientes();

document.getElementById("novoCliente").value="";

}

async function editarCliente(id){

if(!pedirSenha()) return;

let cliente =
banco.clientes.find(c => c.id == id);

let novoNome =
prompt("Editar nome:", cliente.nome);

if(novoNome === null) return;

cliente.nome = novoNome;

banco.entregas.forEach(entrega => {

if(entrega.clienteId == id){

entrega.cliente = novoNome;

}

});

await salvarBanco();

atualizarClientes();

atualizarTabela();

}

async function excluirCliente(id){

if(!pedirSenha()) return;

let confirmar =
confirm("Excluir cliente?");

if(!confirmar) return;

banco.clientes =
banco.clientes.filter(c => c.id != id);

banco.entregas =
banco.entregas.filter(e => e.clienteId != id);

await salvarBanco();

atualizarClientes();

atualizarTabela();

atualizarPendenciasMes();

}

// ======================
// SALVAR ENTREGA
// ======================

async function salvarEntrega(){

if(!pedirSenha()) return;

let clienteId =
document.getElementById("clienteSelect").value;

let litros =
document.getElementById("litros").value;

let dia =
document.getElementById("dia").value;

let haver =
document.getElementById("haver").value;

let valorManual =
document.getElementById("valor").value;

if(clienteId == "" || litros == ""){

alert("Preencha tudo");

return;

}

let cliente =
banco.clientes.find(c => c.id == clienteId);

let valorFinal = valorManual ? Number(valorManual) : (Number(litros) * banco.valorLitro);

let dataAtual = new Date();

let dataFormatada =
dataAtual.toLocaleDateString("pt-BR");

banco.entregas.push({

id:"entrega_" + Date.now(),

clienteId:cliente.id,

cliente:cliente.nome,

litros:Number(litros),

dia:dia,

data:dataFormatada,

haver:haver,

valor:valorFinal

});

await salvarBanco();

atualizarTabela();

atualizarPendenciasMes();

document.getElementById("litros").value="";

document.getElementById("valor").value="";

}

// ======================
// EDITAR ENTREGA (COM FUNÇÃO TROCAR INTEGRADA)
// ======================

async function editarEntrega(id){

if(!pedirSenha()) return;

let entrega =
banco.entregas.find(e => e.id == id);

let novoLitro =
prompt("Editar litros:", entrega.litros);

if(novoLitro == null) return;

let novoValor =
prompt("Editar valor:", entrega.valor || 0);

if(novoValor == null) return;

let novoHaver =
prompt("Digite 💲 (Recebido) ou 📄 (Pendente)",
entrega.haver || "📄");

if(novoHaver == null) return;

entrega.litros =
Number(novoLitro);

entrega.valor =
Number(novoValor);

entrega.haver =
novoHaver;

await salvarBanco();

atualizarTabela();

atualizarPendenciasMes();

}

// ======================
// EXCLUIR ENTREGA
// ======================

async function excluirEntrega(id){

if(!pedirSenha()) return;

let confirmar =
confirm("Excluir entrega?");

if(!confirmar) return;

banco.entregas =
banco.entregas.filter(e => e.id !== id);

await salvarBanco();

atualizarTabela();

atualizarPendenciasMes();

}

// ======================
// TABELA
// ======================

function atualizarTabela(){

let tabela =
document.getElementById("tabela");

tabela.innerHTML = "";

let totalSemana = 0;

let totalDia = 0;

let totalRecebido = 0;

let totalPendente = 0;

let hoje =
new Date().toLocaleDateString("pt-BR");

let entregasPorData = {};

banco.entregas.forEach(item => {

let litros =
Number(item.litros) || 0;

let valor =
Number(item.valor) || 0;

totalSemana += litros;

if(item.data == hoje){

totalDia += litros;

}

if(item.haver == "💲"){

totalRecebido += valor;

}else{

totalPendente += valor;

}

if(!entregasPorData[item.data]){

entregasPorData[item.data] = [];

}

entregasPorData[item.data].push(item);

});

for(let data in entregasPorData){

tabela.innerHTML += `

<tr style="background:#0f172a;">

<td colspan="8">

📅 <b>${data}</b>

</td>

</tr>

`;

entregasPorData[data].forEach(item => {

let classeHaver =
item.haver == "💲"
? "haverPago"
: "haverPendente";

let classeValor =
item.haver == "💲"
? "valorRecebido"
: "valorPendente";

let valorLinha = Number(item.litros) * banco.valorLitro;

tabela.innerHTML += `

<tr>

<td>${item.cliente}</td>

<td>${item.litros}L</td>

<td>${item.dia}</td>

<td>${item.data}</td>

<td>R$ ${valorLinha.toFixed(2)}</td>

<td class="${classeHaver}">
${item.haver}
</td>

<td class="${classeValor}">
${item.valor
? "R$ " + Number(item.valor).toFixed(2)
: "-"}
</td>

<td>

<button class="editar"
onclick="editarEntrega('${item.id}')">
Editar
</button>

<button class="excluir"
onclick="excluirEntrega('${item.id}')">
Excluir
</button>

</td>

</tr>

`;

});

}

document.getElementById("totalDia").innerHTML =

"🥛 Total do Dia: "
+ totalDia + "L";

document.getElementById("totalSemana").innerHTML =

"📦 Total da Semana: "
+ totalSemana + "L";

document.getElementById("totalRecebido").innerHTML =

"💰 Total Recebido: R$ "
+ totalRecebido.toFixed(2);

document.getElementById("totalPendente").innerHTML =

"📄 Total Pendente: R$ "
+ totalPendente.toFixed(2);

}

// ======================
// PENDÊNCIAS DO MÊS
// ======================

function atualizarPendenciasMes(){

let container = document.getElementById("pendenciasMes");

container.innerHTML = "";

let mesAtual = new Date().getMonth();

let anoAtual = new Date().getFullYear();

let pendenciasPorCliente = {};

banco.entregas.forEach(entrega => {

let dataParts = entrega.data.split("/");

let diaEntrega = parseInt(dataParts[0]);

let mesEntrega = parseInt(dataParts[1]) - 1;

let anoEntrega = parseInt(dataParts[2]);

if(mesEntrega == mesAtual && anoEntrega == anoAtual && entrega.haver == "📄"){

if(!pendenciasPorCliente[entrega.clienteId]){

pendenciasPorCliente[entrega.clienteId] = {

nome: entrega.cliente,

total: 0

};

}

pendenciasPorCliente[entrega.clienteId].total += Number(entrega.valor);

}

});

let temPendencias = false;

for(let clienteId in pendenciasPorCliente){

temPendencias = true;

let pendencia = pendenciasPorCliente[clienteId];

container.innerHTML += `

<div class="pendenciaItem">

<div class="pendenciaInfo">

<h4>${pendencia.nome}</h4>

<p>Pendente do mês</p>

</div>

<div class="pendenciaValor">
R$ ${pendencia.total.toFixed(2)}
</div>

<button class="botaoRecebido"
onclick="darBaixaPendencias('${clienteId}')">
Recebido
</button>

</div>

`;

}

if(!temPendencias){

container.innerHTML = `<div class="semPendencias">✅ Sem pendências!</div>`;

}

}

// ======================
// DAR BAIXA EM PENDÊNCIAS
// ======================

async function darBaixaPendencias(clienteId){

if(!pedirSenha()) return;

let confirmar = confirm("Marcar todas as entregas pendentes como recebidas?");

if(!confirmar) return;

let mesAtual = new Date().getMonth();

let anoAtual = new Date().getFullYear();

banco.entregas.forEach(entrega => {

let dataParts = entrega.data.split("/");

let mesEntrega = parseInt(dataParts[1]) - 1;

let anoEntrega = parseInt(dataParts[2]);

if(entrega.clienteId == clienteId && 
   mesEntrega == mesAtual && 
   anoEntrega == anoAtual && 
   entrega.haver == "📄"){

entrega.haver = "💲";

}

});

await salvarBanco();

atualizarTabela();

atualizarPendenciasMes();

alert("Pagamento registrado com sucesso!");

}

// ======================
// SENHA
// ======================

const SENHA_ADMIN = "1234";

function pedirSenha(){

let senha =
prompt("Digite a senha:");

if(senha != SENHA_ADMIN){

alert("Senha incorreta!");

return false;

}

return true;

}

// ======================
// LIMPAR BANCO
// ======================

async function limparBanco(){

if(!pedirSenha()) return;

let confirmar =
confirm("Apagar tudo?");

if(!confirmar) return;

banco = {

clientes: [],

entregas: [],

valorLitro: 0

};

await salvarBanco();

atualizarClientes();

atualizarTabela();

atualizarValorAtual();

atualizarPendenciasMes();

}

// ======================
// BACKUP
// ======================

function baixarBanco(){

let dados =
JSON.stringify(banco, null, 2);

let blob =
new Blob([dados], {

type:"application/json"

});

let link =
document.createElement("a");

link.href =
URL.createObjectURL(blob);

link.download =
"banco.json";

link.click();

}

async function restaurarBackup(event){

let arquivo =
event.target.files[0];

if(!arquivo) return;

let leitor =
new FileReader();

leitor.onload =
async function(e){

banco =
JSON.parse(e.target.result);

await salvarBanco();

atualizarClientes();

atualizarTabela();

atualizarValorAtual();

atualizarPendenciasMes();

};

leitor.readAsText(arquivo);

}

// ======================
// ATUALIZAR CLIENTES
// ======================

function atualizarClientes(){

let lista =
document.getElementById("listaClientes");

let select =
document.getElementById("clienteSelect");

lista.innerHTML = "";

select.innerHTML = "";

banco.clientes.forEach(cliente => {

lista.innerHTML += `

<p>

${cliente.nome}

<button class="editar"
onclick="editarCliente('${cliente.id}')">

Editar

</button>

<button class="excluir"
onclick="excluirCliente('${cliente.id}')">

Excluir

</button>

</p>

`;

select.innerHTML += `

<option value="${cliente.id}">
${cliente.nome}
</option>

`;

});

}

// ======================
// INICIAR
// ======================

carregarBanco();
