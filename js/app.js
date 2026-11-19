import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const $ = id => document.getElementById(id);
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("COLE_AQUI") && !SUPABASE_ANON_KEY.includes("COLE_AQUI");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let members=[], entries=[], settings={ratio:10,warehouse:2500,vault:250,machines:5,essMachine:250,cycle:482,deliveryQty:120,deliveryCount:4};
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const n=v=>Number(v)||0, fmt=v=>n(v).toLocaleString("pt-BR");
function toast(msg){$("toast").textContent=msg;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",3500)}
function msgLogin(msg){$("loginMessage").textContent=msg}
function isAdmin(user){return user?.app_metadata?.role==="admin"}
async function start(){
 if(!supabase){toast("O painel público precisa da URL e da chave pública do Supabase em js/config.js.");return}
 const {data:{session}}=await supabase.auth.getSession();
 if(session && isAdmin(session.user)) await showApp(session.user);
 else { await supabase.auth.signOut(); await showPublic(); }
}
async function showPublic(){
 document.body.classList.remove("admin-mode");
 $("loginView").classList.add("hidden");$("appView").classList.remove("hidden");
 $("adminLoginBtn").classList.remove("hidden");$("logoutBtn").classList.add("hidden");
 document.querySelectorAll(".tab,.page").forEach(x=>x.classList.remove("active"));
 document.querySelector('.tab[data-page="dashboard"]').classList.add("active");$("dashboard").classList.add("active");
 await loadAll();
}
$("adminLoginBtn").onclick=()=>{$("loginView").classList.remove("hidden");$("appView").classList.add("hidden");msgLogin("Acesso exclusivo ao administrador.")};
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!supabase)return;
 msgLogin("Verificando acesso...");
 const {data,error}=await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
 if(error){msgLogin("Não foi possível entrar. Confira o e-mail e a senha.");return}
 if(!isAdmin(data.user)){await supabase.auth.signOut();msgLogin("Este usuário não possui permissão de administrador.");return}
 await showApp(data.user);
});
$("logoutBtn").onclick=async()=>{await supabase.auth.signOut();await showPublic()};
async function showApp(user){
 if(!isAdmin(user)){await supabase.auth.signOut();return}
 document.body.classList.add("admin-mode");
 $("loginView").classList.add("hidden");$("appView").classList.remove("hidden");
 $("adminLoginBtn").classList.add("hidden");$("logoutBtn").classList.remove("hidden");
 await loadAll();
}
async function loadAll(){
 const [m,e,s]=await Promise.all([
  supabase.from("members").select("*").order("name"),
  supabase.from("entries").select("*, members(name)").order("entry_date",{ascending:false}),
  supabase.from("settings").select("*").eq("id",1).maybeSingle()
 ]);
 if(m.error||e.error){toast("Erro ao carregar dados. Confira as políticas do banco.");console.error(m.error,e.error);return}
 members=m.data||[];entries=e.data||[];
 if(s.data)settings={ratio:s.data.ratio,warehouse:s.data.warehouse_capacity,vault:s.data.vault_capacity,machines:s.data.machines,essMachine:s.data.essence_per_machine,cycle:s.data.cycle_minutes,deliveryQty:s.data.delivery_quantity,deliveryCount:s.data.delivery_count};
 fillSettings();render();timerCycleMinutes=settings.cycle;$("timerCycle").value=settings.cycle;renderTimers();$("simEssence").value=settings.warehouse;$("simMachines").value=settings.machines;$("simEssMachine").value=settings.essMachine;$("simRatio").value=settings.ratio;$("simHours").value=Math.floor(settings.cycle/60);$("simMinutes").value=settings.cycle%60;$("simTarget").value=settings.deliveryQty*settings.deliveryCount;runSimulation();
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
 $("membersTable").innerHTML=members.map(m=>{const rows=entries.filter(x=>x.member_id===m.id);return `<tr><td>${esc(m.name)}</td><td>${esc(m.team)}</td><td>${fmt(m.daily_essence)}</td><td>${fmt(m.delivery_per_operation)}</td><td>${fmt(m.game_level||1)}</td><td>${esc(m.member_rank||"CRIA")}</td><td>${fmt(m.honor_points||0)}</td><td>${esc(m.activity||"—")}</td><td>${m.active?"Ativo":"Inativo"}</td><td>${fmt(rows.reduce((a,x)=>a+n(x.essence),0))}</td><td>${fmt(rows.filter(x=>x.status==="Sim").reduce((a,x)=>a+n(x.jewels),0))}</td><td><button class="secondary" data-edit="${m.id}">Editar</button> <button class="secondary" data-toggle="${m.id}">${m.active?"Inativar":"Ativar"}</button></td></tr>`}).join("")||'<tr><td colspan="12">Nenhum membro cadastrado.</td></tr>';
 $("publicRoster").innerHTML=members.slice().sort((a,b)=>(a.game_level||0)-(b.game_level||0)).map(m=>`<tr><td>${m.roster_position||"—"}</td><td><b>${esc(m.name)}</b></td><td>${fmt(m.game_level||1)}</td><td>${esc(m.member_rank||"CRIA")}</td><td>${fmt(m.honor_points||0)}</td><td>${esc(m.activity||"Sem informação")}</td></tr>`).join("");
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
$("memberForm").onsubmit=async e=>{e.preventDefault();const row={name:$("memberName").value.trim(),team:$("memberTeam").value,daily_essence:n($("memberEssence").value),delivery_per_operation:n($("memberDelivery").value),active:$("memberActive").value==="true",game_level:n($("memberLevel").value),member_rank:$("memberRank").value.trim()||"CRIA",honor_points:n($("memberHonor").value),activity:$("memberActivity").value.trim()||"Sem informação"};const {error}=await supabase.from("members").insert(row);if(error){toast("Erro ao cadastrar membro.");return}e.target.reset();toast("Membro cadastrado.");await loadAll()};
$("entryMember").onchange=()=>{const m=members.find(x=>x.id===$("entryMember").value);if(m)$("entryTeam").value=m.team};
$("entryType").onchange=()=>{const prod=$("entryType").value==="production";$("entryEssence").disabled=!prod;$("entryJewels").disabled=prod;$("entryTime").disabled=prod;$("entryStatus").disabled=prod;$("entryEssence").value=prod?0:0;$("entryJewels").value=prod?0:settings.deliveryQty};
$("entryForm").onsubmit=async e=>{e.preventDefault();const kind=$("entryType").value,member=members.find(x=>x.id===$("entryMember").value);if(!member)return toast("Selecione um membro.");const row={member_id:member.id,entry_date:$("entryDate").value,kind,essence:kind==="production"?n($("entryEssence").value):0,jewels:kind==="delivery"?n($("entryJewels").value):0,team:$("entryTeam").value,time_slot:kind==="delivery"?$("entryTime").value:null,status:kind==="production"?"N/A":$("entryStatus").value,notes:$("entryNotes").value};const {error}=await supabase.from("entries").insert(row);if(error){toast("Erro ao salvar lançamento.");return}toast("Lançamento salvo.");e.target.reset();$("entryDate").value=today();$("entryType").dispatchEvent(new Event("change"));await loadAll()};
$("batchProduction").onclick=async()=>{const date=$("batchDate").value||today(),active=members.filter(m=>m.active);if(!active.length)return toast("Não há membros ativos.");let added=0;for(const m of active){const exists=entries.some(x=>x.member_id===m.id&&x.entry_date===date&&x.kind==="production");if(!exists){const {error}=await supabase.from("entries").insert({member_id:m.id,entry_date:date,kind:"production",essence:m.daily_essence,jewels:0,team:m.team,status:"N/A",notes:"Gerado em lote"});if(!error)added++}}toast(`${added} lançamentos de produção criados.`);await loadAll()};
$("batchDelivery").onclick=async()=>{const date=$("batchDate").value||today(),slot=$("batchTime").value,active=members.filter(m=>m.active);if(!active.length)return toast("Não há membros ativos.");let added=0;for(const m of active){const exists=entries.some(x=>x.member_id===m.id&&x.entry_date===date&&x.kind==="delivery"&&x.time_slot===slot);if(!exists){const {error}=await supabase.from("entries").insert({member_id:m.id,entry_date:date,kind:"delivery",essence:0,jewels:m.delivery_per_operation,team:m.team,time_slot:slot,status:"Pendente",notes:"Gerado em lote"});if(!error)added++}}toast(`${added} entregas pendentes criadas.`);await loadAll()};
$("membersTable").onclick=async e=>{const id=e.target.dataset.toggle||e.target.dataset.edit;if(!id)return;const m=members.find(x=>x.id===id);if(e.target.dataset.toggle!==undefined){const {error}=await supabase.from("members").update({active:!m.active}).eq("id",id);if(error)toast("Falha ao alterar membro.");else await loadAll()}else{const name=prompt("Nome:",m.name);if(name===null)return;const essence=prompt("Essência diária:",m.daily_essence);const delivery=prompt("Entrega por operação:",m.delivery_per_operation);const team=prompt("Equipe (Carro 1, Carro 2, Carro 3 ou Sem equipe):",m.team);const level=prompt("Nível no jogo:",m.game_level||1);const rank=prompt("Ranq. do membro:",m.member_rank||"CRIA");const honor=prompt("Pontos de honra:",m.honor_points||0);const activity=prompt("Atividade:",m.activity||"Sem informação");const {error}=await supabase.from("members").update({name:name.trim(),daily_essence:n(essence),delivery_per_operation:n(delivery),team,game_level:n(level),member_rank:rank,honor_points:n(honor),activity}).eq("id",id);if(error)toast("Falha ao editar membro.");else await loadAll()}};
$("entriesTable").onclick=async e=>{const id=e.target.dataset.delete||e.target.dataset.status;if(!id)return;if(e.target.dataset.delete!==undefined){if(!confirm("Excluir este lançamento?"))return;const {error}=await supabase.from("entries").delete().eq("id",id);if(error)toast("Falha ao excluir.");else await loadAll()}else{const r=entries.find(x=>x.id===id);const next=prompt("Novo status: Pendente, Sim ou Não",r.status);if(!["Pendente","Sim","Não"].includes(next))return;const {error}=await supabase.from("entries").update({status:next}).eq("id",id);if(error)toast("Falha ao atualizar.");else await loadAll()}};
$("settingsForm").onsubmit=async e=>{e.preventDefault();const row={id:1,ratio:n($("sRatio").value),warehouse_capacity:n($("sWarehouse").value),vault_capacity:n($("sVault").value),machines:n($("sMachines").value),essence_per_machine:n($("sEssMachine").value),cycle_minutes:n($("sCycle").value),delivery_quantity:n($("sDeliveryQty").value),delivery_count:n($("sDeliveryCount").value)};const {error}=await supabase.from("settings").upsert(row);if(error)toast("Falha ao salvar parâmetros.");else{toast("Configurações salvas.");await loadAll()}};
$("dashDate").onchange=render;$("filterDate").onchange=render;$("filterTeam").onchange=render;$("filterStatus").onchange=render;
$("runReport").onclick=()=>{const rs=entries.filter(x=>(!$("fromDate").value||x.entry_date>=$("fromDate").value)&&(!$("toDate").value||x.entry_date<=$("toDate").value));$("reportResult").innerHTML=`<p>Essências: <b>${fmt(rs.reduce((a,x)=>a+n(x.essence),0))}</b></p><p>Joias produzidas (equivalente): <b>${fmt(jewels(rs.reduce((a,x)=>a+n(x.essence),0)))}</b></p><p>Joias entregues: <b>${fmt(rs.filter(x=>x.status==="Sim").reduce((a,x)=>a+n(x.jewels),0))}</b></p><p>Registros: <b>${rs.length}</b></p>`};
$("exportBackup").onclick=()=>{const data={members,entries,settings};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="onestate-backup.json";a.click();URL.revokeObjectURL(a.href)};
supabase?.auth.onAuthStateChange((_event,session)=>{if(!session && !document.body.classList.contains("admin-mode")) return; if(!session){showPublic()}});
start();