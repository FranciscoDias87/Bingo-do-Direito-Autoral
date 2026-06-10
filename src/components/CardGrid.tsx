import { useState, FormEvent } from "react";
import { BingoTerm, Cell, BingoCard, DrawnItem } from "../types";
import { BINGO_TERMS } from "../data";
import { 
  User, 
  RefreshCw, 
  Check, 
  FileSpreadsheet, 
  UserPlus, 
  CheckCheck,
  AlertCircle,
  Trophy,
  Gamepad2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CardGridProps {
  drawnTerms: DrawnItem[];
  activeCards: BingoCard[];
  onAddCard: (card: BingoCard) => void;
  onUpdateCardMarkings: (cardId: string, rowIndex: number, colIndex: number) => void;
  onRemoveCard: (cardId: string) => void;
  winnerName: string | null;
  onTriggerWinAnimation: (ownerName: string) => void;
  alertUser?: (title: string, msg: string) => void;
  confirmUser?: (title: string, msg: string, onConfirm: () => void) => void;
}

export default function CardGrid({
  drawnTerms,
  activeCards,
  onAddCard,
  onUpdateCardMarkings,
  onRemoveCard,
  winnerName,
  onTriggerWinAnimation,
  alertUser,
  confirmUser
}: CardGridProps) {
  const [studentName, setStudentName] = useState("");
  const [dimension, setDimension] = useState<number>(3); // 3 for 3x3 (ideal for fast classroom sessions)
  
  // Track selected active card for the user (to play with in this browser session)
  const [myCardId, setMyCardId] = useState<string | null>(() => {
    return localStorage.getItem("bingo_my_card_id");
  });

  // Find the user's active card object from list
  const currentActiveCard = activeCards.find(c => c.id === myCardId);

  // Quick check for bingo matches in standard layout
  const handleBingoDeclaration = () => {
    if (!currentActiveCard) return;

    // Check if the current card wins
    const wins = checkCardWins(currentActiveCard);
    
    if (wins) {
      onTriggerWinAnimation(currentActiveCard.ownerName);
    } else {
      if (alertUser) {
        alertUser("Ainda não!", "Ainda não completou uma linha, coluna ou diagonal cheia! Continue acompanhando os sorteios.");
      } else {
        alert("Ainda não completou uma linha, coluna ou diagonal cheia! Continue acompanhando os sorteios.");
      }
    }
  };

  const checkCardWins = (card: BingoCard) => {
    const dim = card.dimension;

    // Rows check
    for (let r = 0; r < dim; r++) {
      if (card.grid[r].every(cell => cell.marked)) return true;
    }

    // Cols check
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

    // Diagonal check
    let diag1 = true;
    let diag2 = true;
    for (let i = 0; i < dim; i++) {
      if (!card.grid[i][i].marked) diag1 = false;
      if (!card.grid[i][dim - 1 - i].marked) diag2 = false;
    }
    
    return diag1 || diag2;
  };

  // Generate a randomized grid of unique UI/UX terms
  const generateNewCard = (e: FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    // Shuffle terms
    const shuffled = [...BINGO_TERMS].sort(() => Math.random() - 0.5);
    const totalTermsNeeded = dimension * dimension;
    
    if (shuffled.length < totalTermsNeeded) {
      if (alertUser) {
        alertUser("Erro", "Não há termos salvos suficientes para gerar esta dimensão de cartela.");
      } else {
        alert("Não há termos salvos suficientes para gerar esta dimensão de cartela.");
      }
      return;
    }

    const selectedTerms = shuffled.slice(0, totalTermsNeeded);
    
    // Construct Grid
    const newGrid: Cell[][] = [];
    for (let r = 0; r < dimension; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < dimension; c++) {
        const termItem = selectedTerms[r * dimension + c];
        row.push({
          term: termItem.term,
          marked: false,
          called: false
        });
      }
      newGrid.push(row);
    }

    const newCard: BingoCard = {
      id: `bingo-${dimension}x${dimension}-${studentName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 100000)}`,
      ownerName: studentName.trim(),
      grid: newGrid,
      dimension: dimension
    };

    onAddCard(newCard);
    setMyCardId(newCard.id);
    localStorage.setItem("bingo_my_card_id", newCard.id);
  };

  // Check if a cell's term has indeed been drawn by the caller
  const isCellTermDrawn = (term: string) => {
    return drawnTerms.some(item => item.term === term);
  };

  const handleCellClick = (r: number, c: number) => {
    if (!currentActiveCard) return;
    onUpdateCardMarkings(currentActiveCard.id, r, c);
  };

  const handleAbandonCard = () => {
    if (currentActiveCard) {
      if (confirmUser) {
        confirmUser(
          "Trocar de Cartela",
          "Deseja mesmo sair desta cartela e criar outra? A sua cartela atual será descartada.",
          () => {
            onRemoveCard(currentActiveCard.id);
            setMyCardId(null);
            localStorage.removeItem("bingo_my_card_id");
          }
        );
      } else if (confirm("Deseja mesmo sair desta cartela e criar outra?")) {
        onRemoveCard(currentActiveCard.id);
        setMyCardId(null);
        localStorage.removeItem("bingo_my_card_id");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto text-white" id="student-grid-root">
      
      <AnimatePresence mode="wait">
        {!currentActiveCard ? (
          
          /* VIEW A: CREATE CARD FORM */
          <motion.div
            key="create-card-form"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl space-y-6 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-white/15 text-white rounded-2xl mx-auto flex items-center justify-center border border-white/20 shadow-lg animate-pulse">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Cogerador de Cartela</h3>
                <p className="text-indigo-100/70 text-xs md:text-sm leading-normal max-w-sm mx-auto mt-1">
                  Insira seu nome e escolha o tamanho para receber uma cartela aleatória baseada nas aulas de Direito Autoral.
                </p>
              </div>
            </div>

            {/* School classroom mobile device policy notice */}
            <div className="bg-indigo-950/40 border border-white/10 rounded-2xl p-4 flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-indigo-300 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest font-mono">📱 Restrição de Celular em Sala</span>
                <p className="text-indigo-200/80 text-xs leading-relaxed">
                  Não possui ou não pode usar celular na sala de aula? Sem problemas! O professor pode criar e **imprimir cartelas em lote offline** para jogar em papel pelo Modo Professor.
                </p>
              </div>
            </div>

            <form onSubmit={generateNewCard} className="space-y-5 pt-1">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-white/80 uppercase tracking-widest block font-mono">Nome do Aluno</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                  <input
                    id="input-student-name"
                    type="text"
                    required
                    placeholder="Ex: Ana Souza"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/12 border border-white/15 focus:border-white/40 rounded-xl font-bold focus:ring-2 focus:ring-white/10 duration-150 outline-hidden placeholder:text-white/30 text-sm text-white"
                  />
                </div>
              </div>

              {/* Grid difficulty configuration */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-white/80 uppercase tracking-widest block font-mono">Tamanho da Cartela</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-dim-3"
                    type="button"
                    onClick={() => setDimension(3)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      dimension === 3 
                        ? "border-white/60 bg-white text-indigo-950 shadow-2xl" 
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-xs uppercase tracking-wide">3x3 (Padrão)</span>
                      <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        dimension === 3 ? 'bg-indigo-100 text-indigo-800' : 'bg-white/10 text-indigo-200'
                      }`}>Rápido</span>
                    </div>
                    <span className={`text-[10px] leading-relaxed mt-2 ${dimension === 3 ? 'text-indigo-900/80 font-medium' : 'text-indigo-100/60'}`}>
                      Inovador e rápido! Menor tempo de partida.
                    </span>
                  </button>

                  <button
                    id="btn-dim-4"
                    type="button"
                    onClick={() => setDimension(4)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      dimension === 4 
                        ? "border-white/60 bg-white text-indigo-950 shadow-2xl" 
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-xs uppercase tracking-wide">4x4 (Avançado)</span>
                      <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        dimension === 4 ? 'bg-indigo-100 text-indigo-800' : 'bg-white/10 text-indigo-200'
                      }`}>Foco</span>
                    </div>
                    <span className={`text-[10px] leading-relaxed mt-2 ${dimension === 4 ? 'text-indigo-900/80 font-medium' : 'text-indigo-100/60'}`}>
                      Tradicional. Exige mais esforço intelectual.
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit trigger */}
              <button
                id="btn-generate-submit"
                type="submit"
                className="w-full bg-white text-indigo-920 font-black py-4 rounded-xl hover:bg-white/95 active:scale-98 transition duration-150 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-2xl cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-indigo-950" />
                GERAR MINHA CARTELA
              </button>
            </form>
          </motion.div>
        ) : (
          
          /* VIEW B: INTERACTIVE PLAYABLE BINGO CARD */
          <motion.div
            key="playable-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="space-y-6"
          >
            {/* User Header Info card */}
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/25 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 border border-white/20 text-indigo-200 rounded-xl">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-indigo-200/60 uppercase tracking-widest font-mono">Dono da Cartela</h4>
                  <span className="font-extrabold text-white text-sm">{currentActiveCard.ownerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-declare-bingo"
                  onClick={handleBingoDeclaration}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 border border-emerald-400/35 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center gap-2 animate-pulse cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-yellow-250 fill-yellow-250" />
                  GRITAR BINGO!
                </button>

                <button
                  id="btn-abandon-card"
                  onClick={handleAbandonCard}
                  className="p-2.5 border border-white/10 bg-white/10 text-indigo-200 hover:text-white hover:bg-red-650 rounded-xl transition cursor-pointer"
                  title="Apagar cartela e rascunhar outra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Printed Card Container with fully premium Frosted styling! */}
            <div className="bg-white/15 backdrop-blur-xl text-white rounded-3xl p-5 md:p-6 border border-white/25 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
              
              {/* Printed Header Design block */}
              <div className="flex justify-between items-center border-b border-white/15 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest font-mono">
                    DIREITO AUTORAL • UI/UX
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight">Bingo da Autoria</h3>
                </div>
                <div className="flex items-center gap-1">
                  {["B", "I", "N", "G", "O"].map((letter, i) => (
                    <span 
                      key={i} 
                      className="w-6 h-6 rounded bg-white/15 text-xs font-black text-center leading-6 text-indigo-100 border border-white/10 font-mono"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid cell layout */}
              <div 
                className="grid gap-2.5"
                style={{ gridTemplateColumns: `repeat(${currentActiveCard.dimension}, minmax(0, 1fr))` }}
              >
                {currentActiveCard.grid.map((row, rIdx) => 
                  row.map((cell, cIdx) => {
                    const drawn = isCellTermDrawn(cell.term);
                    return (
                      <button
                        key={`${rIdx}-${cIdx}`}
                        id={`cell-${rIdx}-${cIdx}`}
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        className={`relative aspect-square rounded-2xl border text-center p-2 flex flex-col justify-between items-center transition-all cursor-pointer focus:outline-hidden ${
                          cell.marked 
                            ? "bg-gradient-to-br from-indigo-500 to-indigo-650 border-white/40 text-white shadow-2xl" 
                            : drawn 
                              ? "bg-white/20 border-indigo-400 text-white hover:bg-white/30" 
                              : "bg-white/5 border-white/10 hover:bg-white/10 text-indigo-200/80 hover:text-white"
                        }`}
                      >
                        {/* Status indicators */}
                        <div className="w-full flex justify-between items-center text-[8px] font-mono font-black leading-none select-none">
                          <span className={`${cell.marked ? 'text-indigo-200' : 'text-indigo-200/55'}`}>R{rIdx + 1}C{cIdx + 1}</span>
                          {drawn && (
                            <span className="text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-1 rounded-sm uppercase scale-90 tracking-wider">
                              Sort
                            </span>
                          )}
                        </div>

                        {/* Mid Term Name */}
                        <span className="text-[10px] md:text-xs font-black leading-tight break-words select-none w-full max-h-[3.5em] overflow-hidden text-center block px-0.5 drop-shadow-sm">
                          {cell.term}
                        </span>

                        {/* Interactive Plastic Marker Chip */}
                        <div className="h-4 flex items-center justify-center">
                          <AnimatePresence>
                            {cell.marked && (
                              <motion.div
                                initial={{ scale: 0, rotate: -40 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-5 h-5 rounded-full bg-white/95 border-2 border-indigo-500 shadow-md flex items-center justify-center text-indigo-950 font-black"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Decorative background circle */}
                        {!cell.marked && drawn && (
                          <span className="absolute bottom-1 right-2 block w-1.5 h-1.5 rounded-full bg-white/80 animate-ping" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Dynamic printed Footer */}
              <div className="mt-4 border-t border-white/15 pt-3 flex justify-between items-center text-[10px] font-mono text-indigo-200/60">
                <span>Cód: <strong className="text-indigo-100">{currentActiveCard.id.slice(10, 24).toUpperCase()}</strong></span>
                <span>ID: {currentActiveCard.dimension}X{currentActiveCard.dimension}</span>
              </div>
            </div>

            {/* Helpful Student Companion - Guidelines */}
            <div className="bg-white/10 backdrop-blur-xl hover:bg-white/12 duration-200 rounded-2xl p-4 border border-white/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-300 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Guia de Jogo</h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed">
                  Fique atento às descrições sorteadas no painel do professor. Se a definição corresponder a algum termo na sua cartela, clique sobre ele para posicionar o <strong>chip de marcação</strong>. Quando completar uma linha, coluna ou diagonal, clique em <strong>Gritar Bingo!</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
