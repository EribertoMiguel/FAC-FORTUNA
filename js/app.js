const $ = id => document.getElementById(id);
const DB_NAME = "OneStateLocalDB";
const DB_VERSION = 1;
let db;
let members=[], entries=[], settings={ratio:10,warehouse:2500,vault:250,machines:5,essMachine:250,cycle:482,deliveryQty:120,deliveryCount:4};
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const n=v=>Number(v)||0, fmt=v=>n(v).toLocaleString("pt-BR");
const uid=()=>crypto.randomUUID();
function openDB(){
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=()=>{
   const d=req.result;
   if(!d.objectStoreNames.contains("members"))d.createObjectStore("members",{keyPath:"id"});
   if(!d.objectStoreNames.contains("entries"))d.createObjectStore("entries",{keyPath:"id"});
   if(!d.objectStoreNames.contains("settings"))d.createObjectStore("settings",{keyPath:"id"});
   if(!d.objectStoreNames.contains("admin"))d.createObjectStore("admin",{keyPath:"id"});
  };
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
}
function store(name,mode="readonly"){
 return db.transaction(name,mode).objectStore(name);
}
function getAll(name){return new Promise((resolve,reject)=>{const r=store(name).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
function put(name,value){return new Promise((resolve,reject)=>{const tx=db.transaction(name,"readwrite");tx.objectStore(name).put(value);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
function remove(name,id){return new Promise((resolve,reject)=>{const tx=db.transaction(name,"readwrite");tx.objectStore(name).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function clearStore(name){return new Promise((resolve,reject)=>{const tx=db.transaction(name,"readwrite");tx.objectStore(name).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
const DEFAULT_SETTINGS={id:1,ratio:10,warehouse_capacity:2500,vault_capacity:250,machines:5,essence_per_machine:250,cycle_minutes:482,delivery_quantity:120,delivery_count:4};
const INITIAL_MEMBERS=[{"id": "6516b785-8c9c-4f3b-b3f0-44620f864f8c", "name": "Dudinha Mazzi", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 35, "game_level": 7, "member_rank": "PISTA", "honor_points": 43350, "activity": "17 h"}, {"id": "98135a2d-1206-48e0-a3dc-3016e2d0e99b", "name": "Tralha Lenin", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 25, "game_level": 8, "member_rank": "PISTA", "honor_points": 43882, "activity": "1 d"}, {"id": "14d267bd-a56b-4171-b1f1-a2068960e098", "name": "Dawson Davies", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 30, "game_level": 9, "member_rank": "PISTA", "honor_points": 117959, "activity": "14 h"}, {"id": "fbf82e99-0d0b-495f-a77d-745be87f6a33", "name": "Tempestade Kl", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 28, "game_level": 10, "member_rank": "PISTA", "honor_points": 377210, "activity": "Online"}, {"id": "e3c9edcc-ac22-415f-8fcb-ed1f918d58a9", "name": "Mckevin Richard", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 20, "game_level": 11, "member_rank": "PISTA", "honor_points": 26324, "activity": "1 d"}, {"id": "81720b1a-b0b1-4b40-bb11-b738acd0b064", "name": "Joker Suicida", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 16, "game_level": 12, "member_rank": "PISTA", "honor_points": 49020, "activity": "1 d"}, {"id": "315b4b15-b7f0-435b-907c-256e48fe2f75", "name": "Tiago Lobo", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 29, "game_level": 13, "member_rank": "CRIA", "honor_points": 189308, "activity": "1 h"}, {"id": "1d943ff4-2a56-49cc-9cdb-b0b149a03d70", "name": "Pedrinho Targaryen", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 26, "game_level": 14, "member_rank": "CRIA", "honor_points": 271274, "activity": "3 h"}, {"id": "1ba80737-8c26-4ca9-8598-683b1419f249", "name": "Clayton Clg", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 29, "game_level": 15, "member_rank": "CRIA", "honor_points": 132719, "activity": "20 h"}, {"id": "7bc393d2-574a-4c88-b73f-9e9f87132d1d", "name": "Kelvin Duran", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 29, "game_level": 16, "member_rank": "CRIA", "honor_points": 237622, "activity": "12 min"}, {"id": "18bf0645-f247-4fb5-9e70-2512396794c1", "name": "John Shefft", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 27, "game_level": 17, "member_rank": "CRIA", "honor_points": 178178, "activity": "1 h"}, {"id": "f455d42d-72a1-407d-8616-7599d23eabcd", "name": "Sr Matue", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 24, "game_level": 18, "member_rank": "CRIA", "honor_points": 600, "activity": "2 d"}, {"id": "9a19bd13-d2eb-4810-a33b-9ebd8042bd1e", "name": "Paivaa Lenin", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 34, "game_level": 19, "member_rank": "CRIA", "honor_points": 34770, "activity": "Online"}, {"id": "98a53c93-a7c9-4d08-9abe-e6c514914f2b", "name": "Gomes Profiro", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 25, "game_level": 20, "member_rank": "CRIA", "honor_points": 191220, "activity": "26 min"}, {"id": "5db51179-8bbe-4dcc-9cc6-671125eb04c6", "name": "Erick Rodrigues", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 24, "game_level": 21, "member_rank": "CRIA", "honor_points": 337768, "activity": "37 min"}, {"id": "dc81bc5c-6287-420f-b330-695c2360344c", "name": "Dmitry Haedchottet", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 20, "game_level": 22, "member_rank": "CRIA", "honor_points": 218642, "activity": "11 min"}, {"id": "72adcf90-c6fa-4c45-a7e4-7626b1a1a495", "name": "Stany Targaryen", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 32, "game_level": 23, "member_rank": "CRIA", "honor_points": 39960, "activity": "15 h"}, {"id": "a32ab3cf-f071-4abb-961f-027b57117f89", "name": "Rlk Pk", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 36, "game_level": 24, "member_rank": "CRIA", "honor_points": 26560, "activity": "2 h"}, {"id": "34e7ce9d-81c3-4828-bd9d-9e895a7e645a", "name": "Pesadelo Umcincosete", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 30, "game_level": 31, "member_rank": "CRIA", "honor_points": 25570, "activity": "Online"}, {"id": "fb6d0966-d222-4faa-bb17-95e5b6731715", "name": "Angel Baby", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 30, "game_level": 32, "member_rank": "CRIA", "honor_points": 107882, "activity": "38 min"}, {"id": "f11ebf8b-7970-4171-b2c7-c953f55edd8c", "name": "Alivz Mazzi", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 32, "game_level": 33, "member_rank": "CRIA", "honor_points": 59239, "activity": "18 h"}, {"id": "cf882e87-9061-4340-9f73-1713a5b28c4e", "name": "Sr Achilles", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 22, "game_level": 34, "member_rank": "CRIA", "honor_points": 3540, "activity": "23 h"}, {"id": "3ff1c906-3474-4702-8b72-262aea9ab13b", "name": "Coringa Avs", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 23, "game_level": 35, "member_rank": "CRIA", "honor_points": 9670, "activity": "23 h"}, {"id": "7dbcc692-dbf2-4bae-ac58-15dfcaf55051", "name": "Nadine Targaryen", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 38, "game_level": 36, "member_rank": "CRIA", "honor_points": 202592, "activity": "9 h"}, {"id": "e995bee8-7867-47b3-b1dc-fd522b67de93", "name": "Bzbinhazaya Mazzi", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 22, "game_level": 37, "member_rank": "CRIA", "honor_points": 105426, "activity": "2 h"}, {"id": "9369eeed-85af-4500-9a5c-652ca811c009", "name": "Flor Derejeira", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 34, "game_level": 38, "member_rank": "CRIA", "honor_points": 141970, "activity": "4 h"}, {"id": "fbb63f5e-154d-462b-a125-abeae1241e8c", "name": "Mirna Targaryen", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 32, "game_level": 39, "member_rank": "CRIA", "honor_points": 120, "activity": "55 min"}, {"id": "4e46b696-3e4d-4363-93ea-8e188a1ac69c", "name": "Luaa Mazzarati", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 26, "game_level": 40, "member_rank": "CRIA", "honor_points": 11600, "activity": "1 h"}, {"id": "7e670b05-e09b-4a04-b685-fa1e6580c6fd", "name": "Bradock Kille", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 30, "game_level": 41, "member_rank": "CRIA", "honor_points": 21364, "activity": "2 h"}, {"id": "8d56c2e4-abf2-4b43-9d2d-eefd85e531cb", "name": "Guuh Eduuh", "team": "Sem equipe", "daily_essence": 0, "delivery_per_operation": 120, "active": true, "roster_position": 31, "game_level": 42, "member_rank": "CRIA", "honor_points": 183175, "activity": "Online"}];
async function initializeData(){
 const existing=await getAll("members");
 if(!existing.length){for(const m of INITIAL_MEMBERS)await put("members",m)}
 const current=await store("settings").get(1);
 await new Promise((resolve,reject)=>{current.onsuccess=async()=>{try{if(!current.result)await put("settings",DEFAULT_SETTINGS);resolve()}catch(e){reject(e)}};current.onerror=()=>reject(current.error)});
}
function requireAdmin(){if(!isAdmin()){toast("Entre na Área do Administrador para realizar esta ação.");return false}return true}
function toast(msg){$("toast").textContent=msg;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",3500)}
function msgLogin(msg){$("loginMessage").textContent=msg}
function isAdmin(){return sessionStorage.getItem("onestate_admin_token")==="local-admin"}
async function hashPassword(password,saltHex){
 const salt=saltHex?Uint8Array.from(saltHex.match(/.{1,2}/g).map(x=>parseInt(x,16))):crypto.getRandomValues(new Uint8Array(16));
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
 const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:210000,hash:"SHA-256"},key,256);
 return {salt:Array.from(salt,b=>b.toString(16).padStart(2,"0")).join(""),hash:Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,"0")).join("")};
}

async function ensureDefaultAdmin(){
 const admins=await getAll("admin");
 if(admins.length) return; // preserva qualquer administrador já cadastrado
 const secured=await hashPassword("adm");
 await put("admin",{id:1,username:"adm",salt:secured.salt,password_hash:secured.hash,created_at:new Date().toISOString(),default_credentials:true});
}

async function start(){
 try{db=await openDB();await initializeData();await ensureDefaultAdmin();}catch(err){console.error(err);toast("Não foi possível abrir o armazenamento local deste navegador.");return}
 if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
 if(isAdmin())await showApp();else await showPublic();
}
async function showPublic(){
 document.body.classList.remove("admin-mode");
 $("loginView").classList.add("hidden");$("appView").classList.remove("hidden");
 $("adminLoginBtn").classList.remove("hidden");$("logoutBtn").classList.add("hidden");
 document.querySelectorAll(".tab,.page").forEach(x=>x.classList.remove("active"));
 document.querySelector('.tab[data-page="dashboard"]').classList.add("active");$("dashboard").classList.add("active");
 await loadAll();
}
function showAdminLogin(){
 $("adminLoginPanel").classList.remove("hidden");$("adminRegisterPanel").classList.add("hidden");
 msgLogin("Informe o usuário e a senha administrativa.");
}
$("adminLoginBtn").onclick=()=>{$("loginView").classList.remove("hidden");$("appView").classList.add("hidden");showAdminLogin()};
$("showAdminRegister").onclick=async()=>{
 const admins=await getAll("admin");
 if(admins.length){msgLogin("O administrador já foi cadastrado. Utilize a tela de entrada.");return}
 $("adminLoginPanel").classList.add("hidden");$("adminRegisterPanel").classList.remove("hidden");
 msgLogin("Crie o primeiro acesso administrativo. Este cadastro só pode ser feito uma vez.");
};
$("backToAdminLogin").onclick=showAdminLogin;
$("adminRegisterForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const username=$("newAdminUsername").value.trim(),password=$("newAdminPassword").value,confirmPassword=$("confirmAdminPassword").value;
 if(username.length<3||username.length>40){msgLogin("O usuário deve ter entre 3 e 40 caracteres.");return}
 if(password.length<3){msgLogin("A senha deve ter pelo menos 3 caracteres.");return}
 if(password!==confirmPassword){msgLogin("As senhas informadas não são iguais.");return}
 msgLogin("Criando administrador neste computador...");
 const admins=await getAll("admin");if(admins.length){msgLogin("Já existe um administrador cadastrado neste navegador.");showAdminLogin();return}
 const secured=await hashPassword(password);
 await put("admin",{id:1,username,salt:secured.salt,password_hash:secured.hash,created_at:new Date().toISOString()});
 $("username").value=username;$("password").value="";
 sessionStorage.setItem("onestate_admin_token","local-admin");
 msgLogin("Administrador cadastrado com sucesso.");await showApp();
});
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();msgLogin("Verificando acesso...");
 const username=$("username").value.trim(),password=$("password").value;
 const admin=await new Promise((resolve,reject)=>{const r=store("admin").get(1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
 if(!admin||admin.username!==username){msgLogin("Usuário ou senha inválidos.");return}
 const test=await hashPassword(password,admin.salt);
 if(test.hash!==admin.password_hash){msgLogin("Usuário ou senha inválidos.");return}
 sessionStorage.setItem("onestate_admin_token","local-admin");await showApp();
});
$("logoutBtn").onclick=async()=>{sessionStorage.removeItem("onestate_admin_token");await showPublic()};
async function showApp(){
 if(!isAdmin()){await showPublic();return}
 document.body.classList.add("admin-mode");
 $("loginView").classList.add("hidden");$("appView").classList.remove("hidden");
 $("adminLoginBtn").classList.add("hidden");$("logoutBtn").classList.remove("hidden");
 await loadAll();
}
async function loadAll(){
 const [m,e,s]=await Promise.all([getAll("members"),getAll("entries"),new Promise((resolve,reject)=>{const r=store("settings").get(1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})]);
 members=m.sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
 entries=e.map(x=>({...x,members:{name:members.find(m=>m.id===x.member_id)?.name||"—"}})).sort((a,b)=>b.entry_date.localeCompare(a.entry_date));
 if(s)settings={ratio:s.ratio,warehouse:s.warehouse_capacity,vault:s.vault_capacity,machines:s.machines,essMachine:s.essence_per_machine,cycle:s.cycle_minutes,deliveryQty:s.delivery_quantity,deliveryCount:s.delivery_count};
 fillSettings();render();timerCycleMinutes=settings.cycle;$("timerCycle").value=settings.cycle;renderTimers();
 $("simEssence").value=settings.warehouse;$("simMachines").value=settings.machines;$("simEssMachine").value=settings.essMachine;
 $("simRatio").value=settings.ratio;$("simHours").value=Math.floor(settings.cycle/60);$("simMinutes").value=settings.cycle%60;
 $("simTarget").value=settings.deliveryQty*settings.deliveryCount;runSimulation();
}
function fillSettings(){for(const [id,v] of Object.entries({sRatio:settings.ratio,sWarehouse:settings.warehouse,sVault:settings.vault,sMachines:settings.machines,sEssMachine:settings.essMachine,sCycle:settings.cycle,sDeliveryQty:settings.deliveryQty,sDeliveryCount:settings.deliveryCount}))$(id).value=v}
function jewels(ess){return Math.floor(n(ess)/settings.ratio)}
function render(){
 const date=$("dashDate").value||today(),day=entries.filter(x=>x.entry_date===date),ess=day.reduce((a,x)=>a+n(x.essence),0),del=day.filter(x=>x.status==="Sim").reduce((a,x)=>a+n(x.jewels),0);
 $("kEssence").textContent=fmt(ess);$("kJewels").textContent=fmt(jewels(ess));$("kDelivered").textContent=fmt(del);$("kMembers").textContent=members.filter(x=>x.active).length;
 $("dailySummary").innerHTML=`<p>Meta diária: <b>${fmt(settings.deliveryQty*settings.deliveryCount)} joias</b></p><p>Falta entregar: <b>${fmt(Math.max(0,settings.deliveryQty*settings.deliveryCount-del))}</b></p><p>Lançamentos do dia: <b>${day.length}</b></p>`;
 $("productionSummary").innerHTML=`<p>Máquinas: <b>${settings.machines}</b></p><p>Essências por ciclo simultâneo: <b>${fmt(settings.machines*settings.essMachine)}</b></p><p>Produção por ciclo: <b>${fmt(jewels(settings.machines*settings.essMachine))} joias</b></p><p>Produção teórica em 24h: <b>${fmt(settings.machines*settings.essMachine/settings.ratio*1440/settings.cycle)} joias</b></p>`;
 $("middayGoal").textContent=fmt(2*settings.deliveryQty)+" joias";$("eveningGoal").textContent=fmt(2*settings.deliveryQty)+" joias";
 $("entryMember").innerHTML='<option value="">Selecione</option>'+members.filter(x=>x.active).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("");
 $("membersTable").innerHTML=members.map(m=>`<tr><td>${esc(m.name)}</td><td>${esc(m.team)}</td><td>${fmt(m.daily_essence)}</td><td>${fmt(m.delivery_per_operation)}</td><td>${fmt(m.honor_points||0)}</td></tr>`).join("")||'<tr><td colspan="5">Nenhum membro cadastrado.</td></tr>';
 $("rosterCount").textContent=`${members.length}/45`;
 const ranked=members.slice().sort((a,b)=>n(b.honor_points)-n(a.honor_points));
 $("publicRoster").innerHTML=ranked.map((m,i)=>`<tr><td>${i+1}</td><td><b>${esc(m.name)}</b></td><td>${fmt(m.honor_points||0)}</td></tr>`).join("")||'<tr><td colspan="3">Nenhum membro cadastrado.</td></tr>';
 $("topMembers").innerHTML=ranked.slice(0,5).map((m,i)=>`<div class="top-member"><span class="top-position">${i+1}º</span><div class="top-name"><b>${esc(m.name)}</b><small>${esc(m.team||"Sem equipe")}</small></div><strong>${fmt(m.honor_points||0)} <small>pontos</small></strong></div>`).join("")||'<p class="muted">Cadastre membros para formar o ranking.</p>';

 $("entriesTable").innerHTML=entries.filter(x=>(!$("filterDate").value||x.entry_date===$("filterDate").value)&&(!$("filterTeam").value||x.team===$("filterTeam").value)&&(!$("filterStatus").value||x.status===$("filterStatus").value)).map(x=>`<tr><td>${x.entry_date}</td><td>${esc(x.members?.name||"—")}</td><td>${x.kind==="production"?"Produção":"Entrega"}</td><td>${fmt(x.essence)}</td><td>${fmt(x.jewels)}</td><td>${esc(x.team)}</td><td>${esc(x.time_slot||"—")}</td><td>${esc(x.status)}</td><td><button class="secondary" data-status="${x.id}">Alterar status</button> <button class="secondary" data-delete="${x.id}">Excluir</button></td></tr>`).join("")||'<tr><td colspan="9">Nenhum lançamento.</td></tr>';
 $("teamCards").innerHTML=["Carro 1","Carro 2","Carro 3"].map(t=>{const r=entries.filter(x=>x.team===t),d=r.filter(x=>x.status==="Sim").reduce((a,x)=>a+n(x.jewels),0),e=r.reduce((a,x)=>a+n(x.essence),0);return `<div class="team-card"><h3>${t}</h3><strong>${fmt(d)} joias entregues</strong><p>${fmt(e)} essências registradas</p><small>${members.filter(m=>m.team===t&&m.active).length} membros ativos</small></div>`}).join("");
 $("calcSummary").innerHTML=`<p>Armazém: ${fmt(settings.warehouse)} essências = ${fmt(jewels(settings.warehouse))} joias.</p><p>Meta de entregas: ${fmt(settings.deliveryQty*settings.deliveryCount)} joias/dia.</p>`;
}
// Simulador: cálculos independentes, sem gravar dados no banco.
function runSimulation(){
 const essence=n($("simEssence").value),machines=Math.max(1,n($("simMachines").value)),perMachine=Math.max(1,n($("simEssMachine").value)),ratio=Math.max(1,n($("simRatio").value)),cycle=Math.max(1,n($("simHours").value)*60+n($("simMinutes").value)),target=n($("simTarget").value),initial=n($("simJewels").value);
 const perCycleEss=machines*perMachine,cycles=Math.floor(essence/perCycleEss),jewelsCycle=Math.floor(perCycleEss/ratio),produced=cycles*jewelsCycle,available=initial+produced,shortage=Math.max(0,target-available),dayCycles=1440/cycle,daily=Math.floor(dayCycles*jewelsCycle),neededEss=Math.ceil(target/Math.max(1,jewelsCycle))*perCycleEss;
 $("simulationResult").innerHTML=`<div class="result-card"><small>Joias por ciclo completo</small><strong>${fmt(jewelsCycle)}</strong><p>${fmt(perCycleEss)} essências consumidas</p></div><div class="result-card"><small>Ciclos possíveis com estoque</small><strong>${fmt(cycles)}</strong><p>Estoque de essência: ${fmt(essence)}</p></div><div class="result-card"><small>Joias produzidas no cenário</small><strong>${fmt(produced)}</strong><p>Mais ${fmt(initial)} joias de estoque inicial</p></div><div class="result-card"><small>Total disponível para entrega</small><strong>${fmt(available)}</strong><p>Meta informada: ${fmt(target)} joias</p></div><div class="result-card"><small>Saldo após entregas</small><strong class="${shortage?'warning-text':'success-text'}">${shortage?`Faltam ${fmt(shortage)}`:`Sobram ${fmt(available-target)}`}</strong><p>${shortage?'Será necessário produzir ou obter mais joias':'Meta atendida neste cenário'}</p></div><div class="result-card"><small>Projeção em 24 horas</small><strong>${fmt(daily)} joias</strong><p>${dayCycles.toFixed(2).replace(".",",")} ciclos equivalentes; ciclo de ${Math.floor(cycle/60)}h${String(cycle%60).padStart(2,'0')}</p></div><div class="result-card"><small>Essência para cobrir a meta</small><strong>${fmt(neededEss)}</strong><p>Estimativa em ciclos completos, sem considerar estoque inicial de joias</p></div>`;
}
$("runSimulation").onclick=runSimulation;
$("resetSimulation").onclick=()=>{$("simEssence").value=settings.warehouse;$("simMachines").value=settings.machines;$("simEssMachine").value=settings.essMachine;$("simRatio").value=settings.ratio;$("simHours").value=Math.floor(settings.cycle/60);$("simMinutes").value=settings.cycle%60;$("simTarget").value=settings.deliveryQty*settings.deliveryCount;$("simJewels").value=0;runSimulation()};

// Temporizadores independentes por máquina. A contagem usa timestamp para continuar correta após atualizar a página.
const TIMER_KEY="onestate_machine_timers_v1";
let timerCycleMinutes=482,timerState={};
try{timerState=JSON.parse(localStorage.getItem(TIMER_KEY)||"{}")}catch{timerState={}}
const timerDuration=()=>Math.max(1,timerCycleMinutes)*60000;
function saveTimers(){localStorage.setItem(TIMER_KEY,JSON.stringify(timerState))}
function remainingFor(i){const t=timerState[i];if(!t)return timerDuration();if(t.running)return Math.max(0,t.remaining-(Date.now()-t.startedAt));return Math.max(0,t.remaining)}
function startTimer(i){let t=timerState[i]||{remaining:timerDuration(),running:false};if(t.remaining<=0)t.remaining=timerDuration();timerState[i]={remaining:t.remaining,startedAt:Date.now(),running:true};saveTimers();renderTimers()}
function pauseTimer(i){const t=timerState[i];if(!t?.running)return;t.remaining=remainingFor(i);t.running=false;saveTimers();renderTimers()}
function resetTimer(i){timerState[i]={remaining:timerDuration(),running:false};saveTimers();renderTimers()}
function timerClock(ms){const total=Math.ceil(ms/1000),h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function renderTimers(){
 const duration=timerDuration();$("machineTimers").innerHTML=Array.from({length:settings.machines},(_,idx)=>{const i=idx+1,t=timerState[i]||{remaining:duration,running:false},left=remainingFor(i),running=!!t.running&&left>0,progress=Math.min(100,Math.max(0,(1-left/duration)*100)),state=left<=0?"Ciclo concluído":running?"Em produção":"Pausado / aguardando";return `<article class="machine-timer"><h3>Máquina ${i}</h3><div class="timer-state ${running?'running':''}">${state}</div><div class="timer-display" data-clock="${i}">${timerClock(left)}</div><div class="timer-progress"><span style="width:${progress}%"></span></div><p>${Math.round(progress)}% do ciclo concluído</p><div class="timer-actions"><button type="button" class="primary" data-timer-start="${i}">${running?'Em andamento':'Iniciar'}</button><button type="button" class="secondary" data-timer-pause="${i}" ${running?'':'disabled'}>Pausar</button><button type="button" class="secondary" data-timer-reset="${i}">Reiniciar</button></div></article>`}).join("");
}
$("machineTimers").onclick=e=>{const el=e.target;if(el.dataset.timerStart)startTimer(el.dataset.timerStart);if(el.dataset.timerPause)pauseTimer(el.dataset.timerPause);if(el.dataset.timerReset)resetTimer(el.dataset.timerReset)};
$("applyTimerCycle").onclick=()=>{const v=Math.max(1,n($("timerCycle").value));if(!confirm("Aplicar a nova duração e reiniciar os temporizadores de todas as máquinas?"))return;timerCycleMinutes=v;timerState={};saveTimers();renderTimers();toast("Duração aplicada aos temporizadores.")};
$("startAllTimers").onclick=()=>{for(let i=1;i<=settings.machines;i++)startTimer(i)};
$("pauseAllTimers").onclick=()=>{for(let i=1;i<=settings.machines;i++)pauseTimer(i)};
$("resetAllTimers").onclick=()=>{for(let i=1;i<=settings.machines;i++)resetTimer(i)};
setInterval(()=>{if(!$("timer")?.classList.contains("active"))return;document.querySelectorAll("[data-clock]").forEach(el=>{const i=el.dataset.clock,left=remainingFor(i);el.textContent=timerClock(left);const card=el.closest(".machine-timer"),bar=card?.querySelector(".timer-progress span"),state=card?.querySelector(".timer-state");if(bar)bar.style.width=`${Math.min(100,Math.max(0,(1-left/timerDuration())*100))}%`;if(state&&left<=0){state.textContent="Ciclo concluído";state.classList.remove("running");const pause=card.querySelector("[data-timer-pause]");if(pause)pause.disabled=true;const start=card.querySelector("[data-timer-start]");if(start)start.textContent="Iniciar novamente";const t=timerState[i];if(t?.running){t.remaining=0;t.running=false;saveTimers()}}})},1000);

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.page").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.page).classList.add("active")});
$("dashDate").value=today();$("entryDate").value=today();$("batchDate").value=today();
$("memberForm").onsubmit=async e=>{e.preventDefault();if(!requireAdmin())return;const row={name:$("memberName").value.trim(),team:$("memberTeam").value,daily_essence:n($("memberEssence").value),delivery_per_operation:n($("memberDelivery").value),active:$("memberActive").value==="true",game_level:n($("memberLevel").value),member_rank:$("memberRank").value.trim()||"CRIA",honor_points:n($("memberHonor").value),activity:$("memberActivity").value.trim()||"Sem informação"};row.id=uid();await put("members",row);e.target.reset();toast("Membro cadastrado.");await loadAll()};
$("entryMember").onchange=()=>{const m=members.find(x=>x.id===$("entryMember").value);if(m)$("entryTeam").value=m.team};
$("entryType").onchange=()=>{const prod=$("entryType").value==="production";$("entryEssence").disabled=!prod;$("entryJewels").disabled=prod;$("entryTime").disabled=prod;$("entryStatus").disabled=prod;$("entryEssence").value=prod?0:0;$("entryJewels").value=prod?0:settings.deliveryQty};
$("entryForm").onsubmit=async e=>{e.preventDefault();if(!requireAdmin())return;const kind=$("entryType").value,member=members.find(x=>x.id===$("entryMember").value);if(!member)return toast("Selecione um membro.");const row={member_id:member.id,entry_date:$("entryDate").value,kind,essence:kind==="production"?n($("entryEssence").value):0,jewels:kind==="delivery"?n($("entryJewels").value):0,team:$("entryTeam").value,time_slot:kind==="delivery"?$("entryTime").value:null,status:kind==="production"?"N/A":$("entryStatus").value,notes:$("entryNotes").value};row.id=uid();await put("entries",row);toast("Lançamento salvo.");e.target.reset();$("entryDate").value=today();$("entryType").dispatchEvent(new Event("change"));await loadAll()};
$("batchProduction").onclick=async()=>{if(!requireAdmin())return;const date=$("batchDate").value||today(),active=members.filter(m=>m.active);if(!active.length)return toast("Não há membros ativos.");let added=0;for(const m of active){const exists=entries.some(x=>x.member_id===m.id&&x.entry_date===date&&x.kind==="production");if(!exists){await put("entries",{id:uid(),member_id:m.id,entry_date:date,kind:"production",essence:m.daily_essence,jewels:0,team:m.team,status:"N/A",notes:"Gerado em lote"});added++}}toast(`${added} lançamentos de produção criados.`);await loadAll()};
$("batchDelivery").onclick=async()=>{if(!requireAdmin())return;const date=$("batchDate").value||today(),slot=$("batchTime").value,active=members.filter(m=>m.active);if(!active.length)return toast("Não há membros ativos.");let added=0;for(const m of active){const exists=entries.some(x=>x.member_id===m.id&&x.entry_date===date&&x.kind==="delivery"&&x.time_slot===slot);if(!exists){await put("entries",{id:uid(),member_id:m.id,entry_date:date,kind:"delivery",essence:0,jewels:m.delivery_per_operation,team:m.team,time_slot:slot,status:"Pendente",notes:"Gerado em lote"});added++}}toast(`${added} entregas pendentes criadas.`);await loadAll()};
$("membersTable").onclick=async e=>{if(!requireAdmin())return;const id=e.target.dataset.toggle||e.target.dataset.edit;if(!id)return;const m=members.find(x=>x.id===id);if(e.target.dataset.toggle!==undefined){await put("members",{...m,active:!m.active});await loadAll()}else{const name=prompt("Nome:",m.name);if(name===null)return;const essence=prompt("Essência diária:",m.daily_essence);const delivery=prompt("Entrega por operação:",m.delivery_per_operation);const team=prompt("Equipe (Carro 1, Carro 2, Carro 3 ou Sem equipe):",m.team);const level=prompt("Nível no jogo:",m.game_level||1);const rank=prompt("Classificação do membro:",m.member_rank||"CRIA");const honor=prompt("Pontos de honra:",m.honor_points||0);const activity=prompt("Atividade:",m.activity||"Sem informação");await put("members",{...m,name:name.trim(),daily_essence:n(essence),delivery_per_operation:n(delivery),team,game_level:n(level),member_rank:rank,honor_points:n(honor),activity});await loadAll()}};
$("entriesTable").onclick=async e=>{if(!requireAdmin())return;const id=e.target.dataset.delete||e.target.dataset.status;if(!id)return;if(e.target.dataset.delete!==undefined){if(!confirm("Excluir este lançamento?"))return;await remove("entries",id);await loadAll()}else{const r=entries.find(x=>x.id===id);const next=prompt("Novo status: Pendente, Sim ou Não",r.status);if(!["Pendente","Sim","Não"].includes(next))return;await put("entries",{...r,status:next});await loadAll()}};
$("settingsForm").onsubmit=async e=>{e.preventDefault();if(!requireAdmin())return;const row={id:1,ratio:n($("sRatio").value),warehouse_capacity:n($("sWarehouse").value),vault_capacity:n($("sVault").value),machines:n($("sMachines").value),essence_per_machine:n($("sEssMachine").value),cycle_minutes:n($("sCycle").value),delivery_quantity:n($("sDeliveryQty").value),delivery_count:n($("sDeliveryCount").value)};await put("settings",row);toast("Configurações salvas.");await loadAll()};
$("dashDate").onchange=render;$("filterDate").onchange=render;$("filterTeam").onchange=render;$("filterStatus").onchange=render;
$("reportDate").value=today();
$("generateDailyPdf").onclick=()=>{
 const date=$("reportDate").value||today();
 const dayEntries=entries.filter(x=>x.entry_date===date);
 const escHtml=v=>String(v??"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const totalEss=dayEntries.reduce((a,x)=>a+n(x.essence),0);
 const totalJewels=dayEntries.filter(x=>x.kind==="delivery"&&x.status==="Sim").reduce((a,x)=>a+n(x.jewels),0);
 const productionCount=dayEntries.filter(x=>x.kind==="production").length;
 const deliveryCount=dayEntries.filter(x=>x.kind==="delivery").length;
 const dateBR=date.split("-").reverse().join("/");
 const memberRows=members.slice().sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")).map(m=>{
   const rows=dayEntries.filter(x=>x.member_id===m.id).sort((a,b)=>(a.kind||"").localeCompare(b.kind||""));
   const prod=rows.filter(x=>x.kind==="production");
   const dels=rows.filter(x=>x.kind==="delivery");
   const essence=prod.reduce((a,x)=>a+n(x.essence),0);
   const delivered=dels.filter(x=>x.status==="Sim").reduce((a,x)=>a+n(x.jewels),0);
   const details=rows.length?rows.map(x=>`<tr><td>${x.kind==="production"?"Produção":"Entrega"}</td><td>${fmt(x.essence)}</td><td>${fmt(x.jewels)}</td><td>${escHtml(x.time_slot||"—")}</td><td>${escHtml(x.status)}</td><td>${escHtml(x.notes||"—")}</td></tr>`).join(""):'<tr><td colspan="6" class="empty">Nenhum lançamento nesta data.</td></tr>';
   return `<section class="member"><div class="member-head"><div><h2>${escHtml(m.name)}</h2><p>${escHtml(m.team)} · Nível ${fmt(m.game_level||1)} · ${escHtml(m.member_rank||"CRIA")} · ${m.active?"Ativo":"Inativo"}</p></div><div class="member-total"><b>${fmt(essence)}</b><small>essências</small><b>${fmt(delivered)}</b><small>joias entregues</small></div></div><table><thead><tr><th>Tipo</th><th>Essências</th><th>Joias</th><th>Horário</th><th>Status</th><th>Observações</th></tr></thead><tbody>${details}</tbody></table></section>`;
 }).join("");
 const doc=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>OneState - Relatório diário ${dateBR}</title><style>
 @page{size:A4;margin:14mm}*{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#172033;margin:0}
 header{border-bottom:3px solid #153b70;padding-bottom:12px;margin-bottom:16px}h1{font-size:22px;margin:0 0 5px;color:#153b70}header p{margin:0;color:#596579}
 .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0 20px}.card{border:1px solid #d9e0e9;border-radius:7px;padding:9px}.card b{display:block;font-size:18px;color:#153b70}.card span{font-size:10px;color:#596579}
 .member{margin:0 0 17px;break-inside:avoid}.member-head{display:flex;justify-content:space-between;align-items:center;background:#f1f5fa;padding:8px 10px;border-left:4px solid #153b70}.member h2{font-size:14px;margin:0 0 3px}.member p{margin:0;color:#596579;font-size:10px}.member-total{display:flex;gap:5px;align-items:baseline}.member-total b{font-size:12px;color:#153b70}.member-total small{font-size:9px;color:#596579;margin-right:8px}
 table{width:100%;border-collapse:collapse;margin-top:5px;font-size:10px}th{background:#e8edf4;text-align:left}th,td{border:1px solid #dce2ea;padding:5px} .empty{text-align:center;color:#788395}
 footer{margin-top:20px;border-top:1px solid #dce2ea;padding-top:8px;color:#788395;font-size:9px}
 @media print{button{display:none}}
 </style></head><body><header><h1>OneState | Relatório diário</h1><p>Data: ${dateBR} · Gerado em ${new Date().toLocaleString("pt-BR")}</p></header>
 <div class="summary"><div class="card"><b>${members.length}</b><span>Membros cadastrados</span></div><div class="card"><b>${fmt(totalEss)}</b><span>Essências registradas</span></div><div class="card"><b>${fmt(totalJewels)}</b><span>Joias entregues</span></div><div class="card"><b>${productionCount} / ${deliveryCount}</b><span>Registros de produção / entrega</span></div></div>
 <h2 style="font-size:16px;color:#153b70">Histórico individual dos membros</h2>${memberRows}
 <footer>Relatório gerado pelo OneState. Os dados apresentados correspondem aos lançamentos armazenados neste navegador.</footer>
 <script>window.onload=()=>setTimeout(()=>window.print(),250);</script></body></html>`;
 const w=window.open("","_blank");
 if(!w){toast("Permita janelas pop-up para gerar o PDF.");return}
 w.document.open();w.document.write(doc);w.document.close();
};
const installBtn=$("installAppBtn");let installPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;installBtn.classList.remove("hidden")});
installBtn.onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.classList.add("hidden")};
window.addEventListener("appinstalled",()=>{installBtn.classList.add("hidden");toast("OneState instalado com sucesso.")});
if("serviceWorker" in navigator && location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(err=>console.warn("Service Worker:",err)));
start();