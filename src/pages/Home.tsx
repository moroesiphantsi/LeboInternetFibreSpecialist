import React, { useEffect, useRef, useState } from "react";
import {
  FlashOn as Zap,
  Build as Wrench,
  Construction as Hammer,
  Home as HomeIcon,
  Verified as ShieldCheck,
  AccessTime as Clock,
  AttachMoney as DollarSign,
  Phone,
  LocationOn as MapPin,
  CheckCircle as CheckCircle2,
  Menu,
  Close as X,
  PlayArrow as Play,
  ChevronRight,
  WorkspacePremium as Award,
  Layers,
  AutoAwesome as Sparkles,
  Fullscreen as Maximize2,
  Business as Building,
  Restaurant,
  Kitchen,
  Handyman,
  PlaceOutlined as PinOutline,
  Pause,
  VolumeOff,
  VolumeUp,
} from "@mui/icons-material";
import './Home.css';

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

interface ServiceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CompanyItem {
  name: string;
  tag: string;
  location?: string;
  description: string;
  highlights: string[];
  phone?: string;
  phoneHref?: string;
  phoneNote?: string;
  icon: React.ReactNode;
}

export default function Home() {
  // Ensure the browser uses the real device width on phones.
  useEffect(() => {
    let viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      document.head.appendChild(viewport);
    }
    viewport.content = "width=device-width, initial-scale=1, viewport-fit=cover";
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
  const [scrolled, setScrolled] = useState(false);

  /* ----------------------------------------
     HERO VIDEO CONTROLS
  ----------------------------------------- */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);

  const toggleVideoPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const toggleVideoSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setVideoMuted(video.muted);
    if (!video.muted && video.paused) {
      void video.play();
    }
  };

  const openVideoFullscreen = () => {
    const video = videoRef.current as
      | (HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitRequestFullscreen?: () => void;
        })
      | null;
    if (!video) return;
    if (video.requestFullscreen) {
      void video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    }
  };

  /* ----------------------------------------
     LAYOUT CHECK: open the site with ?debug at the end of the
     address to list anything wider than the phone screen.
  ----------------------------------------- */
  useEffect(() => {
    if (!window.location.search.includes("debug")) return;

    const box = document.createElement("pre");
    box.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;z-index:99999;margin:0;padding:8px;max-height:55vh;overflow:auto;background:rgba(150,0,0,0.94);color:#fff;font:10px/1.4 monospace;white-space:pre-wrap;pointer-events:none;";
    document.body.appendChild(box);

    const run = () => {
      const visual = window.visualViewport;
      const vw = visual ? visual.width : window.innerWidth;
      const lines: string[] = [
        `screen ${window.screen.width} | inner ${window.innerWidth} | visual ${Math.round(vw)} | docClient ${document.documentElement.clientWidth} | docScroll ${document.documentElement.scrollWidth} | bodyScroll ${document.body.scrollWidth} | dpr ${window.devicePixelRatio}`,
        "Elements wider than the screen:",
      ];
      const offenders: { label: string; right: number; width: number }[] = [];

      document.querySelectorAll(".mefane-page *").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.right <= vw + 1) return;

        let clipped = false;
        let parent = el.parentElement;
        while (parent && !parent.classList.contains("mefane-page")) {
          const overflowX = window.getComputedStyle(parent).overflowX;
          if (overflowX !== "visible" && parent.getBoundingClientRect().right <= vw + 1) {
            clipped = true;
            break;
          }
          parent = parent.parentElement;
        }
        if (clipped) return;

        const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/)[0] : "";
        offenders.push({
          label: `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}`,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      });

      offenders
        .sort((a, b) => b.right - a.right)
        .slice(0, 12)
        .forEach((o) => lines.push(`${o.label}  width ${o.width}  right ${o.right}`));
      if (offenders.length === 0) lines.push("none found");

      box.textContent = lines.join("\n");
    };

    const timer = window.setTimeout(run, 1500);
    window.addEventListener("resize", run);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", run);
      box.remove();
    };
  }, []);

  /* ----------------------------------------
     SCROLL EFFECT
  ----------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ----------------------------------------
     CLOSE MOBILE MENU ON RESIZE
  ----------------------------------------- */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ----------------------------------------
     CLOSE LIGHTBOX WITH ESCAPE KEY
  ----------------------------------------- */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ----------------------------------------
     SERVICES DATA
  ----------------------------------------- */
  const services: ServiceItem[] = [
    {
      title: "Electrical Installations",
      description: "Complete residential & commercial wiring, panel upgrades, lighting, and safety inspections.",
      icon: <Zap fontSize="large" />,
    },
    {
      title: "Plumbing Services",
      description: "Pipe repairs, geyser installations, bathroom plumbing, leak detection, and maintenance.",
      icon: <Wrench fontSize="large" />,
    },
    {
      title: "Brick-laying",
      description: "Expert structural brickwork, boundary walls, foundations, and architectural masonry.",
      icon: <Hammer fontSize="large" />,
    },
    {
      title: "Ceilings",
      description: "Suspended ceilings, rhinolite plastering, ornate cornices, and insulation installation.",
      icon: <Layers fontSize="large" />,
    },
    {
      title: "Flooring & Tiling",
      description: "Precise ceramic, porcelain, laminate, and vinyl floor tiling with flawless finishing.",
      icon: <HomeIcon fontSize="large" />,
    },
    {
      title: "Freezer & Cold Room Maintenance",
      description: "Commercial and industrial refrigeration maintenance, servicing, and emergency repairs.",
      icon: <ShieldCheck fontSize="large" />,
    },
    {
      title: "Fixing Refrigerators",
      description: "Diagnostic and repair services for domestic and commercial fridges and cooling units.",
      icon: <Award fontSize="large" />,
    },
    {
      title: "Roofing",
      description: "Roof construction, waterproofing, tile replacements, sheeting, and gutter installations.",
      icon: <Sparkles fontSize="large" />,
    },
  ];

  /* ----------------------------------------
     COMPANIES WORKED WITH
  ----------------------------------------- */
  const companies: CompanyItem[] = [
    {
      name: "Nimble Tech Engineering",
      tag: "Worked With",
      description: "Hands-on engineering and maintenance work carried out together with the Nimble Tech Engineering team.",
      highlights: ["Engineering", "Maintenance", "Site Work"],
      phone: "+266 5610 5510",
      phoneHref: "tel:+26656105510",
      icon: <Building fontSize="large" />,
    },
    {
      name: "Electro Fresh",
      tag: "Worked With",
      description: "Technical work carried out together with the Electro Fresh team.",
      highlights: ["Electrical", "Refrigeration", "Maintenance"],
      phone: "5712 5414",
      phoneHref: "tel:57125414",
      icon: <Kitchen fontSize="large" />,
    },
    {
      name: "Hungry Lion",
      tag: "Worked At",
      location: "Mohale's Hoek",
      description: "Worked at the Hungry Lion Mohale's Hoek branch under Nimble Tech Engineering.",
      highlights: ["On-site Work", "Via Nimble Tech Engineering"],
      phone: "+266 5610 5510",
      phoneHref: "tel:+26656105510",
      phoneNote: "Nimble Tech Engineering",
      icon: <Restaurant fontSize="large" />,
    },
    {
      name: "Jundralls",
      tag: "Worked With",
      location: "Mohale's Hoek",
      description: "Electrical and plumbing maintenance carried out together with Jundralls in Mohale's Hoek.",
      highlights: ["Electrical Maintenance", "Plumbing Maintenance"],
      icon: <Handyman fontSize="large" />,
    },
  ];

  /* ----------------------------------------
     PORTFOLIO DATA (Pictures 1 to 37)
  ----------------------------------------- */
  const portfolioCategories = [
    "All",
    "Electrical",
    "Plumbing & Cold Rooms",
    "Construction & Tiling",
    "Roofing & Ceilings",
  ];

  const portfolioItems: PortfolioItem[] = Array.from(
    { length: 37 },
    (_, index) => {
      const id = index + 1;
      let category = "Construction & Tiling";
      let title = `Home Construction & Tiling #${id}`;

      if (id % 4 === 1) {
        category = "Electrical";
        title = `Electrical Wiring & Panel Installation #${id}`;
      } else if (id % 4 === 2) {
        category = "Plumbing & Cold Rooms";
        title = `Cold Room & Plumbing System #${id}`;
      } else if (id % 4 === 3) {
        category = "Roofing & Ceilings";
        title = `Roofing & Ceiling Finishing #${id}`;
      }

      return {
        id,
        title,
        category,
        image: require(`../assets/picture${id}.jpg`), // Webpack/React asset resolution
      };
    }
  );

  const filteredPortfolio =
    activeCategory === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  /* ----------------------------------------
     FORM SUBMIT → WHATSAPP
  ----------------------------------------- */
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const service = String(formData.get("service") || "").trim();
    const details = String(formData.get("details") || "").trim();

    const whatsappNumber = "26659619361";

    const message = [
      "Hello Mefane Engineering,",
      "",
      "I would like to request an engineering quote.",
      "",
      `*Your Name:* ${name}`,
      `*Phone Number:* ${phone}`,
      `*Service Required:* ${service}`,
      `*Project Details:* ${details}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mefane-page">
      {/* ========================================
          TOP CONTACT BAR
      ========================================= */}
      <div className="mefane-topbar">
        <div className="mefane-container mefane-topbar-inner">
          <div className="mefane-topbar-location">
            <MapPin style={{ fontSize: "16px" }} />
            <span>Serving: Lesotho | South Africa</span>
          </div>
          <div className="mefane-topbar-contact">
            <a href="tel:63740151">
              <Phone style={{ fontSize: "14px" }} /> 63740151
            </a>
            <span>/</span>
            <a href="tel:59619361">
              <Phone style={{ fontSize: "14px" }} /> 59619361
            </a>
          </div>
        </div>
      </div>

      {/* ========================================
          NAVIGATION
      ========================================= */}
      <header className={`mefane-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="mefane-container mefane-navbar-inner">
          <a href="#home" className="mefane-logo">
            <div>
              <div className="mefane-logo-name">MEFANE</div>
              <div className="mefane-logo-subtitle">Engineering</div>
            </div>
          </a>

          <nav className="mefane-nav-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#about">About Us</a>
            <a href="#experience">Experience</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
          </nav>

          <a href="#contact" className="mefane-btn mefane-btn-primary">
            Request Engineering Services
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mefane-mobile-button"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mefane-mobile-menu">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>
          <a href="#experience" onClick={() => setMobileMenuOpen(false)}>Experience</a>
          <a href="#portfolio" onClick={() => setMobileMenuOpen(false)}>Portfolio</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <div style={{ marginTop: "15px" }}>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="mefane-btn mefane-btn-primary"
              style={{ width: "100%" }}
            >
              Request Engineering Services
            </a>
          </div>
        </div>
      )}

      {/* ========================================
          HERO SECTION (With video1.mp4)
      ========================================= */}
      <section id="home" className="mefane-hero">
        <div className="mefane-container mefane-hero-grid">
          <div className="mefane-hero-content animate-in">
            <div className="mefane-eyebrow">
              <Sparkles style={{ fontSize: "14px" }} />
              BUILDING • RENOVATING • POWERING YOUR WORLD
            </div>

            <h1>
              WE DO IT ALL, <br />
              <span className="mefane-gradient-text">SO YOU DON&apos;T HAVE TO.</span>
            </h1>

            <p className="mefane-hero-description">
              <strong>YOUR VISION. OUR EXPERTISE. Perfect Results!</strong> From
              complete electrical installations and plumbing to heavy construction,
              cold room maintenance, and sophisticated architectural finishes.
            </p>

            <div className="mefane-hero-actions">
              <a href="#contact" className="mefane-btn mefane-btn-primary">
                Call Us Today <ChevronRight />
              </a>
              <a href="#portfolio" className="mefane-btn mefane-btn-secondary">
                View My Projects
              </a>
            </div>

            <div className="mefane-hero-meta">
              <div className="mefane-stat">
                <strong>100%</strong>
                <span>Excellence</span>
              </div>
              <div className="mefane-quote">
                &quot;Every project big or small, we deliver excellence!&quot;
                <br />
                <span>— Mefane Engineering Team</span>
              </div>
            </div>
          </div>

          {/* Hero Video Preview using video1.mp4 */}
          <div className="mefane-video-wrapper">
            <div className="mefane-video-glow"></div>
            <div className="mefane-video-card">
              <video
                ref={videoRef}
                className="mefane-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
              >
                <source src={require("../assets/video1.mp4")} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="mefane-video-controls">
                <button
                  type="button"
                  className="mefane-video-control"
                  onClick={toggleVideoPlay}
                  aria-label={videoPlaying ? "Pause video" : "Play video"}
                >
                  {videoPlaying ? <Pause style={{ fontSize: "20px" }} /> : <Play style={{ fontSize: "20px" }} />}
                </button>
                <button
                  type="button"
                  className="mefane-video-control"
                  onClick={toggleVideoSound}
                  aria-label={videoMuted ? "Turn sound on" : "Turn sound off"}
                >
                  {videoMuted ? <VolumeOff style={{ fontSize: "20px" }} /> : <VolumeUp style={{ fontSize: "20px" }} />}
                </button>
                <button
                  type="button"
                  className="mefane-video-control"
                  onClick={openVideoFullscreen}
                  aria-label="Full screen"
                >
                  <Maximize2 style={{ fontSize: "20px" }} />
                </button>
              </div>

              <div className="mefane-video-overlay">
                <div className="mefane-video-badge">
                  <Play style={{ fontSize: "12px" }} /> Featured Reel
                </div>
                <h3>Precision &amp; Power in Action</h3>
                <p>Watch our elite technicians executing top-grade electrical and construction work across Maseru.</p>
                <div className="mefane-video-tags">
                  <span>Electrical</span>
                  <span>Plumbing</span>
                  <span>Construction</span>
                  <span>Cold Rooms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          TRUST BADGES
      ========================================= */}
      <section className="mefane-trust">
        <div className="mefane-container mefane-trust-grid">
          <div className="mefane-trust-card">
            <div className="mefane-trust-icon"><Award /></div>
            <div>
              <h4>Professional Team</h4>
              <p>Expert certified engineers</p>
            </div>
          </div>
          <div className="mefane-trust-card">
            <div className="mefane-trust-icon"><CheckCircle2 /></div>
            <div>
              <h4>Quality Workmanship</h4>
              <p>Flawless results guaranteed</p>
            </div>
          </div>
          <div className="mefane-trust-card">
            <div className="mefane-trust-icon"><Clock /></div>
            <div>
              <h4>Reliable & On Time</h4>
              <p>Punctual project delivery</p>
            </div>
          </div>
          <div className="mefane-trust-card">
            <div className="mefane-trust-icon"><DollarSign /></div>
            <div>
              <h4>Affordable Prices</h4>
              <p>Competitive transparent rates</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          SERVICES SECTION
      ========================================= */}
      <section id="services" className="mefane-section">
        <div className="mefane-container">
          <div className="mefane-section-header">
            <div className="mefane-eyebrow">Our Services</div>
            <h2 className="mefane-section-title">We Do It All, So You Don&apos;t Have To</h2>
            <p className="mefane-section-description">
              Every project big or small, we deliver excellence! Discover our full spectrum of home construction, renovation, and engineering solutions.
            </p>
          </div>

          <div className="mefane-services-grid">
            {services.map((service, index) => (
              <div key={index} className="mefane-service-card">
                <div>
                  <div className="mefane-service-icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <a href="#contact" className="mefane-service-link">
                  Inquire Now <ChevronRight fontSize="small" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          ABOUT SECTION
      ========================================= */}
      <section id="about" className="mefane-section mefane-section-soft">
        <div className="mefane-container mefane-about-grid">
          <div className="mefane-about-content">
            <div className="mefane-eyebrow">About Mefane Engineering</div>
            <h2>We Build. We Fix. <span className="mefane-gradient-text">We Care.</span></h2>
            <p>
              Mefane Engineering is a premier engineering and home construction powerhouse operating across Lesotho. Our mission is to deliver absolute perfection in every project—from foundational brick-laying and high-voltage electrical installations to precision plumbing, cold room maintenance, and stunning architectural ceilings.
            </p>

            <div className="mefane-about-stats">
              <div className="mefane-about-stat">
                <strong>9+</strong>
                <span>Regions Served</span>
              </div>
              <div className="mefane-about-stat">
                <strong>80+</strong>
                <span>Portfolio Showcase</span>
              </div>
            </div>

            <div className="mefane-about-location">
              <MapPin className="mefane-gold-light" />
              <span>Serving Areas: <strong>Lesotho | South Africa</strong></span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================
          COMPANIES I HAVE WORKED WITH
      ========================================= */}
      <section id="experience" className="mefane-section mefane-experience">
        <div className="mefane-container">
          <div className="mefane-section-header">
            <div className="mefane-eyebrow">Work Experience</div>
            <h2 className="mefane-section-title">
              Companies I Have <span className="mefane-gradient-text">Worked With</span>
            </h2>
            <p className="mefane-section-description">
              Trusted experience gained alongside respected businesses in Lesotho. Contact numbers are provided so you can verify my work.
            </p>
          </div>

          <div className="mefane-company-grid">
            {companies.map((company, index) => (
              <article key={company.name} className="mefane-company-card">
                <div className="mefane-company-number">{String(index + 1).padStart(2, "0")}</div>

                <div className="mefane-company-top">
                  <div className="mefane-company-icon">{company.icon}</div>
                  <div className="mefane-company-heading">
                    <span className="mefane-company-tag">{company.tag}</span>
                    <h3>{company.name}</h3>
                    {company.location && (
                      <div className="mefane-company-location">
                        <PinOutline style={{ fontSize: "15px" }} />
                        {company.location}
                      </div>
                    )}
                  </div>
                </div>

                <p className="mefane-company-description">{company.description}</p>

                <div className="mefane-company-chips">
                  {company.highlights.map((item) => (
                    <span key={item} className="mefane-company-chip">
                      <CheckCircle2 style={{ fontSize: "13px" }} />
                      {item}
                    </span>
                  ))}
                </div>

                {company.phone && company.phoneHref ? (
                  <a href={company.phoneHref} className="mefane-company-call">
                    <span className="mefane-company-call-icon"><Phone style={{ fontSize: "18px" }} /></span>
                    <span className="mefane-company-call-text">
                      <small>{company.phoneNote ? `Contact (${company.phoneNote})` : "Contact"}</small>
                      <strong>{company.phone}</strong>
                    </span>
                    <ChevronRight fontSize="small" />
                  </a>
                ) : (
                  <div className="mefane-company-call mefane-company-call-empty">
                    <span className="mefane-company-call-icon"><Handyman style={{ fontSize: "18px" }} /></span>
                    <span className="mefane-company-call-text">
                      <small>Field</small>
                      <strong>Electrical &amp; Plumbing</strong>
                    </span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          PORTFOLIO SECTION (Pictures 1 to 37)
      ========================================= */}
      <section id="portfolio" className="mefane-section">
        <div className="mefane-container">
          <div className="mefane-section-header">
            <div className="mefane-eyebrow">Portfolio Gallery</div>
            <h2 className="mefane-section-title">Complete Project Archive</h2>
            <p className="mefane-section-description">
              Explore our comprehensive gallery showcasing elite residential and commercial engineering projects across Lesotho and South Africa. Click any image to inspect it in full detail.
            </p>
          </div>

          <div className="mefane-category-list">
            {portfolioCategories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`mefane-category ${activeCategory === category ? "active" : ""}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mefane-portfolio-grid">
            {filteredPortfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="mefane-project"
              >
                <div className="mefane-project-image">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="mefane-project-overlay"></div>
                  <span className="mefane-project-number">#{item.id}</span>
                  <div className="mefane-project-expand">
                    <Maximize2 style={{ fontSize: "16px" }} />
                  </div>
                </div>
                <div className="mefane-project-info">
                  <div className="mefane-project-category">{item.category}</div>
                  <h3 className="mefane-project-title">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          LIGHTBOX MODAL
      ========================================= */}
      {selectedImage && (
        <div className="mefane-lightbox" onClick={() => setSelectedImage(null)}>
          <div className="mefane-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="mefane-lightbox-close"
              aria-label="Close modal"
            >
              <X />
            </button>
            <img src={selectedImage.image} alt={selectedImage.title} className="mefane-lightbox-image" />
            <div className="mefane-lightbox-info">
              <div>
                <span className="mefane-project-category">Picture #{selectedImage.id} • {selectedImage.category}</span>
                <h3>{selectedImage.title}</h3>
              </div>
              <a href="#contact" onClick={() => setSelectedImage(null)} className="mefane-btn mefane-btn-primary">
                Request Similar Project
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          CONTACT SECTION
      ========================================= */}
      <section id="contact" className="mefane-section mefane-section-soft">
        <div className="mefane-container mefane-contact-grid">
          <div>
            <div className="mefane-eyebrow">Get In Touch</div>
            <h2 className="mefane-contact-title">Call Us Today For Perfect Results</h2>
            <p className="mefane-contact-description">
              Every project big or small, we deliver excellence! Reach out directly via our official lines or visit us across our serving regions.
            </p>

            <div className="mefane-contact-cards">
              <div className="mefane-contact-card">
                <div className="mefane-contact-icon"><Phone /></div>
                <div>
                  <h4>Call Us Today</h4>
                  <a href="tel:63740151">63740151</a> / <a href="tel:59619361">59619361</a>
                </div>
              </div>
              <div className="mefane-contact-card">
                <div className="mefane-contact-icon"><MapPin /></div>
                <div>
                  <h4>Serving Areas</h4>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>Lesotho | South Africa</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleFormSubmit} className="mefane-form">
              <h3>Request an Engineering Quote</h3>
              <p>Fill out the form below and our professional team will get back to you promptly.</p>

              <div className="mefane-form-grid">
                <div className="mefane-field">
                  <label htmlFor="name">Your Name</label>
                  <input id="name" name="name" type="text" required placeholder="e.g. John Molefi" />
                </div>
                <div className="mefane-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input id="phone" name="phone" type="tel" required placeholder="e.g. +266 ..." />
                </div>
              </div>

              <div className="mefane-field full">
                <label htmlFor="service">Service Required</label>
                <select id="service" name="service" required>
                  <option>Electrical Installations</option>
                  <option>Plumbing Services</option>
                  <option>Brick-laying & Construction</option>
                  <option>Ceilings & Flooring / Tiling</option>
                  <option>Freezer & Cold Room Maintenance</option>
                  <option>Fixing Refrigerators</option>
                  <option>Roofing</option>
                  <option>General Home Renovations</option>
                </select>
              </div>

              <div className="mefane-field full">
                <label htmlFor="details">Project Details</label>
                <textarea id="details" name="details" rows={4} required placeholder="Describe your project size, location, and requirements..."></textarea>
              </div>

              <button type="submit" className="mefane-btn mefane-btn-primary" style={{ width: "100%", marginTop: "10px" }}>
                Submit Inquiry Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================
          FOOTER
      ========================================= */}
      <footer className="mefane-footer">
        <div className="mefane-container mefane-footer-inner">
          <div className="mefane-logo">
            <div>
              <div className="mefane-logo-name" style={{ fontSize: "16px" }}>MEFANE ENGINEERING</div>
              <div className="mefane-logo-subtitle">We build. We fix. We care.</div>
            </div>
          </div>

          <div className="mefane-footer-copy">
            <p>© {new Date().getFullYear()} Mefane Engineering. All rights reserved.</p>
            <strong>&quot;Your vision. Our expertise. Perfect results!&quot;</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}