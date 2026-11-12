import React, { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  WhatsApp, Email, Phone, Menu, Close, DarkMode, LightMode, KeyboardArrowUp, Router,
  Speed, Cable, Videocam, SupportAgent, Hub, Tv, Settings, Share, Download, Search, Check,
  ExpandMore, SignalWifi4Bar, Business, Bolt, Star, StarBorder, Mic, CalendarMonth, GroupAdd, InstallMobile, LocationOn, SmartToy, MyLocation, CheckCircle,
} from "@mui/icons-material";
import "./Home.css";

const LEBO: string = (() => { const m = require("../assets/Lebo.jpeg"); return m && m.default ? m.default : m; })();

/* ---------- BUSINESS DETAILS ---------- */
const NAME = "Lebo Fibre Internet Specialist";
const PHONE = "068 593 2102";
const WA = "27685932102";
const EMAIL = "leboleymolelekoa@gmail.com";

const wa = (t: string) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const mail = (s: string, b = "") => `mailto:${EMAIL}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;

const NAV = [
  ["about", "About"], ["plans", "Plans"],
  ["fix", "Fix my Wi-Fi"], ["faq", "FAQ"], ["contact", "Quote"],
];

const SERVICES = [
  { i: <Cable />, t: "New fibre connections", d: "We help you choose a provider, apply, and get the line to your home or business." },
  { i: <Router />, t: "Router and Wi-Fi 6/7 setup", d: "Placement, settings and security so every room gets a strong signal." },
  { i: <Hub />, t: "Fibre And LTE", d: "Remove dead spots in large homes, offices, and multi-storey buildings." },
  { i: <Business />, t: "Business internet", d: "Reliable fibre for shops, offices and teams, with backup options." },
  { i: <SupportAgent />, t: "Fault finding and repairs", d: "Slow speeds, drop-outs and red lights diagnosed and sorted." },
  { i: <Tv />, t: "Streaming and smart-home setup", d: "Smart TVs, streaming boxes, cameras and devices connected properly." },
];

const BANDS = [
  { m: 25, n: "Light", d: "1–2 people, browsing, email, music" },
  { m: 50, n: "Home", d: "2–3 people, HD streaming, video calls" },
  { m: 100, n: "Family", d: "3–5 people, several screens at once" },
  { m: 200, n: "Power", d: "Work from home, gaming, 4K streaming" },
  { m: 500, n: "Studio", d: "Creators, large uploads, busy homes" },
  { m: 1000, n: "Business", d: "Teams, cloud backups, heavy use" },
];

const USES: [string, number][] = [["Browsing and social", 5], ["Streaming and calls", 15], ["Gaming and remote work", 25]];

const CHECKS = [
  "Restart the router: off for 30 seconds, then on",
  "Check the fibre cable is not bent, pinched or loose",
  "Move the router to a central, raised spot",
  "Test with a cable on one device to rule out Wi-Fi",
  "Disconnect devices you are not using",
];

const LEDS = [
  ["Power", "Solid", "The device has power."],
  ["PON / Link", "Steady", "Fibre signal is connected."],
  ["LOS", "Red or blinking", "Fibre signal is lost. Message us."],
];

const FAQ = [
  ["Can you tell me what fibre is available at my address?", "Yes. Send us your address on WhatsApp and we will check which networks reach you."],
  ["How do I know which speed I need?", "Use the plan finder above. It adds up people and activities, then suggests a speed with some headroom."],
  ["My internet is slow. What first?", "Try the five-step checklist in Fix my Wi-Fi. If it is still slow, send it to us and we will take it from there."],
  ["What does it cost?", "Prices depend on the network in your area and the speed you choose. Ask for a quote and we will reply with exact options."],
];

const TIMES = ["Morning", "Afternoon", "Evening"];

/* Quick-answer assistant (rule-based, uses the answers on this site) */
const ASSIST: [string, string][] = [
  ["Is fibre at my address?", FAQ[0][1]],
  ["Which speed do I need?", FAQ[1][1]],
  ["My internet is slow", FAQ[2][1]],
  ["What does it cost?", FAQ[3][1]],
  ["How does it work?", "You give us your address and we check coverage. If there is coverage, we fill in the application for you, and then your service goes live."],
];

const SPEEDS = [10, 25, 50, 100, 200, 500, 1000];
const fmtTime = (s: number) => (s < 60 ? `${Math.max(1, Math.round(s))} sec` : s < 3600 ? `${Math.round(s / 60)} min` : `${(s / 3600).toFixed(1)} hours`);

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const s = localStorage.getItem("lf-theme");
      if (s === "light" || s === "dark") return s;
    } catch {}
    return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [menu, setMenu] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(3);
  const [people, setPeople] = useState(3);
  const [use, setUse] = useState(1);
  const [checks, setChecks] = useState<boolean[]>(CHECKS.map(() => false));
  const [faq, setFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", phone: "", area: "", service: SERVICES[0].t, msg: "", date: "", time: TIMES[0], urgent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [palette, setPalette] = useState(false);
  const [q, setQ] = useState("");
  const [net, setNet] = useState({ online: true, down: 0, type: "" });
  const [cov, setCov] = useState("");
  const [rating, setRating] = useState(0);
  const [installEvt, setInstallEvt] = useState<any>(null);
  const [zoom, setZoom] = useState(false);
  const [listening, setListening] = useState(false);
  const [loc, setLoc] = useState("");
  const [withNet, setWithNet] = useState(false);
  const [remember, setRemember] = useState(false);
  const [ai, setAi] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([{ me: false, t: "Hi, I am the Lebo Fibre quick-help assistant. What would you like to know?" }]);
  const aiLog = useRef<HTMLDivElement>(null);
  const qRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number>();

  const say = (m: string) => {
    setToast(m);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  };

  /* theme (with View Transitions where supported) */
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    const apply = () => flushSync(() => setTheme(next));
    const d: any = document;
    if (d.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) d.startViewTransition(apply);
    else apply();
    try { localStorage.setItem("lf-theme", next); } catch {}
  };

  /* title, description and structured data for search engines */
  useEffect(() => {
    document.title = `${NAME} | Fibre, Wi-Fi and business internet`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = "Fibre installation help, Wi-Fi 6/7 setup, mesh systems and fault finding. Message Lebo Fibre on WhatsApp for a quote.";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.text = JSON.stringify({
      "@context": "https://schema.org", "@type": "LocalBusiness", name: NAME,
      telephone: "+27685932102", email: EMAIL, description: "Internet and fibre specialist",
    });
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);

  /* scroll progress */
  useEffect(() => {
    const f = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    window.addEventListener("resize", f);
    return () => { window.removeEventListener("scroll", f); window.removeEventListener("resize", f); };
  }, []);

  /* live connection badge (Network Information API where available) */
  useEffect(() => {
    const c: any = (navigator as any).connection;
    const f = () => setNet({ online: navigator.onLine, down: c?.downlink || 0, type: c?.effectiveType || "" });
    f();
    window.addEventListener("online", f); window.addEventListener("offline", f);
    c?.addEventListener?.("change", f);
    return () => { window.removeEventListener("online", f); window.removeEventListener("offline", f); c?.removeEventListener?.("change", f); };
  }, []);

  /* install-as-app prompt */
  useEffect(() => {
    const h = (e: any) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  const install = async () => { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; setInstallEvt(null); };

  /* voice search in quick search */
  const listen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { say("Voice search is not supported in this browser"); return; }
    const r = new SR();
    r.lang = "en-ZA";
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = (e: any) => setQ(e.results[0][0].transcript);
    r.start();
  };

  /* command palette: Ctrl/Cmd+K, Esc */
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); setQ(""); }
      if (e.key === "Escape") { setPalette(false); setMenu(false); setZoom(false); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => { if (palette) qRef.current?.focus(); }, [palette]);

  const go = (id: string) => {
    setMenu(false); setPalette(false);
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const saveContact = () => {
    const v = `BEGIN:VCARD\nVERSION:3.0\nFN:${NAME}\nORG:${NAME}\nTEL;TYPE=CELL:+27685932102\nEMAIL:${EMAIL}\nEND:VCARD`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([v], { type: "text/vcard" }));
    a.download = "Lebo-Fibre.vcf";
    a.click();
    say("Contact card downloaded");
  };

  const share = async () => {
    const data = { title: NAME, text: "Fibre and Wi-Fi help from Lebo Fibre", url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); say("Link copied"); }
    } catch {}
  };

  /* email: phone mail app on mobile, Gmail in a new tab on desktop (mailto: fails when no mail app is set up) */
  const openEmail = (subject: string, body = "") => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) { window.location.href = mail(subject, body); return; }
    const w = window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
    if (w) say("Opening Gmail in a new tab");
    else { say(`Pop-up blocked. Email us at ${EMAIL}`); window.location.href = mail(subject, body); }
  };

  const commands = useMemo(() => [
    ...NAV.map(([id, l]) => ({ l: `Go to ${l}`, run: () => go(id) })),
    { l: "Message us on WhatsApp", run: () => window.open(wa("Hi Lebo Fibre, I need help with my internet."), "_blank") },
    { l: "Send an email", run: () => { setPalette(false); openEmail("Enquiry for Lebo Fibre"); } },
    { l: "Call us", run: () => (window.location.href = "tel:+27685932102") },
    { l: "Refer a friend on WhatsApp", run: () => window.open(`https://wa.me/?text=${encodeURIComponent(`I use Lebo Fibre Internet Specialist for fibre and Wi-Fi help. WhatsApp 068 593 2102 or visit ${window.location.href}`)}`, "_blank") },
    { l: "Ask Lebo (quick help)", run: () => { setPalette(false); setAi(true); } },
    { l: "Save contact card", run: () => { setPalette(false); saveContact(); } },
    { l: theme === "dark" ? "Switch to light mode" : "Switch to dark mode", run: () => { setPalette(false); toggleTheme(); } },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [theme]);
  const shown = commands.filter((c) => c.l.toLowerCase().includes(q.toLowerCase()));

  /* remembered details (stored only on this device) */
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("lf-me") || "null");
      if (s) { setForm((f) => ({ ...f, name: s.name || "", phone: s.phone || "", area: s.area || "" })); setRemember(true); }
    } catch {}
  }, []);

  /* scroll-reveal animation */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".lf-sec h2, .lf-sec .lf-sub, .lf-card, .lf-steps li, .lf-faq > div"));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    els.forEach((el, i) => {
      el.classList.add("lf-rv");
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  /* cursor spotlight on cards */
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const c = (e.target as HTMLElement).closest?.(".lf-card") as HTMLElement | null;
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", `${e.clientX - r.left}px`);
      c.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("mousemove", move, { passive: true });
    return () => document.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => { aiLog.current?.scrollTo({ top: 1e6, behavior: "smooth" }); }, [msgs, ai]);
  const askAi = (i: number) => setMsgs((m) => [...m, { me: true, t: ASSIST[i][0] }, { me: false, t: ASSIST[i][1] }]);

  const getLocation = () => {
    if (!navigator.geolocation) { say("Location is not available on this device"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc(`https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`); say("Location added to your quote"); },
      () => say("Could not get your location. Please type your town."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  /* derived values */
  const netText = !net.online ? "offline" : net.down ? `${net.type || "unknown type"}, about ${net.down} Mbps` : "not available in this browser";
  const mbps = SPEEDS[speedIdx];
  const need = people * USES[use][1];
  const rec = BANDS.find((b) => b.m >= need) || BANDS[BANDS.length - 1];
  const done = checks.filter(Boolean).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = "Enter your name.";
    if (form.phone.replace(/\D/g, "").length < 9) er.phone = "Enter a phone number with at least 9 digits.";
    setErrors(er);
    if (Object.keys(er).length) return;
    try {
      if (remember) localStorage.setItem("lf-me", JSON.stringify({ name: form.name, phone: form.phone, area: form.area }));
      else localStorage.removeItem("lf-me");
    } catch {}
    window.open(wa(`Hi Lebo Fibre, I would like a quote.\nName: ${form.name}\nPhone: ${form.phone}\nArea: ${form.area || "-"}\nService: ${form.service}\nUrgent: ${form.urgent ? "Yes" : "No"}\nPreferred visit: ${form.date || "-"} (${form.time})\nDetails: ${form.msg || "-"}${loc ? `\nLocation: ${loc}` : ""}${withNet ? `\nBrowser connection report: ${netText}` : ""}`), "_blank");
    say("Opening WhatsApp");
  };
  const emailInstead = () => {
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = "Enter your name.";
    if (form.phone.replace(/\D/g, "").length < 9) er.phone = "Enter a phone number with at least 9 digits.";
    setErrors(er);
    if (Object.keys(er).length) { say("Please fill in your name and phone first"); return; }
    openEmail("Quote request", [
      "Hi Lebo Fibre, I would like a quote.", "",
      `Name: ${form.name}`, `Phone: ${form.phone}`, `Area: ${form.area || "-"}`, `Service: ${form.service}`,
      `Urgent: ${form.urgent ? "Yes" : "No"}`, `Preferred visit: ${form.date || "-"} (${form.time})`,
      `Details: ${form.msg || "-"}`,
      ...(loc ? [`Location: ${loc}`] : []),
      ...(withNet ? [`Browser connection report: ${netText}`] : []),
    ].join("\n"));
  };
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm({ ...form, [k]: e.target.value });
  const refer = `https://wa.me/?text=${encodeURIComponent(`I use ${NAME} for fibre and Wi-Fi help. WhatsApp 068 593 2102.`)}`;

  return (
    <div className="lf" data-theme={theme}>
      <div className="lf-strand" style={{ ["--p" as any]: progress }} aria-hidden="true"><i /></div>

      <header className="lf-nav">
        <button className="lf-brand" onClick={() => go("top")} aria-label={`${NAME}, back to top`}>
          <span className="lf-logo"><SignalWifi4Bar /></span>
          <span><b>Lebo Fibre</b><small>Internet Specialist</small></span>
        </button>
        <nav className={menu ? "open" : ""} aria-label="Main">
          {NAV.map(([id, l]) => <button key={id} onClick={() => go(id)}>{l}</button>)}
        </nav>
        <div className="lf-tools">
          <button className="lf-icon" onClick={() => { setPalette(true); setQ(""); }} aria-label="Open quick search (Ctrl K)"><Search /></button>
          <button className="lf-icon" onClick={toggleTheme} aria-label="Toggle dark mode">{theme === "dark" ? <LightMode /> : <DarkMode />}</button>
          <a className="lf-btn sm" href={wa("Hi Lebo Fibre, I need help with my internet.")} target="_blank" rel="noreferrer"><WhatsApp /> WhatsApp</a>
          <button className="lf-icon lf-burger" onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}>{menu ? <Close /> : <Menu />}</button>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="lf-hero">
          <div className="lf-hero-copy">
            <p className={`lf-net ${net.online ? "" : "off"}`} role="status">
              <span className="dot" />
              {!net.online ? "You are offline" : net.down ? `Your connection right now: about ${net.down} Mbps (${net.type})` : "You are online"}
            </p>
            <h1>Fibre that works in every room.</h1>
            <p className="lf-lead">{NAME} helps homes and businesses get connected, pick the right speed, and fix slow Wi-Fi.</p>
            <div className="lf-cta">
              <a className="lf-btn" href={wa("Hi Lebo Fibre, can you check fibre coverage for my address?")} target="_blank" rel="noreferrer"><WhatsApp /> Check my address</a>
              <button className="lf-btn ghost" onClick={() => go("plans")}>Find my speed</button>
            </div>
            <button className="lf-who" onClick={() => go("about")}><img src={LEBO} alt="Lebo, founder" /><span><b>Meet Lebo</b><small>Your fibre specialist</small></span></button>
            <p className="lf-hint">Tip: press <kbd>Ctrl</kbd> <kbd>K</kbd> to jump anywhere.</p>
          </div>

          <div className="lf-card lf-sim" id="speed">
            <h2><Speed /> What your speed feels like</h2>
            <div className="lf-big">{mbps >= 1000 ? "1 Gbps" : `${mbps} Mbps`}</div>
            <input type="range" min={0} max={SPEEDS.length - 1} value={speedIdx} onChange={(e) => setSpeedIdx(Number(e.target.value))} aria-label="Internet speed" aria-valuetext={`${mbps} megabits per second`} />
            <ul>
              <li><Download /><span>5 GB game download</span><b>{fmtTime((5 * 8000) / mbps)}</b></li>
              <li><Tv /><span>Ultra HD streams at once</span><b>{Math.max(0, Math.floor(mbps / 25))}</b></li>
              <li><Videocam /><span>HD video calls at once</span><b>{Math.floor(mbps / 4)}</b></li>
            </ul>
            <p className="lf-note">Estimates at full speed. Real speeds vary with Wi-Fi and the network.</p>
          </div>
        </section>

        {/* ABOUT */}
        <section className="lf-sec lf-about" id="about">
          <button className="lf-photo" onClick={() => setZoom(true)} aria-label="Enlarge photo of Lebo">
            <img src={LEBO} alt="Lebo, founder of Lebo Fibre Internet Specialist" />
          </button>
          <div>
            <h2>Hi, I'm Lebo</h2>
            <p className="lf-sub">I help people get fast, stable internet without the confusion. From choosing the right fibre to making sure Wi-Fi reaches every room, I deal with you directly and keep things simple.</p>
            <ul className="lf-pts">
              <li><Check /> Plain-language advice, no jargon</li>
              <li><Check /> Messages answered on WhatsApp</li>
              <li><Check /> Homes, shops and offices</li>
              <li><Check /> Setup tested before I leave</li>
            </ul>
            <div className="lf-cta">
              <a className="lf-btn" href={wa("Hi Lebo, I would like to talk about my internet.")} target="_blank" rel="noreferrer"><WhatsApp /> Chat to Lebo</a>
              {installEvt && <button className="lf-btn ghost" onClick={install}><InstallMobile /> Install app</button>}
            </div>
          </div>
        </section>

        {/* COVERAGE */}
        <section className="lf-sec lf-cov">
          <div className="lf-card">
            <h2><LocationOn /> Check fibre at your address</h2>
            <p className="lf-sub">Type your street and town. We check which networks reach you and reply on WhatsApp.</p>
            <div className="lf-row">
              <input value={cov} onChange={(e) => setCov(e.target.value)} placeholder="e.g. 12 Main Street, Town" aria-label="Your address" />
              <a className={`lf-btn ${cov.trim().length < 4 ? "dis" : ""}`} aria-disabled={cov.trim().length < 4}
                href={cov.trim().length < 4 ? undefined : wa(`Hi Lebo Fibre, please check fibre coverage at: ${cov}`)} target="_blank" rel="noreferrer"><WhatsApp /> Check coverage</a>
            </div>
          </div>
        </section>

        {/* PLAN FINDER */}
        <section className="lf-sec" id="plans">
          <h2>Find the right speed</h2>
          <p className="lf-sub">Tell us who is online and what they do. Final packages and prices depend on the fibre network in your area.</p>
          <div className="lf-finder">
            <div className="lf-card">
              <label>People using the internet: <b>{people}</b>
                <input type="range" min={1} max={12} value={people} onChange={(e) => setPeople(Number(e.target.value))} />
              </label>
              <fieldset>
                <legend>Main activity</legend>
                {USES.map(([l], i) => (
                  <label key={l} className={`lf-pill ${use === i ? "on" : ""}`}>
                    <input type="radio" name="use" checked={use === i} onChange={() => setUse(i)} />{l}
                  </label>
                ))}
              </fieldset>
              <div className="lf-rec">
                <span>We suggest</span>
                <strong>{rec.n}: {rec.m >= 1000 ? "1 Gbps" : `${rec.m} Mbps`}</strong>
                <a className="lf-btn" href={wa(`Hi Lebo Fibre, ${people} people, mostly ${USES[use][0].toLowerCase()}. Please quote me on ${rec.m} Mbps fibre.`)} target="_blank" rel="noreferrer"><WhatsApp /> Get this quote</a>
              </div>
            </div>
            <div className="lf-bands">
              {BANDS.map((b) => (
                <div key={b.m} className={`lf-band ${b.m === rec.m ? "on" : ""}`}>
                  <b>{b.m >= 1000 ? "1 Gbps" : `${b.m} Mbps`}</b><span>{b.n}</span><small>{b.d}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TROUBLESHOOTER */}
        <section className="lf-sec" id="fix">
          <h2>Fix my Wi-Fi</h2>
          <p className="lf-sub">Try these in order. Tick each one you have done.</p>
          <div className="lf-fix">
            <div className="lf-card">
              <ul className="lf-checks">
                {CHECKS.map((c, i) => (
                  <li key={c}>
                    <label>
                      <input type="checkbox" checked={checks[i]} onChange={() => setChecks(checks.map((v, j) => (j === i ? !v : v)))} />
                      <span className="box">{checks[i] && <Check />}</span>{c}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="lf-meter" role="progressbar" aria-valuemin={0} aria-valuemax={CHECKS.length} aria-valuenow={done}><i style={{ width: `${(done / CHECKS.length) * 100}%` }} /></div>
              <p>{done === CHECKS.length ? "All steps done. If it is still slow, we can take over." : `${done} of ${CHECKS.length} done`}</p>
              <a className="lf-btn" href={wa(`Hi Lebo Fibre, my internet is still slow. I already tried: ${CHECKS.filter((_, i) => checks[i]).join("; ") || "nothing yet"}.`)} target="_blank" rel="noreferrer"><WhatsApp /> Still not fixed? Message us</a>
            </div>
            <div className="lf-card">
              <h3><Settings /> What the lights mean</h3>
              <table className="lf-leds">
                <tbody>{LEDS.map(([l, s, m]) => (
                  <tr key={l} className={l === "LOS" ? "bad" : ""}><th scope="row">{l}</th><td>{s}</td><td>{m}</td></tr>
                ))}</tbody>
              </table>
              <p className="lf-note">Light names differ between devices. Send us a photo on WhatsApp if unsure.</p>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="lf-sec">
          <h2>How it works</h2>
          <ol className="lf-steps">
            {[["Share your address", "Message us or use the quote form and tell us where you need service."], ["We check coverage", "We confirm which providers and speeds are available at your address."], ["We complete your application", "If coverage is available, we fill in and submit the application for you."], ["Your service goes live", "Your connection is activated and we stay reachable for any support you need."]].map(([t, d]) => (
              <li key={t}><b>{t}</b><span>{d}</span></li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="lf-sec" id="faq">
          <h2>Questions people ask</h2>
          <div className="lf-faq">
            {FAQ.map(([a, b], i) => (
              <div key={a} className={faq === i ? "open" : ""}>
                <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>{a}<ExpandMore /></button>
                <div className="ans"><p>{b}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEW */}
        <section className="lf-sec lf-review">
          <div className="lf-card">
            <h2>Already a customer? Rate Lebo Fibre</h2>
            <div className="lf-stars" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>{n <= rating ? <Star /> : <StarBorder />}</button>
              ))}
            </div>
            <div className="lf-cta">
              <a className={`lf-btn ${rating ? "" : "dis"}`} aria-disabled={!rating} href={rating ? wa(`Hi Lebo Fibre, I would rate your service ${rating} out of 5.`) : undefined} target="_blank" rel="noreferrer"><WhatsApp /> Send my rating</a>
              <a className="lf-btn ghost" href={refer} target="_blank" rel="noreferrer"><GroupAdd /> Refer a friend</a>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="lf-sec lf-contact" id="contact">
          <div>
            <h2>Get a quote</h2>
            <p className="lf-sub">Fill this in and it opens WhatsApp with your details ready to send.</p>
            <ul className="lf-links">
              <li><a href={wa("Hi Lebo Fibre")} target="_blank" rel="noreferrer"><WhatsApp /> {PHONE}</a></li>
              <li><a href="tel:+27685932102"><Phone /> Call {PHONE}</a></li>
              <li><a href={mail("Enquiry for Lebo Fibre")} onClick={(e) => { e.preventDefault(); openEmail("Enquiry for Lebo Fibre"); }}><Email /> {EMAIL}</a></li>
            </ul>
            <div className="lf-cta">
              <button className="lf-btn ghost" onClick={saveContact}><Download /> Save contact</button>
              <button className="lf-btn ghost" onClick={share}><Share /> Share</button>
            </div>
          </div>
          <form className="lf-card lf-form" onSubmit={submit} noValidate>
            <label>Name<input value={form.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errors.name} />{errors.name && <em role="alert">{errors.name}</em>}</label>
            <label>Phone or WhatsApp<input value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} />{errors.phone && <em role="alert">{errors.phone}</em>}</label>
            <label>Town or suburb<input value={form.area} onChange={set("area")} /></label>
            <label>Service<select value={form.service} onChange={set("service")}>{SERVICES.map((s) => <option key={s.t}>{s.t}</option>)}</select></label>
            <div className="lf-two">
              <label>Preferred visit date<input type="date" value={form.date} onChange={set("date")} /></label>
              <label>Time of day<select value={form.time} onChange={set("time")}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select></label>
            </div>
            <label className="lf-check"><input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} /> This is urgent (no internet at all)</label>
            <div className="lf-loc">
              <button type="button" className="lf-btn ghost sm" onClick={getLocation}><MyLocation /> {loc ? "Update my location" : "Share my location"}</button>
              {loc && <span><CheckCircle /> Location will be sent with your quote</span>}
            </div>
            <label className="lf-check"><input type="checkbox" checked={withNet} onChange={(e) => setWithNet(e.target.checked)} /> Include my connection details ({netText})</label>
            <label className="lf-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember my name and phone on this device</label>
            <label>Details<textarea rows={3} value={form.msg} onChange={set("msg")} /></label>
            <div className="lf-cta">
              <button className="lf-btn" type="submit"><WhatsApp /> Send on WhatsApp</button>
              <button type="button" className="lf-btn ghost" onClick={emailInstead}><Email /> Email instead</button>
            </div>
          </form>
        </section>
      </main>

      <footer className="lf-foot">
        <span><Bolt /> {NAME}</span>
        <span>{PHONE} · {EMAIL}</span>
        <span>© 2026 Lebo Fibre. All rights reserved.</span>
      </footer>

      {/* mobile action bar */}
      <div className="lf-bar">
        <a href="tel:+27685932102"><Phone /> Call</a>
        <a href={wa("Hi Lebo Fibre, I need help with my internet.")} target="_blank" rel="noreferrer"><WhatsApp /> WhatsApp</a>
        <button onClick={() => go("contact")}><CalendarMonth /> Book</button>
      </div>

      {zoom && (
        <div className="lf-scrim" onMouseDown={() => setZoom(false)}>
          <div className="lf-zoom" role="dialog" aria-label="Photo of Lebo" onMouseDown={(e) => e.stopPropagation()}>
            <img src={LEBO} alt="Lebo" />
            <button className="lf-icon" onClick={() => setZoom(false)} aria-label="Close photo"><Close /></button>
          </div>
        </div>
      )}

      {/* floating actions */}
      <a className="lf-fab" href={wa("Hi Lebo Fibre, I need help with my internet.")} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><WhatsApp /></a>
      {progress > 12 && <button className="lf-top" onClick={() => go("top")} aria-label="Back to top"><KeyboardArrowUp /></button>}
      <button className="lf-ai-fab" onClick={() => setAi(!ai)} aria-label={ai ? "Close assistant" : "Open quick-help assistant"} aria-expanded={ai}>{ai ? <Close /> : <SmartToy />}</button>
      {ai && (
        <div className="lf-ai" role="dialog" aria-label="Ask Lebo">
          <div className="lf-ai-head"><b>Ask Lebo</b><span>Quick answers, any time</span></div>
          <div className="lf-ai-log" ref={aiLog}>
            {msgs.map((m, i) => <p key={i} className={m.me ? "me" : ""}>{m.t}</p>)}
          </div>
          <div className="lf-ai-chips">
            {ASSIST.map(([l], i) => <button key={l} onClick={() => askAi(i)}>{l}</button>)}
          </div>
          <a className="lf-btn sm" href={wa("Hi Lebo Fibre, I need help with my internet.")} target="_blank" rel="noreferrer"><WhatsApp /> Talk to a person</a>
        </div>
      )}
      <div className={`lf-toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>

      {/* command palette */}
      {palette && (
        <div className="lf-scrim" onMouseDown={() => setPalette(false)}>
          <div className="lf-pal" role="dialog" aria-label="Quick search" onMouseDown={(e) => e.stopPropagation()}>
            <input ref={qRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or section" aria-label="Search commands"
              onKeyDown={(e) => { if (e.key === "Enter" && shown[0]) shown[0].run(); }} />
            <button className={`lf-mic ${listening ? "on" : ""}`} onClick={listen} aria-label="Voice search"><Mic /></button>
            <ul>
              {shown.map((c) => <li key={c.l}><button onClick={c.run}>{c.l}</button></li>)}
              {!shown.length && <li className="none">No match. Try "WhatsApp" or "plans".</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
