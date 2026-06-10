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
  Award,
  LogOut,
  Printer,
  BookOpen,
  ExternalLink
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
  onLogout?: () => void;
}

export default function CallerPanel({
  drawnTerms,
  allTerms,
  activeCards,
  onDrawTerm,
  onResetGame,
  onVerifyCard,
  isGameFinished,
  onLogout
}: CallerPanelProps) {
  const [speakOn, setSpeakOn] = useState(false);
  const [selectedReviewCard, setSelectedReviewCard] = useState<BingoCard | null>(null);

  // States for batch printing cards in classrooms without cellphones
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printCardCount, setPrintCardCount] = useState(20);
  const [printCardDimension, setPrintCardDimension] = useState(3);
  const [generatedPrintCards, setGeneratedPrintCards] = useState<BingoCard[]>([]);

  const handleGeneratePrintCards = () => {
    const cards: BingoCard[] = [];
    for (let i = 0; i < printCardCount; i++) {
      const shuffled = [...allTerms].sort(() => Math.random() - 0.5);
      const totalNeeded = printCardDimension * printCardDimension;
      const selectedTerms = shuffled.slice(0, totalNeeded);
      
      const grid: any[][] = [];
      for (let r = 0; r < printCardDimension; r++) {
        const row = [];
        for (let c = 0; c < printCardDimension; c++) {
          row.push({
            term: selectedTerms[r * printCardDimension + c].term,
            marked: false,
            called: false
          });
        }
        grid.push(row);
      }

      cards.push({
        id: `offline-${printCardDimension}x${printCardDimension}-${101 + i}`,
        ownerName: `Folha #${i + 1}`,
        grid,
        dimension: printCardDimension
      });
    }
    setGeneratedPrintCards(cards);
  };

  const handlePrint = () => {
    if (generatedPrintCards.length === 0) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    let cardsHtml = "";
    generatedPrintCards.forEach((card, idx) => {
      let gridCells = "";
      card.grid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
          gridCells += `
            <div style="border: 2px solid #000000; background: #fafafa; aspect-ratio: 1 / 1; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; min-height: 80px;">
              <span style="font-size: 8px; color: #94a3b8; align-self: flex-start;">R${rIdx + 1}C${cIdx + 1}</span>
              <span style="font-weight: 800; font-size: 13px; color: #000000; line-height: 1.25; margin: auto 0;">${cell.term}</span>
              <div style="width: 18px; height: 18px; border-radius: 50%; border: 1px dashed #64748b;"></div>
            </div>
          `;
        });
      });

      cardsHtml += `
        <div class="print-card-box" style="border: 3px solid #000000; border-radius: 12px; padding: 24px; margin-bottom: 40px; background: white; color: black; position: relative; page-break-inside: avoid; break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cccccc; padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 10px; font-weight: bold; color: #4f46e5; letter-spacing: 0.05em; text-transform: uppercase; display: block;">DIREITO AUTORAL • CURSO DE DESENVOLVIMENTO DE SISTEMAS</span>
              <h4 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 4px 0 0 0;">BINGO DE DIREITO AUTORAL • Cartela do Aluno</h4>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; color: #64748b; display: block;">Dimensão: ${card.dimension}x${card.dimension}</span>
              <span style="font-size: 12px; color: #4f46e5; font-weight: bold; display: block;">Folha #${idx + 1}</span>
            </div>
          </div>

          <div style="border-bottom: 1px solid #cccccc; padding-bottom: 4px; margin-bottom: 16px; font-size: 14px; font-weight: bold; color: #1e293b; font-style: italic;">
            Nome do Aluno: ___________________________________________________________
          </div>

          <div style="display: grid; gap: 8px; grid-template-columns: repeat(${card.dimension}, minmax(0, 1fr));">
            ${gridCells}
          </div>

          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cccccc; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748b;">
            <span>Código de Verificação: <strong>${card.id.slice(0, 15).toUpperCase()}</strong></span>
            <span>Aviso Legal: Não cometa Plágio! Respeite o direito intelectual.</span>
          </div>
        </div>
      `;

      if ((idx + 1) % 2 === 0 && (idx + 1) < generatedPrintCards.length) {
        cardsHtml += `<div style="page-break-after: always; break-after: page; height: 1px;"></div>`;
      }
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Cartelas - Bingo Direito Autoral</title>
        <meta charset="utf-8">
        <style>
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 30px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          @media print {
            body {
              padding: 0 !important;
            }
            .no-print-banner {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px; background: #e0f2fe; padding: 15px; border-radius: 12px; border: 1px solid #bae6fd;" class="no-print-banner">
            <h3 style="margin: 0; color: #0369a1;">Aba de Impressão Direta Ativa</h3>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #0284c7;">
              Se a janela de impressão não abrir automaticamente, pressione <strong>Ctrl + P</strong> (or Cmd + P no Mac) para imprimir.
            </p>
          </div>
          ${cardsHtml}
        </div>
        <script>
          setTimeout(function() {
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(fullHtml);
    printWindow.document.close();
  };

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

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-open-print-modal"
              onClick={() => {
                setShowPrintModal(true);
                setGeneratedPrintCards([]);
              }}
              className="px-3 py-2 rounded-xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500 hover:text-white transition duration-150 font-bold text-xs flex items-center gap-2 uppercase tracking-wide cursor-pointer"
              title="Gerar cartelas em lote para sala sem celular"
            >
              <Printer className="w-3.5 h-3.5 animate-bounce text-indigo-300" />
              <span>Gerar p/ Impressão 🖨️</span>
            </button>

            <button
              id="btn-toggle-audio"
              onClick={() => {
                setSpeakOn(!speakOn);
                if (!speakOn && currentDrawn) {
                  speakDefinition(currentDrawn.term, currentDrawn.description);
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 border uppercase ${
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
              className="px-3 py-2 rounded-xl border border-red-500/25 bg-red-950/30 text-red-200 hover:bg-red-900/40 hover:text-white transition duration-150 font-bold text-xs flex items-center gap-2 uppercase tracking-wide cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>

            {onLogout && (
              <button
                id="btn-teacher-logout-panel"
                onClick={onLogout}
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-red-500/30 hover:border-red-500/20 duration-150 font-bold text-xs flex items-center gap-1.5 uppercase cursor-pointer"
                title="Sair do painel e bloquear acesso"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            )}
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

      {/* Batch Cards Print Modal for Classrooms without cell phones */}
      <AnimatePresence>
        {showPrintModal && (
          <div id="print-modal-overlay" className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              id="print-modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/20 text-white rounded-3xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-2xl relative"
            >
              {/* Modal header (HIDDEN DURING PRINT) */}
              <div className="p-5 border-b border-white/15 flex items-center justify-between bg-white/5 no-print">
                <div className="flex items-center gap-2.5">
                  <Printer className="text-indigo-400 w-5 h-5 animate-pulse" />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Gerador e Impressor de Cartelas em Lote</h3>
                    <p className="text-[10px] text-indigo-200/60 font-mono uppercase tracking-wider">Para salas com restrição de celular</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-white hover:bg-white/10 text-xs font-bold px-3.5 py-2 rounded-xl border border-white/10 duration-150 uppercase"
                >
                  Fechar
                </button>
              </div>

              {/* Modal content body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                
                {/* Information banner for iframe environment (HIDDEN DURING PRINT) */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-200 no-print text-left">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center font-bold text-sm">
                    💡
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-black uppercase tracking-wider text-amber-300">Dica de Impressão (Navegador)</h5>
                    <p className="text-[11px] font-medium text-amber-200/90 leading-relaxed">
                      Se você estiver rodando no visualizador integrado do AI Studio, o navegador pode bloquear a janela de impressão direta por segurança. 
                    </p>
                    <p className="text-[11px] font-medium text-amber-200/90 leading-relaxed pt-1 flex flex-wrap items-center gap-2">
                      Se o botão de imprimir não reagir, clique aqui para abrir em tela inteira (o login continuará ativo automaticamente):
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-white px-3 py-1.5 rounded-lg border border-amber-500/30 font-black text-[10px] uppercase duration-150 tracking-wider shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir em Nova Aba 🚀
                      </a>
                    </p>
                  </div>
                </div>

                {/* Options panel (HIDDEN DURING PRINT) */}
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 no-print">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 font-mono">Configurar Impressão de Cartelas</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80">Quantidade de Alunos (Cartelas):</label>
                      <select
                        value={printCardCount}
                        onChange={(e) => setPrintCardCount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 pr-8 pl-3 py-2.5 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500/50 outline-hidden text-white cursor-pointer"
                      >
                        <option value={5} className="bg-slate-800 text-white font-bold">5 Cartelas</option>
                        <option value={10} className="bg-slate-800 text-white font-bold">10 Cartelas</option>
                        <option value={15} className="bg-slate-800 text-white font-bold">15 Cartelas</option>
                        <option value={20} className="bg-slate-800 text-white font-bold">20 Cartelas</option>
                        <option value={30} className="bg-slate-800 text-white font-bold">30 Cartelas</option>
                        <option value={40} className="bg-slate-800 text-white font-bold">40 Cartelas</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80">Dimensão da Cartela:</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPrintCardDimension(3)}
                          className={`py-2 rounded-xl border font-bold text-xs transition ${
                            printCardDimension === 3 ? "bg-white text-indigo-950 border-white" : "bg-white/5 hover:bg-white/10 border-white/10"
                          }`}
                        >
                          3x3 (Rápido)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintCardDimension(4)}
                          className={`py-2 rounded-xl border font-bold text-xs transition ${
                            printCardDimension === 4 ? "bg-white text-indigo-950 border-white" : "bg-white/5 hover:bg-white/10 border-white/10"
                          }`}
                        >
                          4x4 (Avançado)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleGeneratePrintCards}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-pink-200 fill-pink-200" />
                      Gerar {printCardCount} Combinatórias de Cartela
                    </button>
                  </div>
                </div>

                {/* Print area wrapper */}
                <div id="print-preview-container" className="space-y-6">
                  {/* Print custom stylesheet injection */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                      @page {
                        size: A4 portrait;
                        margin: 12mm 12mm 12mm 12mm;
                      }
                      body, html {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        height: auto !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      
                      /* Hide everything except the print modal box container */
                      #bingo-app-header, #bingo-app-nav, footer, #teacher-verification-gate {
                        display: none !important;
                        height: 0 !important;
                        overflow: hidden !important;
                        opacity: 0 !important;
                      }
                      #caller-panel-container > *:not(#print-modal-overlay) {
                        display: none !important;
                        height: 0 !important;
                        overflow: hidden !important;
                        opacity: 0 !important;
                      }

                      /* Transform fixed dark overlay modal into an inline page flow layout */
                      #print-modal-overlay {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        min-height: 100% !important;
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        overflow: visible !important;
                        z-index: 9999999 !important;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                      }

                      #print-modal-content {
                        width: 100% !important;
                        max-width: none !important;
                        height: auto !important;
                        max-height: none !important;
                        background: white !important;
                        color: black !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        overflow: visible !important;
                      }

                      /* Hide header, options panel, buttons and close actions during active print */
                      .no-print, button, select, header, footer {
                        display: none !important;
                        height: 0 !important;
                        width: 0 !important;
                        overflow: hidden !important;
                        opacity: 0 !important;
                      }

                      #print-preview-container {
                        width: 100% !important;
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        overflow: visible !important;
                      }

                      /* Beautiful black and white student cards block */
                      .print-card-box {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        border: 3px solid #000000 !important;
                        border-radius: 12px !important;
                        padding: 24px !important;
                        margin-bottom: 40px !important;
                        background: white !important;
                        color: black !important;
                        font-family: system-ui, -apple-system, sans-serif !important;
                        box-shadow: none !important;
                      }

                      .print-grid-cell {
                        border: 2px solid #000000 !important;
                        background: white !important;
                        color: black !important;
                        aspect-ratio: 1 / 1 !important;
                      }

                      .print-cell-text {
                        color: black !important;
                        font-weight: 800 !important;
                        font-size: 13px !important;
                        line-height: 1.25 !important;
                      }

                      .cut-guide {
                        display: flex !important;
                        border-top: 2px dashed #333333 !important;
                        margin: 25px 0 !important;
                        padding-top: 5px !important;
                      }
                    }
                  ` }} />

                  {generatedPrintCards.length === 0 ? (
                    <div className="py-12 text-center text-white/50 text-xs space-y-3 border-2 border-dashed border-white/10 rounded-2xl no-print">
                      <HelpCircle className="w-10 h-10 w-full text-indigo-300/40" />
                      <p>Nenhuma cartela em lote gerada ainda.</p>
                      <p className="text-[10px] text-white/40 max-w-sm mx-auto leading-relaxed px-4">
                        Selecione as opções acima e clique em Gerar para produzir a pré-visualização das cartelas diagramadas de Direito Autoral em P&B para impressão.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-4.5 py-3 rounded-xl no-print">
                        <span className="text-xs font-bold font-mono">✅ {generatedPrintCards.length} cartelas geradas com sucesso!</span>
                        <button
                          onClick={handlePrint}
                          className="px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase rounded-lg shadow-md duration-150 cursor-pointer flex items-center gap-1.5"
                        >
                          <Printer className="w-4 h-4" />
                          Imprimir {generatedPrintCards.length} Cartelas 🖨️
                        </button>
                      </div>

                      <div className="space-y-6">
                        {generatedPrintCards.map((card, idx) => (
                          <div key={card.id}>
                            <div className="bg-white text-slate-900 rounded-3xl p-6 border-3 border-double border-slate-600 shadow-xl print-card-box relative overflow-hidden">
                              <div className="flex justify-between items-center border-b border-dashed border-slate-300 pb-3 mb-4">
                                <div>
                                  <span className="text-[10px] font-bold text-indigo-600 font-mono tracking-wider uppercase block">DIREITO AUTORAL • CURSO DE DESENVOLVIMENTO DE SISTEMAS</span>
                                  <h4 className="text-base font-extrabold text-slate-800">BINGO DE DIREITO AUTORAL • Cartela do Aluno</h4>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-mono text-slate-400 block">ID: {card.dimension}x{card.dimension}</span>
                                  <span className="text-xs text-indigo-600 font-bold block">Folha #{idx + 1}</span>
                                </div>
                              </div>

                              <div className="mb-4">
                                <div className="border-b border-slate-300 flex items-end pb-1 text-sm font-bold text-slate-800 italic">
                                  Nome do Aluno: ___________________________________________________________
                                </div>
                              </div>

                              <div
                                className="grid gap-2"
                                style={{ gridTemplateColumns: `repeat(${card.dimension}, minmax(0, 1fr))` }}
                              >
                                {card.grid.map((row, r) =>
                                  row.map((cell, c) => (
                                    <div
                                      key={`${r}-${c}`}
                                      className="print-grid-cell border border-slate-300 bg-slate-50 aspect-square rounded-xl p-3 flex flex-col justify-between items-center text-center text-slate-850"
                                    >
                                      <span className="text-[8px] font-mono text-slate-400 select-none block self-start">R{r+1}C{c+1}</span>
                                      <span className="print-cell-text text-[10px] md:text-xs font-bold leading-tight break-words py-1 block my-auto text-slate-900">
                                        {cell.term}
                                      </span>
                                      <div className="w-5 h-5 rounded-full border border-dashed border-slate-400 text-[10px] block" />
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="mt-4 pt-3 border-t border-dashed border-slate-250 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                                <span>Código de Verificação: <strong>{card.id.slice(0, 15).toUpperCase()}</strong></span>
                                <span>Aviso Legal: Não cometa Plágio! Respeite o direito intelectual.</span>
                              </div>
                            </div>

                            {/* Scissor cutting line guide dynamically printed */}
                            {(idx + 1) < generatedPrintCards.length && (idx + 1) % 2 !== 0 && (
                              <div className="border-t-2 border-dashed border-slate-400/50 my-6 pt-1 flex justify-center items-center gap-2 text-slate-400 text-[10px] uppercase font-mono no-print cut-guide select-none">
                                <span>✂️ Dobra ou Recorte de Folha (Imprimir Máx: 2 por folha A4) ✂️</span>
                              </div>
                            )}

                            {/* Page breaks strictly after every 2 cards */}
                            {(idx + 1) % 2 === 0 && (idx + 1) < generatedPrintCards.length && (
                              <div className="hidden print:block" style={{ pageBreakAfter: 'always', breakAfter: 'page' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Modal footer (HIDDEN DURING PRINT) */}
              <div className="p-5 border-t border-white/10 bg-slate-950 flex justify-end gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-5 py-3 border border-white/15 hover:bg-white/5 rounded-2xl text-xs font-bold uppercase transition"
                >
                  Voltar ao Painel
                </button>
                {generatedPrintCards.length > 0 && (
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-indigo-950 rounded-2xl text-xs font-black tracking-wider uppercase shadow-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-indigo-950" />
                    Enviar para Impressora 🖨️
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
