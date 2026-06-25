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

let valorPago =
document.getElementById("valor").value;

if(clienteId == "" || litros == ""){

alert("Preencha tudo");

return;

}

let cliente =
banco.clientes.find(c => c.id == clienteId);

let valorTotal = Number(litros) * banco.valorLitro;

let pagamento = valorPago ? Number(valorPago) : 0;

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

valorTotal:valorTotal,

valorPago:pagamento

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

let novoValorPago =
prompt("Editar valor pago:", entrega.valorPago || 0);

if(novoValorPago == null) return;

let novoHaver =
prompt("Digite 💲 (Recebido) ou 📄 (Pendente)",
entrega.haver || "📄");

if(novoHaver == null) return;

entrega.litros = Number(novoLitro);

entrega.valorTotal = Number(novoLitro) * banco.valorLitro;

entrega.valorPago = Number(novoValorPago);

entrega.haver = novoHaver;

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

let valorTotal =
Number(item.valorTotal) || 0;

let valorPago =
Number(item.valorPago) || 0;

let saldo = valorTotal - valorPago;

totalSemana += litros;

if(item.data == hoje){

totalDia += litros;

}

totalRecebido += valorPago;

totalPendente += saldo;

if(!entregasPorData[item.data]){

entregasPorData[item.data] = [];

}

entregasPorData[item.data].push(item);

});

for(let data in entregasPorData){

tabela.innerHTML += `

<tr style="background:#0f172a;">

<td colspan="9">

📅 <b>${data}</b>

</td>

</tr>

`;

entregasPorData[data].forEach(item => {

let classeHaver =
item.haver == "💲"
? "haverPago"
: "haverPendente";

let valorTotal = Number(item.valorTotal) || 0;

let valorPago = Number(item.valorPago) || 0;

let saldo = valorTotal - valorPago;

let classeSaldo = saldo > 0 ? "saldoDevedor" : "saldoZero";

let valorLinha = Number(item.litros) * banco.valorLitro;

tabela.innerHTML += `

<tr>

<td>${item.cliente}</td>

<td>${item.litros}L</td>

<td>${item.dia}</td>

<td>${item.data}</td>

<td>R$ ${banco.valorLitro.toFixed(2)}</td>

<td class="valorRecebido">R$ ${valorTotal.toFixed(2)}</td>

<td class="valorRecebido">R$ ${valorPago.toFixed(2)}</td>

<td class="${classeSaldo}">R$ ${saldo.toFixed(2)}</td>

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

if(mesEntrega == mesAtual && anoEntrega == anoAtual){

let valorTotal = Number(entrega.valorTotal) || 0;

let valorPago = Number(entrega.valorPago) || 0;

let saldo = valorTotal - valorPago;

if(saldo > 0){

if(!pendenciasPorCliente[entrega.clienteId]){

pendenciasPorCliente[entrega.clienteId] = {

nome: entrega.cliente,

total: 0

};

}

pendenciasPorCliente[entrega.clienteId].total += saldo;

}

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

<p>Saldo devedor do mês</p>

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
// DAR BAIXA EM PENDÊNCIAS (COM PAGAMENTO PARCIAL)
// ======================

async function darBaixaPendencias(clienteId){

if(!pedirSenha()) return;

let mesAtual = new Date().getMonth();

let anoAtual = new Date().getFullYear();

// Calcula o total devido do cliente no mês
let totalDevido = 0;

banco.entregas.forEach(entrega => {

let dataParts = entrega.data.split("/");

let mesEntrega = parseInt(dataParts[1]) - 1;

let anoEntrega = parseInt(dataParts[2]);

if(entrega.clienteId == clienteId && 
   mesEntrega == mesAtual && 
   anoEntrega == anoAtual){

let valorTotal = Number(entrega.valorTotal) || 0;

let valorPago = Number(entrega.valorPago) || 0;

let saldo = valorTotal - valorPago;

if(saldo > 0){

totalDevido += saldo;

}

}

});

if(totalDevido <= 0){

alert("Este cliente não possui pendências!");

return;

}

let valorPagamento = prompt(`Total devido: R$ ${totalDevido.toFixed(2)}\n\nDigite o valor que o cliente está pagando:`, "0.00");

if(valorPagamento === null) return;

valorPagamento = Number(valorPagamento);

if(valorPagamento <= 0){

alert("Digite um valor válido!");

return;

}

if(valorPagamento > totalDevido){

alert("O valor informado é maior que a dívida total! Ajuste o valor.");

return;

}

// Distribui o pagamento nas entregas pendentes
let restoPagamento = valorPagamento;

banco.entregas.forEach(entrega => {

let dataParts = entrega.data.split("/");

let mesEntrega = parseInt(dataParts[1]) - 1;

let anoEntrega = parseInt(dataParts[2]);

if(entrega.clienteId == clienteId && 
   mesEntrega == mesAtual && 
   anoEntrega == anoAtual &&
   restoPagamento > 0){

let valorTotal = Number(entrega.valorTotal) || 0;

let valorPago = Number(entrega.valorPago) || 0;

let saldo = valorTotal - valorPago;

if(saldo > 0){

if(restoPagamento >= saldo){

// Paga totalmente esta entrega
entrega.valorPago = valorTotal;

entrega.haver = "💲";

restoPagamento -= saldo;

}else{

// Paga parcialmente esta entrega
entrega.valorPago += restoPagamento;

restoPagamento = 0;

}

}

}

});

await salvarBanco();

atualizarTabela();

atualizarPendenciasMes();

alert("Pagamento de R$ " + valorPagamento.toFixed(2) + " registrado com sucesso!");

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
