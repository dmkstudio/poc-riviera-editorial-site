"use client";
/* eslint-disable @next/next/no-img-element -- local SVG brand marks are tiny vectors and do not benefit from image optimisation. */

import { FormEvent, type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowDown, ArrowRight, Check, ChevronDown, Mail, Menu, Phone, ShieldCheck, X } from "lucide-react";
import { copy, directionKeys, pillars, type DirectionKey, type Locale } from "./poc-data";

const languages: Locale[] = ["en", "fr", "ru"];
function InstagramMark() { return <img className="contact-brand-mark" src="/assets/icon-instagram.svg" width="24" height="24" alt="" aria-hidden="true" />; }
function WhatsAppMark() { return <img className="contact-brand-mark" src="/assets/icon-whatsapp.svg" width="24" height="24" alt="" aria-hidden="true" />; }
const contactLinks = [
  { name: "Instagram", Icon: InstagramMark, channel: "instagram" },
  { name: "WhatsApp", Icon: WhatsAppMark, channel: "whatsapp", href: "https://wa.me/33748613632", detail: "+33 7 48 61 36 32" },
  { name: "Email", Icon: Mail, channel: "email", href: "mailto:conact.poc@gmail.com", detail: "conact.poc@gmail.com" },
  { name: "Call", Icon: Phone, channel: "call", href: "tel:+33748613632", detail: "+33 7 48 61 36 32" },
];

function Brand({ label = "POC, home" }: { label?: string }) { return <a className="brand" href="#home" aria-label={label}><span>POC</span><i /><small>Private Office<br />Consulting</small></a>; }
function LanguageSwitch({ locale, setLocale, label }: { locale: Locale; setLocale: (l: Locale) => void; label: string }) {
  const dragging = useRef(false);
  const activeIndex = languages.indexOf(locale);
  function chooseAt(clientX: number, element: HTMLDivElement) {
    const rect = element.getBoundingClientRect();
    const position = Math.max(0, Math.min(.999, (clientX - rect.left) / rect.width));
    setLocale(languages[Math.min(languages.length - 1, Math.floor(position * languages.length))]);
  }
  function beginDrag(event: React.PointerEvent<HTMLDivElement>) { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); chooseAt(event.clientX, event.currentTarget); }
  function moveDrag(event: React.PointerEvent<HTMLDivElement>) { if (dragging.current) chooseAt(event.clientX, event.currentTarget); }
  function endDrag(event: React.PointerEvent<HTMLDivElement>) { dragging.current = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }
  return <div className="language" role="group" aria-label={label} style={{ "--language-index": activeIndex } as CSSProperties} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
    <span className="language-track" aria-hidden="true"><span className="language-thumb" /></span>
    {languages.map(l => <button key={l} className={locale === l ? "active" : ""} aria-pressed={locale === l} onClick={() => setLocale(l)}>{l.toUpperCase()}</button>)}
  </div>;
}
function Contacts({ unavailable, compact = false }: { unavailable: string; compact?: boolean }) {
  return <div className={`socials ${compact ? "compact" : ""}`}>
    {contactLinks.map(({ name, Icon, channel, href, detail }) => href
      ? <a className="contact-channel" data-channel={channel} key={name} href={href} title={detail} aria-label={`${name}: ${detail}`}><Icon /><span>{compact ? "" : name}</span>{!compact && <small>{detail}</small>}</a>
      : <div className="social-unavailable contact-channel" data-channel={channel} key={name} aria-label={`${name}. ${unavailable}`}><Icon /><span>{compact ? "" : name}</span>{!compact && <small>{unavailable}</small>}</div>)}
  </div>;
}
function HeroTitle({ locale }: { locale: Locale }) {
  const lines: Record<Locale, string[]> = {
    en: ["One call.", "Everything else", "is our concern."],
    fr: ["Un appel.", "Nous nous occupons", "de tout le reste."],
    ru: ["Один звонок.", "Всё остальное —", "наша забота."],
  };
  return <h1>{lines[locale].map((line, index) => <span key={line}>{line}{index < 2 && <br />}</span>)}</h1>;
}

export default function PocSite() {
  const [locale, setLocaleState] = useState<Locale>("en"); const [menu, setMenu] = useState(false); const [active, setActive] = useState<DirectionKey | null>(null); const [serviceDialog, setServiceDialog] = useState<DirectionKey | null>(null); const serviceTrigger = useRef<HTMLButtonElement | null>(null); const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll(); const progress = useSpring(scrollYProgress,{stiffness:120,damping:28}); const t = copy(locale);
  const labels: Record<Locale, { brand: string; hero: string }> = {
    en: { brand: "POC, home", hero: "French Riviera villa terrace overlooking the Mediterranean" },
    fr: { brand: "POC, accueil", hero: "Terrasse d'une villa sur la Côte d’Azur, face à la Méditerranée" },
    ru: { brand: "POC, главная", hero: "Терраса виллы на Лазурном берегу с видом на Средиземное море" },
  };
  useEffect(()=>{const saved=localStorage.getItem("poc-locale") as Locale|null;const timer=window.setTimeout(()=>{if(saved&&languages.includes(saved))setLocaleState(saved)},0);return()=>window.clearTimeout(timer)},[]);
  useEffect(()=>{document.documentElement.lang=locale},[locale]);
  useEffect(()=>{if(!menu&&!serviceDialog)return;const close=(event:KeyboardEvent)=>{if(event.key!=="Escape")return;if(serviceDialog)setServiceDialog(null);else setMenu(false)};const previousOverflow=document.body.style.overflow;document.body.style.overflow="hidden";window.addEventListener("keydown",close);return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener("keydown",close)}},[menu,serviceDialog]);
  function setLocale(l: Locale){ setLocaleState(l); localStorage.setItem("poc-locale",l); document.documentElement.lang=l; }
  function openService(key: DirectionKey, trigger: HTMLButtonElement){serviceTrigger.current=trigger;setServiceDialog(key)}
  function closeService(){setServiceDialog(null);window.setTimeout(()=>serviceTrigger.current?.focus(),0)}
  function request(key?: DirectionKey){ if(key)setActive(key); setServiceDialog(null); document.getElementById("contact")?.scrollIntoView({behavior:reduce?"auto":"smooth"}); }
  return <MotionConfig reducedMotion="user" transition={{duration:.7,ease:[.22,1,.36,1]}}>
    <a className="skip" href="#main">{t.nav.skip}</a><motion.div className="progress" style={{scaleY:progress}} />
    <header><Brand label={labels[locale].brand} /><nav className="desktop-nav" aria-label="Primary navigation">{[["#home","POC"],["#approach",t.nav.approach],["#services",t.nav.expertise],["#confidentiality",t.nav.confidentiality],["#contact",t.nav.contact]].map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav><LanguageSwitch locale={locale} setLocale={setLocale} label={locale === "fr" ? "Sélecteur de langue" : locale === "ru" ? "Выбор языка" : "Language selector"}/><button className="menu-button" onClick={()=>setMenu(v=>!v)} aria-expanded={menu} aria-controls="mobile-navigation" aria-label={menu?t.nav.menuClose:t.nav.menuOpen}>{menu?<X/>:<Menu/>}</button></header>
    <AnimatePresence>{menu&&<motion.nav id="mobile-navigation" className="mobile-menu" initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.28}}>{[["#home","POC"],["#approach",t.nav.approach],["#services",t.nav.expertise],["#confidentiality",t.nav.confidentiality],["#contact",t.nav.contact]].map(([href,label])=><a key={href} href={href} onClick={()=>setMenu(false)}>{label}</a>)}<LanguageSwitch locale={locale} setLocale={setLocale} label={locale === "fr" ? "Sélecteur de langue" : locale === "ru" ? "Выбор языка" : "Language selector"}/></motion.nav>}</AnimatePresence>
    <main id="main">
      <section className="hero" id="home">
        <motion.div className="hero-copy" initial={{opacity:0,y:38}} animate={{opacity:1,y:0}}><HeroTitle locale={locale}/><span className="sand-line"/><p>{t.hero.body}</p><div className="hero-actions"><a className="primary-action" href="#contact">{t.hero.primary}<ArrowRight/></a><a href="#services">{t.hero.secondary}<ArrowDown/></a></div></motion.div>
        <motion.div className="hero-photo" initial={{opacity:0,scale:1.015}} animate={{opacity:1,scale:1}} transition={{duration:.65,delay:.05}}><picture><source type="image/webp" srcSet="/assets/poc-master-riviera-architecture.webp" /><source type="image/png" srcSet="/assets/poc-master-riviera-architecture.png" /><img src="/assets/poc-master-riviera-architecture.png" alt={labels[locale].hero} fetchPriority="high" /></picture><span className="navy-block" /></motion.div>
        <span className="architect-line one"/><span className="architect-line two"/>
      </section>

      <section className="approach" id="approach">
        <Reveal className="approach-intro"><h2>{t.positioning.title}</h2></Reveal>
        <div className="approach-prose">
          <Reveal className="approach-lead"><p>{t.positioning.paragraphs[0]}</p></Reveal>
          <div className="approach-support">
            {t.positioning.paragraphs.slice(1).map(paragraph=><Reveal key={paragraph} className="approach-note"><p>{paragraph}</p></Reveal>)}
          </div>
        </div>
        <div className="assurances" aria-label={t.positioning.label}>{t.positioning.assurances.map(value=><span key={value}><Check/>{value}</span>)}</div>
      </section>

      <section className="services" id="services"><div className="services-head"><p className="eyebrow">{t.expertise.label}</p><h2>{t.expertise.title}</h2><p>{t.expertise.body}</p></div><div className="service-grid">
        {directionKeys.map((key,index)=>{const p=pillars[locale][key];const detailsId=`service-details-${key}`;return <motion.article key={key} layout className="service"><button className="service-cover" onClick={(event)=>openService(key,event.currentTarget)} aria-haspopup="dialog" aria-controls={detailsId}><span>0{index+1}</span><h3>{p.title}</h3><div className={`panel panel-${index+1}`}/><i><ArrowRight/></i></button></motion.article>})}
      </div></section>
      <AnimatePresence>{serviceDialog&&<ServiceDialog locale={locale} direction={serviceDialog} onChange={setServiceDialog} onClose={closeService} onRequest={request}/>}</AnimatePresence>

      <section className="bespoke" id="confidentiality"><div className="bespoke-dark"><Reveal><p className="eyebrow">{t.custom.label}</p><h2>{t.custom.title}</h2><span className="sand-line"/><p>{t.custom.body}</p></Reveal></div><div className="bespoke-light"><motion.div className="conversation-card" whileHover={{y:-8}}><ShieldCheck/><h2>{t.form.label}.</h2><span className="sand-line"/><a href="#contact" aria-label={t.form.submit}><ArrowRight/></a></motion.div></div></section>

      <section className="confidential"><Reveal><p className="eyebrow">{t.confidentiality.label}</p><h2>{t.confidentiality.title}</h2><p>{t.confidentiality.body}</p></Reveal><div>{t.confidentiality.points.map((p,i)=><Reveal key={p} className="point"><span>0{i+1}</span><p>{p}</p></Reveal>)}</div></section>

      <section className="contact" id="contact"><div className="contact-copy"><p className="eyebrow">{t.form.label}</p><h2>{t.form.title}</h2><p>{t.form.body}</p><Contacts unavailable={t.form.unavailable}/></div><RequestForm key={`${locale}-${active ?? "none"}`} locale={locale} direction={active}/></section>
    </main>
    <footer><Brand label={labels[locale].brand}/><div><p>{t.footer.line}</p><p>{t.footer.region}</p></div><p className="copyright">© {new Date().getFullYear()} {t.footer.rights}</p></footer>
  </MotionConfig>;
}

function Reveal({children,className=""}:{children:React.ReactNode;className?:string}){return <motion.div className={className} initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}}>{children}</motion.div>}

function ServiceDialog({ locale, direction, onChange, onClose, onRequest }: { locale: Locale; direction: DirectionKey; onChange: (key: DirectionKey) => void; onClose: () => void; onRequest: (key: DirectionKey) => void }) {
  const t = copy(locale); const pillar = pillars[locale][direction]; const detailsId = `service-details-${direction}`;
  return <motion.div className="service-dialog-backdrop" role="presentation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={onClose}>
    <motion.aside id={detailsId} className="service-dialog" role="dialog" aria-modal="true" aria-labelledby="service-dialog-title" initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{duration:.42,ease:[.22,1,.36,1]}} onMouseDown={event=>event.stopPropagation()}>
      <div className="service-dialog-header"><p className="eyebrow">{t.expertise.services}</p><button className="service-dialog-close" type="button" onClick={onClose} aria-label={t.expertise.close}><X /></button></div>
      <div className="service-dialog-tabs" role="tablist" aria-label={t.expertise.label}>{directionKeys.map((key,index)=><button key={key} type="button" role="tab" aria-selected={key===direction} aria-controls={detailsId} aria-label={`${index+1}. ${pillars[locale][key].title}`} onClick={()=>onChange(key)}>0{index+1}</button>)}</div>
      <div className="service-dialog-body"><h2 id="service-dialog-title">{pillar.title}</h2><p className="service-promise">{pillar.summary}</p><div className="service-dialog-groups">{pillar.groups.map(group=><section key={group.title}><h3>{group.title}</h3><ul>{group.items.map(item=><li key={item}>{item}</li>)}</ul></section>)}</div></div>
      <div className="service-dialog-footer"><button type="button" onClick={()=>onRequest(direction)}>{t.expertise.discuss}<ArrowRight /></button></div>
    </motion.aside>
  </motion.div>;
}

function RequestForm({locale,direction}:{locale:Locale;direction:DirectionKey|null}){const t=copy(locale);const ref=useRef<HTMLFormElement>(null);const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");const [selected,setSelected]=useState(direction??"");const options=useMemo(()=>directionKeys.map(k=>({value:k,label:pillars[locale][k].title})),[locale]);async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setStatus("sending");const f=new FormData(e.currentTarget);try{const res=await fetch("/api/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:f.get("name"),email:f.get("email"),phone:f.get("phone"),direction:f.get("direction"),task:f.get("task"),website:f.get("website"),locale,sourcePath:location.pathname})});if(!res.ok)throw new Error();setStatus("success");ref.current?.reset();setSelected("")}catch{setStatus("error")}}
  if(status==="success")return <div className="form success" role="status" aria-live="polite"><Check/><h3>{t.form.successTitle}</h3><p>{t.form.successBody}</p><button onClick={()=>setStatus("idle")}>{t.form.another}</button></div>;
  return <form ref={ref} className="form" onSubmit={submit}><label className="honeypot" aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off"/></label><label><span>{t.form.name}</span><input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label><label><span>{t.form.email}</span><input name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email"/></label><label><span>{t.form.phone}</span><input name="phone" type="tel" maxLength={40} autoComplete="tel" inputMode="tel"/></label><label><span>{t.form.direction}</span><span className="select"><select name="direction" required value={selected} onChange={e=>setSelected(e.target.value)}><option value="" disabled>{t.form.select}</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}<option value="custom">{t.form.custom}</option><option value="unsure">{t.form.unsure}</option></select><ChevronDown/></span></label><label className="task"><span>{t.form.task}</span><textarea name="task" required minLength={20} maxLength={3000} rows={6}/></label><p className="privacy"><ShieldCheck/>{t.form.privacy}</p><p className="form-status" aria-live="polite">{status==="sending"?t.form.sending:""}</p>{status==="error"&&<p className="error" role="alert">{t.form.sendError}</p>}<button className="submit" disabled={status==="sending"}>{status==="sending"?t.form.sending:t.form.submit}<ArrowRight/></button></form>}
