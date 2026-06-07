import { useState } from "react";
import { STUDY_SECTIONS, BINGO_TERMS } from "../data";
import { BookOpen, FileText, Landmark, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Instructions() {
  const [activeTab, setActiveTab] = useState<"slides" | "glossario">("slides");
  const [slideIndex, setSlideIndex] = useState(0);

  // Helper icon for cards
  const getSectionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <BookOpen className="w-6 h-6 text-indigo-500" />;
      case 1:
        return <FileText className="w-6 h-6 text-cyan-500" />;
      case 2:
        return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
      case 3:
        return <Landmark className="w-6 h-6 text-amber-500" />;
      default:
        return <BookOpen className="w-6 h-6 text-indigo-500" />;
    }
  };

  const nextSlide = () => {
    if (slideIndex < STUDY_SECTIONS.length - 1) {
      setSlideIndex(slideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  return (
    <div id="instruction-section" className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/15 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-indigo-300 w-7 h-7" id="icon-book" />
            Material de Estudo: Aula 09
          </h2>
          <p className="text-indigo-100/80 text-sm mt-1">
            Estude os tópicos de Direito Autoral em UI/UX para gabaritar o Bingo em sala de aula!
          </p>
        </div>

        {/* Mini Tab Switcher */}
        <div className="flex bg-white/10 p-1.5 rounded-xl gap-1 border border-white/15 backdrop-blur-md">
          <button
            id="btn-slides"
            onClick={() => setActiveTab("slides")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-200 uppercase tracking-wider ${
              activeTab === "slides"
                ? "bg-white text-indigo-950 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            Slides Resumo
          </button>
          <button
            id="btn-glossario"
            onClick={() => setActiveTab("glossario")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-200 uppercase tracking-wider ${
              activeTab === "glossario"
                ? "bg-white text-indigo-950 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            Glossário
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "slides" ? (
          <motion.div
            key="slides"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
            id="slides-view"
          >
            {/* Slide Navigation Header */}
            <div className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-2xl border border-white/15 backdrop-blur-xs">
              <span className="text-xs font-extrabold text-[#fdf4ff] uppercase tracking-wider bg-white/15 px-3 py-1.5 rounded-lg border border-white/10">
                Tópico {slideIndex + 1} de {STUDY_SECTIONS.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="btn-prev-slide"
                  onClick={prevSlide}
                  disabled={slideIndex === 0}
                  className="p-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  id="btn-next-slide"
                  onClick={nextSlide}
                  disabled={slideIndex === STUDY_SECTIONS.length - 1}
                  className="p-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Content Active Card */}
            <motion.div
              key={`slide-card-${slideIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 text-indigo-950 p-6 md:p-8 rounded-3xl border border-white/50 shadow-2xl space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl shadow-inner border border-indigo-100 flex-shrink-0">
                  {getSectionIcon(slideIndex)}
                </div>
                <div>
                  <span className="text-xs text-indigo-500 font-bold font-mono tracking-wider uppercase">{STUDY_SECTIONS[slideIndex].pageNumber} do PDF</span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight mt-1">
                    {STUDY_SECTIONS[slideIndex].title}
                  </h3>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                  {STUDY_SECTIONS[slideIndex].summary}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5">Pontos Chave para Fixar:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {STUDY_SECTIONS[slideIndex].keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-50 px-4.5 py-3.5 rounded-xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-xs md:text-sm font-semibold text-slate-700 hover:border-slate-200 transition">
                      <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mt-1 flex-shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="glossario"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
            id="glossario-view"
          >
            <div className="bg-white/15 p-4 rounded-2xl border border-white/10 text-xs text-white/90 leading-relaxed font-medium">
              Existem <strong className="text-pink-200 font-bold">{BINGO_TERMS.length} conceitos fundamentais</strong> catalogados a partir da Aula 09 (Foco do Bingo!). Use esta lista para revisar as definições rápidas.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[385px] overflow-y-auto pr-2 custom-scrollbar">
              {BINGO_TERMS.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/90 hover:bg-white text-indigo-950 p-4 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-150 space-y-1.5"
                >
                  <span className="text-[11px] font-extrabold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 uppercase tracking-wide inline-block">
                    {item.term}
                  </span>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
