import { useState, useEffect, useRef } from "react";

//  CONFIG 
const PARENT_PIN   = "1234";   //  change this!
const DAILY_FULL   = 5.00;
const MAX_STARS    = 3;

//  TASKS 
const TASKS = [
  { id:"breakfast", label:"Eat Breakfast",        emoji:"🥣", group:"Kitchen",   timer:15 },
  { id:"teeth",     label:"Brush Teeth",           emoji:"🦷", group:"Bathroom",  timer:2  },
  { id:"hair",      label:"Brush Hair",            emoji:"✨", group:"Bathroom",  timer:3  },
  { id:"sunscreen", label:"Sunscreen & Lip Balm",  emoji:"☀️", group:"Bathroom",  timer:2  },
  { id:"dressed",   label:"Get Dressed",           emoji:"👗", group:"Get Ready", timer:5  },
  { id:"shoes",     label:"Put Shoes On",          emoji:"👟", group:"Get Ready", timer:2  },
  { id:"bag",       label:"Pack School Bag",       emoji:"🎒", group:"Pack Up",   timer:5,
    subItems:["Hat","Lunchbox","Water bottle","iPad"] },
  { id:"bed",       label:"Make Bed",              emoji:"🛏️", group:"Pack Up",   timer:4,
    subItems:["Pillow straight","Blanket smooth","Teddy in place","Cushions on","PJs under pillow"] },
  { id:"pet",       label:"Feed Pet",              emoji:"🐾", group:"Feed Pet",  timer:2,
    subItems:["Food in bowl","Check water level"] },
];

const TUESDAY_TASK = {
  id:"swim", label:"Pack Swimming Bag", emoji:"🏊", group:"Pack Up", timer:5,
  subItems:["Goggles","Swim cap","Towel","Swimmers"]
};

const CAPY_MSGS = {
  breakfast:["Capy says: Fuel up, explorer! 🌟","Capy says: Yum yum, energy time! 🥣","Capy says: Breakfast = superpowers! ⚡"],
  teeth:    ["Capy says: Dazzling chompers! 🦷","Capy says: Sparkle sparkle! ✨","Capy says: Capy approves those teeth! 😁"],
  hair:     ["Capy says: Looking absolutely fabulous! 💁","Capy says: Hair = PERFECTION! 🌈","Capy says: 10/10 would brush again! ✨"],
  sunscreen:["Capy says: Sun protection engaged! ☀️","Capy says: Glow protected! 🌟","Capy says: SPF = smart! Capy is proud! 🦫"],
  dressed:  ["Capy says: Outfit? ICONIC! 👗","Capy says: Fashion icon spotted! 💫","Capy says: Ready to conquer the day! 🌟"],
  shoes:    ["Capy says: Those shoes are ready to GO! 👟","Capy says: Lace-up legend! 🏆","Capy says: Feet sorted! 🎉"],
  bag:      ["Capy says: Packed and prepared! 🎒","Capy says: Nothing forgotten… right? 😏","Capy says: So organised! ✨"],
  bed:      ["Capy says: Bed-making champion! 🏅","Capy says: Capy would sleep there! 😴","Capy says: Tidy room = tidy mind! 🧠"],
  pet:      ["Capy says: Pet hero of the day! 🐾","Capy says: Your pet is SO lucky! 💛","Capy says: Caring for others = best quality! 🌟"],
  swim:     ["Capy says: Splash day! Let's GO! 🏊","Capy says: Future Olympian? Capy thinks YES! 🥇","Capy says: Goggles packed! Legend! 🌊"],
};

const DONE_MSGS = [
  "Capy says: YOU DID IT! Full Charter complete! 🎉",
  "Capy says: Isla, you are INCREDIBLE today! 🏆",
  "Capy says: Charter CONQUERED! Capy does a happy dance! 🦫💃",
  "Capy says: Perfect morning! Capy is SO proud! 🌟",
];

//  HELPERS 
const load = (k,d) => { try { const v=localStorage.getItem(k); return v!=null?JSON.parse(v):d; } catch{ return d; } };
const save = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch{} };
const todayStr = () => new Date().toDateString();
const isTue    = () => new Date().getDay()===2;
const rand     = arr => arr[Math.floor(Math.random()*arr.length)];
const fmtMoney = v => `$${parseFloat(v||0).toFixed(2)}`;

//  SVG CAPY 
const Capy = ({ size=80, happy=false, dancing=false }) => (
  <svg viewBox="0 0 200 160" width={size} height={size*.8}
    style={{filter:happy?"drop-shadow(0 0 14px #f9c74faa)":"none",
            animation:dancing?"capyDance 0.5s ease-in-out infinite alternate":"none",
            transition:"filter 0.4s"}}>
    <ellipse cx="100" cy="108" rx="70" ry="46" fill="#c8a97e"/>
    <ellipse cx="100" cy="64"  rx="44" ry="36" fill="#c8a97e"/>
    <ellipse cx="66"  cy="36"  rx="12" ry="9"  fill="#b8906a"/>
    <ellipse cx="134" cy="36"  rx="12" ry="9"  fill="#b8906a"/>
    <ellipse cx="100" cy="79"  rx="24" ry="15" fill="#b8906a"/>
    <ellipse cx="92"  cy="77"  rx="3.5" ry="3" fill="#5a3a1a"/>
    <ellipse cx="108" cy="77"  rx="3.5" ry="3" fill="#5a3a1a"/>
    <ellipse cx="83"  cy="60"  rx="6.5" ry="6.5" fill="#2d1a0a"/>
    <ellipse cx="117" cy="60"  rx="6.5" ry="6.5" fill="#2d1a0a"/>
    <ellipse cx="85"  cy="58"  rx="2"   ry="2"   fill="white"/>
    <ellipse cx="119" cy="58"  rx="2"   ry="2"   fill="white"/>
    {happy
      ? <path d="M88 88 Q100 98 112 88" stroke="#5a3a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      : <path d="M90 89 Q100 89 110 89" stroke="#5a3a1a" strokeWidth="2"   fill="none" strokeLinecap="round"/>}
    <ellipse cx="68"  cy="148" rx="15" ry="9" fill="#b8906a"/>
    <ellipse cx="132" cy="148" rx="15" ry="9" fill="#b8906a"/>
    {happy && [0,60,120,180,240,300].map((a,i)=>(
      <ellipse key={i}
        cx={100+11*Math.cos(a*Math.PI/180)} cy={22+11*Math.sin(a*Math.PI/180)}
        rx="5" ry="3" fill={["#f72585","#4cc9f0","#f9c74f","#43aa8b"][i%4]}
        transform={`rotate(${a} ${100+11*Math.cos(a*Math.PI/180)} ${22+11*Math.sin(a*Math.PI/180)})`}/>
    ))}
    {happy && <circle cx="100" cy="22" r="5" fill="#f9c74f"/>}
  </svg>
);

//  CONFETTI 
const Confetti = ({ active }) => {
  const p = useRef(Array.from({length:52},(_,i)=>({
    id:i, x:Math.random()*100,
    color:["#f9c74f","#f72585","#4cc9f0","#43aa8b","#ff6b6b","#a8dadc"][i%6],
    delay:Math.random()*.9, size:7+Math.random()*9, rot:Math.random()*360
  }))).current;
  if (!active) return null;
  return <>{p.map(c=>(
    <div key={c.id} style={{position:"fixed",left:`${c.x}%`,top:"-16px",
      width:c.size,height:c.size,background:c.color,
      borderRadius:c.id%3===0?"50%":c.id%3===1?"2px":"0",
      animation:`confettiFall 2.8s ${c.delay}s ease-in forwards`,
      zIndex:9999,pointerEvents:"none",transform:`rotate(${c.rot}deg)`}}/>
  ))}</>;
};

//  STAR BURST 
const StarBurst = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",
      justifyContent:"center",zIndex:998,pointerEvents:"none"}}>
      <div style={{fontSize:100,animation:"starPop 0.7s ease forwards"}}>⭐</div>
      {[...Array(8)].map((_,i)=>(
        <div key={i} style={{position:"absolute",fontSize:28,top:"50%",left:"50%",
          opacity:0,transform:`rotate(${i*45}deg) translateY(-90px)`,
          animation:`starFly 0.8s ${i*.06}s ease forwards`}}>✨</div>
      ))}
    </div>
  );
};

//  TASK TIMER 
const TaskTimer = ({ minutes }) => {
  const [secs,setSecs] = useState(minutes*60);
  const [run,setRun]   = useState(false);
  const [done,setDone] = useState(false);
  const ref = useRef();
  useEffect(()=>{ setSecs(minutes*60); setRun(false); setDone(false); },[minutes]);
  useEffect(()=>{
    if(!run) return;
    ref.current = setInterval(()=>setSecs(s=>{
      if(s<=1){ clearInterval(ref.current); setRun(false); setDone(true); return 0; }
      return s-1;
    }),1000);
    return ()=>clearInterval(ref.current);
  },[run]);
  const m=Math.floor(secs/60), s=secs%60, pct=1-secs/(minutes*60);
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
      <div style={{position:"relative",width:40,height:40}}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#f5dfc0" strokeWidth="4"/>
          <circle cx="20" cy="20" r="16" fill="none"
            stroke={done?"#43aa8b":run?"#f72585":"#c8a97e"} strokeWidth="4"
            strokeDasharray={`${2*Math.PI*16}`}
            strokeDashoffset={`${2*Math.PI*16*(1-pct)}`}
            strokeLinecap="round" transform="rotate(-90 20 20)"
            style={{transition:"stroke-dashoffset 1s linear,stroke 0.3s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:9,fontWeight:900,
          color:done?"#43aa8b":"#6b4226"}}>
          {done?"✓":`${m}:${s.toString().padStart(2,"0")}`}
        </div>
      </div>
      {!done && (
        <button onClick={()=>setRun(r=>!r)} style={{
          background:run?"#f5dfc0":"linear-gradient(135deg,#f4a261,#e76f51)",
          color:run?"#6b4226":"white",border:"none",borderRadius:9,
          padding:"5px 11px",fontSize:11,fontWeight:800,cursor:"pointer"}}>
          {run?"Pause ⏸":"Start ⏱"}
        </button>
      )}
      {done && <span style={{fontSize:11,fontWeight:800,color:"#43aa8b"}}>Time's up! 🎉</span>}
      {!done && !run && secs<minutes*60 && (
        <button onClick={()=>{setSecs(minutes*60);setRun(false);}} style={{
          background:"none",border:"none",fontSize:10,color:"#c8a97e",cursor:"pointer",fontWeight:700}}>Reset</button>
      )}
    </div>
  );
};

//  TRAIL 
const Trail = ({ tasks, stars }) => {
  const done = tasks.filter(t=>(stars[t.id]||0)>0).length;
  return (
    <div style={{overflowX:"auto",paddingBottom:4}}>
      <div style={{display:"flex",alignItems:"center",minWidth:tasks.length*52+60}}>
        {tasks.map((t,i)=>{
          const isDone=(stars[t.id]||0)>0, isNext=i===done, s=stars[t.id]||0;
          return (
            <div key={t.id} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                animation:isNext?"trailPulse 1.2s ease-in-out infinite":"none"}}>
                <div style={{width:38,height:38,borderRadius:"50%",
                  background:isDone?(s===3?"linear-gradient(135deg,#f9c74f,#f4a261)":"linear-gradient(135deg,#43aa8b,#4cc9f0)"):
                    isNext?"linear-gradient(135deg,#f72585,#b5179e)":"#f5dfc0",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
                  boxShadow:isNext?"0 0 0 3px #f7258566":"none",
                  border:isDone?"2px solid #fff8":"2px solid transparent",
                  transition:"all 0.4s"}}>
                  {isDone?(s===3?"⭐":t.emoji):isNext?t.emoji:"·"}
                </div>
                <div style={{fontSize:8,fontWeight:800,textAlign:"center",width:42,lineHeight:1.2,
                  color:isDone?"#43aa8b":isNext?"#f72585":"#c8a97e"}}>
                  {t.label.split(" ")[0]}
                </div>
              </div>
              {i<tasks.length-1&&<div style={{width:10,height:4,borderRadius:2,marginBottom:14,
                background:i<done?"linear-gradient(90deg,#43aa8b,#4cc9f0)":"#f5dfc0",transition:"background 0.4s"}}/>}
            </div>
          );
        })}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{width:42,height:42,borderRadius:"50%",
            background:done===tasks.length?"linear-gradient(135deg,#f9c74f,#f72585)":"#f5dfc0",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
            boxShadow:done===tasks.length?"0 0 16px #f9c74f88":"none",transition:"all 0.5s"}}>
            {done===tasks.length?"🏆":"🏫"}
          </div>
          <div style={{fontSize:8,fontWeight:800,color:done===tasks.length?"#f9c74f":"#c8a97e"}}>School!</div>
        </div>
      </div>
    </div>
  );
};

//  SUB-ITEM CHECKLIST 
const SubItems = ({ items, checked, onChange }) => (
  <div style={{marginTop:8,paddingLeft:8,borderLeft:"3px solid #f5dfc0",display:"flex",flexDirection:"column",gap:6}}>
    {items.map(item=>{
      const done = checked[item]||false;
      return (
        <label key={item} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <div onClick={()=>onChange(item,!done)} style={{
            width:22,height:22,borderRadius:6,flexShrink:0,
            border:done?"none":"2px solid #c8a97e",
            background:done?"linear-gradient(135deg,#43aa8b,#4cc9f0)":"white",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:13,color:"white",fontWeight:900,cursor:"pointer",transition:"all 0.2s"}}>
            {done?"✓":""}
          </div>
          <span style={{fontSize:13,fontWeight:700,color:"#8b6242",
            textDecoration:done?"line-through":"none",opacity:done?0.55:1,transition:"all 0.2s"}}>
            {item}
          </span>
        </label>
      );
    })}
  </div>
);

//  MAIN APP 
export default function App() {
  const tuesday  = isTue();
  const allTasks = tuesday ? [...TASKS.slice(0,7), TUESDAY_TASK, ...TASKS.slice(7)] : TASKS;
  const today    = todayStr();

  //  state 
  const [stars,        setStars]        = useState(()=>load("ic2_stars",{}));
  const [subChecked,   setSubChecked]   = useState(()=>load("ic2_sub",{}));
  const [bonusTasks,   setBonusTasks]   = useState(()=>load("ic2_bonus",[]));
  const [chores,       setChores]       = useState(()=>load("ic2_chores",[]));
  const [totalEarned,  setTotalEarned]  = useState(()=>load("ic2_total",0));
  const [streak,       setStreak]       = useState(()=>load("ic2_streak",0));
  const [lastDone,     setLastDone]     = useState(()=>load("ic2_lastDone",""));
  const [lastDate,     setLastDate]     = useState(()=>load("ic2_date",""));
  const [pendingApproval, setPending]   = useState(()=>load("ic2_pending",null));
  const [approvedDays, setApprovedDays] = useState(()=>load("ic2_approved",[]));
  const [payHistory,   setPayHistory]   = useState(()=>load("ic2_payHistory",[]));
  const [view,         setView]         = useState("child");
  const [pinInput,     setPinInput]     = useState("");
  const [pinError,     setPinError]     = useState(false);
  const [showPin,      setShowPin]      = useState(false);
  const [confetti,     setConfetti]     = useState(false);
  const [starBurst,    setStarBurst]    = useState(false);
  const [allDone,      setAllDone]      = useState(false);
  const [message,      setMessage]      = useState("");
  const [msgVis,       setMsgVis]       = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  // new chore form
  const [newChore, setNewChore] = useState({label:"",amount:"",deadline:""});

  // daily reset
  useEffect(()=>{
    if(lastDate!==today && !lastDate.startsWith("done_"+today)){
      setStars({}); save("ic2_stars",{});
      setSubChecked({}); save("ic2_sub",{});
      setAllDone(false);
      save("ic2_date",today); setLastDate(today);
    }
  },[]);

  useEffect(()=>save("ic2_stars",stars),[stars]);
  useEffect(()=>save("ic2_sub",subChecked),[subChecked]);
  useEffect(()=>save("ic2_bonus",bonusTasks),[bonusTasks]);
  useEffect(()=>save("ic2_chores",chores),[chores]);
  useEffect(()=>save("ic2_total",totalEarned),[totalEarned]);
  useEffect(()=>save("ic2_streak",streak),[streak]);
  useEffect(()=>save("ic2_lastDone",lastDone),[lastDone]);
  useEffect(()=>save("ic2_pending",pendingApproval),[pendingApproval]);
  useEffect(()=>save("ic2_approved",approvedDays),[approvedDays]);
  useEffect(()=>save("ic2_payHistory",payHistory),[payHistory]);

  const showMsg = msg => {
    setMessage(msg); setMsgVis(true);
    setTimeout(()=>setMsgVis(false),2800);
  };

  // star click
  const handleStar = (taskId, val) => {
    const prev = stars[taskId]||0;
    if(prev===val) return;
    const ns = {...stars,[taskId]:val};
    setStars(ns);
    if(val===3){ setStarBurst(true); setTimeout(()=>setStarBurst(false),900); }
    const msgs = CAPY_MSGS[taskId];
    if(msgs) showMsg(rand(msgs));
    const doneCount = allTasks.filter(t=>(ns[t.id]||0)>0).length;
    if(doneCount===allTasks.length && !allDone){
      setAllDone(true);
      setTimeout(()=>{ setConfetti(true); setTimeout(()=>setConfetti(false),3200); },300);
      showMsg(rand(DONE_MSGS));
    }
  };

  // sub-item toggle
  const handleSub = (taskId, item, val) => {
    const ns = {...subChecked,[taskId]:{...(subChecked[taskId]||{}),[item]:val}};
    setSubChecked(ns);
  };

  // finish day  sends approval request
  const handleFinish = () => {
    const allSolo = allTasks.every(t=>(stars[t.id]||0)===3);
    const totalS  = allTasks.reduce((a,t)=>a+(stars[t.id]||0),0);
    const maxS    = allTasks.length*MAX_STARS;
    const avgPct  = totalS/maxS;
    const bonusAmt= bonusTasks.filter(t=>t.done).reduce((a,t)=>a+parseFloat(t.amount||0),0);
    const earned  = parseFloat((DAILY_FULL*avgPct+bonusAmt).toFixed(2));
    setPending({ date:today, allSolo, earned, stars:{...stars} });
    showMsg("Capy says: Request sent to Mum! 📨");
  };

  // mum approves
  const handleApprove = () => {
    if(!pendingApproval) return;
    setTotalEarned(p=>parseFloat((p+pendingApproval.earned).toFixed(2)));
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const wasYesterday = lastDone===yesterday.toDateString();
    setStreak(wasYesterday?streak+1:1);
    setLastDone(today);
    setApprovedDays(a=>[...a,{...pendingApproval, approvedAt:new Date().toISOString()}]);
    setPending(null);
    setStars({}); setSubChecked({});
    setBonusTasks(bonusTasks.map(t=>({...t,done:false})));
    setAllDone(false);
    save("ic2_date","done_"+today);
    setLastDate("done_"+today);
    showMsg("Capy says: Mum approved! Amazing Isla! 🎉");
  };

  // pay out
  const handlePayOut = () => {
    if(totalEarned<=0) return;
    setPayHistory(h=>[...h,{amount:totalEarned, date:new Date().toLocaleDateString("en-AU"), paid:true}]);
    setTotalEarned(0);
  };

  // add chore
  const addChore = () => {
    if(!newChore.label||!newChore.amount) return;
    setChores(c=>[...c,{id:Date.now(),...newChore,done:false}]);
    setNewChore({label:"",amount:"",deadline:""});
  };

  // complete chore (child side)
  const completeChore = id => {
    setChores(c=>c.map(x=>x.id===id?{...x,done:!x.done}:x));
    const chore = chores.find(x=>x.id===id);
    if(chore && !chore.done){
      setTotalEarned(p=>parseFloat((p+parseFloat(chore.amount||0)).toFixed(2)));
      showMsg(`Capy says: Chore done! +${fmtMoney(chore.amount)} earned! 🌟`);
    }
  };

  // calculations
  const totalS      = allTasks.reduce((a,t)=>a+(stars[t.id]||0),0);
  const maxS        = allTasks.length*MAX_STARS;
  const bonusDone   = bonusTasks.filter(t=>t.done).reduce((a,t)=>a+parseFloat(t.amount||0),0);
  const projected   = parseFloat((DAILY_FULL*(totalS/maxS)+bonusDone).toFixed(2));
  const doneTasks   = allTasks.filter(t=>(stars[t.id]||0)>0).length;
  const allSolo     = allTasks.length>0 && allTasks.every(t=>(stars[t.id]||0)===3);

  //  STYLES 
  const S = {
    app:    { minHeight:"100vh", background:"linear-gradient(160deg,#fff8f0,#fdebd0 60%,#fad7a8)",
              fontFamily:"'Nunito',cursive,sans-serif", paddingBottom:56 },
    header: { background:"linear-gradient(135deg,#7b4f2e,#c8956c)", borderRadius:"0 0 36px 36px",
              padding:"20px 20px 16px", textAlign:"center",
              boxShadow:"0 6px 24px #b8906a55", marginBottom:14, position:"relative" },
    title:  { fontSize:28, fontWeight:900, color:"#fff", margin:0, textShadow:"0 2px 8px #7a5c3a88" },
    card:   { background:"white", borderRadius:22, padding:"14px 16px",
              margin:"0 14px 12px", boxShadow:"0 4px 16px #c8a97e22", border:"2px solid #f5dfc0" },
    sec:    { fontSize:11, fontWeight:900, color:"#b8906a", textTransform:"uppercase",
              letterSpacing:1.8, marginBottom:8 },
    row:    { display:"flex", alignItems:"flex-start", justifyContent:"space-between",
              padding:"10px 4px", borderBottom:"1px solid #fde8c844" },
    btn:    (bg,extra={}) => ({ background:bg||"linear-gradient(135deg,#f72585,#b5179e)",
              color:"white", border:"none", borderRadius:14, padding:"11px 22px",
              fontSize:14, fontWeight:800, cursor:"pointer",
              boxShadow:"0 4px 14px #f7258533", ...extra }),
    input:  { border:"2px solid #f5dfc0", borderRadius:12, padding:"9px 12px",
              fontSize:14, fontFamily:"inherit", outline:"none",
              background:"#fffdf8", color:"#6b4226", fontWeight:700 },
    money:  { background:"linear-gradient(135deg,#43aa8b,#4cc9f0)", borderRadius:20,
              padding:"12px 18px", margin:"0 14px 12px",
              display:"flex", justifyContent:"space-between", alignItems:"center",
              boxShadow:"0 4px 14px #43aa8b33" },
    toast:  { position:"fixed", bottom:72, left:"50%", transform:"translateX(-50%)",
              background:"linear-gradient(135deg,#7b4f2e,#c8956c)", color:"white",
              borderRadius:20, padding:"11px 20px", fontSize:14, fontWeight:800,
              zIndex:500, boxShadow:"0 6px 20px #7b4f2e44", whiteSpace:"nowrap",
              maxWidth:"90vw", opacity:msgVis?1:0,
              transition:"opacity 0.4s", animation:msgVis?"msgPop 0.3s ease":"none" },
  };

  //  PARENT VIEW 
  if(view==="parent") return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');`}</style>
      <div style={S.header}>
        <p style={{color:"#fde8c8",margin:"0 0 2px",fontSize:11,fontWeight:800}}>👩 PARENT VIEW</p>
        <h1 style={S.title}>Isla's Charter</h1>
      </div>

      {/* Pending approval */}
      {pendingApproval && (
        <div style={{...S.card, border:"2px solid #f9c74f", background:"#fffdf0"}}>
          <div style={S.sec}>⏳ Waiting for your Approval!</div>
          <div style={{fontSize:14,color:"#6b4226",fontWeight:700,marginBottom:10,lineHeight:1.7}}>
            📅 {pendingApproval.date}<br/>
            {pendingApproval.allSolo
              ? <span style={{color:"#43aa8b",fontWeight:900}}>🌟 ALL TASKS DONE SOLO — amazing day!</span>
              : <><span>Stars earned: </span>
                {allTasks.map(t=>(
                  <span key={t.id}>{t.emoji}{"⭐".repeat(pendingApproval.stars[t.id]||0)} </span>
                ))}</>
            }<br/>
            💰 Earned today: <strong>{fmtMoney(pendingApproval.earned)}</strong>
          </div>
          {pendingApproval.allSolo && (
            <div style={{background:"linear-gradient(135deg,#fff3cd,#ffeaa7)",borderRadius:12,
              padding:"10px 14px",marginBottom:10,fontSize:13,fontWeight:700,color:"#856404"}}>
              🎊 Isla did EVERYTHING by herself today! Time for some positive reinforcement! 🦫
            </div>
          )}
          <button style={{...S.btn("linear-gradient(135deg,#43aa8b,#2d9a6e)"),width:"100%",fontSize:15}}
            onClick={handleApprove}>
            ✅ Approve & Add to Balance
          </button>
        </div>
      )}

      {/* Balance & pay out */}
      <div style={S.money}>
        <div>
          <div style={{color:"white",fontSize:11,fontWeight:700,opacity:.8}}>TOTAL SAVED 🐾</div>
          <div style={{color:"white",fontSize:30,fontWeight:900}}>{fmtMoney(totalEarned)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"white",fontSize:11,fontWeight:700,opacity:.8}}>🔥 STREAK</div>
          <div style={{color:"white",fontSize:24,fontWeight:900}}>{streak} day{streak!==1?"s":""}</div>
        </div>
      </div>

      <div style={{...S.card,padding:"12px 16px"}}>
        <div style={S.sec}>💸 Pay Out Pocket Money</div>
        <p style={{fontSize:13,color:"#8b6242",fontWeight:600,margin:"0 0 10px",lineHeight:1.5}}>
          When you hand Isla her money, tap below to zero the balance. A record is kept.
        </p>
        <button
          style={{...S.btn(totalEarned>0?"linear-gradient(135deg,#f9c74f,#f4a261)":"linear-gradient(135deg,#ccc,#aaa)"),
            width:"100%", color: totalEarned>0?"#5a3a00":"white"}}
          onClick={handlePayOut} disabled={totalEarned<=0}>
          💰 Pay {fmtMoney(totalEarned)} & Zero Balance
        </button>
        {payHistory.length>0 && (
          <div style={{marginTop:10}}>
            <div style={{fontSize:10,fontWeight:800,color:"#b8906a",letterSpacing:1.5,marginBottom:6}}>PAYMENT HISTORY</div>
            {[...payHistory].reverse().slice(0,5).map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,
                color:"#8b6242",fontWeight:700,padding:"4px 0",borderBottom:"1px solid #fde8c822"}}>
                <span>{p.date}</span><span style={{color:"#43aa8b"}}>{fmtMoney(p.amount)} paid ✓</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How payment works */}
      <div style={{...S.card,padding:"12px 16px"}}>
        <div style={S.sec}>💰 How Payment Works</div>
        <p style={{fontSize:12,color:"#8b6242",fontWeight:600,margin:0,lineHeight:1.8}}>
          ⭐ = asked lots = ⅓ points<br/>
          ⭐⭐ = one reminder = ⅔ points<br/>
          ⭐⭐⭐ = did it alone = full points<br/>
          Daily max = <strong>$5.00</strong> (avg stars ÷ max × $5)<br/>
          Bonus tasks & chores add on top
        </p>
      </div>

      {/* Bonus tasks */}
      <div style={S.card}>
        <div style={S.sec}>✨ Add Bonus Task</div>
        <BonusAdder bonusTasks={bonusTasks} setBonusTasks={setBonusTasks} S={S}/>
      </div>

      {/* Extra chores */}
      <div style={S.card}>
        <div style={S.sec}>🧹 Set Extra Chores</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
          <input style={{...S.input,width:"100%"}} placeholder="Chore name (e.g. Tidy playroom)"
            value={newChore.label} onChange={e=>setNewChore({...newChore,label:e.target.value})}/>
          <div style={{display:"flex",gap:8}}>
            <input style={{...S.input,flex:1}} placeholder="Earns $0.50"
              value={newChore.amount} onChange={e=>setNewChore({...newChore,amount:e.target.value})}/>
            <input style={{...S.input,flex:1}} type="date"
              value={newChore.deadline} onChange={e=>setNewChore({...newChore,deadline:e.target.value})}/>
          </div>
          <button style={{...S.btn("linear-gradient(135deg,#43aa8b,#2d9a6e)"),width:"100%"}}
            onClick={addChore}>Add Chore</button>
        </div>
        {chores.length===0 && <p style={{fontSize:13,color:"#c8a97e",margin:0}}>No extra chores set yet.</p>}
        {chores.map(c=>(
          <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"8px 0",borderTop:"1px solid #fde8c822"}}>
            <div>
              <div style={{fontWeight:800,color:"#6b4226",fontSize:14,
                textDecoration:c.done?"line-through":"none",opacity:c.done?.55:1}}>{c.label}</div>
              {c.deadline&&<div style={{fontSize:11,color:"#b8906a",fontWeight:700}}>Due: {new Date(c.deadline).toLocaleDateString("en-AU")}</div>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:"#43aa8b",fontWeight:900,fontSize:14}}>{fmtMoney(c.amount)}</span>
              {c.done&&<span style={{fontSize:11,background:"#43aa8b22",color:"#2d9a6e",
                borderRadius:6,padding:"2px 8px",fontWeight:700}}>Done ✓</span>}
              <button onClick={()=>setChores(ch=>ch.filter(x=>x.id!==c.id))}
                style={{background:"none",border:"none",color:"#f72585",fontSize:18,cursor:"pointer",fontWeight:900}}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Approved days log */}
      {approvedDays.length>0&&(
        <div style={{...S.card,padding:"12px 16px"}}>
          <div style={S.sec}>📋 Recent Approved Days</div>
          {[...approvedDays].reverse().slice(0,5).map((d,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,
              color:"#8b6242",fontWeight:700,padding:"4px 0",borderBottom:"1px solid #fde8c822"}}>
              <span>{d.date} {d.allSolo?"🌟":""}</span>
              <span style={{color:"#43aa8b"}}>{fmtMoney(d.earned)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{margin:"0 14px"}}>
        <button style={{...S.btn(),width:"100%"}} onClick={()=>setView("child")}>← Back to Isla's View 🦫</button>
      </div>
    </div>
  );

  //  CHILD VIEW 
  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(105vh) rotate(540deg);opacity:0}}
        @keyframes capyDance{0%{transform:rotate(-8deg) scale(1.05)}100%{transform:rotate(8deg) scale(1.05)}}
        @keyframes trailPulse{0%,100%{box-shadow:0 0 0 3px #f7258566}50%{box-shadow:0 0 0 7px #f7258511}}
        @keyframes msgPop{0%{transform:translateX(-50%) scale(0.85);opacity:0}100%{transform:translateX(-50%) scale(1);opacity:1}}
        @keyframes starPop{0%{transform:scale(0.2);opacity:0}60%{transform:scale(1.4)}100%{transform:scale(1);opacity:1}}
        @keyframes starFly{0%{opacity:1;transform:rotate(inherit) translateY(-90px) scale(0.5)}100%{opacity:0;transform:rotate(inherit) translateY(-160px) scale(1.2)}}
        @keyframes headBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <Confetti active={confetti}/>
      <StarBurst show={starBurst}/>
      <div style={S.toast}>{message}</div>

      {/* PIN modal */}
      {showPin&&(
        <div style={{position:"fixed",inset:0,background:"#0007",zIndex:200,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"white",borderRadius:24,padding:28,textAlign:"center",
            width:270,boxShadow:"0 8px 32px #0003"}}>
            <div style={{fontSize:36,marginBottom:6}}>🔐</div>
            <div style={{fontWeight:900,fontSize:17,color:"#6b4226",marginBottom:14}}>Mum's PIN</div>
            <input type="password" autoFocus maxLength={4}
              style={{...S.input,width:"100%",textAlign:"center",fontSize:26,letterSpacing:10,marginBottom:10}}
              value={pinInput} onChange={e=>setPinInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handlePin(setPinInput,setPinError,setShowPin,setView,pinInput)}/>
            {pinError&&<div style={{color:"#f72585",fontSize:13,fontWeight:800,marginBottom:8}}>Nope! Try again 😅</div>}
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn(),flex:1,padding:"10px 0"}}
                onClick={()=>{
                  if(pinInput===PARENT_PIN){setView("parent");setPinInput("");setPinError(false);setShowPin(false);}
                  else{setPinError(true);setPinInput("");}
                }}>Enter</button>
              <button style={{...S.btn("linear-gradient(135deg,#aaa,#888)"),flex:1,padding:"10px 0"}}
                onClick={()=>{setShowPin(false);setPinInput("");setPinError(false);}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>🦫 Isla's Charter</h1>
        <p style={{color:"#fde8c8",margin:"3px 0 0",fontSize:13,fontWeight:700}}>
          {new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}
          {tuesday&&" 🏊 Swimming Day!"}
        </p>
        <button onClick={()=>setShowPin(true)} style={{position:"absolute",top:14,right:14,
          background:"rgba(255,255,255,0.18)",border:"none",borderRadius:10,
          color:"white",fontSize:11,fontWeight:800,padding:"6px 12px",cursor:"pointer"}}>
          👩 Mum
        </button>
      </div>

      {/* Pending notice */}
      {pendingApproval && (
        <div style={{...S.card,background:"#fff9e6",border:"2px solid #f9c74f",textAlign:"center",padding:"12px 16px"}}>
          <div style={{fontSize:22}}>📨</div>
          <div style={{fontWeight:900,color:"#6b4226",fontSize:14}}>Waiting for Mum to approve your day!</div>
          <div style={{fontSize:12,color:"#b8906a",fontWeight:700,marginTop:2}}>Capy is proud of you! 🦫</div>
        </div>
      )}

      {/* Streak */}
      {streak>0&&(
        <div style={{margin:"0 14px 10px",background:"linear-gradient(135deg,#ff6b6b,#ffd93d)",
          borderRadius:16,padding:"8px 16px",display:"flex",alignItems:"center",gap:10,
          boxShadow:"0 3px 12px #ff6b6b33"}}>
          <span style={{fontSize:24}}>🔥</span>
          <div>
            <div style={{color:"white",fontWeight:900,fontSize:15}}>{streak} day streak!</div>
            <div style={{color:"#fff8",fontSize:12,fontWeight:700}}>Keep it going Isla! 💪</div>
          </div>
        </div>
      )}

      {/* Capy */}
      <div style={{textAlign:"center",padding:"4px 0 0",
        animation:allDone?"headBob 0.9s ease-in-out infinite":"none"}}>
        <Capy size={100} happy={allDone} dancing={allDone}/>
        {allDone&&(
          <div style={{fontSize:16,fontWeight:900,
            background:"linear-gradient(90deg,#f72585,#f9c74f,#43aa8b,#4cc9f0)",
            backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"shimmer 1.5s linear infinite",margin:"2px 0 4px"}}>
            Charter Complete! YOU LEGEND! 🏆
          </div>
        )}
      </div>

      {/* Trail */}
      <div style={S.card}>
        <div style={S.sec}>🐾 Morning Trail — {doneTasks}/{allTasks.length}</div>
        <Trail tasks={allTasks} stars={stars}/>
      </div>

      {/* Star guide */}
      <div style={{...S.card,padding:"9px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-around",fontSize:11,fontWeight:700,color:"#b8906a"}}>
          <span>⭐ asked lots</span>
          <span>⭐⭐ one reminder</span>
          <span>⭐⭐⭐ all by myself!</span>
        </div>
      </div>

      {/* Tasks */}
      <div style={S.card}>
        <div style={S.sec}>☀️ Morning Tasks</div>
        {allTasks.map((task,i)=>{
          const val    = stars[task.id]||0;
          const isDone = val>0;
          const isExp  = expandedTask===task.id;
          const subs   = task.subItems||[];
          const subC   = subChecked[task.id]||{};
          const subDone = subs.filter(s=>subC[s]).length;
          return (
            <div key={task.id} style={{
              borderBottom:i<allTasks.length-1?"1px solid #fde8c844":"none",
              background:isDone?"#f6fdf8":"transparent",
              borderRadius:isDone?12:0,marginBottom:isDone?2:0,
              transition:"background 0.3s",padding:"8px 4px",animation:"fadeIn 0.3s ease"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                  <span style={{fontSize:22,flexShrink:0}}>{task.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:15,fontWeight:800,color:"#6b4226",
                        textDecoration:isDone?"line-through":"none",opacity:isDone?0.55:1,
                        transition:"all 0.3s"}}>
                        {task.label}
                      </span>
                      {isDone&&val===3&&<span style={{fontSize:10,background:"linear-gradient(135deg,#f9c74f,#f4a261)",
                        color:"white",borderRadius:6,padding:"1px 7px",fontWeight:900,flexShrink:0}}>⭐ Solo!</span>}
                    </div>
                    {subs.length>0&&(
                      <button onClick={()=>setExpandedTask(isExp?null:task.id)}
                        style={{background:"none",border:"none",padding:0,cursor:"pointer",
                          fontSize:11,fontWeight:800,color:"#f4a261",marginTop:2}}>
                        {isExp?"▲ hide":"▼ checklist"} ({subDone}/{subs.length})
                      </button>
                    )}
                    {!isDone&&<TaskTimer minutes={task.timer}/>}
                  </div>
                </div>
                <div style={{display:"flex",gap:1,marginLeft:8,flexShrink:0}}>
                  {[1,2,3].map(n=>(
                    <span key={n} onClick={()=>handleStar(task.id,val===n?0:n)}
                      style={{fontSize:26,cursor:"pointer",userSelect:"none",
                        color:n<=val?"#f9c74f":"#e0cdb5",
                        transform:n<=val?"scale(1.15)":"scale(1)",
                        transition:"transform 0.15s,color 0.2s",padding:"0 1px"}}>★</span>
                  ))}
                </div>
              </div>
              {isExp&&subs.length>0&&(
                <div style={{animation:"fadeIn 0.2s ease"}}>
                  <SubItems items={subs} checked={subC}
                    onChange={(item,v)=>handleSub(task.id,item,v)}/>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bonus tasks */}
      {bonusTasks.length>0&&(
        <div style={S.card}>
          <div style={S.sec}>🌟 Bonus Tasks from Mum</div>
          {bonusTasks.map(t=>(
            <div key={t.id} style={{...S.row,borderBottom:"1px solid #fde8c822",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>💛</span>
                <span style={{fontWeight:800,fontSize:14,color:"#6b4226",
                  textDecoration:t.done?"line-through":"none",opacity:t.done?0.5:1}}>{t.label}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"#43aa8b",fontWeight:900,fontSize:14}}>{fmtMoney(t.amount)}</span>
                <button onClick={()=>setBonusTasks(bonusTasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))}
                  style={{width:32,height:32,borderRadius:9,
                    border:t.done?"none":"2px solid #c8a97e",
                    background:t.done?"#43aa8b":"white",color:"white",
                    fontSize:15,cursor:"pointer",fontWeight:900,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {t.done?"✓":""}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extra chores */}
      {chores.filter(c=>!c.done).length>0&&(
        <div style={S.card}>
          <div style={S.sec}>🧹 Extra Chores</div>
          {chores.filter(c=>!c.done).map(c=>{
            const overdue = c.deadline && new Date(c.deadline)<new Date() && !c.done;
            return (
              <div key={c.id} style={{...S.row,borderBottom:"1px solid #fde8c822",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:800,color:"#6b4226",fontSize:14}}>{c.label}</div>
                  {c.deadline&&<div style={{fontSize:11,fontWeight:700,
                    color:overdue?"#f72585":"#b8906a"}}>
                    {overdue?"⚠️ Overdue! ":"Due: "}{new Date(c.deadline).toLocaleDateString("en-AU")}
                  </div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{color:"#43aa8b",fontWeight:900,fontSize:14}}>{fmtMoney(c.amount)}</span>
                  <button onClick={()=>completeChore(c.id)}
                    style={{...S.btn("linear-gradient(135deg,#43aa8b,#2d9a6e)"),
                      padding:"7px 14px",fontSize:12}}>Done! ✓</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Money bar */}
      <div style={S.money}>
        <div>
          <div style={{color:"white",fontSize:11,fontWeight:700,opacity:.8}}>TOTAL SAVED 🐾</div>
          <div style={{color:"white",fontSize:28,fontWeight:900}}>{fmtMoney(totalEarned)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"white",fontSize:11,fontWeight:700,opacity:.8}}>TODAY SO FAR</div>
          <div style={{color:"white",fontSize:22,fontWeight:900}}>+{fmtMoney(projected)}</div>
        </div>
      </div>

      {/* Finish button */}
      {allDone&&!pendingApproval&&(
        <div style={{margin:"0 14px"}}>
          <button style={{...S.btn("linear-gradient(135deg,#f9c74f,#f4a261)"),
            width:"100%",fontSize:17,padding:"16px 0",color:"#5a3a00",
            boxShadow:"0 6px 20px #f9c74f55"}} onClick={handleFinish}>
            🎒 All done! Ask Mum to approve! 🦫
          </button>
        </div>
      )}
    </div>
  );
}

//  BONUS ADDER (sub-component to avoid closure issues) 
function BonusAdder({ bonusTasks, setBonusTasks, S }) {
  const [nb, setNb] = useState({label:"",amount:""});
  return (
    <>
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <input style={{...S.input,flex:2,minWidth:120}} placeholder="Task name..."
          value={nb.label} onChange={e=>setNb({...nb,label:e.target.value})}/>
        <input style={{...S.input,width:80}} placeholder="$0.50"
          value={nb.amount} onChange={e=>setNb({...nb,amount:e.target.value})}/>
        <button style={S.btn("linear-gradient(135deg,#43aa8b,#2d9a6e)")}
          onClick={()=>{
            if(!nb.label||!nb.amount) return;
            setBonusTasks([...bonusTasks,{id:Date.now(),...nb,done:false}]);
            setNb({label:"",amount:""});
          }}>Add</button>
      </div>
      {bonusTasks.length===0&&<p style={{color:"#c8a97e",fontSize:13,margin:0}}>No bonus tasks yet!</p>}
      {bonusTasks.map(t=>(
        <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"8px 0",borderTop:"1px solid #fde8c822"}}>
          <span style={{fontWeight:700,color:"#6b4226",fontSize:14}}>{t.label}</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#43aa8b",fontWeight:800}}>{`$${parseFloat(t.amount).toFixed(2)}`}</span>
            {t.done&&<span style={{fontSize:11,background:"#43aa8b22",color:"#2d9a6e",
              borderRadius:6,padding:"2px 8px",fontWeight:700}}>Done ✓</span>}
            <button onClick={()=>setBonusTasks(bonusTasks.filter(x=>x.id!==t.id))}
              style={{background:"none",border:"none",color:"#f72585",fontSize:18,cursor:"pointer",fontWeight:900}}>×</button>
          </div>
        </div>
      ))}
    </>
  );
}
