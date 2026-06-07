import { useState, useEffect } from "react";
import { BingoTerm, DrawnItem, BingoCard } from "../types";
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle, 
  Users, 
  Layers,
  HelpCircle,
  Eye,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CallerPanelProps {
  drawnTerms: DrawnItem[];
  allTerms: BingoTerm[];
  activeCards: BingoCard[];
  onDrawTerm: () => void;
  onResetGame: () => void;
  onVerifyCard: (cardId: string) => void;
  isGameFinished: boolean;
}

export default function CallerPanel({
  drawnTerms,
  allTerms,
  activeCards,
  onDrawTerm,
  onResetGame,
  onVerifyCard,
  isGameFinished
}: CallerPanelProps) {
  const [speakOn, setSpeakOn] = useState(false);
  const [selectedReviewCard, setSelectedReviewCard] = useState<BingoCard | null>(null);

  const currentDrawn = drawnTerms.length > 0 ? drawnTerms[drawnTerms.length - 1] : null;
  const remainingCount = allTerms.length - drawnTerms.length;

  // Speak when a new term is drawn
  useEffect(() => {
    if (speakOn && currentDrawn) {
      speakDefinition(currentDrawn.term, currentDrawn.description);
    }
  }, [drawnTerms.length]);

  const speakDefinition = (term: string, description: string) => {
    if (!("speechSynthesis" in window)) return;
    
    // Stop any speech that is currently playing
    window.speechSynthesis.cancel();

    // Standard high-quality portuguese speech
    const utterance = new SpeechSynthesisUtterance(
      `Termo sorteado. Descrição: ${description}`
    );
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Helper to count marked and called
  const getCardStatus = (card: BingoCard) => {
    let markedCount = 0;
    let totalCells = card.dimension * card.dimension;
    
    card.grid.forEach(row => {
      row.forEach(cell => {
        if (cell.marked) markedCount++;
      });
    });

    return {
      markedCount,
      totalCells,
      isBingo: markedCount === totalCells || checkGridWinner(card)
    };
  };

  // Check if grid has a completed row, column, or diagonal
  const checkGridWinner = (card: BingoCard) => {
    const dim = card.dimension;
    
    // Check rows
    for (let r = 0; r < dim; r++) {
      if (card.grid[r].every(cell => cell.marked)) return true;
    }

    // Check cols
    for (let c = 0; c < dim; c++) {
      let colMarked = true;
      for (let r = 0; r < dim; r++) {
        if (!card.grid[r][c].marked) {
          colMarked = false;
          break;
        }
      }
      if (colMarked) return true;
    }

    // Check Diagonals
    let diag1 = true;
    let diag2 = true;
    for (let i = 0; i < dim; i++) {
      if (!card.grid[i][i].marked) diag1 = false;
      if (!card.grid[i][dim - 1 - i].marked) diag2 = false;
    }
    
    return diag1 || diag2;
  };  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="caller-panel-container">
      
      {/* SECTION 1: Draw Center & Controls */}
      <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 flex flex-col justify-between space-y-6 relative overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header toolbar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black font-mono text-emerald-300 tracking-widest uppercase">PAINEL DE SORTEIO</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-audio"
              onClick={() => {
                setSpeakOn(!speakOn);
                if (!speakOn && currentDrawn) {
                  speakDefinition(currentDrawn.term, currentDrawn.description);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 border uppercase ${
                speakOn 
                  ? "bg-indigo-600/40 border-indigo-400 text-indigo-100" 
                  : "bg-white/10 border-white/15 text-white/90 hover:bg-white/20 hover:text-white"
              }`}
              title="Locução por voz sintética das definições"
            >
              {speakOn ? <Volume2 className="w-4 h-4 text-indigo-300" /> : <VolumeX className="w-4 h-4 text-white/50" />}
              <span className="hidden sm:inline">Voz {speakOn ? "Ativa" : "Muda"}</span>
            </button>

            <button
              id="btn-reset-game-prop"
              onClick={onResetGame}
              className="px-3.5 py-2 rounded-xl border border-red-500/25 bg-red-950/30 text-red-200 hover:bg-red-900/40 hover:text-white transition duration-150 font-bold text-xs flex items-center gap-2 uppercase tracking-wide"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Big Drawn Sphere Display */}
        <div className="my-4 text-center py-6 flex flex-col items-center justify-center min-h-[230px] z-10">
          <AnimatePresence mode="wait">
            {currentDrawn ? (
              <motion.div
                key={`drawn-${currentDrawn.term}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="space-y-5 max-w-xl w-full"
              >
                {/* Simulated Glass Spheric Container */}
                <div className="relative mx-auto w-36 h-36 flex items-center justify-center rounded-full bg-linear-to-b from-white/15 to-white/25 border-2 border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.15)] backdrop-blur-xl">
                  <div className="absolute inset-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex flex-col items-center justify-center font-bold font-mono shadow-inner border border-white/20">
                    <span className="text-xl tracking-wider uppercase font-extrabold px-3 truncate max-w-full text-white drop-shadow-md">
                      BINGO
                    </span>
                    <span className="text-xs text-indigo-100 uppercase tracking-widest mt-1 font-extrabold bg-indigo-900/40 px-2 py-0.5 rounded-full border border-indigo-400/30 font-mono">
                      Nº {currentDrawn.order}
                    </span>
                  </div>
                </div>

                {/* Definition/Clue Card */}
                <div className="bg-white/95 text-indigo-950 p-6 rounded-3xl border border-white/50 shadow-2xl space-y-3 text-left">
                  <span className="text-[10px] font-black font-mono text-indigo-600 uppercase tracking-widest block">
                    Dica / Definição Sorteada:
                  </span>
                  <p className="text-slate-800 text-sm md:text-base leading-relaxed font-bold italic">
                    &ldquo;{currentDrawn.description}&rdquo;
                  </p>
                  
                  {/* Reveal answer block */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Elemento esperado na cartela:</span>
                      <span id="revealed-answer" className="inline-block mt-1 text-emerald-700 font-extrabold text-lg bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                        {currentDrawn.term}
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 py-1 px-2.5 rounded-lg border border-slate-200/60 font-mono font-medium self-start sm:self-auto">
                      Aula 09 • Direito Autoral
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="w-24 h-24 bg-white/10 border-2 border-dashed border-white/25 rounded-full mx-auto flex items-center justify-center text-white">
                  <Sparkles className="w-10 h-10 animate-pulse text-[#fdf4ff]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white leading-tight">Pronto para Jogar!</h3>
                  <p className="text-indigo-100/70 text-xs md:text-sm max-w-sm mx-auto">
                    Projete este painel no quadro. Clique em Sorteie para dar a primeira dica do conteúdo de Direito Autoral.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Draw Trigger bottom footer */}
        <div id="draw-footer" className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
          <div className="text-xs sm:text-sm text-indigo-100/85">
            Sorteados hoje: <strong className="text-white font-black underline underline-offset-2">{drawnTerms.length}</strong> / <strong className="text-white font-bold">{allTerms.length}</strong>
            <span className="block text-indigo-200/60 text-xs mt-0.5 font-mono">Faltam {remainingCount} conceitos para sortear.</span>
          </div>

          <button
            id="btn-draw-term"
            onClick={onDrawTerm}
            disabled={isGameFinished || remainingCount === 0}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white text-indigo-950 font-black tracking-wider uppercase text-xs hover:bg-white/95 active:scale-97 transition duration-155 disabled:bg-white/10 disabled:text-white/30 disabled:border-white/10 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-2xl border border-white/30 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-indigo-950 text-indigo-950" />
            SORTEAR CONCEITO
          </button>
        </div>

      </div>

      {/* SECTION 2: Right side - Active Students & drawn history */}
      <div className="space-y-6 flex flex-col justify-start">
        
        {/* Draw History List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl text-white space-y-4">
          <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2.5 border-b border-white/15 pb-3">
            <Layers className="w-4 h-4 text-pink-300" />
            Histórico ({drawnTerms.length})
          </h3>

          {drawnTerms.length === 0 ? (
            <div className="py-8 text-center text-white/50 text-xs italic">
              Nenhum sorteado ainda nesta rodada.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-2 custom-scrollbar flex flex-col-reverse">
              {drawnTerms.map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 duration-150 p-3 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[10px] bg-white/15 text-white font-bold rounded px-1.5 py-0.5 border border-white/10">
                      Nº {item.order}
                    </span>
                    <span className="text-xs font-semibold text-white truncate">{item.term}</span>
                  </div>
                  <span className="text-[9px] text-white/50 font-mono">
                    {item.drawnAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Classroom Lobby: Registered Student Cards */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl text-white space-y-4 flex-1">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2.5">
              <Users className="w-4 h-4 text-indigo-300" />
              Alunos Online ({activeCards.length})
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Sala Ativa
            </span>
          </div>

          {activeCards.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-white/30 mx-auto" />
              <p className="text-white/70 text-xs font-medium">Nenhum aluno entrou ainda.</p>
              <p className="text-indigo-200/50 text-[10px] leading-normal max-w-[200px] mx-auto space-y-2">
                Na aba &ldquo;Minha Cartela&rdquo;, o aluno digita o seu nome e cria sua cartela para participar.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {activeCards.map((card) => {
                const status = getCardStatus(card);
                return (
                  <div 
                    key={card.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition duration-200 ${
                      status.isBingo 
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-100" 
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[110px]">{card.ownerName}</span>
                        {status.isBingo && (
                          <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-bounce">
                            BINGO!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/60 font-mono">
                          {status.markedCount}/{status.totalCells} marcados
                        </span>
                        
                        {/* Progress bar */}
                        <div className="w-14 bg-white/10 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${status.isBingo ? 'bg-emerald-400' : 'bg-indigo-400'}`} 
                            style={{ width: `${(status.markedCount / status.totalCells) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        title="Ver Cartela detalhada"
                        onClick={() => setSelectedReviewCard(card)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </button>
                      <button
                        title="Verificar se venceu legalmente"
                        onClick={() => onVerifyCard(card.id)}
                        className="p-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/20 rounded-lg text-indigo-100 transition cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Review Modal Drawer for Teacher */}
      <AnimatePresence>
        {selectedReviewCard && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-indigo-950/95 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl max-w-md w-full flex flex-col max-h-[90vh] overflow-hidden text-white"
            >
              {/* Modal header */}
              <div className="p-5 border-b border-white/15 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2.5">
                  <Award className="text-amber-400 w-5 h-5 flex-shrink-0 animate-pulse" />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Cartela de {selectedReviewCard.ownerName}</h3>
                    <p className="text-[9px] text-indigo-200/60 font-mono tracking-wider">ID: {selectedReviewCard.id.slice(0, 10).toUpperCase()} • {selectedReviewCard.dimension}x{selectedReviewCard.dimension}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReviewCard(null)}
                  className="text-white hover:bg-white/10 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10 duration-150 uppercase cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              {/* Grid content */}
              <div className="p-6 overflow-y-auto space-y-5">
                <div 
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${selectedReviewCard.dimension}, minmax(0, 1fr))` }}
                >
                  {selectedReviewCard.grid.map((row, rIdx) => 
                    row.map((cell, cIdx) => {
                      const isDrawn = drawnTerms.some(t => t.term === cell.term);
                      return (
                        <div 
                          key={`${rIdx}-${cIdx}`}
                          className={`p-2.5 rounded-xl border text-center aspect-square flex flex-col justify-center items-center gap-1 transition-all ${
                            cell.marked 
                              ? "bg-indigo-500/30 border-indigo-300 text-white shadow-inner" 
                              : "bg-white/5 border-white/10 text-indigo-100/70"
                          }`}
                        >
                          <span className="text-[10px] font-black leading-tight truncate w-full">{cell.term}</span>
                          <span className={`text-[7.5px] font-black px-1 py-0.5 rounded-sm uppercase tracking-wider ${
                            isDrawn 
                              ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/30" 
                              : "bg-white/10 text-indigo-300/40"
                          }`}>
                            {isDrawn ? "Sort" : "Aguard"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="bg-indigo-900/40 p-4 rounded-2xl border border-indigo-700/30 space-y-1 text-xs text-indigo-200">
                  <span className="font-black block uppercase tracking-widest text-[9px] text-indigo-300 font-mono">INTEGRIDADE LEGAL DE DIREITO AUTORAL</span>
                  <p className="leading-relaxed font-semibold">
                    A marcação é considerada legalmente válida apenas se o termo selecionado foi disparado oficialmente pelo histórico oficial de regência do docente. Estude e evite o Plágio ou a Infração!
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                <button
                  onClick={() => {
                    onVerifyCard(selectedReviewCard.id);
                    setSelectedReviewCard(null);
                  }}
                  className="px-5 py-3 bg-white hover:bg-white/95 text-indigo-950 rounded-2xl text-xs font-black tracking-wider uppercase shadow-xl transition duration-150 cursor-pointer"
                >
                  Validar Vencedor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
