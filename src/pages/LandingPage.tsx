// src/components/LandingPage.tsx
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { CheckCircle, Smartphone, Grid3x3, Palette, Clock, Shield, ChevronDown } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900">
      <Header />
      <Hero />
      <SectionWrapper id="schools" title="Écoles supportées" subtitle="EPSI, WIS, IFAG, SUP'DE COM, IET, 3A, IDRAK, et bien d'autres">
        <Schools />
      </SectionWrapper>
      <SectionWrapper id="benefits" title="Pourquoi c’est plus simple" subtitle="Fini les pages d’EDT compliquées : récupère automatiquement ton emploi du temps et profite d’une présentation claire et moderne.">
        <Benefits />
      </SectionWrapper>
      <SectionWrapper id="how" title="Comment ça marche">
        <HowItWorks />
      </SectionWrapper>
      <SectionWrapper id="features" title="Fonctionnalités">
        <Features />
      </SectionWrapper>
      <SectionWrapper id="faq" title="FAQ">
        <FAQ />
      </SectionWrapper>
      <Footer />
    </div>
  );
}

/* Variants */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.05, staggerChildren: 0.06 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 140, damping: 16 } },
};

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35 }}
      className={`sticky top-0 z-40 backdrop-blur bg-white/70 border-b ${scrolled ? "border-gray-200 shadow-sm" : "border-transparent"}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">EDT Manager HEP</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {["schools", "benefits", "how", "features", "faq"].map((id) => (
            <motion.a
              key={id}
              href={`#${id}`}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="hover:text-blue-600" 
            >
              {id === "schools"
                ? "Écoles"
                : id === "benefits"
                ? "Pourquoi"
                : id === "how"
                ? "Comment"
                : id === "features"
                ? "Fonctionnalités"
                : "FAQ"}
            </motion.a>
          ))}
        </nav>
        <motion.a
          href="https://edt-hep.matheodelaunay.studio/"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Voir mon emploi du temps
        </motion.a>
      </div>
    </motion.header>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const yImage = useTransform(scrollYProgress, [0, 1], [0, -12]);
  const opacityImage = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage:
            "radial-gradient(600px 200px at 10% 10%, rgba(37,99,235,0.12), transparent), radial-gradient(600px 200px at 90% 20%, rgba(59,130,246,0.10), transparent)",
        }}
      />
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center">
          <motion.h1 variants={fadeUp} style={{ y: yTitle }} className="text-3xl md:text-5xl font-bold tracking-tight">
            Emploi du temps HEP clair, moderne et interactif
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 md:mt-6 text-gray-600 max-w-2xl mx-auto">
            Visualise ton EDT EPSI, WIS, IFAG, SUP’DE COM en un clic. Couleurs par matière,
            détails du cours, vue grille et liste. Optimisé pour mobile et desktop.
          </motion.p>

          <motion.div variants={fadeUp} id="cta" className="mt-6 md:mt-8 flex items-center justify-center gap-3">
            <motion.a
              href="https://edt-hep.matheodelaunay.studio/"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-base font-medium shadow hover:bg-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Voir mon emploi du temps
            </motion.a>
            <motion.a
              href="https://github.com/D-Seonay/edt-hep"
              whileHover={{ y: -1 }}
              className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-base font-medium hover:bg-gray-50 transition"
            >
              Voir le code
            </motion.a>
          </motion.div>

          <motion.div
            style={{ y: yImage, opacity: opacityImage }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 md:mt-12"
          >
            <div className="relative rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <img src="/preview.png" alt="Aperçu de l'application EDT Manager" className="w-full object-cover" loading="lazy" />
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(400px 180px at 80% 20%, rgba(59,130,246,0.12), transparent)" }}
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 text-xs text-gray-500">
            Licence MIT • Données récupérées automatiquement depuis le site officiel
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionWrapper({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`border-t border-gray-100 ${id === "how" || id === "faq" ? "bg-gray-50" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10% 0px" }} variants={staggerContainer}>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p variants={fadeUp} className="mt-3 text-gray-600 max-w-2xl">
              {subtitle}
            </motion.p>
          )}
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </section>
  );
}

function Schools() {
  const schools = [
    { name: "3A", src: "/logos/3A.png" },
    { name: "IFAG", src: "/logos/IFAG.png" },
    { name: "IDRAC", src: "/logos/IDRAC.png" },
    { name: "EPSI", src: "/logos/EPSI.png" },
    { name: "WIS", src: "/logos/WIS.png" },
    { name: "SUP'DE COM", src: "/logos/SUPDECOM.png" },
    { name: "IET", src: "/logos/IET.png" },
    { name: "ICL", src: "/logos/ICL.png" },
    { name: "IEFT", src: "/logos/IEFT.png" },
    { name: "IGEFI", src: "/logos/IGEFI.png" },
    { name: "IHEDREA", src: "/logos/IHEDREA.png" },
    { name: "ILERI", src: "/logos/ILERI.png" },
    { name: "VIVA MUNDI", src: "/logos/VIVA_MUNDI.png" },
    { name: "ESAIL", src: "/logos/ESAIL.png" },
    { name: "FIGS", src: "/logos/FIGS.png" },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
      }}
      className="relative"
    >
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="mx-auto max-w-6xl h-full bg-gradient-to-r from-blue-50 via-white to-blue-50 opacity-60 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {schools.map((s) => (
          <motion.div
            key={s.name}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4"
          >
            <img
              src={s.src}
              alt={`Logo ${s.name}`}
              className="h-10 md:h-12 object-contain"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="mt-2 text-sm text-gray-700">{s.name}</span>
          </motion.div>
        ))}
      </div>

      <motion.div aria-hidden className="mt-6 hidden md:block overflow-hidden" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="flex gap-8">
          {schools.concat(schools).map((s, i) => (
            <img key={`${s.name}-${i}`} src={s.src} alt="" className="h-8 opacity-60 hover:opacity-90 transition" loading="lazy" />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Benefits() {
  const items = [
    { icon: Smartphone, title: "Mobile & Desktop", desc: "Vue liste sur mobile, grille sur desktop." },
    { icon: Grid3x3, title: "Lisible & organisé", desc: "Disposition claire avec horaires et matières." },
    { icon: Palette, title: "Couleurs par matière", desc: "Chaque matière a sa couleur pour repérer d’un coup d’œil." },
  ];
  return (
    <motion.div className="grid md:grid-cols-3 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
      {items.map(({ icon: Icon, title, desc }) => (
        <motion.div
          key={title}
          variants={cardVariant}
          whileHover={{ translateY: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="p-5 rounded-lg border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">{desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function HowItWorks() {
  const steps = [
    { step: "1", title: "Choisis ton école/filière", desc: "EPSI, WIS, IFAG, SUP’DE COM, etc." },
    { step: "2", title: "Récupération automatique", desc: "On parse l’EDT officiel pour normaliser les cours." },
    { step: "3", title: "Affichage instantané", desc: "Vue claire, couleurs par matière et détails du cours." },
  ];
  return (
    <motion.div className="grid md:grid-cols-3 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
      {steps.map(({ step, title, desc }) => (
        <motion.div key={title} variants={cardVariant} whileHover={{ translateY: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} className="p-5 rounded-lg bg-white border border-gray-200">
          <motion.div layout initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            {step}
          </motion.div>
          <h3 className="mt-3 font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function Features() {
  const features = [
    { icon: CheckCircle, title: "Vue grille & liste", desc: "Adaptée selon l’appareil pour toujours être lisible." },
    { icon: Clock, title: "Mises à jour automatiques", desc: "Synchronisé avec le site officiel HEP." },
    { icon: Shield, title: "Respect de la confidentialité", desc: "Aucune donnée personnelle stockée sans consentement." },
  ];
  return (
    <motion.div className="grid md:grid-cols-3 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
      {features.map(({ icon: Icon, title, desc }) => (
        <motion.div key={title} variants={cardVariant} whileHover={{ translateY: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} className="p-5 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">{desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function FAQ() {
  const items = [
    { q: "Quelles écoles HEP sont supportées ?", a: "EPSI, WIS, IFAG, SUP’DE COM, etc. Les données proviennent du site officiel." },
    { q: "Est-ce mis à jour automatiquement ?", a: "Oui, l’EDT est récupéré et normalisé pour afficher les changements dès leur publication." },
    { q: "Est-ce compatible sur mobile ?", a: "Complètement. La vue liste est optimisée pour smartphone, la vue grille pour desktop." },
    { q: "Mes données sont-elles protégées ?", a: "Nous ne stockons pas d’informations personnelles sans consentement et utilisons HTTPS." },
  ];
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <FAQItem key={item.q} item={item} delay={i * 0.03} />
      ))}
    </div>
  );
}

function FAQItem({ item, delay }: { item: { q: string; a: string }; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }} className="rounded-lg border border-gray-200 bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full px-4 py-3 flex items-center justify-between text-left">
        <span className="font-medium">{item.q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0, scale: open ? 1.05 : 1 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ height: "auto", opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ height: 0, opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.28 }}
            className="px-4 pb-3 text-sm text-gray-600"
          >
            {item.a}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} EDT Manager</div>
          <div className="flex items-center gap-4">
            {[
              { href: "https://edt-hep.matheodelaunay.studio/", label: "Application" },
              { href: "https://github.com/D-Seonay/edt-hep", label: "Repository" },
            ].map((l) => (
              <motion.a key={l.href} href={l.href} whileHover={{ color: "#2563EB", y: -1 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="hover:text-blue-600">
                {l.label}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
