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

let dataEscolhida = document.getElementById("dataEntrega")?.value;
let dataAtual = dataEscolhida ? new Date(dataEscolhida + "T12:00:00") : new Date();
let dataFormatada = dataAtual.toLocaleDateString("pt-BR");

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

let novaData = prompt("Editar data (DD/MM/AAAA):", entrega.data);
if(novaData == null) return;

let novoHaver = prompt("Digite 💲 (Recebido) ou 📄 (Pendente)", entrega.haver || "📄");
if(novoHaver == null) return;

entrega.litros = Number(novoLitro);
entrega.data = novaData;

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

let hoje =
new Date().toLocaleDateString("pt-BR");

let totalDiaLitros = 0;

let totalDiaRecebido = 0;

let totalDiaPendente = 0;

let entregasHoje = [];

let entregasPorData = {};

banco.entregas.forEach(item => {

if(!entregasPorData[item.data]){

entregasPorData[item.data] = [];

}

entregasPorData[item.data].push(item);

if(item.data == hoje){

entregasHoje.push(item);

}

});

// Calcula totais apenas de HOJE
entregasHoje.forEach(item => {

let litros = Number(item.litros) || 0;

let valorTotal = Number(item.valorTotal) || 0;

let valorPago = Number(item.valorPago) || 0;

let saldo = valorTotal - valorPago;

totalDiaLitros += litros;

totalDiaRecebido += valorPago;

totalDiaPendente += saldo;

});

// Renderiza a tabela por data
for(let data in entregasPorData){

tabela.innerHTML += `

<tr style="background:#0f172a;">

<td colspan="9">

📅 <b>${data}</b>

</td>

</tr>

`;

// Adiciona cabeçalho repetido para cada data
tabela.innerHTML += `

<tr class="dataHeader">

<td>Cliente</td>
<td>Litros</td>
<td>Dia</td>
<td>Data</td>
<td>Val/L</td>
<td>Total</td>
<td>PAGO:</td>
<td>FIADO:</td>
<td>Ações</td>

</tr>

`;

entregasPorData[data].forEach(item => {

let valorTotal = Number(item.valorTotal) || 0;

let valorPago = Number(item.valorPago) || 0;

let saldo = valorTotal - valorPago;

// Classe para PAGO (branco se 0, verde se > 0)
let classePago = valorPago === 0 ? "pagoBranco" : "pagoVerde";

// Classe para FIADO (branco se 0, vermelho se > 0)
let classeFiado = saldo === 0 ? "fiadoBranco" : "fiadoVermelho";

tabela.innerHTML += `

<tr>

<td>${item.cliente}</td>

<td>${item.litros}L</td>

<td>${item.dia}</td>

<td>${item.data}</td>

<td>R$ ${banco.valorLitro.toFixed(2)}</td>

<td class="valorRecebido">R$ ${valorTotal.toFixed(2)}</td>

<td class="${classePago}">R$ ${valorPago.toFixed(2)}</td>

<td class="${classeFiado}">R$ ${saldo.toFixed(2)}</td>

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

// Atualiza totais apenas de HOJE
document.getElementById("totalDia").innerHTML =

"🥛 Total do Dia: "
+ totalDiaLitros + "L";

document.getElementById("totalRecebido").innerHTML =

"💰 Total Recebido: R$ "
+ totalDiaRecebido.toFixed(2);

document.getElementById("totalPendente").innerHTML =

"📄 Total Pendente: R$ "
+ totalDiaPendente.toFixed(2);

// Oculta totalSemana pois agora é apenas por dia
document.getElementById("totalSemana").style.display = "none";

}

// ======================
// PENDÊNCIAS DE HOJE
// ======================

function atualizarPendenciasMes(){

let container = document.getElementById("pendenciasMes");

container.innerHTML = "";

let hoje =
new Date().toLocaleDateString("pt-BR");

let pendenciasPorCliente = {};

banco.entregas.forEach(entrega => {

// Filtra apenas entregas de HOJE
if(entrega.data == hoje){

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

<p>Saldo devedor de hoje</p>

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

let hoje =
new Date().toLocaleDateString("pt-BR");

// Calcula o total devido do cliente HOJE
let totalDevido = 0;

banco.entregas.forEach(entrega => {

if(entrega.clienteId == clienteId && entrega.data == hoje){

let valorTotal = Number(entrega.valorTotal) || 0;

let valorPago = Number(entrega.valorPago) || 0;

let saldo = valorTotal - valorPago;

if(saldo > 0){

totalDevido += saldo;

}

}

});

if(totalDevido <= 0){

alert("Este cliente não possui pendências hoje!");

return;

}

let valorPagamento = prompt(`Total devido hoje: R$ ${totalDevido.toFixed(2)}\n\nDigite o valor que o cliente está pagando:`, "0.00");

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

// Distribui o pagamento nas entregas pendentes de HOJE
let restoPagamento = valorPagamento;

banco.entregas.forEach(entrega => {

if(entrega.clienteId == clienteId && 
   entrega.data == hoje &&
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
// DASHBOARD E PÁGINAS
// ======================
const titulosPaginas={dashboard:"Dashboard",clientes:"Clientes",entregas:"Fazer Entregas",relatorios:"Relatórios das Entregas",devedores:"Devedores","quem-somos":"Quem somos?"};
function mostrarPagina(nome){
 document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa"));
 document.getElementById(nome).classList.add("ativa");
 document.getElementById("tituloPagina").textContent=titulosPaginas[nome]||nome;
 if(nome==="relatorios") gerarRelatorio();
 if(nome==="devedores") atualizarPendenciasMes();
 document.querySelector(".sidebar").classList.remove("aberta");
}
function atualizarDashboard(){
 const el=id=>document.getElementById(id);
 if(!el("dashClientes"))return;
 let litros=0,divida=0;
 banco.entregas.forEach(e=>{litros+=Number(e.litros)||0;divida+=(Number(e.valorTotal)||0)-(Number(e.valorPago)||0)});
 el("dashClientes").textContent=banco.clientes.length; el("dashEntregas").textContent=banco.entregas.length;
 el("dashLitros").textContent=litros+"L"; el("dashDivida").textContent="R$ "+divida.toFixed(2);
}
function gerarRelatorio(){
 const alvo=document.getElementById("resultadoRelatorio"); if(!alvo)return;
 const valor=document.getElementById("dataRelatorio").value;
 let data=valor?new Date(valor+"T12:00:00").toLocaleDateString("pt-BR"):new Date().toLocaleDateString("pt-BR");
 const itens=banco.entregas.filter(e=>e.data===data); let litros=0,total=0,pago=0;
 itens.forEach(e=>{litros+=Number(e.litros)||0;total+=Number(e.valorTotal)||0;pago+=Number(e.valorPago)||0});
 let html=`<h3>📅 ${data}</h3>`;
 if(!itens.length){alvo.innerHTML=html+"<p>Nenhuma entrega nesta data.</p>";return;}
 html+=`<div class="tableWrap"><table><tr><th>Cliente</th><th>Litros</th><th>Total</th><th>Pago</th><th>Fiado</th></tr>`;
 itens.forEach(e=>{let fiado=(Number(e.valorTotal)||0)-(Number(e.valorPago)||0);html+=`<tr><td>${e.cliente}</td><td>${e.litros}L</td><td>R$ ${(Number(e.valorTotal)||0).toFixed(2)}</td><td>R$ ${(Number(e.valorPago)||0).toFixed(2)}</td><td>R$ ${fiado.toFixed(2)}</td></tr>`});
 html+=`</table></div><div class="totais"><div>🥛 ${litros}L</div><div>💰 Recebido: R$ ${pago.toFixed(2)}</div><div>📄 Em aberto: R$ ${(total-pago).toFixed(2)}</div></div>`; alvo.innerHTML=html;
}

// ======================
// INICIAR
// ======================

const _atualizarTabela=atualizarTabela; atualizarTabela=function(){_atualizarTabela();atualizarDashboard();};
const _atualizarClientes=atualizarClientes; atualizarClientes=function(){_atualizarClientes();atualizarDashboard();};
carregarBanco();
