"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowDown, ArrowRight, Camera, Check, ChevronDown, Mail, Menu, Phone, Send, ShieldCheck, X } from "lucide-react";
import { copy, directionKeys, pillars, type DirectionKey, type Locale } from "./poc-data";

const languages: Locale[] = ["en", "fr", "ru"];
const contactLinks = [{ name: "Instagram", Icon: Camera }, { name: "Telegram", Icon: Send }, { name: "Email", Icon: Mail }, { name: "Call", Icon: Phone }];

function Brand() { return <a className="brand" href="#home" aria-label="POC, home"><span>POC</span><i /><small>Private Office<br />Consulting</small></a>; }
function LanguageSwitch({ locale, setLocale }: { locale: Locale; setLocale: (l: Locale) => void }) { return <div className="language" role="group" aria-label="Language">{languages.map(l => <button key={l} className={locale === l ? "active" : ""} aria-pressed={locale === l} onClick={() => setLocale(l)}>{l.toUpperCase()}</button>)}</div>; }
function Contacts({ unavailable, compact = false }: { unavailable: string; compact?: boolean }) { return <div className={`socials ${compact ? "compact" : ""}`}>{contactLinks.map(({name,Icon}) => <a key={name} href="#contact" title={unavailable} aria-label={`${name}. ${unavailable}`}><Icon/><span>{compact?"":name}</span></a>)}</div>; }

export default function PocSite() {
  const [locale, setLocaleState] = useState<Locale>("en"); const [menu, setMenu] = useState(false); const [active, setActive] = useState<DirectionKey | null>(null); const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll(); const progress = useSpring(scrollYProgress,{stiffness:120,damping:28}); const t = copy(locale);
  useEffect(()=>{const saved=localStorage.getItem("poc-locale") as Locale|null;const timer=window.setTimeout(()=>{if(saved&&languages.includes(saved))setLocaleState(saved)},0);return()=>window.clearTimeout(timer)},[]);
  useEffect(()=>{if(!menu)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setMenu(false)};document.body.style.overflow="hidden";window.addEventListener("keydown",close);return()=>{document.body.style.overflow="";window.removeEventListener("keydown",close)}},[menu]);
  function setLocale(l: Locale){ setLocaleState(l); localStorage.setItem("poc-locale",l); document.documentElement.lang=l; }
  function request(key?: DirectionKey){ if(key)setActive(key); document.getElementById("contact")?.scrollIntoView({behavior:reduce?"auto":"smooth"}); }
  return <MotionConfig reducedMotion="user" transition={{duration:.7,ease:[.22,1,.36,1]}}>
    <a className="skip" href="#main">{t.nav.skip}</a><motion.div className="progress" style={{scaleY:progress}} />
    <aside className="rail" aria-label="Direct contact"><span className="rail-line top" /><Contacts unavailable={t.form.unavailable} compact /><span className="rail-line bottom" /></aside>
    <header><Brand /><LanguageSwitch locale={locale} setLocale={setLocale}/><button className="menu-button" onClick={()=>setMenu(v=>!v)} aria-expanded={menu} aria-label={menu?t.nav.menuClose:t.nav.menuOpen}>{menu?<X/>:<Menu/>}</button></header>
    <AnimatePresence>{menu&&<motion.nav className="mobile-menu" initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>{[["#approach",t.nav.approach],["#services",t.nav.expertise],["#confidentiality",t.nav.confidentiality],["#contact",t.nav.contact]].map(([href,label])=><a key={href} href={href} onClick={()=>setMenu(false)}>{label}</a>)}<LanguageSwitch locale={locale} setLocale={setLocale}/></motion.nav>}</AnimatePresence>
    <main id="main">
      <section className="hero" id="home">
        <motion.div className="hero-copy" initial={{opacity:0,y:38}} animate={{opacity:1,y:0}}><h1>{t.hero.title}</h1><span className="sand-line"/><p>{t.hero.body}</p><div className="hero-actions"><a className="primary-action" href="#contact">{t.hero.primary}<ArrowRight/></a><a href="#services">{t.hero.secondary}<ArrowDown/></a></div></motion.div>
        <motion.div className="hero-photo" initial={{clipPath:"inset(0 100% 0 0)"}} animate={{clipPath:"inset(0 0% 0 0)"}} transition={{duration:1.5,delay:.15}}><picture><img src="/assets/riviera-editorial-hero.png" alt="French Riviera villa terrace overlooking the Mediterranean" /></picture><span className="navy-block" /></motion.div>
        <span className="architect-line one"/><span className="architect-line two"/>
      </section>

      <section className="approach" id="approach"><Reveal><p className="eyebrow">{t.positioning.label}</p><h2>{t.positioning.title}</h2></Reveal><div className="approach-grid">{t.positioning.paragraphs.map((p,i)=><Reveal key={p} className="approach-item"><span>0{i+1}</span><p>{p}</p></Reveal>)}</div><div className="assurances">{t.positioning.assurances.map(v=><span key={v}><Check/>{v}</span>)}</div></section>

      <section className="services" id="services"><div className="services-head"><p className="eyebrow">{t.expertise.label}</p><h2>{t.expertise.title}</h2><p>{t.expertise.body}</p></div><div className="service-grid">
        {directionKeys.map((key,index)=>{const p=pillars[locale][key];return <motion.article key={key} layout className={`service ${active===key?"active":""}`}><button className="service-cover" onClick={()=>setActive(active===key?null:key)} aria-expanded={active===key}><span>0{index+1}</span><h3>{p.title}</h3><div className={`panel panel-${index+1}`}/><i><ArrowRight/></i></button><AnimatePresence initial={false}>{active===key&&<motion.div className="service-details" initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}><p>{p.summary}</p>{p.groups.map(g=><div key={g.title}><h4>{g.title}</h4><ul>{g.items.map(s=><li key={s}>{s}</li>)}</ul></div>)}<button onClick={()=>request(key)}>{t.expertise.discuss}<ArrowRight/></button></motion.div>}</AnimatePresence></motion.article>})}
      </div></section>

      <section className="bespoke" id="confidentiality"><div className="bespoke-dark"><Reveal><p className="eyebrow">{t.custom.label}</p><h2>{t.custom.title}</h2><span className="sand-line"/><p>{t.custom.body}</p></Reveal></div><div className="bespoke-light"><motion.div className="conversation-card" whileHover={{y:-8}}><ShieldCheck/><h2>{t.form.label}.</h2><span className="sand-line"/><a href="#contact" aria-label={t.form.submit}><ArrowRight/></a></motion.div></div></section>

      <section className="confidential"><Reveal><p className="eyebrow">{t.confidentiality.label}</p><h2>{t.confidentiality.title}</h2><p>{t.confidentiality.body}</p></Reveal><div>{t.confidentiality.points.map((p,i)=><Reveal key={p} className="point"><span>0{i+1}</span><p>{p}</p></Reveal>)}</div></section>

      <section className="contact" id="contact"><div className="contact-copy"><p className="eyebrow">{t.form.label}</p><h2>{t.form.title}</h2><p>{t.form.body}</p><Contacts unavailable={t.form.unavailable}/></div><RequestForm key={`${locale}-${active ?? "none"}`} locale={locale} direction={active}/></section>
    </main>
    <footer><Brand/><div><p>{t.footer.line}</p><p>{t.footer.region}</p></div><p className="copyright">© {new Date().getFullYear()} {t.footer.rights}</p></footer>
  </MotionConfig>;
}

function Reveal({children,className=""}:{children:React.ReactNode;className?:string}){return <motion.div className={className} initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}}>{children}</motion.div>}

function RequestForm({locale,direction}:{locale:Locale;direction:DirectionKey|null}){const t=copy(locale);const ref=useRef<HTMLFormElement>(null);const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");const [selected,setSelected]=useState(direction??"");const options=useMemo(()=>directionKeys.map(k=>({value:k,label:pillars[locale][k].title})),[locale]);async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setStatus("sending");const f=new FormData(e.currentTarget);try{const res=await fetch("/api/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:f.get("name"),email:f.get("email"),phone:f.get("phone"),direction:f.get("direction"),task:f.get("task"),locale,sourcePath:location.pathname})});if(!res.ok)throw new Error();setStatus("success");ref.current?.reset();setSelected("")}catch{setStatus("error")}}
  if(status==="success")return <div className="form success"><Check/><h3>{t.form.successTitle}</h3><p>{t.form.successBody}</p><button onClick={()=>setStatus("idle")}>{t.form.another}</button></div>;
  return <form ref={ref} className="form" onSubmit={submit}><label><span>{t.form.name}</span><input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label><label><span>{t.form.email}</span><input name="email" type="email" required maxLength={254} autoComplete="email"/></label><label><span>{t.form.phone}</span><input name="phone" type="tel" maxLength={40} autoComplete="tel"/></label><label><span>{t.form.direction}</span><span className="select"><select name="direction" required value={selected} onChange={e=>setSelected(e.target.value)}><option value="" disabled>{t.form.select}</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}<option value="custom">{t.form.custom}</option><option value="unsure">{t.form.unsure}</option></select><ChevronDown/></span></label><label className="task"><span>{t.form.task}</span><textarea name="task" required minLength={20} maxLength={3000} rows={6}/></label><p className="privacy"><ShieldCheck/>{t.form.privacy}</p>{status==="error"&&<p className="error" role="alert">{t.form.sendError}</p>}<button className="submit" disabled={status==="sending"}>{status==="sending"?t.form.sending:t.form.submit}<ArrowRight/></button></form>}
