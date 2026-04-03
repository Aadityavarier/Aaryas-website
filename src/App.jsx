import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ── Fonts ────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Quicksand:wght@300;400;500;600;700&family=Noto+Serif+JP:wght@300;400;500&display=swap";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);

// ── Palette: Sakura × Samurai ────────────────────────────────────────────────
const C = {
    sakura: "#f7a8b8", sakuraLight: "#fde4ec", sakuraDark: "#d4607a",
    hotPink: "#e84393", magenta: "#c44daa",
    lavender: "#c9a0dc", plum: "#8b3a7d", violet: "#6c3fa0",
    amethyst: "#4a1a6b", deepPlum: "#2e1245",
    midnight: "#1a0e2e", void: "#0d0815",
    gold: "#d4a84b", goldDim: "rgba(212,168,75,0.15)",
    cream: "#f5e6d3", crimson: "#c0392b",
};

// ── Global Styles ────────────────────────────────────────────────────────────
function GlobalStyles() {
    return (<style>{`
    *,*::before,*::after{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{margin:0;padding:0;overflow-x:hidden;background:${C.void}}
    ::selection{background:${C.hotPink};color:white}

    @keyframes sakuraFall{
      0%{transform:translateY(-10vh) translateX(0) rotate(0deg) scale(1);opacity:0}
      8%{opacity:0.9}
      50%{transform:translateY(50vh) translateX(60px) rotate(360deg) scale(0.8);opacity:0.7}
      100%{transform:translateY(110vh) translateX(-30px) rotate(720deg) scale(0.4);opacity:0}
    }
    @keyframes sakuraFall2{
      0%{transform:translateY(-10vh) translateX(0) rotate(45deg);opacity:0}
      8%{opacity:0.85}
      100%{transform:translateY(110vh) translateX(-80px) rotate(540deg);opacity:0}
    }
    @keyframes floatUp{
      0%,100%{transform:translateY(0);opacity:0}
      10%{opacity:0.6}90%{opacity:0.5}
      100%{transform:translateY(-100vh);opacity:0}
    }
    @keyframes pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.4);opacity:0.15}}
    @keyframes spinSlow{100%{transform:translate(-50%,-50%) rotate(360deg)}}
    @keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(12px)}}
    @keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes wave{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes breathe{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.6;transform:scale(1.05)}}
    @keyframes katanaSlash{
      0%{width:0;opacity:0}30%{opacity:1}100%{width:100%;opacity:0.8}
    }
    @keyframes inkReveal{
      from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}
    }
    @keyframes float3d{
      0%,100%{transform:perspective(600px) rotateX(2deg) rotateY(-2deg) translateY(0)}
      50%{transform:perspective(600px) rotateX(-2deg) rotateY(2deg) translateY(-8px)}
    }

    .section-enter{opacity:0;transform:perspective(800px) rotateX(4deg) translateY(50px);
      transition:opacity 0.9s cubic-bezier(.16,1,.3,1),transform 0.9s cubic-bezier(.16,1,.3,1)}
    .section-enter.visible{opacity:1;transform:perspective(800px) rotateX(0) translateY(0)}

    .nav-link{position:relative;font-family:'Quicksand',sans-serif;font-size:11px;
      color:rgba(255,255,255,0.5);text-decoration:none;letter-spacing:2.5px;
      text-transform:uppercase;font-weight:600;transition:color .3s;padding-bottom:6px}
    .nav-link::after{content:'';position:absolute;bottom:0;left:50%;width:0;height:1.5px;
      background:linear-gradient(90deg,${C.sakura},${C.violet});transition:width .3s,left .3s}
    .nav-link:hover{color:${C.sakuraLight}}
    .nav-link:hover::after{width:100%;left:0}

    .glow-border{position:relative;border-radius:24px;overflow:hidden}
    .glow-border::before{content:'';position:absolute;inset:0;border-radius:24px;padding:1px;
      background:linear-gradient(135deg,${C.sakura}40,${C.violet}30,${C.gold}20,transparent);
      mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
      mask-composite:exclude;-webkit-mask-composite:xor;pointer-events:none}

    .tilt-card{transition:transform .25s ease-out,box-shadow .4s ease;transform-style:preserve-3d;cursor:default}

    .magnetic-btn{display:inline-block;transition:transform .25s ease-out}

    .petal{position:absolute;border-radius:50% 0 50% 50%;pointer-events:none}

    @media(max-width:768px){
      .about-grid{grid-template-columns:1fr!important}
      .hobby-grid{grid-template-columns:repeat(auto-fill,minmax(100px,1fr))!important}
      .fav-grid{grid-template-columns:1fr 1fr!important}
      .nav-links{display:none!important}
    }
    @media(max-width:480px){.fav-grid{grid-template-columns:1fr!important}}
  `}</style>);
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useFadeIn(threshold = 0.15) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, vis];
}

// ── 3D Tilt Card ─────────────────────────────────────────────────────────────
function TiltCard({ children, style, className = "" }) {
    const ref = useRef(null);
    const onMove = useCallback((e) => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale3d(1.03,1.03,1.03)`;
        el.style.boxShadow = `${-x * 20}px ${y * 20}px 40px rgba(232,67,147,0.15), 0 10px 30px rgba(0,0,0,0.3)`;
    }, []);
    const onLeave = useCallback(() => {
        if (ref.current) {
            ref.current.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale3d(1,1,1)";
            ref.current.style.boxShadow = "0 8px 30px rgba(0,0,0,0.2)";
        }
    }, []);
    return (<div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`tilt-card ${className}`} style={style}>{children}</div>);
}

// ── Magnetic Button ──────────────────────────────────────────────────────────
function MagneticBtn({ children, style = {}, href = "#" }) {
    const ref = useRef(null);
    const onMove = useCallback((e) => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    }, []);
    const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = "translate(0,0)"; }, []);
    return (<a ref={ref} href={href} target={href !== "#" ? "_blank" : undefined} rel={href !== "#" ? "noopener noreferrer" : undefined} onMouseMove={onMove} onMouseLeave={onLeave}
        className="magnetic-btn" style={{ textDecoration: "none", ...style }}>{children}</a>);
}

// ── Cursor Glow ──────────────────────────────────────────────────────────────
function CursorGlow() {
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current) { ref.current.style.left = e.clientX + "px"; ref.current.style.top = e.clientY + "px"; } };
        window.addEventListener("mousemove", h, { passive: true });
        return () => window.removeEventListener("mousemove", h);
    }, []);
    return (<div ref={ref} style={{
        position: "fixed", width: 450, height: 450, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(247,168,184,0.08) 0%, rgba(108,63,160,0.04) 40%, transparent 65%)",
        pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)",
        transition: "left .12s ease-out, top .12s ease-out", left: -300, top: -300
    }} />);
}

// ── Sakura Petals ────────────────────────────────────────────────────────────
function SakuraPetals({ count = 18 }) {
    const petals = useMemo(() => Array.from({ length: count }, (_, i) => ({
        id: i, x: Math.random() * 100, size: 8 + Math.random() * 14,
        dur: 10 + Math.random() * 15, delay: Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.5,
        color: [`${C.sakura}`, `${C.sakuraLight}`, `${C.lavender}`, `${C.sakuraDark}`][i % 4],
        anim: i % 2 === 0 ? "sakuraFall" : "sakuraFall2",
        rotate: Math.random() * 360,
    })), [count]);
    return (<div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 3 }}>
        {petals.map(p => (<div key={p.id} className="petal" style={{
            left: `${p.x}%`, top: "-5%", width: p.size, height: p.size * 1.2,
            background: p.color, opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
            animation: `${p.anim} ${p.dur}s ${p.delay}s linear infinite`,
        }} />))}
    </div>);
}

// ── Mountain Silhouette ──────────────────────────────────────────────────────
function Mountains() {
    return (<div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none", zIndex: 1 }}>
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "35vh", opacity: 0.25 }}>
            <path fill={C.deepPlum} d="M0,400 L0,280 L180,140 L300,200 L480,80 L600,160 L780,60 L900,150 L1080,40 L1200,130 L1350,70 L1440,160 L1440,400 Z" />
            <path fill={C.amethyst} d="M0,400 L0,320 L120,220 L240,280 L420,160 L540,240 L720,120 L840,220 L1020,100 L1160,200 L1320,130 L1440,220 L1440,400 Z" style={{ opacity: 0.6 }} />
            <path fill={C.midnight} d="M0,400 L0,350 L200,280 L400,320 L600,260 L800,300 L1000,240 L1200,290 L1440,260 L1440,400 Z" style={{ opacity: 0.8 }} />
        </svg>
    </div>);
}

// ── Wave Divider ─────────────────────────────────────────────────────────────
function WaveDivider({ color = C.midnight, flip = false }) {
    return (<div style={{
        position: "absolute", [flip ? "top" : "bottom"]: -2, left: 0, right: 0, overflow: "hidden",
        transform: flip ? "scaleY(-1)" : "none", pointerEvents: "none", zIndex: 4
    }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "200%", height: 60, animation: "wave 25s linear infinite" }}>
            <path fill={color} d="M0,40 Q180,0 360,40 Q540,80 720,40 Q900,0 1080,40 Q1260,80 1440,40 Q1620,0 1800,40 Q1980,80 2160,40 Q2340,0 2520,40 Q2700,80 2880,40 L2880,80 L0,80 Z" />
        </svg>
    </div>);
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Scene({ id, children, style = {} }) {
    return (<section id={id} style={{
        position: "relative", minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "120px 24px", overflow: "hidden",
        contain: "layout style paint", ...style
    }}>{children}</section>);
}

// ── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ label, title, highlight, accentColor = C.sakura, kanji = "" }) {
    const [ref, vis] = useFadeIn();
    return (<div ref={ref} className={`section-enter ${vis ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
        {kanji && <div style={{
            fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(40px,8vw,80px)",
            color: "rgba(247,168,184,0.06)", position: "absolute", top: -10, left: "50%",
            transform: "translateX(-50%)", pointerEvents: "none", letterSpacing: 20
        }}>{kanji}</div>}
        <div style={{
            fontFamily: "'Quicksand'", fontSize: 11, letterSpacing: 6,
            color: accentColor, textTransform: "uppercase", marginBottom: 20, fontWeight: 700
        }}>{label}</div>
        <h2 style={{
            fontFamily: "'Instrument Serif',serif", fontSize: "clamp(38px,6vw,68px)",
            fontWeight: 400, color: "white", margin: 0, lineHeight: 1.15
        }}>
            {title} <em style={{ fontStyle: "italic", color: accentColor }}>{highlight}</em>
        </h2>
        <div style={{
            width: 60, height: 2, margin: "24px auto 0", borderRadius: 1,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`
        }} />
    </div>);
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        let t = false;
        const h = () => { if (!t) { t = true; requestAnimationFrame(() => { setScrolled(window.scrollY > 60); t = false; }); } };
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);
    const links = ["About", "Skills", "Hobbies", "Favorites", "Education", "Contact"];
    return (<nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: scrolled ? "12px 48px" : "22px 48px",
        background: scrolled ? "rgba(13,8,21,0.9)" : "transparent",
        borderBottom: scrolled ? `1px solid ${C.sakura}15` : "1px solid transparent",
        transition: "all .4s ease"
    }}>
        <a href="#hero" style={{ textDecoration: "none" }}>
            <span style={{
                fontFamily: "'Instrument Serif',serif", fontSize: 26, color: C.sakuraLight,
                fontWeight: 400, letterSpacing: 3
            }}>桜 <span style={{ color: "white" }}>Aarya</span></span></a>
        <div className="nav-links" style={{ display: "flex", gap: 28 }}>
            {links.map(l => <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>)}
        </div>
    </nav>);
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => { const t = setTimeout(() => setLoaded(true), 250); return () => clearTimeout(t); }, []);

    return (<Scene id="hero" style={{
        background: `radial-gradient(ellipse at 30% 20%, rgba(247,168,184,0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 70%, rgba(108,63,160,0.1) 0%, transparent 50%),
      linear-gradient(165deg, ${C.sakuraDark}30 0%, ${C.plum} 20%, ${C.amethyst} 45%, ${C.midnight} 75%, ${C.void} 100%)`,
        minHeight: "100vh"
    }}>
        <Mountains />
        <SakuraPetals count={22} />

        {/* Decorative orbs */}
        <div style={{
            position: "absolute", top: "10%", right: "15%", width: 350, height: 350, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.sakura}10, transparent 70%)`, animation: "pulse 8s ease-in-out infinite",
            pointerEvents: "none"
        }} />
        <div style={{
            position: "absolute", bottom: "25%", left: "8%", width: 300, height: 300, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.violet}0d, transparent 70%)`, animation: "pulse 11s 4s ease-in-out infinite",
            pointerEvents: "none"
        }} />

        <div style={{ textAlign: "center", position: "relative", zIndex: 5, maxWidth: 900, perspective: "800px" }}>
            {/* Kanji background */}
            <div style={{
                fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(100px,20vw,220px)", color: "rgba(247,168,184,0.03)",
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none",
                letterSpacing: 30, whiteSpace: "nowrap"
            }}>武士道</div>

            <div style={{
                width: 1, height: loaded ? 80 : 0, background: `linear-gradient(to bottom, transparent, ${C.sakura}80, transparent)`,
                margin: "0 auto 36px", transition: "height 1.2s cubic-bezier(.16,1,.3,1)"
            }} />

            <div style={{
                fontFamily: "'Quicksand'", fontSize: "clamp(11px,1.5vw,14px)", color: `${C.sakura}90`,
                letterSpacing: 10, textTransform: "uppercase", fontWeight: 600,
                opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
                transition: "opacity .8s .4s, transform .8s .4s"
            }}>Welcome to my world</div>

            <h1 style={{
                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(58px,13vw,140px)", fontWeight: 400,
                color: "white", lineHeight: 1, margin: "20px 0 12px", letterSpacing: "-2px",
                opacity: loaded ? 1 : 0, transform: loaded ? "perspective(600px) rotateX(0)" : "perspective(600px) rotateX(15deg) translateY(40px)",
                transition: "opacity 1s .6s cubic-bezier(.16,1,.3,1), transform 1.2s .6s cubic-bezier(.16,1,.3,1)",
                transformOrigin: "center bottom"
            }}>
                Aarya<br />
                <em style={{
                    fontStyle: "italic",
                    background: `linear-gradient(135deg, ${C.sakuraLight}, ${C.sakura}, ${C.lavender}, ${C.gold})`,
                    backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    animation: "gradientShift 5s ease-in-out infinite"
                }}>Varier</em>
            </h1>

            <p style={{
                fontFamily: "'Quicksand'", fontSize: "clamp(14px,2vw,19px)", color: "rgba(255,255,255,0.5)",
                marginTop: 28, letterSpacing: 3, fontWeight: 300,
                opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
                transition: "opacity .8s .9s, transform .8s .9s"
            }}>
                Curious mind · Creative soul · Always evolving
            </p>

            <div style={{
                width: 1, height: loaded ? 70 : 0, background: `linear-gradient(to bottom, transparent, ${C.lavender}60, transparent)`,
                margin: "48px auto 0", transition: "height 1.2s 1.2s cubic-bezier(.16,1,.3,1)"
            }} />
        </div>

        <div style={{
            position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
            opacity: loaded ? 0.5 : 0, transition: "opacity 1s 2.5s", animation: "bounce 3s 2.5s ease-in-out infinite", zIndex: 5
        }}>
            <div style={{
                fontFamily: "'Quicksand'", fontSize: 9, letterSpacing: 5, color: `${C.sakura}80`,
                textTransform: "uppercase", textAlign: "center", marginBottom: 10, fontWeight: 600
            }}>Scroll</div>
            <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${C.sakura}60, transparent)`, margin: "0 auto" }} />
        </div>

        <WaveDivider color={C.void} />
    </Scene>);
}

// ── About ────────────────────────────────────────────────────────────────────
function About() {
    const [ref, vis] = useFadeIn();
    return (<Scene id="about" style={{
        background: `radial-gradient(ellipse at 80% 30%, ${C.lavender}0a, transparent 50%),
      linear-gradient(170deg, ${C.void} 0%, ${C.midnight} 50%, ${C.deepPlum} 100%)`
    }}>
        <SakuraPetals count={8} />
        <div ref={ref} className={`section-enter ${vis ? "visible" : ""}`} style={{ transitionDelay: ".1s" }}>
            <div className="about-grid" style={{
                maxWidth: 1000, width: "100%", display: "grid",
                gridTemplateColumns: "1fr 1.2fr", gap: "clamp(40px,8vw,80px)", alignItems: "center"
            }}>
                <TiltCard className="glow-border" style={{
                    width: "100%", paddingBottom: "120%", position: "relative", overflow: "hidden",
                    background: `linear-gradient(135deg, ${C.plum}40, ${C.amethyst}60, ${C.midnight}cc)`,
                    boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${C.sakura}10`
                }}>
                    {[1, 2, 3].map(i => (<div key={i} style={{
                        position: "absolute", borderRadius: "50%",
                        border: `1px solid ${C.sakura}${10 + i * 8}`,
                        width: `${40 + i * 18}%`, height: `${40 + i * 18}%`,
                        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                        animation: `spinSlow ${35 + i * 12}s linear infinite ${i % 2 === 0 ? "reverse" : ""}`
                    }} />))}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                        <div style={{
                            fontFamily: "'Instrument Serif',serif", fontSize: "clamp(56px,8vw,100px)",
                            fontWeight: 400, color: "rgba(255,255,255,0.85)", lineHeight: 1,
                            textShadow: `0 0 40px ${C.sakura}50`
                        }}>AV</div>
                        <div style={{
                            fontFamily: "'Quicksand'", fontSize: 10, color: C.gold,
                            letterSpacing: 7, marginTop: 16, fontWeight: 700, textTransform: "uppercase"
                        }}>Head Girl</div>
                    </div>
                </TiltCard>

                <div>
                    <div style={{
                        fontFamily: "'Quicksand'", fontSize: 11, letterSpacing: 6,
                        color: C.sakura, textTransform: "uppercase", marginBottom: 20, fontWeight: 700
                    }}>About me</div>
                    <h2 style={{
                        fontFamily: "'Instrument Serif',serif", fontSize: "clamp(40px,6vw,64px)",
                        fontWeight: 400, color: "white", lineHeight: 1.1, margin: "0 0 36px"
                    }}>
                        My <em style={{ fontStyle: "italic", color: C.lavender }}>Story</em></h2>
                    {[
                        <>Hi, I'm <span style={{ color: C.sakuraLight, fontWeight: 600 }}>Aarya Varier</span>, a 15-year-old student from Fr. Agnel School.</>,
                        <>I currently serve as the <span style={{ color: C.gold, fontWeight: 600 }}>Head Girl</span> of my school — a role I carry with pride and purpose.</>,
                        <>I enjoy subjects like <span style={{ color: C.sakura, fontWeight: 500 }}>Biology</span> and <span style={{ color: C.sakura, fontWeight: 500 }}>Literature</span>, and I love expressing creativity in everything I do.</>,
                    ].map((t, i) => (<p key={i} style={{
                        fontFamily: "'Quicksand'", fontSize: 15, lineHeight: 1.9,
                        color: "rgba(255,255,255,0.65)", margin: "0 0 18px", fontWeight: 300
                    }}>{t}</p>))}
                </div>
            </div>
        </div>
        <WaveDivider color={C.midnight} />
    </Scene>);
}

// ── Skills ───────────────────────────────────────────────────────────────────
function SkillOrb({ label, pct, delay, accent }) {
    const [ref, vis] = useFadeIn(0.2);
    const [hov, setHov] = useState(false);
    const r = 56, circ = 2 * Math.PI * r, dash = vis ? circ * (1 - pct / 100) : circ;
    return (<div ref={ref} className={`section-enter ${vis ? "visible" : ""}`}
        style={{ textAlign: "center", transitionDelay: `${delay}s` }}>
        <TiltCard style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 170, height: 170, position: "relative", borderRadius: "50%",
            background: hov ? `${accent}10` : "transparent",
            transition: "background .4s"
        }}
        >
            <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={170} height={170} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                    <circle cx={85} cy={85} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={5} />
                    <circle cx={85} cy={85} r={r} fill="none" stroke={accent} strokeWidth={6}
                        strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                        style={{
                            transition: `stroke-dashoffset 1.8s ${delay + .3}s cubic-bezier(.4,0,.2,1)`,
                            filter: hov ? `drop-shadow(0 0 10px ${accent})` : "none"
                        }} />
                </svg>
                <div>
                    <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: "white", fontWeight: 400 }}>
                        {pct}<span style={{ fontSize: 16, color: accent }}>%</span></div>
                </div>
            </div>
        </TiltCard>
        <div style={{
            fontFamily: "'Quicksand'", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)",
            marginTop: 18, letterSpacing: 2.5, textTransform: "uppercase"
        }}>{label}</div>
    </div>);
}

function Skills() {
    const skills = [
        { label: "Communication", pct: 90, accent: C.sakura },
        { label: "Creativity", pct: 95, accent: C.gold },
        { label: "Discipline", pct: 85, accent: C.lavender },
    ];
    return (<Scene id="skills" style={{
        background: `radial-gradient(ellipse at 50% 50%, ${C.plum}15, transparent 60%),
      linear-gradient(150deg, ${C.midnight} 0%, ${C.deepPlum} 60%, ${C.void} 100%)`
    }}>
        <SakuraPetals count={6} />
        <div style={{ maxWidth: 1000, width: "100%", textAlign: "center", position: "relative" }}>
            <SectionTitle label="What I bring" title="My" highlight="Strengths" accentColor={C.sakura} kanji="力" />
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(40px,10vw,120px)", flexWrap: "wrap" }}>
                {skills.map((s, i) => <SkillOrb key={s.label} {...s} delay={i * .15} />)}
            </div>
        </div>
        <WaveDivider color={C.void} />
    </Scene>);
}

// ── Hobbies ──────────────────────────────────────────────────────────────────
const hobbyData = [
    { label: "Dancing", icon: "🩰", accent: C.sakura },
    { label: "Singing", icon: "🎵", accent: C.lavender },
    { label: "Sewing", icon: "🧵", accent: C.gold },
    { label: "Drawing", icon: "✏️", accent: C.sakura },
    { label: "Reading", icon: "📖", accent: C.lavender },
    { label: "Gaming", icon: "🎮", accent: C.magenta },
    { label: "Crafting", icon: "🎨", accent: C.gold },
];

function HobbyCard({ label, icon, accent, delay }) {
    const [ref, vis] = useFadeIn(0.1);
    return (<div ref={ref} className={`section-enter ${vis ? "visible" : ""}`} style={{ transitionDelay: `${delay}s` }}>
        <TiltCard className="glow-border" style={{
            padding: "30px 14px", borderRadius: 24, textAlign: "center",
            background: `linear-gradient(135deg, ${accent}08, rgba(255,255,255,0.02))`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
        }}>
            <div style={{
                fontSize: 36, marginBottom: 12, animation: "float3d 4s ease-in-out infinite",
                animationDelay: `${delay}s`
            }}>{icon}</div>
            <div style={{
                fontFamily: "'Quicksand'", fontSize: 12, color: "rgba(255,255,255,0.6)",
                letterSpacing: 2, fontWeight: 600, textTransform: "uppercase"
            }}>{label}</div>
        </TiltCard>
    </div>);
}

function Hobbies() {
    return (<Scene id="hobbies" style={{
        background: `radial-gradient(ellipse at 20% 80%, ${C.sakura}0a, transparent 50%),
      radial-gradient(ellipse at 80% 20%, ${C.gold}08, transparent 50%),
      linear-gradient(160deg, ${C.void} 0%, ${C.deepPlum} 40%, ${C.plum}80 100%)`
    }}>
        <SakuraPetals count={10} />
        <div style={{ maxWidth: 900, width: "100%", position: "relative" }}>
            <SectionTitle label="Things I love" title="My" highlight="Hobbies" accentColor={C.hotPink} kanji="趣味" />
            <div className="hobby-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(115px, 1fr))", gap: 14, marginBottom: 44
            }}>
                {hobbyData.map((h, i) => <HobbyCard key={h.label} {...h} delay={i * .06} />)}
            </div>
            <TiltCard className="glow-border" style={{
                textAlign: "center", padding: "26px 36px",
                background: `linear-gradient(135deg, ${C.sakura}0a, rgba(255,255,255,0.02))`,
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
            }}>
                <span style={{
                    fontFamily: "'Quicksand'", fontSize: 15, color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.8, fontWeight: 300
                }}>
                    🌸 I am also a trainee in Indian classical dance — {" "}
                    <span style={{ color: C.gold, fontWeight: 600 }}>Bharatanatyam</span> and{" "}
                    <span style={{ color: C.gold, fontWeight: 600 }}>Kathak</span>
                </span>
            </TiltCard>
        </div>
        <WaveDivider color={C.midnight} />
    </Scene>);
}

// ── Favorites ────────────────────────────────────────────────────────────────
function FavCard({ emoji, title, items, delay, accent }) {
    const [ref, vis] = useFadeIn(0.1);
    const [hov, setHov] = useState(false);
    return (<div ref={ref} className={`section-enter ${vis ? "visible" : ""}`} style={{ transitionDelay: `${delay}s` }}>
        <TiltCard className="glow-border" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                padding: "34px 22px", borderRadius: 24, height: "100%", cursor: "default",
                background: `linear-gradient(145deg, ${accent}0c, rgba(255,255,255,0.02))`,
                boxShadow: "0 6px 25px rgba(0,0,0,0.2)"
            }}>
            <div style={{
                fontSize: 32, marginBottom: 14, animation: "float3d 5s ease-in-out infinite",
                animationDelay: `${delay * 2}s`
            }}>{emoji}</div>
            <div style={{
                fontFamily: "'Instrument Serif',serif", fontSize: 22, color: "white",
                fontWeight: 400, marginBottom: 18
            }}>{title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {items.map(item => (<div key={item} style={{
                    fontFamily: "'Quicksand'", fontSize: 13,
                    color: "rgba(255,255,255,0.5)", padding: "7px 12px", borderRadius: 8,
                    borderLeft: `2px solid ${accent}30`, fontWeight: 400,
                    transition: "all .3s"
                }}>{item}</div>))}
            </div>
        </TiltCard>
    </div>);
}

function Favorites() {
    const favs = [
        { emoji: "🎬", title: "Movies", items: ["Damsel", "Enola Holmes", "The Housemaid"], accent: C.sakura },
        { emoji: "📺", title: "Shows", items: ["Brooklyn Nine-Nine", "Kim's Convenience", "A Good Girl's Guide to Murder"], accent: C.lavender },
        { emoji: "🎸", title: "Bands", items: ["Arctic Monkeys", "Eagles", "The Smiths", "The Neighbourhood", "Radiohead"], accent: C.gold },
        { emoji: "🎵", title: "Artists", items: ["Sombr", "Justin Bieber", "SZA", "Joji", "Charlie Puth"], accent: C.hotPink },
    ];
    return (<Scene id="favorites" style={{
        background: `radial-gradient(ellipse at 30% 60%, ${C.lavender}08, transparent 50%),
      linear-gradient(150deg, ${C.midnight} 0%, ${C.void} 50%, ${C.deepPlum} 100%)`
    }}>
        <SakuraPetals count={7} />
        <div style={{ maxWidth: 1000, width: "100%", position: "relative" }}>
            <SectionTitle label="A peek inside" title="My" highlight="Favourites" accentColor={C.lavender} kanji="愛" />
            <div className="fav-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))", gap: 18
            }}>
                {favs.map((f, i) => <FavCard key={f.title} {...f} delay={i * .1} />)}
            </div>
        </div>
        <WaveDivider color={C.void} />
    </Scene>);
}

// ── Education ────────────────────────────────────────────────────────────────
function Education() {
    const [ref, vis] = useFadeIn();
    return (<Scene id="education" style={{
        background: `radial-gradient(ellipse at 60% 40%, ${C.gold}08, transparent 50%),
      linear-gradient(160deg, ${C.void} 0%, ${C.midnight} 60%, ${C.deepPlum} 100%)`
    }}>
        <SakuraPetals count={5} />
        <div ref={ref} className={`section-enter ${vis ? "visible" : ""}`}
            style={{ textAlign: "center", maxWidth: 700, width: "100%", position: "relative" }}>
            <SectionTitle label="Where I learn" title="My" highlight="Education" accentColor={C.gold} kanji="学" />
            {/* Torii gate decoration */}
            <div style={{ position: "relative", margin: "0 auto", width: "fit-content" }}>
                <svg viewBox="0 0 200 30" width="300" style={{ display: "block", margin: "0 auto 20px", opacity: 0.3 }}>
                    <rect x="30" y="8" width="140" height="4" rx="2" fill={C.crimson} />
                    <rect x="25" y="0" width="150" height="5" rx="2.5" fill={C.crimson} />
                    <rect x="40" y="12" width="4" height="18" fill={C.crimson} />
                    <rect x="156" y="12" width="4" height="18" fill={C.crimson} />
                </svg>
            </div>
            <TiltCard className="glow-border" style={{
                padding: "60px 48px", borderRadius: 24, position: "relative", overflow: "hidden",
                background: `linear-gradient(135deg, ${C.gold}0a, rgba(255,255,255,0.02))`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 40px ${C.gold}08`
            }}>
                <div style={{
                    position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%",
                    background: `radial-gradient(circle, ${C.gold}10, transparent 70%)`, pointerEvents: "none"
                }} />
                <div style={{
                    fontFamily: "'Quicksand'", fontSize: 10, color: C.gold, letterSpacing: 7,
                    textTransform: "uppercase", marginBottom: 20, fontWeight: 700
                }}>School</div>
                <div style={{
                    fontFamily: "'Instrument Serif',serif", fontSize: "clamp(30px,5vw,50px)",
                    color: "white", fontWeight: 400, marginBottom: 18
                }}>Fr. Agnel School</div>
                <div style={{
                    width: 50, height: 1.5, margin: "20px auto",
                    background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`
                }} />
                <div style={{
                    fontFamily: "'Quicksand'", fontSize: 15, color: "rgba(255,255,255,0.55)",
                    letterSpacing: 1.5, fontWeight: 300
                }}>
                    Currently studying in <span style={{ color: "white", fontWeight: 600 }}>Grade 10</span></div>
            </TiltCard>
        </div>
        <WaveDivider color={C.midnight} />
    </Scene>);
}

// ── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
    const [ref, vis] = useFadeIn();
    return (<Scene id="contact" style={{
        background: `radial-gradient(ellipse at 50% 40%, ${C.sakura}08, transparent 50%),
      radial-gradient(ellipse at 30% 80%, ${C.violet}08, transparent 50%),
      linear-gradient(170deg, ${C.midnight} 0%, ${C.deepPlum} 40%, ${C.plum}60 70%, ${C.amethyst} 100%)`
    }}>
        <SakuraPetals count={15} />
        <Mountains />
        <div ref={ref} className={`section-enter ${vis ? "visible" : ""}`}
            style={{ textAlign: "center", position: "relative", zIndex: 5 }}>
            <div style={{
                fontFamily: "'Quicksand'", fontSize: 11, letterSpacing: 6, color: C.sakura,
                textTransform: "uppercase", marginBottom: 24, fontWeight: 700
            }}>Farewell, traveller</div>
            <h2 style={{
                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(46px,8vw,100px)",
                fontWeight: 400, color: "white", lineHeight: 1.1, margin: "0 0 28px"
            }}>
                Thanks for visiting<br />
                <em style={{ fontStyle: "italic", color: C.sakura }}>my world</em>{" "}
                <span style={{ fontSize: ".5em" }}>🌸</span></h2>
            <p style={{
                fontFamily: "'Noto Serif JP','Quicksand'", fontSize: 15, color: "rgba(255,255,255,0.4)",
                letterSpacing: 4, fontWeight: 300
            }}>— Aarya Varier —</p>

            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 52 }}>
                {[
                    { name: "Instagram", url: "https://www.instagram.com/rya_._._?igsh=amNpZHU4ejAycXV5" },
                    { name: "Pinterest", url: "https://pin.it/1L2wdCRP1" }
                ].map(l => (
                    <MagneticBtn key={l.name} href={l.url}>
                        <div style={{
                            padding: "12px 30px", borderRadius: 50,
                            border: `1px solid ${C.sakura}25`, fontFamily: "'Quicksand'", fontSize: 12,
                            color: "rgba(255,255,255,0.55)", letterSpacing: 2.5, fontWeight: 600,
                            background: `${C.sakura}06`, textTransform: "uppercase",
                            transition: "all .3s ease"
                        }}
                            onMouseEnter={e => {
                                e.target.style.background = `${C.sakura}18`; e.target.style.color = C.sakuraLight;
                                e.target.style.borderColor = `${C.sakura}50`;
                            }}
                            onMouseLeave={e => {
                                e.target.style.background = `${C.sakura}06`; e.target.style.color = "rgba(255,255,255,0.55)";
                                e.target.style.borderColor = `${C.sakura}25`;
                            }}
                        >{l.name}</div>
                    </MagneticBtn>))}
            </div>

            <div style={{
                width: 1, height: 70, background: `linear-gradient(to bottom, ${C.sakura}40, transparent)`,
                margin: "56px auto 0"
            }} />
            <div style={{
                fontFamily: "'Quicksand'", fontSize: 10, color: "rgba(255,255,255,0.2)",
                letterSpacing: 3, marginTop: 20, fontWeight: 400
            }}>© {new Date().getFullYear()} Aarya Varier · 桜</div>
        </div>
    </Scene>);
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
    return (<div style={{ fontFamily: "'Quicksand',sans-serif", background: C.void, color: "white" }}>
        <GlobalStyles />
        <CursorGlow />
        <Nav />
        <Hero />
        <About />
        <Skills />
        <Hobbies />
        <Favorites />
        <Education />
        <Contact />
    </div>);
}
