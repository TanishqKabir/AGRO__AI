import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─────────────────────────────────────────────────────────────────── */
const LANGS = {
  en:{ label:"English",   flag:"🇬🇧", nav:{home:"Home",about:"About",features:"Features",dashboard:"Dashboard",weather:"Weather",contact:"Contact"}, hero:{tag:"AI-Powered Agriculture Platform",h1:"Farm smarter.",h2:"Grow fearless.",sub:"AgroAI fuses satellite intelligence & real-time AI to give every farmer a precision agronomist in their pocket.",cta:"Start Free Trial",demo:"Watch Demo"}, chat:{ph:"Ask AgroAI anything…",send:"Send",title:"AgroAI Assistant",sub:"Powered by Agricultural AI"}, voice:{tap:"Tap to speak",listening:"Listening…",title:"Voice Assistant"} },
  hi:{ label:"हिंदी",     flag:"🇮🇳", nav:{home:"होम",about:"हमारे बारे में",features:"विशेषताएं",dashboard:"डैशबोर्ड",weather:"मौसम",contact:"संपर्क"}, hero:{tag:"AI-संचालित कृषि",h1:"स्मार्ट खेती।",h2:"निडर उगाएं।",sub:"AgroAI हर किसान को AI की शक्ति देता है।",cta:"निःशुल्क शुरू करें",demo:"डेमो देखें"}, chat:{ph:"अपनी खेती के बारे में पूछें…",send:"भेजें",title:"AgroAI सहायक",sub:"कृषि AI द्वारा संचालित"}, voice:{tap:"बोलने के लिए दबाएं",listening:"सुन रहा है…",title:"वॉयस सहायक"} },
  mr:{ label:"मराठी",     flag:"🇮🇳", nav:{home:"मुख्यपृष्ठ",about:"आमच्याबद्दल",features:"वैशिष्ट्ये",dashboard:"डॅशबोर्ड",weather:"हवामान",contact:"संपर्क"}, hero:{tag:"AI-चालित शेती",h1:"हुशार शेती।",h2:"निर्भयपणे वाढा।",sub:"AgroAI प्रत्येक शेतकऱ्याला AI ची ताकद देतो.",cta:"विनामूल्य सुरू करा",demo:"डेमो पहा"}, chat:{ph:"तुमच्या शेताबद्दल विचारा…",send:"पाठवा",title:"AgroAI सहाय्यक",sub:"कृषी AI"}, voice:{tap:"बोलण्यासाठी दाबा",listening:"ऐकत आहे…",title:"व्हॉइस सहाय्यक"} },
  gu:{ label:"ગુજરાતી",   flag:"🇮🇳", nav:{home:"હોમ",about:"અમારા વિશે",features:"વૈશિષ્ટ્યો",dashboard:"ડૅશ",weather:"હવામાન",contact:"સંપર્ક"}, hero:{tag:"AI ખેતી",h1:"સ્માર્ટ ખેતી।",h2:"નિર્ભય ઉગાડો।",sub:"AgroAI દ્વારા ખેડૂતોને AI ની શક્તિ.",cta:"મફત શરૂ",demo:"ડેમો"}, chat:{ph:"ખેત વિશે પૂછો…",send:"મોકલો",title:"AgroAI",sub:"AI"}, voice:{tap:"બોલો",listening:"સાંભળે છે…",title:"Voice"} },
  ta:{ label:"தமிழ்",     flag:"🇮🇳", nav:{home:"முகப்பு",about:"பற்றி",features:"அம்சங்கள்",dashboard:"டாஷ்",weather:"வானிலை",contact:"தொடர்பு"}, hero:{tag:"AI விவசாயம்",h1:"புத்திசாலி விவசாயம்.",h2:"தைரியமாக வளர்.",sub:"AgroAI விவசாயிகளுக்கு AI சக்தி.",cta:"இலவசம்",demo:"டெமோ"}, chat:{ph:"கேளுங்கள்…",send:"அனுப்பு",title:"AgroAI",sub:"AI"}, voice:{tap:"பேசுங்கள்",listening:"கேட்கிறது…",title:"Voice"} },
};

const CHAT_RESP = {
  en:["Soil moisture in Field A: 68% — ideal for wheat. Irrigate in 3 days.","NDVI analysis: 92% crop health. One zone shows early stress signs.","14-day forecast: Avoid pesticides Thursday — 40% rain probability after 3pm.","Rice yield projected +18% above regional average. Harvest window: Oct 12–18.","AI detects high leaf blight risk in Block B. Recommend fungicide spray now."],
  hi:["खेत A: मिट्टी नमी 68% — गेहूं के लिए आदर्श।","NDVI: 92% फसल स्वास्थ्य। Block B में झुलसा जोखिम।","14-दिन पूर्वानुमान: गुरुवार कीटनाशक न लगाएं।"],
  mr:["शेत A: आर्द्रता 68%. Block B: रोग धोका उच्च.","14 दिवस अंदाज: गुरुवारी फवारणी टाळा."],
  gu:["ખેત A: ભેજ 68%. Block B: રોગ ઉચ્ચ જોખમ."],
  ta:["வயல் A: ஈரப்பதம் 68%. Block B: இலை கருக்கல் அபாயம்."],
};

const CROP_AI = {
  wheat:  { health:88, disease:"Powdery Mildew — Low Risk ✅",   yield:"+22% above average", irrigation:"Irrigate in 4 days",         color:"#fbbf24", emoji:"🌾" },
  rice:   { health:76, disease:"Brown Spot — Medium Risk ⚠️",    yield:"+15% above average", irrigation:"Irrigate tomorrow morning",  color:"#4ade80", emoji:"🍚" },
  cotton: { health:92, disease:"Bollworm — Low Risk ✅",          yield:"+28% above average", irrigation:"Skip — moisture optimal",    color:"#38bdf8", emoji:"🌸" },
  maize:  { health:61, disease:"Leaf Blight — HIGH RISK 🔴",      yield:"-5% below average",  irrigation:"Irrigate urgently today",   color:"#ef4444", emoji:"🌽" },
  soybean:{ health:84, disease:"Rust — Low Risk ✅",              yield:"+18% above average", irrigation:"Irrigate in 2 days",         color:"#a78bfa", emoji:"🫘" },
};

const CHART_DATA = [
  {m:"Jan",yield:62,moisture:58,health:70},{m:"Feb",yield:58,moisture:52,health:65},{m:"Mar",yield:71,moisture:63,health:78},
  {m:"Apr",yield:80,moisture:70,health:82},{m:"May",yield:75,moisture:65,health:79},{m:"Jun",yield:90,moisture:80,health:91},
  {m:"Jul",yield:95,moisture:85,health:94},{m:"Aug",yield:88,moisture:78,health:90},{m:"Sep",yield:92,moisture:82,health:93},
  {m:"Oct",yield:97,moisture:88,health:96},{m:"Nov",yield:85,moisture:75,health:88},{m:"Dec",yield:78,moisture:70,health:84},
];

const WEATHER = [
  {day:"Mon",high:32,low:22,icon:"☀️", rain:5,  hum:45,wind:12,desc:"Clear & Sunny"},
  {day:"Tue",high:29,low:21,icon:"⛅", rain:20, hum:60,wind:18,desc:"Partly Cloudy"},
  {day:"Wed",high:26,low:19,icon:"🌧️",rain:70, hum:82,wind:22,desc:"Heavy Rain"},
  {day:"Thu",high:24,low:18,icon:"🌦️",rain:45, hum:75,wind:16,desc:"Showers"},
  {day:"Fri",high:30,low:22,icon:"🌤️",rain:10, hum:50,wind:10,desc:"Mostly Clear"},
  {day:"Sat",high:33,low:24,icon:"☀️", rain:3,  hum:42,wind:8, desc:"Hot & Sunny"},
  {day:"Sun",high:31,low:23,icon:"🌤️",rain:8,  hum:48,wind:11,desc:"Partly Clear"},
];

const SAT_FIELDS = [
  { id:"A", x:60,  y:50,  w:200, h:140, crop:"Wheat",  ndvi:0.82, status:"Healthy",   color:"#4ade80" },
  { id:"B", x:275, y:40,  w:160, h:120, crop:"Rice",   ndvi:0.67, status:"Monitor",   color:"#fbbf24" },
  { id:"C", x:60,  y:205, w:150, h:110, crop:"Cotton", ndvi:0.91, status:"Excellent", color:"#22d3ee" },
  { id:"D", x:225, y:175, w:130, h:100, crop:"Maize",  ndvi:0.44, status:"Alert",     color:"#ef4444" },
  { id:"E", x:370, y:175, w:100, h:100, crop:"Soybean",ndvi:0.78, status:"Good",      color:"#a78bfa" },
];

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#030a05;color:#fff}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#030a05}::-webkit-scrollbar-thumb{background:#1a3325;border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes glow{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.75;transform:scale(1.07)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes spinR{to{transform:rotate(-360deg)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.55)}50%{box-shadow:0 0 0 14px rgba(74,222,128,0)}}
@keyframes ripple{0%{transform:scale(1);opacity:1}100%{transform:scale(2.8);opacity:0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes wave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@keyframes scan{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes splashPop{0%{opacity:0;transform:scale(.8)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes ndviFill{from{width:0}to{width:var(--w)}}
.btn-g{background:linear-gradient(135deg,#4ade80,#22d3ee);color:#030a05;border:none;padding:.88rem 2.2rem;border-radius:100px;font-size:.94rem;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .3s cubic-bezier(.23,1,.32,1);animation:pulse 3s ease-in-out infinite}
.btn-g:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 18px 50px rgba(74,222,128,.4)}
.btn-g:active{transform:scale(.97)}
.btn-o{background:transparent;color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.22);padding:.88rem 2.2rem;border-radius:100px;font-size:.94rem;font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .3s}
.btn-o:hover{background:rgba(255,255,255,.07);transform:translateY(-2px)}
.btn-o:active{transform:scale(.97)}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(74,222,128,.12);border-radius:20px;transition:all .32s cubic-bezier(.23,1,.32,1)}
.card:hover{border-color:rgba(74,222,128,.3);transform:translateY(-4px);box-shadow:0 20px 52px rgba(74,222,128,.1)}
.ni{color:rgba(255,255,255,.58);font-size:.87rem;font-weight:500;cursor:pointer;padding:.4rem .1rem;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap}
.ni:hover,.ni.act{color:#4ade80;border-bottom-color:#4ade80}
.badge{display:inline-flex;align-items:center;gap:6px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.26);color:#4ade80;padding:.28rem .88rem;border-radius:100px;font-size:.73rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;margin-bottom:1.15rem}
.inp{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.11);color:#fff;padding:.73rem 1rem;border-radius:12px;font-family:'Outfit',sans-serif;font-size:.88rem;outline:none;transition:border .2s;width:100%}
.inp:focus{border-color:rgba(74,222,128,.52)}
.inp::placeholder{color:rgba(255,255,255,.33)}
.gbg{background-image:linear-gradient(rgba(74,222,128,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,.04) 1px,transparent 1px);background-size:56px 56px}
.pe{animation:fadeUp .45s ease forwards}
.dz{border:2px dashed rgba(74,222,128,.35);border-radius:20px;transition:all .3s;cursor:pointer}
.dz:hover,.dz.ov{border-color:#4ade80;background:rgba(74,222,128,.06)}
.fcard{cursor:pointer;transition:all .3s cubic-bezier(.23,1,.32,1)}
.fcard:hover{transform:translateY(-6px) scale(1.02)}
.fcard:active{transform:scale(.97)}
.modal-bg{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;animation:fadeIn .25s ease}
.modal{background:#0b1e0e;border:1px solid rgba(74,222,128,.25);border-radius:26px;max-width:560px;width:92%;max-height:88vh;overflow-y:auto;animation:fadeUp .3s ease;box-shadow:0 40px 100px rgba(0,0,0,.7)}
.tab-btn{background:transparent;border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);padding:.45rem 1rem;border-radius:100px;cursor:pointer;font-size:.8rem;font-weight:600;font-family:'Outfit',sans-serif;transition:all .2s}
.tab-btn.on{background:rgba(74,222,128,.15);border-color:rgba(74,222,128,.5);color:#4ade80}
.tab-btn:hover:not(.on){background:rgba(255,255,255,.05);color:rgba(255,255,255,.8)}
tr.row:hover td{background:rgba(255,255,255,.03)}
`;

/* ─── LOGO ──────────────────────────────────────────────────────────────────── */
function Logo({ size=42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient>
        <linearGradient id="lg2" x1="44" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#4ade80" stopOpacity=".4"/></linearGradient>
      </defs>
      <path d="M22 3L38 12.5 38 31.5 22 41 6 31.5 6 12.5Z" fill="url(#lg1)" opacity=".15" stroke="url(#lg1)" strokeWidth="1.5"/>
      <path d="M22 31C22 31 13 24 14 16C15 10 22 8 22 8C22 8 29 10 30 16C31 24 22 31 22 31Z" fill="url(#lg1)" opacity=".95"/>
      <line x1="22" y1="31" x2="22" y2="39" stroke="url(#lg1)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M22 24C22 24 16 21 16 17C18.5 17 22 20 22 24Z" fill="#22d3ee" opacity=".85"/>
      <path d="M22 24C22 24 28 21 28 17C25.5 17 22 20 22 24Z" fill="#4ade80" opacity=".7"/>
      <circle cx="22" cy="16" r="2.2" fill="#fff" opacity=".95"/>
      <circle cx="15" cy="21" r="1.3" fill="#22d3ee" opacity=".9"/>
      <circle cx="29" cy="21" r="1.3" fill="#4ade80" opacity=".9"/>
      <line x1="15" y1="21" x2="22" y2="16" stroke="rgba(34,211,238,.5)" strokeWidth=".7"/>
      <line x1="29" y1="21" x2="22" y2="16" stroke="rgba(74,222,128,.5)" strokeWidth=".7"/>
      <ellipse cx="22" cy="22" rx="19" ry="6.5" stroke="url(#lg2)" strokeWidth=".8" fill="none" strokeDasharray="3 3" opacity=".5"/>
    </svg>
  );
}

/* ─── MODAL WRAPPER ─────────────────────────────────────────────────────────── */
function Modal({ onClose, children, wide }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: wide ? 720 : 560 }}>
        {children}
      </div>
    </div>
  );
}

/* ─── MAIN APP ──────────────────────────────────────────────────────────────── */
export default function AgroAI() {
  const [appState, setAppState] = useState("splash"); // splash | login | register | app
  const [page, setPage]         = useState("home");
  const [lang, setLang]         = useState("en");
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [msgs, setMsgs]         = useState([{ role:"ai", text:"🌱 Hello! I'm AgroAI — your intelligent farming assistant. Ask me anything about your crops, soil, or weather!" }]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [activeChart, setActiveChart] = useState("yield");
  const chatEnd = useRef();
  const t = LANGS[lang];

  useEffect(() => { setTimeout(() => setAppState("login"), 2000); }, []);
  useEffect(() => { const s = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", s); return () => window.removeEventListener("scroll", s); }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const sendMsg = useCallback(() => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { role:"user", text:input }]);
    setInput(""); setTyping(true);
    const r = CHAT_RESP[lang] || CHAT_RESP.en;
    setTimeout(() => { setMsgs(m => [...m, { role:"ai", text:r[Math.floor(Math.random()*r.length)] }]); setTyping(false); }, 1100 + Math.random()*700);
  }, [input, lang]);

  const toggleVoice = () => {
    if (!listening) {
      setListening(true); setVoiceText("");
      const q = ["What is the crop health of Field B?","When should I irrigate wheat?","Show rainfall forecast."];
      const chosen = q[Math.floor(Math.random()*q.length)];
      setTimeout(() => { setVoiceText(chosen); setTimeout(() => { setListening(false); const r = CHAT_RESP[lang]||CHAT_RESP.en; setMsgs(m => [...m, {role:"user",text:chosen},{role:"ai",text:r[0]}]); setVoiceOpen(false); setChatOpen(true); }, 1800); }, 1400);
    } else setListening(false);
  };

  const maxV = Math.max(...CHART_DATA.map(d => d[activeChart]));

  /* ── SPLASH ── */
  if (appState === "splash") return (
    <div style={{minHeight:"100vh",background:"#030a05",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1.4rem"}}>
      <style>{CSS}</style>
      <div style={{animation:"splashPop .8s cubic-bezier(.23,1,.32,1) forwards"}}><Logo size={80}/></div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:"2.6rem",fontWeight:800,letterSpacing:"-.05em",background:"linear-gradient(135deg,#fff 55%,#4ade80)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"fadeUp .6s .3s ease forwards",opacity:0}}>AgroAI</div>
      <div style={{fontSize:".76rem",color:"rgba(74,222,128,.6)",letterSpacing:".15em",textTransform:"uppercase",animation:"fadeUp .6s .5s ease forwards",opacity:0}}>Precision Farming Intelligence</div>
      <div style={{display:"flex",gap:5,marginTop:".8rem"}}>{[0,.22,.44].map(d=><div key={d} style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",animation:`blink 1.2s ease ${d}s infinite`}}/>)}</div>
    </div>
  );

  if (appState==="login"||appState==="register") return <AuthPage mode={appState} onLogin={()=>setAppState("app")} onSwitch={()=>setAppState(appState==="login"?"register":"login")}/>;

  /* ── APP ── */
  return (
    <div style={{fontFamily:"'Outfit',sans-serif",background:"#030a05",color:"#fff",minHeight:"100vh",overflowX:"hidden"}}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.5rem",background:scrolled?"rgba(3,10,5,.93)":"transparent",backdropFilter:scrolled?"blur(22px)":"none",borderBottom:scrolled?"1px solid rgba(74,222,128,.1)":"1px solid transparent",transition:"all .4s",gap:"1rem"}}>
        <div onClick={()=>setPage("home")} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",flexShrink:0}}>
          <Logo size={36}/>
          <div>
            <div style={{fontSize:"1.12rem",fontWeight:800,letterSpacing:"-.04em",fontFamily:"'Syne',sans-serif",background:"linear-gradient(135deg,#fff 55%,#4ade80)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>AgroAI</div>
            <div style={{fontSize:".48rem",color:"rgba(74,222,128,.7)",letterSpacing:".1em",fontWeight:600}}>PRECISION FARMING</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"1.4rem",alignItems:"center"}}>
          {Object.entries(t.nav).map(([k,l])=><span key={k} className={`ni${page===k?" act":""}`} onClick={()=>setPage(k)}>{l}</span>)}
        </div>
        <div style={{display:"flex",gap:".6rem",alignItems:"center",flexShrink:0}}>
          {/* Language */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setLangOpen(!langOpen)} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.8)",padding:".34rem .7rem",borderRadius:100,cursor:"pointer",fontSize:".76rem",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:4,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"}>
              {LANGS[lang].flag} {LANGS[lang].label.split(" ")[0]} ▾
            </button>
            {langOpen&&(
              <div style={{position:"absolute",top:"calc(100%+8px)",right:0,background:"#0d1f12",border:"1px solid rgba(74,222,128,.2)",borderRadius:14,overflow:"hidden",zIndex:300,minWidth:145,boxShadow:"0 16px 40px rgba(0,0,0,.5)"}}>
                {Object.entries(LANGS).map(([code,l])=>(
                  <div key={code} onClick={()=>{setLang(code);setLangOpen(false);}} style={{padding:".56rem .88rem",cursor:"pointer",fontSize:".81rem",background:lang===code?"rgba(74,222,128,.12)":"transparent",color:lang===code?"#4ade80":"rgba(255,255,255,.75)",display:"flex",gap:7,alignItems:"center",fontFamily:"'Outfit',sans-serif",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"} onMouseLeave={e=>e.currentTarget.style.background=lang===code?"rgba(74,222,128,.12)":"transparent"}>
                    {l.flag} {l.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={()=>setVoiceOpen(true)} style={{background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.25)",color:"#4ade80",padding:".34rem .7rem",borderRadius:100,cursor:"pointer",fontSize:".81rem",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(74,222,128,.2)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(74,222,128,.1)"}}>🎙 Voice</button>
          <button onClick={()=>setAppState("login")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.55)",padding:".34rem .75rem",borderRadius:100,cursor:"pointer",fontSize:".76rem",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.55)"}>Sign Out</button>
        </div>
      </nav>

      <div style={{paddingTop:64}}>
        {page==="home"      && <HomePage t={t} setPage={setPage}/>}
        {page==="about"     && <AboutPage/>}
        {page==="features"  && <FeaturesPage setPage={setPage}/>}
        {page==="dashboard" && <DashboardPage chartData={CHART_DATA} activeChart={activeChart} setActiveChart={setActiveChart} maxV={maxV}/>}
        {page==="weather"   && <WeatherPage/>}
        {page==="contact"   && <ContactPage/>}
      </div>

      {/* Chat FAB */}
      <button onClick={()=>setChatOpen(c=>!c)} style={{position:"fixed",bottom:"5.5rem",right:"2rem",zIndex:150,width:54,height:54,borderRadius:"50%",background:"linear-gradient(135deg,#4ade80,#22d3ee)",border:"none",cursor:"pointer",fontSize:"1.3rem",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 28px rgba(74,222,128,.45)",animation:"pulse 3s ease-in-out infinite",transition:"transform .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        {chatOpen?"✕":"🌿"}
      </button>

      {/* Chat Panel */}
      {chatOpen&&(
        <div style={{position:"fixed",bottom:"8rem",right:"2rem",zIndex:150,width:345,height:480,background:"#0b1e0e",border:"1px solid rgba(74,222,128,.22)",borderRadius:22,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 28px 70px rgba(0,0,0,.65)",animation:"fadeUp .3s ease"}}>
          <div style={{padding:".95rem 1.15rem",background:"linear-gradient(135deg,rgba(74,222,128,.15),rgba(34,211,238,.08))",borderBottom:"1px solid rgba(74,222,128,.15)",display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#4ade80,#22d3ee)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".95rem"}}>🌿</div>
            <div><div style={{fontWeight:700,fontSize:".88rem",fontFamily:"'Syne',sans-serif"}}>{t.chat.title}</div><div style={{fontSize:".66rem",color:"rgba(74,222,128,.8)"}}>● {t.chat.sub}</div></div>
            <button onClick={()=>{setVoiceOpen(true);setChatOpen(false);}} style={{marginLeft:"auto",background:"rgba(74,222,128,.12)",border:"1px solid rgba(74,222,128,.25)",color:"#4ade80",borderRadius:100,padding:".26rem .62rem",cursor:"pointer",fontSize:".7rem",fontFamily:"'Outfit',sans-serif"}}>🎙</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:".85rem",display:"flex",flexDirection:"column",gap:".62rem"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"82%",padding:".58rem .82rem",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?"linear-gradient(135deg,#4ade80,#22d3ee)":"rgba(255,255,255,.07)",color:m.role==="user"?"#030a05":"rgba(255,255,255,.9)",fontSize:".82rem",lineHeight:1.6,fontFamily:"'Outfit',sans-serif"}}>{m.text}</div>
              </div>
            ))}
            {typing&&<div style={{display:"flex",gap:4,padding:".58rem .82rem",background:"rgba(255,255,255,.07)",borderRadius:"14px 14px 14px 4px",width:"fit-content"}}>{[0,.2,.4].map(d=><div key={d} style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",animation:`blink 1s ease ${d}s infinite`}}/>)}</div>}
            <div ref={chatEnd}/>
          </div>
          <div style={{padding:".65rem",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:7}}>
            <input className="inp" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder={t.chat.ph} style={{flex:1,padding:".58rem .82rem",borderRadius:10}}/>
            <button onClick={sendMsg} style={{background:"linear-gradient(135deg,#4ade80,#22d3ee)",border:"none",color:"#030a05",padding:".58rem .92rem",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:".8rem",fontFamily:"'Outfit',sans-serif",transition:"transform .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{t.chat.send}</button>
          </div>
        </div>
      )}

      {/* Voice Modal */}
      {voiceOpen&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setVoiceOpen(false)}>
          <div style={{background:"#0b1e0e",border:"1px solid rgba(74,222,128,.25)",borderRadius:28,padding:"3rem 2.5rem",textAlign:"center",maxWidth:330,width:"90%",animation:"fadeUp .3s ease"}}>
            <div style={{fontSize:"1rem",fontWeight:700,marginBottom:"1.5rem",fontFamily:"'Syne',sans-serif"}}>{t.voice.title}</div>
            <div onClick={toggleVoice} style={{width:94,height:94,borderRadius:"50%",background:listening?"linear-gradient(135deg,#ef4444,#f97316)":"linear-gradient(135deg,#4ade80,#22d3ee)",margin:"0 auto 1.4rem",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"2.3rem",position:"relative",animation:listening?"pulse 1s ease-in-out infinite":"pulse 3s ease-in-out infinite",transition:"all .3s"}}>
              {listening?"🎤":"🎙"}
              {listening&&[1,2,3].map(i=><div key={i} style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(239,68,68,.4)",animation:`ripple ${i*.5+.5}s ease-out infinite`}}/>)}
            </div>
            <div style={{fontSize:".86rem",color:listening?"#4ade80":"rgba(255,255,255,.5)",marginBottom:"1rem",fontFamily:"'Outfit',sans-serif",transition:"color .3s"}}>{listening?t.voice.listening:t.voice.tap}</div>
            {voiceText&&<div style={{background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.2)",borderRadius:12,padding:".65rem .95rem",fontSize:".81rem",color:"rgba(255,255,255,.8)",fontFamily:"'Outfit',sans-serif",fontStyle:"italic"}}>"{voiceText}"</div>}
            {listening&&<div style={{display:"flex",gap:4,justifyContent:"center",marginTop:".95rem"}}>{[0,.1,.2,.1,.3,.1,.2,.1,0].map((d,i)=><div key={i} style={{width:4,height:21,borderRadius:2,background:"linear-gradient(to top,#4ade80,#22d3ee)",transformOrigin:"bottom",animation:`wave .8s ease ${d}s infinite`}}/>)}</div>}
            <button onClick={()=>setVoiceOpen(false)} style={{marginTop:"1.4rem",background:"transparent",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.5)",padding:".42rem 1.3rem",borderRadius:100,cursor:"pointer",fontSize:".81rem",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.35)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.15)"}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── AUTH ──────────────────────────────────────────────────────────────────── */
function AuthPage({ mode, onLogin, onSwitch }) {
  const isLogin = mode === "login";
  const [f, setF] = useState({ name:"", email:"", phone:"", pw:"", cpw:"", role:"farmer" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const I = ({ label, type="text", field, ph, req }) => (
    <div>
      <label style={{fontSize:".73rem",color:"rgba(255,255,255,.5)",display:"block",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>{label}{req&&" *"}</label>
      <input required={req} type={type} value={f[field]} onChange={e=>setF({...f,[field]:e.target.value})} placeholder={ph} className="inp"/>
    </div>
  );

  const submit = e => {
    e.preventDefault(); setErr("");
    if (!isLogin && f.pw !== f.cpw) { setErr("Passwords do not match."); return; }
    if (f.pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1500);
  };

  return (
    <div style={{minHeight:"100vh",background:"#030a05",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem",position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,222,128,.1),transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"glow 5s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:470,animation:"fadeUp .55s ease forwards"}}>
        <div style={{textAlign:"center",marginBottom:"2.3rem"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:"1rem"}}>
            <Logo size={46}/>
            <div>
              <div style={{fontSize:"1.5rem",fontWeight:800,letterSpacing:"-.04em",fontFamily:"'Syne',sans-serif",background:"linear-gradient(135deg,#fff 55%,#4ade80)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>AgroAI</div>
              <div style={{fontSize:".5rem",color:"rgba(74,222,128,.7)",letterSpacing:".12em",fontWeight:600}}>PRECISION FARMING</div>
            </div>
          </div>
          <h2 style={{fontSize:"1.5rem",fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-.03em",marginBottom:".35rem"}}>{isLogin?"Welcome back 👋":"Join AgroAI 🌱"}</h2>
          <p style={{fontSize:".85rem",color:"rgba(255,255,255,.45)",fontFamily:"'Outfit',sans-serif"}}>{isLogin?"Sign in to your farm dashboard":"Create your free farming account"}</p>
        </div>
        <form onSubmit={submit} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(74,222,128,.16)",borderRadius:24,padding:"2.1rem",display:"flex",flexDirection:"column",gap:".95rem"}}>
          {!isLogin&&<I label="Full Name" field="name" ph="e.g. Rajesh Patel" req/>}
          <I label="Email Address" type="email" field="email" ph="you@farm.com" req/>
          {!isLogin&&<I label="Phone / WhatsApp" field="phone" ph="+91 99677 22680"/>}
          {!isLogin&&(
            <div>
              <div style={{fontSize:".73rem",color:"rgba(255,255,255,.5)",marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>I am a…</div>
              <div style={{display:"flex",gap:".45rem",flexWrap:"wrap"}}>
                {[["farmer","🌾"],["agronomist","🔬"],["researcher","📊"],["enterprise","🏢"]].map(([r,ic])=>(
                  <div key={r} onClick={()=>setF({...f,role:r})} style={{flex:1,minWidth:75,padding:".5rem .3rem",textAlign:"center",borderRadius:10,cursor:"pointer",border:`1px solid ${f.role===r?"rgba(74,222,128,.6)":"rgba(255,255,255,.1)"}`,background:f.role===r?"rgba(74,222,128,.1)":"rgba(255,255,255,.03)",color:f.role===r?"#4ade80":"rgba(255,255,255,.5)",fontSize:".7rem",fontWeight:600,textTransform:"capitalize",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>
                    {ic} {r}
                  </div>
                ))}
              </div>
            </div>
          )}
          <I label="Password" type="password" field="pw" ph="Min. 6 characters" req/>
          {!isLogin&&<I label="Confirm Password" type="password" field="cpw" ph="Re-enter password" req/>}
          {err&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,padding:".55rem .85rem",fontSize:".8rem",color:"#fca5a5",fontFamily:"'Outfit',sans-serif"}}>⚠️ {err}</div>}
          {isLogin&&<div style={{textAlign:"right"}}><span style={{fontSize:".75rem",color:"rgba(74,222,128,.7)",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}} onClick={()=>alert("Password reset link sent!")}>Forgot password?</span></div>}
          <button type="submit" disabled={loading} style={{background:"linear-gradient(135deg,#4ade80,#22d3ee)",color:"#030a05",border:"none",padding:".95rem",borderRadius:100,fontWeight:700,fontSize:".98rem",cursor:"pointer",fontFamily:"'Outfit',sans-serif",animation:loading?"none":"pulse 3s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:".2rem"}}>
            {loading?<><div style={{width:17,height:17,borderRadius:"50%",border:"2px solid #030a05",borderTopColor:"transparent",animation:"spin .8s linear infinite"}}/>Processing…</>:isLogin?"Sign In →":"Create Account →"}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.08)"}}/>
            <span style={{fontSize:".72rem",color:"rgba(255,255,255,.3)",fontFamily:"'Outfit',sans-serif"}}>or</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.08)"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".65rem"}}>
            {[["🌐","Google"],["📱","OTP Login"]].map(([ic,lb])=>(
              <button key={lb} type="button" onClick={onLogin} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.75)",padding:".68rem",borderRadius:12,cursor:"pointer",fontSize:".83rem",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.09)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}>{ic} {lb}</button>
            ))}
          </div>
        </form>
        <p style={{textAlign:"center",marginTop:"1.3rem",fontSize:".83rem",color:"rgba(255,255,255,.4)",fontFamily:"'Outfit',sans-serif"}}>
          {isLogin?"Don't have an account? ":"Already have an account? "}
          <span onClick={onSwitch} style={{color:"#4ade80",cursor:"pointer",fontWeight:600}}>{isLogin?"Sign up free →":"Sign in →"}</span>
        </p>
      </div>
    </div>
  );
}

/* ─── HOME ──────────────────────────────────────────────────────────────────── */
function HomePage({ t, setPage }) {
  const [modal, setModal] = useState(null); // null | feature key
  const stats = [{ v:"47%",l:"Yield Increase" },{ v:"31%",l:"Water Saved" },{ v:"2.3M",l:"Acres Managed" },{ v:"98.7%",l:"Detection Accuracy" }];

  const FEAT_DETAILS = {
    satellite:{ title:"Satellite Analytics", icon:"🛰️", color:"#22d3ee", body:"Daily Sentinel-2 & PlanetScope imagery processed into NDVI, NDWI, and NDRE indices. Sub-field variability maps at 3m resolution delivered to your dashboard every morning. Click any field in the Dashboard to view its live satellite data.", action:()=>setPage("dashboard") },
    crop:     { title:"Smart AI Crop Prediction", icon:"🌾", color:"#4ade80", body:"Drag & drop a crop image for instant AI health analysis. Our Vision AI detects 300+ diseases, evaluates crop health on a 0–100 scale, forecasts yield deviation, and recommends irrigation timing — all in under 10 seconds.", action:()=>setPage("features") },
    irrigation:{ title:"Smart Irrigation", icon:"💧", color:"#38bdf8", body:"Multi-variable irrigation scheduling fuses soil moisture sensors, weather APIs, evapotranspiration models, and crop growth stages. Average water reduction: 31%. Set irrigation zones and get automated daily recommendations.", action:()=>setPage("dashboard") },
    weather:  { title:"Hyperlocal Weather AI", icon:"🌦️", color:"#fbbf24", body:"14-day forecasts at 500m resolution, blending NWP models, radar nowcasting, and 50 years of local climate history. Updated every 3 hours. Get AI-generated farm advisories for each forecast day.", action:()=>setPage("weather") },
    disease:  { title:"Crop Disease AI", icon:"🌱", color:"#a78bfa", body:"Deep learning models trained on 50M+ crop images detect 300+ diseases, pests, and nutrient deficiencies at 97.3% accuracy — often 2–3 weeks before visible symptoms appear. Covers wheat, rice, cotton, maize, soybean, and 20+ more crops.", action:()=>setPage("features") },
    voice:    { title:"Multi-Language Voice AI", icon:"🗣️", color:"#f97316", body:"Speak naturally in Hindi, Marathi, Gujarati, Tamil, Telugu, Punjabi, Bengali, or English. Ask any farming question and receive spoken AI answers. Works offline for basic queries. Use the 🎙 button in the top navbar to try it now.", action:null },
  };

  const feats = [
    { key:"satellite", icon:"🛰️", title:"Satellite Analytics", desc:"Daily field maps at 3m resolution for yield prediction.", color:"#22d3ee" },
    { key:"crop",      icon:"🌾", title:"Smart AI Crop Prediction", desc:"Drag & drop crop images — instant AI health analysis.", color:"#4ade80" },
    { key:"irrigation",icon:"💧", title:"Smart Irrigation", desc:"Precision water scheduling reduces usage by 31%.", color:"#38bdf8" },
    { key:"weather",   icon:"🌦️", title:"Hyperlocal Weather", desc:"14-day forecasts fused with 50 years of climate data.", color:"#fbbf24" },
    { key:"disease",   icon:"🌱", title:"Crop Disease AI", desc:"Detect 300+ diseases before visible symptoms appear.", color:"#a78bfa" },
    { key:"voice",     icon:"🗣️", title:"Multi-Language Voice", desc:"Hindi, Marathi, Gujarati, Tamil & 10+ more languages.", color:"#f97316" },
  ];

  return (
    <div className="pe">
      {/* Hero */}
      <section className="gbg" style={{minHeight:"calc(100vh - 64px)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",padding:"4rem 2rem"}}>
        {[["50%","50%","#4ade80",700],["80%","20%","#22d3ee",500],["15%","75%","#a78bfa",400]].map(([lx,ty,c,s],i)=>(
          <div key={i} style={{position:"absolute",width:s,height:s,borderRadius:"50%",background:`radial-gradient(circle,${c}1a 0%,transparent 70%)`,left:lx,top:ty,transform:"translate(-50%,-50%)",animation:`glow ${5+i}s ease-in-out infinite`,animationDelay:`${i*1.5}s`,pointerEvents:"none"}}/>
        ))}
        {[600,450,300].map((s,i)=>(
          <div key={i} style={{position:"absolute",width:s,height:s,borderRadius:"50%",border:"1px solid rgba(74,222,128,.07)",top:"50%",left:"50%",marginLeft:-s/2,marginTop:-s/2,animation:`${i%2?"spinR":"spin"} ${20+i*8}s linear infinite`,pointerEvents:"none"}}/>
        ))}
        <div style={{textAlign:"center",maxWidth:860,position:"relative",zIndex:2,animation:"fadeUp .8s ease forwards"}}>
          <div className="badge"><span style={{animation:"blink 2s ease infinite",display:"inline-block",width:7,height:7,borderRadius:"50%",background:"#4ade80"}}/>{t.hero.tag}</div>
          <h1 style={{fontSize:"clamp(2.8rem,9vw,6.5rem)",fontWeight:800,lineHeight:.98,letterSpacing:"-.05em",marginBottom:"1.5rem",fontFamily:"'Syne',sans-serif"}}>
            {t.hero.h1}<br/>
            <span style={{background:"linear-gradient(135deg,#4ade80 0%,#22d3ee 50%,#a78bfa 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"200% auto",animation:"shimmer 4s linear infinite"}}>{t.hero.h2}</span>
          </h1>
          <p style={{fontSize:"clamp(1rem,2.5vw,1.2rem)",color:"rgba(255,255,255,.6)",lineHeight:1.75,maxWidth:620,margin:"0 auto 2.5rem",fontFamily:"'Outfit',sans-serif"}}>{t.hero.sub}</p>
          <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-g" onClick={()=>setPage("dashboard")}>{t.hero.cta}</button>
            <button className="btn-o" onClick={()=>setPage("features")}>▶ {t.hero.demo}</button>
          </div>
          <div style={{display:"flex",gap:"2rem",justifyContent:"center",marginTop:"3rem",flexWrap:"wrap"}}>
            {["🏆 Forbes AgTech 50","🌍 UN Food Systems Award","⚡ YC S22","🇮🇳 Startup India"].map(b=><span key={b} style={{fontSize:".76rem",color:"rgba(255,255,255,.4)"}}>{b}</span>)}
          </div>
        </div>
        <div style={{position:"absolute",bottom:"2rem",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <span style={{fontSize:".62rem",color:"rgba(255,255,255,.25)",letterSpacing:".12em"}}>SCROLL</span>
          <div style={{width:21,height:35,border:"1.5px solid rgba(255,255,255,.18)",borderRadius:11,display:"flex",justifyContent:"center",paddingTop:5}}><div style={{width:4,height:8,background:"#4ade80",borderRadius:2,animation:"float 2s ease-in-out infinite"}}/></div>
        </div>
      </section>

      {/* Stats */}
      <section style={{padding:"4rem 2rem",maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1.4rem"}}>
          {stats.map(s=>(
            <div key={s.l} className="card" style={{padding:"2rem 1.5rem",textAlign:"center",cursor:"pointer"}} onClick={()=>setPage("dashboard")}>
              <div style={{fontSize:"clamp(1.8rem,5vw,3rem)",fontWeight:800,letterSpacing:"-.04em",fontFamily:"'Syne',sans-serif",background:"linear-gradient(135deg,#4ade80,#22d3ee)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1,marginBottom:".4rem"}}>{s.v}</div>
              <div style={{fontSize:".76rem",color:"rgba(255,255,255,.45)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards — each clickable */}
      <section style={{padding:"2rem 2rem 6rem",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"3rem"}}><div className="badge">Core Capabilities</div><h2 style={{fontSize:"clamp(2rem,5vw,3rem)",fontWeight:800,letterSpacing:"-.04em",fontFamily:"'Syne',sans-serif"}}>Everything your farm needs</h2><p style={{color:"rgba(255,255,255,.45)",marginTop:".6rem",fontFamily:"'Outfit',sans-serif",fontSize:".9rem"}}>Click any card to explore the feature</p></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"1.2rem"}}>
          {feats.map((f,i)=>(
            <div key={f.key} className="fcard card" onClick={()=>setModal(f.key)} style={{padding:"1.75rem",borderColor:"rgba(74,222,128,.1)",animation:`fadeUp .5s ease ${i*.08}s forwards`,opacity:0,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,width:80,height:80,borderRadius:"0 20px 0 80px",background:`${f.color}0d`,transition:"all .3s"}}/>
              <div style={{fontSize:"2rem",marginBottom:".9rem"}}>{f.icon}</div>
              <h3 style={{fontSize:"1rem",fontWeight:700,marginBottom:".5rem",fontFamily:"'Syne',sans-serif",color:f.color}}>{f.title}</h3>
              <p style={{fontSize:".86rem",color:"rgba(255,255,255,.5)",lineHeight:1.7,fontFamily:"'Outfit',sans-serif",marginBottom:"1rem"}}>{f.desc}</p>
              <div style={{fontSize:".78rem",color:f.color,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>Learn more <span style={{transition:"transform .2s"}}>→</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Detail Modal */}
      {modal&&FEAT_DETAILS[modal]&&(()=>{const d=FEAT_DETAILS[modal]; return(
        <Modal onClose={()=>setModal(null)}>
          <div style={{padding:"2.5rem"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:"1rem",marginBottom:"1.5rem"}}>
              <div style={{width:52,height:52,borderRadius:16,background:`${d.color}22`,border:`1px solid ${d.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",flexShrink:0}}>{d.icon}</div>
              <div><h2 style={{fontSize:"1.25rem",fontWeight:800,fontFamily:"'Syne',sans-serif",color:d.color}}>{d.title}</h2><div style={{fontSize:".75rem",color:"rgba(255,255,255,.4)",marginTop:3}}>AgroAI Feature</div></div>
              <button onClick={()=>setModal(null)} style={{marginLeft:"auto",background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.6)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <p style={{fontSize:".95rem",color:"rgba(255,255,255,.75)",lineHeight:1.8,fontFamily:"'Outfit',sans-serif",marginBottom:"1.75rem"}}>{d.body}</p>
            <div style={{display:"flex",gap:".75rem"}}>
              {d.action&&<button className="btn-g" style={{animation:"none",padding:".75rem 1.8rem",fontSize:".9rem"}} onClick={()=>{d.action();setModal(null);}}>Open Feature →</button>}
              <button className="btn-o" style={{padding:".75rem 1.8rem",fontSize:".9rem"}} onClick={()=>setModal(null)}>Close</button>
            </div>
          </div>
        </Modal>
      );})()}
    </div>
  );
}

/* ─── ABOUT ─────────────────────────────────────────────────────────────────── */
function AboutPage() {
  const [activeTeam, setActiveTeam] = useState(null);
  const team = [
    { name:"Tanishq Kabir",   role:"Frontend Developer",  bg:"👨‍💻", tag:"React · UI/UX · TypeScript", color:"#22d3ee", bio:"Tanishq leads all frontend engineering — building the interactive dashboards, AI crop prediction UI, and multi-language interface that make AgroAI's power accessible to every farmer.", skills:["React","TypeScript","Tailwind CSS","D3.js","Figma"] },
    { name:"Sameera",         role:"Backend Developer",   bg:"👩‍💻", tag:"Node.js · Python · AWS",      color:"#4ade80", bio:"Sameera architected the entire AgroAI backend infrastructure — REST APIs, real-time data pipelines, cloud deployments, and the scalable systems serving 14,000+ farms globally.", skills:["Node.js","Python","PostgreSQL","AWS","Redis"] },
    { name:"Kunal Chaudhari", role:"AI/ML Developer",     bg:"🧑‍🔬", tag:"TensorFlow · CV · NLP",       color:"#a78bfa", bio:"Kunal built and trained the core crop disease detection models with 97.3% accuracy, the NDVI field analysis pipeline, and the multi-language NLP engine powering the voice assistant.", skills:["TensorFlow","Computer Vision","NLP","Python","GCP"] },
    { name:"Annmaria Binoy",  role:"AI/ML Developer",     bg:"👩‍🔬", tag:"PyTorch · Deep Learning",     color:"#f97316", bio:"Annmaria leads yield prediction modeling and satellite image analysis — combining climate data, soil science, and deep learning to deliver forecasts with <8% mean absolute error.", skills:["PyTorch","Satellite ML","Yield Modeling","R","Jupyter"] },
  ];
  const milestones = [
    { year:"2021", event:"Founded in Vashi, Navi Mumbai — seed round $2M" },
    { year:"2022", event:"Launched in 5 Indian states — 10,000 farmers onboarded" },
    { year:"2023", event:"Series A $18M — expanded to 12 countries" },
    { year:"2024", event:"2M+ acres under management — UN Food Systems Award" },
    { year:"2025", event:"Series B $65M — 42 countries, 14,000+ farmers" },
    { year:"2026", event:"AgroAI 2.0 — Smart AI Crop Prediction & Voice AI" },
  ];

  return (
    <div className="pe" style={{padding:"4rem 2rem",maxWidth:1100,margin:"0 auto"}}>
      {/* Banner */}
      <div style={{background:"radial-gradient(ellipse at 30% 50%,rgba(74,222,128,.12),transparent 70%),rgba(255,255,255,.02)",border:"1px solid rgba(74,222,128,.16)",borderRadius:28,padding:"3.5rem 3rem",marginBottom:"4rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,211,238,.1),transparent)",pointerEvents:"none"}}/>
        <div className="badge">Our Story</div>
        <h1 style={{fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:800,letterSpacing:"-.04em",fontFamily:"'Syne',sans-serif",marginBottom:"1.5rem",maxWidth:600}}>Built by farmers,<br/><span style={{background:"linear-gradient(135deg,#4ade80,#22d3ee)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>powered by AI</span></h1>
        <p style={{fontSize:"1.03rem",color:"rgba(255,255,255,.6)",lineHeight:1.8,maxWidth:640,fontFamily:"'Outfit',sans-serif"}}>AgroAI was born in Vashi, Maharashtra when our co-founders watched families lose entire harvests to late blight — a disease AI could have caught 3 weeks earlier. We built the platform we wished existed: real-time intelligence, in every language, accessible to every farmer on earth.</p>
        <div style={{display:"flex",gap:"2rem",marginTop:"2rem",flexWrap:"wrap"}}>
          {[["🌍","42 Countries"],["👩‍🌾","14,000+ Farmers"],["🏆","12 Awards"],["💰","$85M Raised"]].map(([ic,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:8,fontSize:".9rem",color:"rgba(255,255,255,.7)"}}>{ic} {l}</div>
          ))}
        </div>
      </div>

      {/* Mission / Vision */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginBottom:"4rem"}}>
        {[
          { icon:"🎯", title:"Our Mission", color:"#4ade80", text:"To democratize precision agriculture so every smallholder farmer — regardless of geography, language, or literacy — can access the same AI intelligence as the world's largest agribusinesses." },
          { icon:"🔭", title:"Our Vision",  color:"#22d3ee", text:"A world where no crop fails due to preventable causes. Where AI bridges the gap between agricultural science and the 500 million farming families who feed humanity." },
        ].map(it=>(
          <div key={it.title} className="card" style={{padding:"2rem",borderColor:`${it.color}22`,cursor:"pointer"}} onClick={()=>alert(it.text)}>
            <div style={{fontSize:"2.3rem",marginBottom:"1rem"}}>{it.icon}</div>
            <h3 style={{fontSize:"1.08rem",fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:".75rem",color:it.color}}>{it.title}</h3>
            <p style={{fontSize:".88rem",color:"rgba(255,255,255,.6)",lineHeight:1.75,fontFamily:"'Outfit',sans-serif"}}>{it.text}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{marginBottom:"4rem"}}>
        <div className="badge" style={{marginBottom:"2rem"}}>Our Journey</div>
        <div style={{position:"relative",paddingLeft:"2rem"}}>
          <div style={{position:"absolute",left:7,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,#4ade80,#22d3ee,rgba(74,222,128,.1))",borderRadius:1}}/>
          {milestones.map((m,i)=>(
            <div key={m.year} style={{marginBottom:"1.75rem",animation:`fadeUp .5s ease ${i*.1}s forwards`,opacity:0,cursor:"pointer"}} onClick={()=>alert(`${m.year}: ${m.event}`)}>
              <div style={{position:"absolute",left:0,width:16,height:16,borderRadius:"50%",background:"linear-gradient(135deg,#4ade80,#22d3ee)",border:"2px solid #030a05",marginTop:4,transition:"transform .2s"}}/>
              <div style={{paddingLeft:".5rem"}}>
                <span style={{fontSize:".73rem",color:"#4ade80",fontWeight:700,letterSpacing:".06em"}}>{m.year}</span>
                <p style={{fontSize:".93rem",color:"rgba(255,255,255,.75)",fontFamily:"'Outfit',sans-serif",marginTop:3,lineHeight:1.6}}>{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team — each card opens bio modal */}
      <div>
        <div className="badge" style={{marginBottom:"2rem"}}>Our Team</div>
        <p style={{fontSize:".85rem",color:"rgba(255,255,255,.4)",marginBottom:"1.5rem",fontFamily:"'Outfit',sans-serif"}}>Click any card to meet the team member</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:"1.2rem"}}>
          {team.map((p,i)=>(
            <div key={p.name} className="fcard card" onClick={()=>setActiveTeam(p)} style={{padding:"2rem",textAlign:"center",animation:`fadeUp .5s ease ${i*.1}s forwards`,opacity:0,borderColor:`${p.color}22`,cursor:"pointer"}}>
              <div style={{width:68,height:68,borderRadius:"50%",background:`linear-gradient(135deg,${p.color}22,${p.color}11)`,border:`2px solid ${p.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.1rem",margin:"0 auto 1rem"}}>{p.bg}</div>
              <h4 style={{fontSize:"1rem",fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:".3rem"}}>{p.name}</h4>
              <div style={{fontSize:".8rem",color:p.color,marginBottom:".6rem",fontWeight:600}}>{p.role}</div>
              <div style={{fontSize:".7rem",color:"rgba(255,255,255,.4)",background:"rgba(255,255,255,.04)",padding:".26rem .65rem",borderRadius:100,display:"inline-block",fontFamily:"'Outfit',sans-serif"}}>{p.tag}</div>
              <div style={{fontSize:".75rem",color:"rgba(255,255,255,.3)",marginTop:".8rem",fontFamily:"'Outfit',sans-serif"}}>Click to view profile →</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team member modal */}
      {activeTeam&&(
        <Modal onClose={()=>setActiveTeam(null)}>
          <div style={{padding:"2.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"1.2rem",marginBottom:"1.5rem"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${activeTeam.color}22,${activeTeam.color}11)`,border:`2px solid ${activeTeam.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>{activeTeam.bg}</div>
              <div>
                <h2 style={{fontSize:"1.2rem",fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{activeTeam.name}</h2>
                <div style={{fontSize:".82rem",color:activeTeam.color,fontWeight:600,marginTop:3}}>{activeTeam.role}</div>
              </div>
              <button onClick={()=>setActiveTeam(null)} style={{marginLeft:"auto",background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.6)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <p style={{fontSize:".93rem",color:"rgba(255,255,255,.75)",lineHeight:1.8,fontFamily:"'Outfit',sans-serif",marginBottom:"1.5rem"}}>{activeTeam.bio}</p>
            <div style={{marginBottom:"1.5rem"}}>
              <div style={{fontSize:".72rem",color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:".75rem",fontFamily:"'Outfit',sans-serif"}}>Tech Stack</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:".5rem"}}>
                {activeTeam.skills.map(sk=>(
                  <span key={sk} style={{background:`${activeTeam.color}15`,border:`1px solid ${activeTeam.color}35`,color:activeTeam.color,padding:".3rem .75rem",borderRadius:100,fontSize:".76rem",fontFamily:"'Outfit',sans-serif",fontWeight:600}}>{sk}</span>
                ))}
              </div>
            </div>
            <button className="btn-g" style={{animation:"none",padding:".75rem 1.8rem",fontSize:".88rem"}} onClick={()=>setActiveTeam(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── FEATURES ──────────────────────────────────────────────────────────────── */
function FeaturesPage({ setPage }) {
  const [activeFeature, setActiveFeature] = useState(null);

  const FEATURES = [
    { icon:"🌱", title:"Crop Disease AI",       color:"#22d3ee", badge:"Core AI",       desc:"Deep learning models trained on 50M+ crop images detect 300+ diseases at 97.3% accuracy — often 2–3 weeks before visible symptoms.",         detail:"Our CNN-based model was fine-tuned on 50 million labeled crop images from 40 countries. It identifies Powdery Mildew, Brown Spot, Leaf Blight, Rust, Bollworm damage, and 295 more conditions. Results include confidence score, severity map, and treatment recommendation." },
    { icon:"💧", title:"Precision Irrigation",  color:"#38bdf8", badge:"Water Tech",     desc:"Multi-variable irrigation scheduling fusing soil sensors, weather APIs, and crop growth stages. Average water reduction: 31%.",               detail:"We combine IoT soil moisture sensors, evapotranspiration models, real-time weather forecasts, and crop-specific water demand curves to compute daily irrigation volumes per zone. Integrates with most drip and sprinkler systems via API." },
    { icon:"🛰️", title:"Satellite Field Maps",  color:"#22d3ee", badge:"Remote Sensing", desc:"Daily Sentinel-2 imagery processed into NDVI, NDWI, NDRE indices. Sub-field variability maps at 3m resolution each morning.",               detail:"We process Sentinel-2 and PlanetScope imagery through our cloud pipeline every morning. NDVI (vegetation health), NDWI (water stress), and NDRE (nitrogen deficiency) indices are computed per pixel and overlaid on your field map in the dashboard." },
    { icon:"🌦️", title:"Hyperlocal Weather AI", color:"#fbbf24", badge:"Weather AI",     desc:"14-day forecasts at 500m resolution — updated every 3 hours with NWP models and 50 years of local climate history.",                         detail:"Our weather engine fuses ECMWF NWP models, Doppler radar nowcasting, local weather station networks, and 50 years of historical climate data. Delivers temperature, rainfall, wind, humidity, and frost probability at 500m grid resolution." },
    { icon:"📊", title:"Yield Forecasting",      color:"#a78bfa", badge:"Predictive AI",  desc:"ML models combining 200+ agronomic variables forecast harvest yield 60 days ahead with <8% mean absolute error.",                             detail:"Our gradient-boosted models ingest NDVI time series, soil chemistry, weather history, irrigation records, seed variety, and management practices to forecast final yield per zone 60 days before harvest. Field-validated across 2.3M acres." },
    { icon:"🌍", title:"Multi-Language Voice AI",color:"#f97316", badge:"Language AI",    desc:"Voice assistant in Hindi, Marathi, Gujarati, Tamil, Telugu, Punjabi, and 14 other languages.",                                                detail:"Our NLP engine uses a fine-tuned transformer model for each supported language, with agricultural-domain vocabulary. Farmers ask questions verbally, the system parses intent, queries the AgroAI knowledge base, and responds in the same language — all under 2 seconds." },
    { icon:"📱", title:"Offline Mobile App",     color:"#ec4899", badge:"Mobile",         desc:"Full-featured iOS and Android app that works offline in remote fields. Syncs automatically on reconnect.",                                     detail:"The AgroAI mobile app is under 40MB and stores the last 7 days of your farm data locally. Crop scanning, AI analysis, field notes, and weather work fully offline. Data syncs automatically when 2G connectivity is restored." },
  ];

  return (
    <div className="pe" style={{padding:"4rem 2rem",maxWidth:1100,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:"3.5rem"}}>
        <div className="badge">Full Platform</div>
        <h1 style={{fontSize:"clamp(2rem,5vw,3.2rem)",fontWeight:800,letterSpacing:"-.04em",fontFamily:"'Syne',sans-serif",marginBottom:"1rem"}}>Every tool your farm needs,<br/><span style={{background:"linear-gradient(135deg,#4ade80,#22d3ee)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>in one intelligent platform</span></h1>
        <p style={{color:"rgba(255,255,255,.4)",fontFamily:"'Outfit',sans-serif",fontSize:".88rem"}}>Click any feature card to learn more</p>
      </div>

      {/* Flagship crop prediction tool */}
      <CropPredictionTool/>

      {/* Feature grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(310px,1fr))",gap:"1.2rem",marginTop:"2rem"}}>
        {FEATURES.map((f,i)=>(
          <div key={f.title} className="fcard card" onClick={()=>setActiveFeature(f)} style={{padding:"2rem",animation:`fadeUp .5s ease ${i*.07}s forwards`,opacity:0,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
              <div style={{fontSize:"2rem"}}>{f.icon}</div>
              <span style={{background:`${f.color}18`,border:`1px solid ${f.color}40`,color:f.color,fontSize:".67rem",fontWeight:700,padding:".2rem .6rem",borderRadius:100,letterSpacing:".06em"}}>{f.badge}</span>
            </div>
            <h3 style={{fontSize:"1rem",fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:".6rem",color:f.color}}>{f.title}</h3>
            <p style={{fontSize:".84rem",color:"rgba(255,255,255,.55)",lineHeight:1.75,fontFamily:"'Outfit',sans-serif",marginBottom:".8rem"}}>{f.desc}</p>
            <div style={{fontSize:".76rem",color:f.color,fontWeight:600}}>Click to learn more →</div>
          </div>
        ))}
      </div>

      {/* Feature detail modal */}
      {activeFeature&&(
        <Modal onClose={()=>setActiveFeature(null)}>
          <div style={{padding:"2.5rem"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:"1rem",marginBottom:"1.5rem"}}>
              <div style={{width:50,height:50,borderRadius:14,background:`${activeFeature.color}22`,border:`1px solid ${activeFeature.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0}}>{activeFeature.icon}</div>
              <div>
                <span style={{background:`${activeFeature.color}18`,border:`1px solid ${activeFeature.color}40`,color:activeFeature.color,fontSize:".67rem",fontWeight:700,padding:".18rem .55rem",borderRadius:100,letterSpacing:".06em",display:"inline-block",marginBottom:6}}>{activeFeature.badge}</span>
                <h2 style={{fontSize:"1.2rem",fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{activeFeature.title}</h2>
              </div>
              <button onClick={()=>setActiveFeature(null)} style={{marginLeft:"auto",background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.6)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <p style={{fontSize:".94rem",color:"rgba(255,255,255,.75)",lineHeight:1.8,fontFamily:"'Outfit',sans-serif",marginBottom:"1rem"}}>{activeFeature.detail}</p>
            <div style={{background:`${activeFeature.color}0c`,border:`1px solid ${activeFeature.color}25`,borderRadius:14,padding:"1rem 1.2rem",marginBottom:"1.5rem"}}>
              <div style={{fontSize:".72rem",color:activeFeature.color,fontWeight:700,letterSpacing:".06em",marginBottom:".5rem"}}>✅ KEY BENEFITS</div>
              {["Reduces crop loss by up to 40%","Easy to use — no technical knowledge required","Works in offline mode","Available in 18 languages"].map((b,i)=><div key={i} style={{fontSize:".85rem",color:"rgba(255,255,255,.7)",fontFamily:"'Outfit',sans-serif",marginBottom:".35rem"}}>• {b}</div>)}
            </div>
            <div style={{display:"flex",gap:".75rem"}}>
              <button className="btn-g" style={{animation:"none",padding:".75rem 1.8rem",fontSize:".88rem"}} onClick={()=>{setActiveFeature(null);setPage("dashboard");}}>Try in Dashboard →</button>
              <button className="btn-o" style={{padding:".75rem 1.8rem",fontSize:".88rem"}} onClick={()=>setActiveFeature(null)}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Language showcase */}
      <div style={{marginTop:"2.5rem",background:"radial-gradient(ellipse at 50% 0%,rgba(74,222,128,.12),transparent 70%),rgba(255,255,255,.02)",border:"1px solid rgba(74,222,128,.2)",borderRadius:24,padding:"2.5rem",textAlign:"center"}}>
        <div className="badge" style={{justifyContent:"center"}}>🗣️ Multi-Language Support</div>
        <h3 style={{fontSize:"1.55rem",fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:"1.4rem"}}>Speak your language. Grow your future.</h3>
        <div style={{display:"flex",flexWrap:"wrap",gap:".65rem",justifyContent:"center"}}>
          {[["🇮🇳","हिंदी","Hindi"],["🇮🇳","मराठी","Marathi"],["🇮🇳","ગુજ.","Gujarati"],["🇮🇳","தமிழ்","Tamil"],["🇮🇳","తెలుగు","Telugu"],["🇮🇳","ਪੰਜਾਬੀ","Punjabi"],["🇧🇩","বাংলা","Bengali"],["🇬🇧","EN","English"],["🇪🇸","ES","Spanish"],["🇫🇷","FR","French"],["🇸🇦","AR","Arabic"],["🇨🇳","中文","Chinese"]].map(([fl,n,e])=>(
            <div key={e} className="fcard" style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:".55rem .92rem",display:"flex",alignItems:"center",gap:8,fontSize:".83rem",cursor:"pointer"}} onClick={()=>alert(`${n} (${e}) is fully supported in AgroAI voice and chat assistant.`)}>
              <span>{fl}</span><span style={{fontWeight:600}}>{n}</span><span style={{color:"rgba(255,255,255,.4)",fontSize:".72rem"}}>{e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CROP PREDICTION (Drag & Drop) ─────────────────────────────────────────── */
function CropPredictionTool() {
  const [dragging, setDragging] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [cropType, setCropType] = useState("wheat");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const runAnalysis = ct => {
    const type = ct || cropType;
    setResult(null); setAnalyzing(true); setProgress(0);
    const steps = [8,20,38,55,70,84,95,100];
    steps.forEach((v,i) => setTimeout(() => { setProgress(v); if (v===100) { setAnalyzing(false); setResult(CROP_AI[type]); }}, 380+i*360));
  };
  const handleDrop = e => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f&&f.type.startsWith("image/")){setCropFile(URL.createObjectURL(f));} };
  const handleFile = e => { const f=e.target.files[0]; if(f){setCropFile(URL.createObjectURL(f));} };
  const reset = () => { setCropFile(null); setResult(null); setProgress(0); setAnalyzing(false); };
  const lc = CROP_AI[cropType].color;

  return (
    <div style={{background:`linear-gradient(135deg,rgba(74,222,128,.05),rgba(34,211,238,.03))`,border:"1px solid rgba(74,222,128,.23)",borderRadius:24,padding:"2rem",marginBottom:"2rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.75rem",flexWrap:"wrap"}}>
        <div style={{background:"linear-gradient(135deg,#4ade80,#22d3ee)",borderRadius:14,padding:".58rem .72rem",fontSize:"1.5rem",lineHeight:1}}>🌾</div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <h3 style={{fontSize:"1.18rem",fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#fff"}}>Smart AI Crop Prediction</h3>
            <span style={{background:"rgba(74,222,128,.18)",border:"1px solid rgba(74,222,128,.4)",color:"#4ade80",fontSize:".67rem",fontWeight:700,padding:".18rem .62rem",borderRadius:100,letterSpacing:".06em"}}>FLAGSHIP AI</span>
          </div>
          <p style={{fontSize:".82rem",color:"rgba(255,255,255,.5)",fontFamily:"'Outfit',sans-serif",marginTop:3}}>Drag & drop a crop image — get instant AI health analysis, disease detection & yield forecast</p>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",alignItems:"start"}}>
        {/* Left: upload */}
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div>
            <div style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",marginBottom:8,fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Select Crop Type</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:".42rem"}}>
              {Object.keys(CROP_AI).map(c=>(
                <div key={c} onClick={()=>{setCropType(c);setResult(null);}} style={{padding:".36rem .78rem",borderRadius:100,cursor:"pointer",border:`1px solid ${cropType===c?CROP_AI[c].color+"99":"rgba(255,255,255,.12)"}`,background:cropType===c?`${CROP_AI[c].color}18`:"rgba(255,255,255,.04)",color:cropType===c?CROP_AI[c].color:"rgba(255,255,255,.55)",fontSize:".74rem",fontWeight:600,textTransform:"capitalize",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>
                  {CROP_AI[c].emoji} {c}
                </div>
              ))}
            </div>
          </div>
          <div className={`dz${dragging?" ov":""}`} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop} onClick={()=>fileRef.current?.click()} style={{minHeight:180,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:".65rem",padding:"1.25rem",position:"relative"}}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
            {cropFile&&cropFile!=="demo"?(
              <>
                <img src={cropFile} alt="crop" style={{width:"100%",maxHeight:150,objectFit:"cover",borderRadius:12,opacity:.88}}/>
                <button onClick={e=>{e.stopPropagation();reset();}} style={{position:"absolute",top:10,right:10,background:"rgba(239,68,68,.85)",border:"none",color:"#fff",borderRadius:"50%",width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".72rem"}}>✕</button>
              </>
            ):(
              <>
                <div style={{fontSize:"2.6rem",opacity:.5,animation:dragging?"float 1s ease-in-out infinite":"none"}}>📷</div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:".88rem",fontWeight:600,color:"rgba(255,255,255,.75)",fontFamily:"'Outfit',sans-serif"}}>{dragging?"Drop it here!":"Drag & Drop crop photo"}</div>
                  <div style={{fontSize:".75rem",color:"rgba(255,255,255,.35)",marginTop:3,fontFamily:"'Outfit',sans-serif"}}>or click to browse · JPG, PNG, WEBP</div>
                </div>
                <div style={{display:"flex",gap:".42rem",marginTop:".25rem"}}>
                  {["🌾 Wheat","🍚 Rice","🌽 Maize"].map(ex=><span key={ex} style={{fontSize:".68rem",background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.15)",color:"rgba(74,222,128,.7)",padding:".18rem .52rem",borderRadius:100}}>{ex}</span>)}
                </div>
              </>
            )}
          </div>
          <div style={{display:"flex",gap:".65rem"}}>
            {cropFile&&!result&&<button onClick={()=>runAnalysis()} disabled={analyzing} style={{flex:1,background:`linear-gradient(135deg,${lc},#22d3ee)`,color:"#030a05",border:"none",padding:".8rem",borderRadius:14,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:".88rem",animation:analyzing?"none":"pulse 3s ease-in-out infinite",transition:"all .3s"}}>🔍 Analyze Crop Health</button>}
            <button onClick={()=>{setCropFile("demo");runAnalysis(cropType);}} style={{flex:cropFile&&!result?0:1,background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.25)",color:"#4ade80",padding:".8rem",borderRadius:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:".82rem",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(74,222,128,.15)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(74,222,128,.08)"}>
              ⚡ {cropFile&&!result?"":"Demo Analysis"}
            </button>
          </div>
          {analyzing&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:".76rem",fontFamily:"'Outfit',sans-serif"}}>
                <span style={{color:"rgba(255,255,255,.5)",animation:"scan 1s ease-in-out infinite"}}>{progress<30?"🔎 Scanning morphology…":progress<60?"🧬 Running disease models…":progress<85?"📊 Computing yield…":"✅ Finalizing…"}</span>
                <span style={{color:lc,fontWeight:700}}>{progress}%</span>
              </div>
              <div style={{height:6,background:"rgba(255,255,255,.08)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${progress}%`,height:"100%",background:`linear-gradient(90deg,${lc},#22d3ee)`,borderRadius:3,transition:"width .35s ease"}}/></div>
            </div>
          )}
        </div>
        {/* Right: result */}
        <div>
          {!result&&!analyzing&&(
            <div style={{minHeight:250,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem",padding:"2rem",background:"rgba(255,255,255,.02)",border:"1px dashed rgba(255,255,255,.07)",borderRadius:20}}>
              <div style={{fontSize:"2.6rem",opacity:.32}}>🌿</div>
              <div style={{textAlign:"center",fontSize:".86rem",color:"rgba(255,255,255,.28)",fontFamily:"'Outfit',sans-serif",lineHeight:1.65}}>Upload a crop image or click<br/>"Demo Analysis" to begin</div>
              <div style={{display:"flex",flexDirection:"column",gap:".4rem",width:"100%",maxWidth:210}}>
                {["Crop Health Score (0–100)","Disease Risk Detection","Yield Forecast","Irrigation Advice"].map(l=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:7,fontSize:".75rem",color:"rgba(255,255,255,.26)",fontFamily:"'Outfit',sans-serif"}}>
                    <div style={{width:17,height:17,borderRadius:6,background:"rgba(74,222,128,.06)",border:"1px solid rgba(74,222,128,.13)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".56rem",color:"rgba(74,222,128,.45)"}}>✓</div>{l}
                  </div>
                ))}
              </div>
            </div>
          )}
          {result&&(
            <div style={{animation:"fadeUp .5s ease forwards"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"1.15rem"}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:result.health>85?"#4ade80":result.health>70?"#fbbf24":"#ef4444",animation:"pulse 2s ease-in-out infinite"}}/>
                <span style={{fontSize:".76rem",fontWeight:700,color:"rgba(255,255,255,.55)",textTransform:"uppercase",letterSpacing:".06em",fontFamily:"'Outfit',sans-serif"}}>Analysis Complete — {cropType}</span>
              </div>
              {/* Health ring */}
              <div style={{display:"flex",alignItems:"center",gap:"1.3rem",marginBottom:"1.15rem",background:"rgba(255,255,255,.03)",borderRadius:16,padding:"1.15rem"}}>
                <svg width={84} height={84} style={{flexShrink:0}}>
                  <circle cx={42} cy={42} r={35} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={7}/>
                  <circle cx={42} cy={42} r={35} fill="none" stroke={result.color} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${2*Math.PI*35*result.health/100} 999`} transform="rotate(-90 42 42)" style={{transition:"stroke-dasharray 1.2s ease"}}/>
                  <text x={42} y={46} textAnchor="middle" fontSize={15} fontWeight={800} fill="#fff" fontFamily="Syne,sans-serif">{result.health}</text>
                  <text x={42} y={58} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.35)" fontFamily="Outfit,sans-serif">HEALTH</text>
                </svg>
                <div style={{flex:1}}>
                  <div style={{fontSize:".95rem",fontWeight:700,fontFamily:"'Syne',sans-serif",color:result.color}}>{result.health>85?"Excellent ✅":result.health>70?"Good — Monitor ⚠️":"Needs Attention 🔴"}</div>
                  <div style={{fontSize:".72rem",color:"rgba(255,255,255,.42)",fontFamily:"'Outfit',sans-serif",marginTop:3,textTransform:"capitalize"}}>{result.emoji} {cropType} · Analyzed now</div>
                </div>
              </div>
              {[{icon:"🦠",l:"Disease",v:result.disease,c:result.disease.includes("HIGH")?"#ef4444":result.disease.includes("Medium")?"#fbbf24":"#4ade80"},{icon:"📈",l:"Yield",v:result.yield,c:"#a78bfa"},{icon:"💧",l:"Irrigation",v:result.irrigation,c:"#38bdf8"}].map(it=>(
                <div key={it.l} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${it.c}1e`,borderRadius:12,padding:".78rem .95rem",display:"flex",alignItems:"center",gap:".9rem",marginBottom:".65rem",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.07)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}>
                  <span style={{fontSize:"1.2rem"}}>{it.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:".67rem",color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{it.l}</div>
                    <div style={{fontSize:".84rem",fontWeight:600,color:it.c,fontFamily:"'Outfit',sans-serif"}}>{it.v}</div>
                  </div>
                </div>
              ))}
              <button onClick={reset} style={{marginTop:".6rem",width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",padding:".65rem",borderRadius:12,cursor:"pointer",fontSize:".82rem",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.09)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}>🔄 Analyze Another Crop</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─────────────────────────────────────────────────────────────── */
function DashboardPage({ chartData, activeChart, setActiveChart, maxV }) {
  const [selField, setSelField] = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  const [fieldModal, setFieldModal] = useState(null);

  const FIELDS_DETAIL = [
    { name:"Field Alpha", acres:847, health:92, moisture:68, crop:"Wheat",  status:"Healthy",   ndvi:0.82, ph:6.8, n:180, lastIrr:"2 days ago", nextIrr:"4 days",     color:"#4ade80" },
    { name:"Field Beta",  acres:523, health:78, moisture:55, crop:"Rice",   status:"Monitor",   ndvi:0.67, ph:6.2, n:145, lastIrr:"1 day ago",  nextIrr:"Tomorrow",   color:"#fbbf24" },
    { name:"Field Gamma", acres:312, health:96, moisture:74, crop:"Cotton", status:"Excellent", ndvi:0.91, ph:7.1, n:210, lastIrr:"3 days ago", nextIrr:"5 days",     color:"#22d3ee" },
    { name:"Field Delta", acres:198, health:61, moisture:42, crop:"Maize",  status:"Alert",     ndvi:0.44, ph:5.8, n:95,  lastIrr:"5 days ago", nextIrr:"Today ⚠️",  color:"#ef4444" },
  ];
  const sc = { Healthy:"#4ade80", Monitor:"#fbbf24", Excellent:"#22d3ee", Alert:"#ef4444" };
  const W=560, H=195, pad=36, cH=H-55, cW=W-2*pad;
  const pts = chartData.map((d,i)=>({ x:pad+i*(cW/(chartData.length-1)), y:H-25-(d[activeChart]/maxV)*cH }));
  const pathD = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length-1].x},${H-25} L${pts[0].x},${H-25} Z`;
  const lc = activeChart==="yield"?"#4ade80":activeChart==="moisture"?"#38bdf8":"#a78bfa";

  const ALERTS = [
    { id:1, level:"⚠️", color:"#fbbf24", title:"Aphid Pressure — Block C3", msg:"AI detects early aphid pressure in Block C3. Scout within 24 hours. Recommend neem oil spray if confirmed.", field:"Field Alpha", time:"2h ago", action:"View Field" },
    { id:2, level:"🔴", color:"#ef4444", title:"Critical: Low Moisture — Field Delta", msg:"Soil moisture at 42% — below critical threshold for Maize at this growth stage. Irrigate urgently today.", field:"Field Delta", time:"4h ago", action:"Irrigate Now" },
    { id:3, level:"💚", color:"#4ade80", title:"Excellent Canopy — Field Alpha", msg:"NDVI up 8 points this week to 0.82. Wheat crop showing excellent canopy development. On track for +22% yield.", field:"Field Alpha", time:"1d ago", action:"View Map" },
    { id:4, level:"🔵", color:"#38bdf8", title:"Optimal Spray Window", msg:"Tomorrow 6–9am has ideal conditions: wind < 10 km/h, no rain forecast, humidity 45%. Best window for pesticide application.", field:"All Fields", time:"1d ago", action:"Schedule" },
  ];

  return (
    <div className="pe" style={{padding:"2rem",maxWidth:1200,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2rem",flexWrap:"wrap",gap:"1rem"}}>
        <div><div className="badge">Live Dashboard</div><h1 style={{fontSize:"1.78rem",fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-.04em"}}>Farm Command Center</h1></div>
        <div style={{display:"flex",gap:".58rem",flexWrap:"wrap"}}>
          {[["yield","#4ade80","Yield"],["moisture","#38bdf8","Moisture"],["health","#a78bfa","Health"]].map(([k,c,l])=>(
            <button key={k} onClick={()=>setActiveChart(k)} style={{background:activeChart===k?`${c}22`:"rgba(255,255,255,.04)",border:`1px solid ${activeChart===k?c:"rgba(255,255,255,.1)"}`,color:activeChart===k?c:"rgba(255,255,255,.6)",padding:".38rem .88rem",borderRadius:100,cursor:"pointer",fontSize:".78rem",fontWeight:600,fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:".95rem",marginBottom:"1.4rem"}}>
        {[{l:"Total Acres",v:"1,880",ic:"🌾",c:"#4ade80",ch:"+12%",click:()=>setFieldModal(FIELDS_DETAIL[0])},{l:"Avg Health",v:"82/100",ic:"💚",c:"#22d3ee",ch:"+4pts",click:()=>alert("Overall farm health: 82/100. Field Gamma leads at 96/100.")},{l:"Water Used",v:"2,140 L",ic:"💧",c:"#38bdf8",ch:"-18%",click:()=>alert("Water savings: 18% below last season. Smart irrigation is working!")},{l:"AI Alerts",v:"3 Active",ic:"⚠️",c:"#fbbf24",ch:"2 new",click:()=>setAlertModal(ALERTS[0])},{l:"Est. Yield",v:"+22%",ic:"📈",c:"#a78bfa",ch:"vs avg",click:()=>alert("Your projected yield is 22% above regional average. Based on NDVI trends, weather, and soil data.")}].map(k=>(
          <div key={k.l} className="fcard card" onClick={k.click} style={{padding:"1.15rem",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:".45rem"}}>
              <span style={{fontSize:"1.25rem"}}>{k.ic}</span>
              <span style={{fontSize:".65rem",background:`${k.c}18`,color:k.c,padding:".12rem .45rem",borderRadius:100,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>{k.ch}</span>
            </div>
            <div style={{fontSize:"1.28rem",fontWeight:800,fontFamily:"'Syne',sans-serif",color:k.c,letterSpacing:"-.03em"}}>{k.v}</div>
            <div style={{fontSize:".68rem",color:"rgba(255,255,255,.44)",marginTop:3,textTransform:"uppercase",letterSpacing:".06em",fontFamily:"'Outfit',sans-serif"}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Chart + Alerts */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"1.35rem",marginBottom:"1.35rem"}}>
        <div className="card" style={{padding:"1.45rem",overflow:"hidden"}}>
          <h3 style={{fontSize:".82rem",fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:"1.15rem",textTransform:"uppercase",letterSpacing:".06em",color:"rgba(255,255,255,.5)"}}>{activeChart.charAt(0).toUpperCase()+activeChart.slice(1)} — 12-Month Trend</h3>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible",cursor:"crosshair"}}>
            <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lc} stopOpacity=".75"/><stop offset="100%" stopColor={lc} stopOpacity=".04"/></linearGradient></defs>
            <path d={areaD} fill="url(#cg)" opacity=".4"/>
            <path d={pathD} fill="none" stroke={lc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p,i)=>(
              <g key={i} style={{cursor:"pointer"}} onClick={()=>alert(`${chartData[i].m}: ${activeChart} = ${chartData[i][activeChart]}`)}>
                <circle cx={p.x} cy={p.y} r="5" fill={lc} opacity=".9"/>
                <circle cx={p.x} cy={p.y} r="9" fill={lc} opacity="0" style={{transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".15"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}/>
                <text x={p.x} y={H-7} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="Outfit,sans-serif">{chartData[i].m}</text>
              </g>
            ))}
            {[0,25,50,75,100].map(v=>{const y=H-25-(v/100)*cH;return(<g key={v}><line x1={pad} y1={y} x2={W-pad+10} y2={y} stroke="rgba(255,255,255,.04)" strokeWidth="1"/><text x={pad-8} y={y+4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.22)" fontFamily="Outfit,sans-serif">{v}</text></g>);})}
          </svg>
        </div>
        {/* Alerts panel */}
        <div className="card" style={{padding:"1.4rem",display:"flex",flexDirection:"column",gap:".8rem"}}>
          <h3 style={{fontSize:".82rem",fontWeight:700,fontFamily:"'Syne',sans-serif",textTransform:"uppercase",letterSpacing:".06em",color:"rgba(255,255,255,.5)"}}>AI Alerts</h3>
          {ALERTS.map(a=>(
            <div key={a.id} className="fcard" onClick={()=>setAlertModal(a)} style={{background:`${a.color}0d`,border:`1px solid ${a.color}28`,borderRadius:12,padding:".72rem .88rem",cursor:"pointer",transition:"all .25s"}} onMouseEnter={e=>{e.currentTarget.style.background=`${a.color}18`}} onMouseLeave={e=>{e.currentTarget.style.background=`${a.color}0d`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:".73rem",fontWeight:700,color:a.color}}>{a.level} {a.title.split("—")[0]}</span><span style={{fontSize:".66rem",color:"rgba(255,255,255,.3)"}}>{a.time}</span></div>
              <p style={{fontSize:".76rem",color:"rgba(255,255,255,.65)",lineHeight:1.5,fontFamily:"'Outfit',sans-serif"}}>{a.msg.slice(0,60)}…</p>
              <div style={{fontSize:".7rem",color:a.color,marginTop:4,fontWeight:600}}>Click to view →</div>
            </div>
          ))}
        </div>
      </div>

      {/* Satellite Field Map */}
      <div className="card" style={{padding:"1.45rem",marginBottom:"1.35rem"}}>
        <h3 style={{fontSize:".82rem",fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:"1.15rem",textTransform:"uppercase",letterSpacing:".06em",color:"rgba(255,255,255,.5)"}}>📡 Satellite Field Map — Click a Field</h3>
        <div style={{position:"relative",background:"rgba(74,222,128,.03)",border:"1px solid rgba(74,222,128,.1)",borderRadius:14,overflow:"hidden"}}>
          {/* Grid pattern */}
          <svg width="100%" height={320} style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}>
            <defs><pattern id="sg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(74,222,128,0.07)" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="320" fill="url(#sg)"/>
          </svg>
          <svg width="100%" viewBox="0 0 500 295" style={{display:"block",cursor:"crosshair"}}>
            {SAT_FIELDS.map(f=>(
              <g key={f.id} onClick={()=>setSelField(f)} style={{cursor:"pointer"}}>
                <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="8" fill={`${f.color}22`} stroke={selField?.id===f.id?f.color:`${f.color}55`} strokeWidth={selField?.id===f.id?2:1} style={{transition:"all .25s"}}/>
                {/* NDVI fill bar */}
                <rect x={f.x+8} y={f.y+f.h-22} width={(f.w-16)*f.ndvi} height={6} rx="3" fill={f.color} opacity=".6"/>
                <rect x={f.x+8} y={f.y+f.h-22} width={f.w-16} height={6} rx="3" fill="none" stroke={`${f.color}33`} strokeWidth="1"/>
                <text x={f.x+f.w/2} y={f.y+22} textAnchor="middle" fontSize="11" fontWeight="700" fill={f.color} fontFamily="Syne,sans-serif">Field {f.id}</text>
                <text x={f.x+f.w/2} y={f.y+38} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)" fontFamily="Outfit,sans-serif">{f.crop}</text>
                <text x={f.x+f.w/2} y={f.y+54} textAnchor="middle" fontSize="9" fill={f.color} fontFamily="Outfit,sans-serif">NDVI {f.ndvi}</text>
                {f.status==="Alert"&&<circle cx={f.x+f.w-12} cy={f.y+12} r="6" fill="#ef4444" opacity=".9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.2s" repeatCount="indefinite"/></circle>}
              </g>
            ))}
            {/* Legend */}
            <rect x="370" y="10" width="120" height="60" rx="8" fill="rgba(3,10,5,.8)" stroke="rgba(74,222,128,.2)" strokeWidth="1"/>
            <text x="380" y="28" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="Outfit,sans-serif">NDVI Legend</text>
            {[["#4ade80","Healthy"],["#fbbf24","Monitor"],["#ef4444","Alert"]].map(([c,l],i)=>(
              <g key={l}><rect x="380" y={38+i*10} width="8" height="8" rx="2" fill={c}/><text x="392" y={46+i*10} fontSize="7.5" fill="rgba(255,255,255,0.7)" fontFamily="Outfit,sans-serif">{l}</text></g>
            ))}
          </svg>
          {selField&&(
            <div style={{position:"absolute",bottom:12,left:12,background:"rgba(3,10,5,.92)",border:`1px solid ${selField.color}44`,borderRadius:14,padding:".85rem 1.1rem",animation:"slideIn .25s ease",maxWidth:220}}>
              <div style={{fontWeight:700,fontSize:".88rem",fontFamily:"'Syne',sans-serif",color:selField.color,marginBottom:".5rem"}}>Field {selField.id} — {selField.crop}</div>
              {[["NDVI",selField.ndvi],["Status",selField.status],["Acres",`${selField.acres||"—"}`]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:".78rem",fontFamily:"'Outfit',sans-serif",marginBottom:3}}><span style={{color:"rgba(255,255,255,.45)"}}>{k}</span><span style={{color:"#fff",fontWeight:600}}>{v}</span></div>
              ))}
              <button onClick={()=>{const f=FIELDS_DETAIL.find(x=>x.crop===selField.crop);setFieldModal(f||FIELDS_DETAIL[0]);setSelField(null);}} style={{marginTop:".6rem",width:"100%",background:`${selField.color}22`,border:`1px solid ${selField.color}44`,color:selField.color,padding:".42rem",borderRadius:8,cursor:"pointer",fontSize:".76rem",fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>View Full Details →</button>
            </div>
          )}
        </div>
      </div>

      {/* Field table */}
      <div className="card" style={{padding:"1.45rem",overflow:"auto"}}>
        <h3 style={{fontSize:".82rem",fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:"1.15rem",textTransform:"uppercase",letterSpacing:".06em",color:"rgba(255,255,255,.5)"}}>Field Overview — Click Row for Details</h3>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:".85rem",fontFamily:"'Outfit',sans-serif"}}>
          <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.07)"}}>{["Field","Acres","Crop","Health","Moisture","Status","Action"].map(h=><th key={h} style={{textAlign:"left",padding:".6rem .65rem",color:"rgba(255,255,255,.38)",fontWeight:600,fontSize:".68rem",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</th>)}</tr></thead>
          <tbody>
            {FIELDS_DETAIL.map(f=>(
              <tr key={f.name} className="row" onClick={()=>setFieldModal(f)} style={{borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",transition:"background .2s"}}>
                <td style={{padding:".75rem .65rem",fontWeight:600,color:"#fff"}}>{f.name}</td>
                <td style={{padding:".75rem .65rem",color:"rgba(255,255,255,.6)"}}>{f.acres.toLocaleString()}</td>
                <td style={{padding:".75rem .65rem",color:"rgba(255,255,255,.6)"}}>{f.crop}</td>
                <td style={{padding:".75rem .65rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:80,height:5,background:"rgba(255,255,255,.08)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${f.health}%`,height:"100%",background:`linear-gradient(90deg,${f.health>85?"#4ade80":f.health>70?"#fbbf24":"#ef4444"},${f.health>85?"#22d3ee":f.health>70?"#f97316":"#ef4444"})`,borderRadius:3}}/></div>
                    <span style={{color:"rgba(255,255,255,.7)",fontSize:".77rem"}}>{f.health}%</span>
                  </div>
                </td>
                <td style={{padding:".75rem .65rem",color:"rgba(255,255,255,.6)"}}>{f.moisture}%</td>
                <td style={{padding:".75rem .65rem"}}><span style={{background:`${sc[f.status]}18`,color:sc[f.status],padding:".2rem .6rem",borderRadius:100,fontSize:".71rem",fontWeight:700}}>{f.status}</span></td>
                <td style={{padding:".75rem .65rem"}}><span style={{color:"#4ade80",fontSize:".75rem",fontWeight:600,cursor:"pointer"}}>View →</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alert Detail Modal */}
      {alertModal&&(
        <Modal onClose={()=>setAlertModal(null)}>
          <div style={{padding:"2.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:".85rem",marginBottom:"1.5rem"}}>
              <div style={{width:46,height:46,borderRadius:14,background:`${alertModal.color}18`,border:`1px solid ${alertModal.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{alertModal.level}</div>
              <div><h2 style={{fontSize:"1.1rem",fontWeight:800,fontFamily:"'Syne',sans-serif",color:alertModal.color}}>{alertModal.title}</h2><div style={{fontSize:".72rem",color:"rgba(255,255,255,.4)",marginTop:2}}>{alertModal.field} · {alertModal.time}</div></div>
              <button onClick={()=>setAlertModal(null)} style={{marginLeft:"auto",background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.6)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <p style={{fontSize:".93rem",color:"rgba(255,255,255,.8)",lineHeight:1.8,fontFamily:"'Outfit',sans-serif",marginBottom:"1.5rem"}}>{alertModal.msg}</p>
            <div style={{background:`${alertModal.color}0c`,border:`1px solid ${alertModal.color}22`,borderRadius:14,padding:"1rem 1.1rem",marginBottom:"1.5rem"}}>
              <div style={{fontSize:".7rem",color:alertModal.color,fontWeight:700,letterSpacing:".06em",marginBottom:".5rem"}}>RECOMMENDED ACTION</div>
              <p style={{fontSize:".85rem",color:"rgba(255,255,255,.75)",fontFamily:"'Outfit',sans-serif",lineHeight:1.6}}>{alertModal.action}: Act within 24 hours for best results.</p>
            </div>
            <div style={{display:"flex",gap:".7rem"}}>
              <button className="btn-g" style={{animation:"none",padding:".72rem 1.6rem",fontSize:".88rem"}} onClick={()=>{alert(`Action taken: ${alertModal.action}`);setAlertModal(null);}}>✓ {alertModal.action}</button>
              <button className="btn-o" style={{padding:".72rem 1.6rem",fontSize:".88rem"}} onClick={()=>setAlertModal(null)}>Dismiss</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Field Detail Modal */}
      {fieldModal&&(
        <Modal onClose={()=>setFieldModal(null)} wide>
          <div style={{padding:"2.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:".85rem",marginBottom:"1.75rem"}}>
              <div style={{width:46,height:46,borderRadius:14,background:`${fieldModal.color}22`,border:`1px solid ${fieldModal.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>🌾</div>
              <div>
                <h2 style={{fontSize:"1.2rem",fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{fieldModal.name}</h2>
                <div style={{fontSize:".75rem",color:fieldModal.color,fontWeight:600,marginTop:2}}>{fieldModal.crop} · {fieldModal.acres.toLocaleString()} acres</div>
              </div>
              <span style={{marginLeft:"auto",background:`${sc[fieldModal.status]}18`,color:sc[fieldModal.status],padding:".3rem .85rem",borderRadius:100,fontSize:".78rem",fontWeight:700}}>{fieldModal.status}</span>
              <button onClick={()=>setFieldModal(null)} style={{background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.6)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
              {[{l:"Crop Health",v:`${fieldModal.health}/100`,c:fieldModal.color},{l:"Soil Moisture",v:`${fieldModal.moisture}%`,c:"#38bdf8"},{l:"NDVI Index",v:fieldModal.ndvi,c:"#4ade80"},{l:"Soil pH",v:fieldModal.ph,c:"#a78bfa"},{l:"Nitrogen",v:`${fieldModal.n} kg/ha`,c:"#fbbf24"},{l:"Next Irrigation",v:fieldModal.nextIrr,c:fieldModal.nextIrr.includes("⚠️")?"#ef4444":"#22d3ee"}].map(it=>(
                <div key={it.l} style={{background:"rgba(255,255,255,.04)",borderRadius:14,padding:"1rem",border:`1px solid ${it.c}1a`}}>
                  <div style={{fontSize:".68rem",color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:".35rem",fontFamily:"'Outfit',sans-serif"}}>{it.l}</div>
                  <div style={{fontSize:"1.15rem",fontWeight:800,fontFamily:"'Syne',sans-serif",color:it.c}}>{it.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:".7rem",flexWrap:"wrap"}}>
              {["View Satellite Map","Download Report","Set Irrigation Alert","Share with Agronomist"].map(action=>(
                <button key={action} className="tab-btn" onClick={()=>alert(`Action: ${action} for ${fieldModal.name}`)}>{action}</button>
              ))}
            </div>
            <button className="btn-g" style={{animation:"none",padding:".72rem 1.8rem",fontSize:".88rem",marginTop:"1.2rem"}} onClick={()=>setFieldModal(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── WEATHER ────────────────────────────────────────────────────────────────── */
function WeatherPage() {
  const [sel, setSel] = useState(0);
  const [modal, setModal] = useState(null);
  const d = WEATHER[sel];

  const ADVISORY = {
    Mon:["✅ Perfect spray conditions — low wind, no rain.","🌱 Soil warming well — good germination window.","💧 Irrigate wheat plots in evening."],
    Tue:["⚠️ Partial cloud — monitor fungal risk if humidity rises.","✅ Morning spray window 6–10am.","🌾 Harvest planning: Conditions acceptable."],
    Wed:["🚫 Do NOT spray — 70% rain probability all day.","⛈️ Secure loose equipment before evening storms.","💧 Skip irrigation — rainfall will provide 15–20mm."],
    Thu:["🌦️ Showers easing by afternoon — spray after 3pm if needed.","⚠️ Check drainage in low-lying fields.","📊 Update soil moisture readings after rain."],
    Fri:["✅ Good recovery day — resume normal operations.","☀️ Solar radiation high — monitor crop water demand.","💧 Light irrigation recommended for sandy soils."],
    Sat:["🌡️ Heat stress alert above 32°C — irrigate early morning.","🚫 Avoid field work after noon — worker safety.","🌾 Monitor heat stress in maize tasseling stage."],
    Sun:["✅ Comfortable conditions — good field work day.","📋 Weekly review: Update irrigation schedules.","🌱 Scouting recommended before new week begins."],
  };

  return (
    <div className="pe" style={{padding:"2rem",maxWidth:1100,margin:"0 auto"}}>
      <div style={{marginBottom:"2rem"}}>
        <div className="badge">Hyperlocal Forecast</div>
        <h1 style={{fontSize:"1.95rem",fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-.04em"}}>Weather Intelligence</h1>
        <p style={{color:"rgba(255,255,255,.5)",marginTop:".4rem",fontFamily:"'Outfit',sans-serif",fontSize:".87rem"}}>Updated every 3 hours · AgroAI Weather AI · 📍 Vashi, Maharashtra</p>
      </div>

      {/* Current conditions — clickable */}
      <div onClick={()=>setModal({title:"Current Conditions",body:`Today is ${d.desc}. Temperature: ${d.high}°C / ${d.low}°C. Humidity: ${d.hum}%. Wind: ${d.wind} km/h. Rain probability: ${d.rain}%. These conditions ${d.rain>50?"are NOT":"are"} suitable for spraying.`})} className="fcard" style={{background:"radial-gradient(ellipse at 30% 50%,rgba(34,211,238,.12),transparent 70%),rgba(255,255,255,.03)",border:"1px solid rgba(34,211,238,.2)",borderRadius:24,padding:"2.5rem",marginBottom:"2rem",cursor:"pointer",transition:"all .3s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"2rem"}}>
          <div>
            <div style={{fontSize:".75rem",color:"rgba(255,255,255,.45)",marginBottom:".5rem",textTransform:"uppercase",letterSpacing:".08em",fontFamily:"'Outfit',sans-serif"}}>📍 Vashi, Navi Mumbai · Click for details</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:"1rem"}}>
              <span style={{fontSize:"4rem",lineHeight:1}}>{d.icon}</span>
              <div><div style={{fontSize:"3rem",fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-.05em",lineHeight:1}}>{d.high}°C</div><div style={{fontSize:".85rem",color:"rgba(255,255,255,.5)",fontFamily:"'Outfit',sans-serif"}}>{d.desc}</div></div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".9rem"}}>
            {[{l:"Humidity",v:`${d.hum}%`,i:"💧"},{l:"Wind",v:`${d.wind} km/h`,i:"💨"},{l:"Rain Prob.",v:`${d.rain}%`,i:"🌧️"},{l:"Low",v:`${d.low}°C`,i:"🌡️"}].map(it=>(
              <div key={it.l} onClick={e=>{e.stopPropagation();setModal({title:it.l,body:`Current ${it.l}: ${it.v}. ${it.l==="Rain Prob."&&d.rain>50?"Rain expected — avoid spraying.":it.l==="Humidity"&&d.hum>75?"High humidity increases fungal disease risk. Monitor closely.":"Conditions are within normal range."}`});}} style={{background:"rgba(255,255,255,.05)",borderRadius:14,padding:".82rem .95rem",textAlign:"center",minWidth:90,cursor:"pointer",transition:"all .2s",border:"1px solid rgba(255,255,255,.06)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}>
                <div style={{fontSize:"1.3rem",marginBottom:".2rem"}}>{it.i}</div>
                <div style={{fontSize:".98rem",fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{it.v}</div>
                <div style={{fontSize:".65rem",color:"rgba(255,255,255,.4)",marginTop:2,fontFamily:"'Outfit',sans-serif"}}>{it.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-day — each day clickable */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:".6rem",marginBottom:"2rem"}}>
        {WEATHER.map((day,i)=>(
          <div key={day.day} onClick={()=>setSel(i)} className="fcard card" style={{padding:".95rem .6rem",textAlign:"center",cursor:"pointer",borderColor:sel===i?"rgba(34,211,238,.4)":"rgba(74,222,128,.1)",background:sel===i?"rgba(34,211,238,.08)":"rgba(255,255,255,.025)"}}>
            <div style={{fontSize:".67rem",color:"rgba(255,255,255,.5)",fontWeight:600,marginBottom:".4rem",textTransform:"uppercase",fontFamily:"'Outfit',sans-serif"}}>{day.day}</div>
            <div style={{fontSize:"1.4rem",margin:".36rem 0"}}>{day.icon}</div>
            <div style={{fontSize:".86rem",fontWeight:700}}>{day.high}°</div>
            <div style={{fontSize:".72rem",color:"rgba(255,255,255,.4)"}}>{day.low}°</div>
            <div style={{marginTop:".45rem",fontSize:".66rem",color:"#38bdf8",fontWeight:600}}>💧{day.rain}%</div>
          </div>
        ))}
      </div>

      {/* Detailed selected day */}
      <div className="card" style={{padding:"1.75rem"}}>
        <h3 style={{fontSize:".82rem",fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:"1.4rem",textTransform:"uppercase",letterSpacing:".06em",color:"rgba(255,255,255,.5)"}}>{d.day} — Detailed Analysis</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem",alignItems:"start"}}>
          <div>
            {[{l:"Temperature Range",v:`${d.low}°–${d.high}°C`,bar:(d.high/45)*100,c:"#f97316"},{l:"Rainfall Probability",v:`${d.rain}%`,bar:d.rain,c:"#38bdf8"},{l:"Humidity",v:`${d.hum}%`,bar:d.hum,c:"#22d3ee"},{l:"Wind Speed",v:`${d.wind} km/h`,bar:(d.wind/50)*100,c:"#a78bfa"}].map(it=>(
              <div key={it.l} style={{marginBottom:"1rem",cursor:"pointer"}} onClick={()=>setModal({title:it.l,body:`${d.day} ${it.l}: ${it.v}. ${it.l==="Rainfall Probability"&&d.rain>50?"High rain expected — delay field operations.":it.l==="Humidity"&&d.hum>75?"Elevated fungal disease risk. Apply preventive fungicide if susceptible crops present.":"Conditions are within normal range for farming operations."}`})}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:".32rem",fontSize:".83rem",fontFamily:"'Outfit',sans-serif"}}>
                  <span style={{color:"rgba(255,255,255,.55)"}}>{it.l}</span>
                  <span style={{fontWeight:700,color:it.c}}>{it.v}</span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,.07)",borderRadius:3,overflow:"hidden",transition:"opacity .2s"}}><div style={{width:`${it.bar}%`,height:"100%",background:`linear-gradient(90deg,${it.c},${it.c}99)`,borderRadius:3,transition:"width .6s ease"}}/></div>
              </div>
            ))}
          </div>
          {/* AI Advisory — each tip clickable */}
          <div style={{background:"rgba(74,222,128,.05)",border:"1px solid rgba(74,222,128,.2)",borderRadius:16,padding:"1.4rem"}}>
            <div style={{fontSize:".7rem",color:"#4ade80",fontWeight:700,letterSpacing:".06em",marginBottom:"1rem",fontFamily:"'Outfit',sans-serif"}}>🌾 AI FARM ADVISORY — {d.day}</div>
            {(ADVISORY[d.day]||[]).map((tip,i)=>(
              <div key={i} onClick={()=>setModal({title:`Advisory — ${d.day}`,body:tip+` (Based on ${d.day} forecast: ${d.desc}, ${d.high}°C, ${d.rain}% rain, ${d.hum}% humidity.)`})} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:".65rem",cursor:"pointer",padding:".4rem",borderRadius:8,transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(74,222,128,.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{fontSize:".82rem"}}></span>
                <p style={{fontSize:".82rem",color:"rgba(255,255,255,.78)",lineHeight:1.6,fontFamily:"'Outfit',sans-serif",flex:1}}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info modal */}
      {modal&&(
        <Modal onClose={()=>setModal(null)}>
          <div style={{padding:"2.2rem"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
              <h2 style={{fontSize:"1.15rem",fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#22d3ee"}}>{modal.title}</h2>
              <button onClick={()=>setModal(null)} style={{background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.6)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <p style={{fontSize:".93rem",color:"rgba(255,255,255,.8)",lineHeight:1.8,fontFamily:"'Outfit',sans-serif",marginBottom:"1.4rem"}}>{modal.body}</p>
            <button className="btn-g" style={{animation:"none",padding:".72rem 1.8rem",fontSize:".88rem"}} onClick={()=>setModal(null)}>Got it</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── CONTACT ────────────────────────────────────────────────────────────────── */
function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", farm:"", msg:"" });
  const [sent, setSent] = useState(false);
  const [tags, setTags] = useState([]);
  const TAGS = ["Crop Monitoring","Irrigation AI","Weather Forecasting","AI Crop Prediction","Soil Analysis","Voice AI"];

  const submit = e => { e.preventDefault(); setSent(true); };
  const toggleTag = t => setTags(ts => ts.includes(t) ? ts.filter(x=>x!==t) : [...ts, t]);

  return (
    <div className="pe" style={{padding:"4rem 2rem",maxWidth:1100,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:"3.5rem"}}>
        <div className="badge">Get In Touch</div>
        <h1 style={{fontSize:"clamp(2rem,5vw,3rem)",fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-.04em",marginBottom:"1rem"}}>Talk to an expert.<br/><span style={{background:"linear-gradient(135deg,#4ade80,#22d3ee)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Grow together.</span></h1>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:"1rem",fontFamily:"'Outfit',sans-serif"}}>Our agronomists are available 7 days a week in your language.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:"2rem",alignItems:"start"}}>
        {/* Contact info — each clickable */}
        <div style={{display:"flex",flexDirection:"column",gap:"1.15rem"}}>
          {[
            {icon:"📞",title:"Call Us",info:"+91 99677 22680",sub:"Mon–Sun 6am–10pm IST",click:()=>alert("Calling +91 99677 22680…\n(In production this would open your phone dialer)")},
            {icon:"💬",title:"WhatsApp",info:"+91 99677 22680",sub:"Instant support · Tap to chat",click:()=>window.open("https://wa.me/919967722680","_blank")},
            {icon:"✉️",title:"Email",info:"hello@agroai.farm",sub:"Response within 2 hours",click:()=>window.open("mailto:hello@agroai.farm","_blank")},
            {icon:"🏢",title:"HQ",info:"Vashi, Maharashtra, India",sub:"Navi Mumbai · Open 9am–7pm",click:()=>alert("Address: AgroAI Technologies Pvt. Ltd.\nSector 17, Vashi\nNavi Mumbai - 400703\nMaharashtra, India")},
          ].map(c=>(
            <div key={c.title} className="fcard card" onClick={c.click} style={{padding:"1.32rem",display:"flex",gap:"1rem",alignItems:"flex-start",cursor:"pointer"}}>
              <div style={{width:44,height:44,borderRadius:12,background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.35rem",flexShrink:0}}>{c.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:".88rem",fontFamily:"'Syne',sans-serif",marginBottom:3}}>{c.title}</div>
                <div style={{fontSize:".92rem",color:"#4ade80",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>{c.info}</div>
                <div style={{fontSize:".73rem",color:"rgba(255,255,255,.4)",marginTop:2,fontFamily:"'Outfit',sans-serif"}}>{c.sub}</div>
              </div>
              <div style={{fontSize:".7rem",color:"rgba(74,222,128,.6)",alignSelf:"center",fontWeight:600}}>→</div>
            </div>
          ))}

          {/* Map placeholder */}
          <div style={{background:"rgba(74,222,128,.04)",border:"1px solid rgba(74,222,128,.15)",borderRadius:16,padding:"1.15rem",cursor:"pointer"}} onClick={()=>window.open("https://maps.google.com/?q=Vashi+Navi+Mumbai","_blank")}>
            <div style={{fontSize:".68rem",color:"rgba(74,222,128,.8)",fontWeight:700,letterSpacing:".06em",marginBottom:".72rem",fontFamily:"'Outfit',sans-serif"}}>📍 FIND US · Click to open Maps</div>
            <div style={{background:"rgba(255,255,255,.03)",borderRadius:12,height:120,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
              <svg width="100%" height="120" viewBox="0 0 300 120" style={{position:"absolute"}}>
                <rect width="300" height="120" fill="rgba(74,222,128,0.03)"/>
                {[0,1,2,3,4,5].map(i=><line key={i} x1={i*60} y1="0" x2={i*60} y2="120" stroke="rgba(74,222,128,0.07)" strokeWidth="1"/>)}
                {[0,1,2].map(i=><line key={i} x1="0" y1={i*60} x2="300" y2={i*60} stroke="rgba(74,222,128,0.07)" strokeWidth="1"/>)}
                <circle cx="150" cy="60" r="26" fill="rgba(74,222,128,0.07)" stroke="rgba(74,222,128,0.2)" strokeWidth="1" strokeDasharray="4 4"/>
                <circle cx="150" cy="60" r="9" fill="rgba(74,222,128,0.2)" stroke="#4ade80" strokeWidth="1.5"/>
                <circle cx="150" cy="60" r="3.5" fill="#4ade80"/>
              </svg>
              <div style={{position:"relative",textAlign:"center",zIndex:1}}>
                <div style={{fontSize:"1.3rem"}}>📍</div>
                <div style={{fontSize:".75rem",color:"#4ade80",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>Vashi, Navi Mumbai</div>
                <div style={{fontSize:".66rem",color:"rgba(255,255,255,.35)",fontFamily:"'Outfit',sans-serif"}}>Maharashtra, India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {sent ? (
          <div style={{background:"rgba(74,222,128,.06)",border:"1px solid rgba(74,222,128,.25)",borderRadius:24,padding:"4rem 2rem",textAlign:"center"}}>
            <div style={{fontSize:"4rem",marginBottom:"1.4rem",animation:"bounce 1s ease-in-out 3"}}>✅</div>
            <h3 style={{fontSize:"1.55rem",fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:"1rem"}}>Message sent!</h3>
            <p style={{color:"rgba(255,255,255,.6)",fontFamily:"'Outfit',sans-serif",lineHeight:1.75,marginBottom:"1.5rem"}}>Our Vashi team will reach out within 2 hours on <span style={{color:"#4ade80",fontWeight:600}}>+91 99677 22680</span>.</p>
            <div style={{display:"flex",gap:".75rem",justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn-g" style={{animation:"none",padding:".72rem 1.6rem",fontSize:".88rem"}} onClick={()=>setSent(false)}>Send Another</button>
              <button className="btn-o" style={{padding:".72rem 1.6rem",fontSize:".88rem"}} onClick={()=>window.open("https://wa.me/919967722680","_blank")}>WhatsApp Us</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(74,222,128,.15)",borderRadius:24,padding:"2.3rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
            <div><h3 style={{fontSize:"1.08rem",fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:".2rem"}}>Request a Free Consultation</h3><p style={{fontSize:".78rem",color:"rgba(255,255,255,.4)",fontFamily:"'Outfit',sans-serif"}}>We respond within 2 hours on call & WhatsApp</p></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              <div><label style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"block",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>Full Name *</label><input className="inp" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Rajesh Patel"/></div>
              <div><label style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"block",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>Email *</label><input className="inp" required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@farm.com"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              <div><label style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"block",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>Phone / WhatsApp</label><input className="inp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 99677 22680"/></div>
              <div><label style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"block",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>Farm Size (acres)</label><input className="inp" value={form.farm} onChange={e=>setForm({...form,farm:e.target.value})} placeholder="e.g. 500"/></div>
            </div>
            <div>
              <label style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"block",marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>I'm interested in… (click to select)</label>
              <div style={{display:"flex",gap:".55rem",flexWrap:"wrap"}}>
                {TAGS.map(tag=>(
                  <span key={tag} onClick={()=>toggleTag(tag)} style={{background:tags.includes(tag)?"rgba(74,222,128,.18)":"rgba(74,222,128,.06)",border:`1px solid ${tags.includes(tag)?"rgba(74,222,128,.5)":"rgba(74,222,128,.2)"}`,color:tags.includes(tag)?"#4ade80":"rgba(74,222,128,.7)",padding:".26rem .66rem",borderRadius:100,fontSize:".7rem",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:tags.includes(tag)?700:400,transition:"all .2s"}}>{tags.includes(tag)?"✓ ":""}{tag}</span>
                ))}
              </div>
            </div>
            <div><label style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"block",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>Message *</label><textarea className="inp" required rows={4} value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})} placeholder="Tell us about your farm, crops, and challenges…" style={{resize:"vertical",minHeight:100}}/></div>
            <button type="submit" className="btn-g" style={{width:"100%",padding:".95rem",animation:"none",fontSize:".96rem"}}>Send Message →</button>
            <p style={{fontSize:".7rem",color:"rgba(255,255,255,.3)",textAlign:"center",fontFamily:"'Outfit',sans-serif"}}>🔒 Your data is secure. We never share your information.</p>
          </form>
        )}
      </div>
    </div>
  );
}
