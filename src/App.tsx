import { useState, useEffect, FormEvent } from "react";
import { BingoCard, DrawnItem, Cell } from "./types";
import { BINGO_TERMS } from "./data";
import Instructions from "./components/Instructions";
import CallerPanel from "./components/CallerPanel";
import CardGrid from "./components/CardGrid";
import { 
  GraduationCap, 
  Gamepad2, 
  Tv2, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  X, 
  Maximize2,
  Award,
  Crown,
  Lock,
  Unlock,
  KeyRound,
  Mail,
  LogOut,
  ShieldAlert,
  Smartphone,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"student" | "teacher" | "study">("study");

  const [isTeacherVerified, setIsTeacherVerified] = useState<boolean>(() => {
    return localStorage.getItem("bingo_is_teacher_verified") === "true";
  });

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert"
  });

  const showCustomAlert = (title: string, message: string) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type: "alert"
    });
  };

  const showCustomConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm
    });
  };

  const handleVerifyTeacher = (): void => {
    setIsTeacherVerified(true);
    localStorage.setItem("bingo_is_teacher_verified", "true");
  };

  const handleTeacherLogout = () => {
    showCustomConfirm(
      "Confirmar Saída",
      "Deseja mesmo sair do Painel do Professor e bloquear o acesso?",
      () => {
        setIsTeacherVerified(false);
        localStorage.removeItem("bingo_is_teacher_verified");
      }
    );
  };

  // Load drawing history and cards list from localStorage
  const [drawnTerms, setDrawnTerms] = useState<DrawnItem[]>(() => {
    const saved = localStorage.getItem("bingo_drawn_terms");
    if (saved) {
      try {
        const decoded = JSON.parse(saved);
        return decoded.map((item: any) => ({
          ...item,
          drawnAt: new Date(item.drawnAt)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeCards, setActiveCards] = useState<BingoCard[]>(() => {
    const saved = localStorage.getItem("bingo_active_cards");
    return saved ? JSON.parse(saved) : [];
  });

  const [celebrationWinner, setCelebrationWinner] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("bingo_drawn_terms", JSON.stringify(drawnTerms));
  }, [drawnTerms]);

  useEffect(() => {
    localStorage.setItem("bingo_active_cards", JSON.stringify(activeCards));
  }, [activeCards]);

  // Handle single term drawing from remaining pool
  const handleDrawTerm = () => {
    const remainingTerms = BINGO_TERMS.filter(
      termItem => !drawnTerms.some(drawn => drawn.term === termItem.term)
    );

    if (remainingTerms.length === 0) {
      showCustomAlert("Sorteio Concluído", "Todos os conceitos já foram sorteados!");
      return;
    }

    // Pick a random term
    const randomIndex = Math.floor(Math.random() * remainingTerms.length);
    const chosenTerm = remainingTerms[randomIndex];

    const newDrawn: DrawnItem = {
      term: chosenTerm.term,
      description: chosenTerm.description,
      drawnAt: new Date(),
      order: drawnTerms.length + 1
    };

    setDrawnTerms([...drawnTerms, newDrawn]);
  };

  // Full session clean/restart
  const handleResetGame = () => {
    showCustomConfirm(
      "Reiniciar Partida",
      "Tens a certeza que desejas apagar o histórico de sorteios e reiniciar a partida de Bingo do Direito Autoral?",
      () => {
        setDrawnTerms([]);
        setCelebrationWinner(null);
        
        // Clean marked flags of active cards to keep same names but fresh boards
        const cleanedCards = activeCards.map(card => {
          const cleanedGrid = card.grid.map(row => 
            row.map(cell => ({ ...cell, marked: false }))
          );
          return {
            ...card,
            grid: cleanedGrid,
            winChecked: false,
            isWinner: false
          };
        });

        setActiveCards(cleanedCards);
      }
    );
  };

  // Student adds their card layout to register lobby
  const handleAddCard = (newCard: BingoCard) => {
    // Avoid double registration of same owner
    const filtered = activeCards.filter(c => c.ownerName.toLowerCase() !== newCard.ownerName.toLowerCase());
    setActiveCards([...filtered, newCard]);
  };

  const handleRemoveCard = (cardId: string) => {
    setActiveCards(activeCards.filter(c => c.id !== cardId));
  };

  // Toggle cell marked status on students grid
  const handleUpdateCardMarkings = (cardId: string, rowIndex: number, colIndex: number) => {
    const updated = activeCards.map(card => {
      if (card.id === cardId) {
        const gridCopy = card.grid.map((row, r) => 
          row.map((cell, c) => {
            if (r === rowIndex && c === colIndex) {
              return { ...cell, marked: !cell.marked };
            }
            return cell;
          })
        );
        return { ...card, grid: gridCopy, winChecked: false };
      }
      return card;
    });
    setActiveCards(updated);
  };

  // Teacher or Student validates a card ID
  const handleVerifyCard = (cardId: string) => {
    const card = activeCards.find(c => c.id === cardId);
    if (!card) {
      showCustomAlert("Erro", "Cartela não localizada!");
      return;
    }

    // A cell is validly marked only if the term was actually drawn
    let hasIllegalMarkings = false;
    let correctMarkingCount = 0;
    let totalCellsCount = card.dimension * card.dimension;

    card.grid.forEach(row => {
      row.forEach(cell => {
        const beenDrawn = drawnTerms.some(t => t.term === cell.term);
        if (cell.marked) {
          if (!beenDrawn) {
            hasIllegalMarkings = true;
          } else {
            correctMarkingCount++;
          }
        }
      });
    });

    // Check lines, columns and diagonals
    const isWinnerText = checkGenericCardWinner(card) ? "VENCEDOR!" : "AINDA NÃO GANHOU";

    if (hasIllegalMarkings) {
      showCustomAlert(
        "Pendência de Integridade",
        `Atenção: A cartela de ${card.ownerName} possui termos marcados que AINDA não foram sorteados pelo professor! Verifique com atenção.`
      );
    } else if (checkGenericCardWinner(card)) {
      setCelebrationWinner(card.ownerName);
      
      // Update state
      setActiveCards(activeCards.map(c => {
        if (c.id === cardId) {
          return { ...c, winChecked: true, isWinner: true };
        }
        return c;
      }));
    } else {
      showCustomAlert(
        "Verificação Concluída",
        `Verificação para ${card.ownerName}:\n- Acertos válidos: ${correctMarkingCount}/${totalCellsCount}\n- Status: Ainda faltam mais sorteios para fechar uma linha, coluna ou diagonal!`
      );
    }
  };

  // Helper inside Verification flow
  const checkGenericCardWinner = (card: BingoCard) => {
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
  };

  const handleTriggerWinAnimation = (ownerName: string) => {
    setCelebrationWinner(ownerName);
  };

  return (
    <div className="min-h-screen flex flex-col justify-start pb-12 relative overflow-x-hidden">
      {/* Dynamic Ambient Background neon blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-40 right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* TOP HEADER: School branding, Subject, Title */}
      <header className="container mx-auto px-4 pt-6 md:pt-8 pb-4" id="bingo-app-header">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-white/10 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-white/20 shadow-2xl text-white">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="p-3 bg-white/15 backdrop-blur-md text-white rounded-2xl shadow-lg border border-white/20 flex-shrink-0 animate-pulse">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <span className="text-[10px] font-mono font-bold bg-indigo-500/30 text-white/90 border border-indigo-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Desenvolvimento de Sistemas
                </span>
                <span className="text-[10px] font-mono font-bold bg-white/15 text-white/90 border border-white/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Aula 09 • UI/UX
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1.5 drop-shadow-xs">
                Bingo do Direito Autoral
              </h1>
            </div>
          </div>

          {/* Quick Stats right block */}
          <div className="flex gap-4 items-center">
            <div className="text-center md:text-right hidden sm:block">
              <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest font-mono">LOBBY DA SALA</span>
              <p className="text-sm font-extrabold text-white">{activeCards.length} Alunos Online</p>
            </div>
            <div className="h-8 w-px bg-white/25 hidden sm:block" />
            <div className="text-center md:text-right">
              <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest font-mono">CONCEITOS DA AULA</span>
              <p className="text-sm font-extrabold text-[#fdf4ff] underline decoration-indigo-400 decoration-2 underline-offset-4">{drawnTerms.length} / {BINGO_TERMS.length} Sorteados</p>
            </div>
          </div>
        </div>
      </header>

      {/* CORE INTERACTIVE APP NAVIGATION BAR */}
      <nav className="container mx-auto px-4 max-w-5xl my-4">
        <div className="flex bg-white/10 backdrop-blur-xl p-1 rounded-2xl gap-2 border border-white/20 shadow-2xl">
          <button
            id="tab-study"
            onClick={() => setActiveTab("study")}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition duration-240 flex items-center justify-center gap-2 ${
              activeTab === "study"
                ? "bg-white text-indigo-950 shadow-xl"
                : "text-white/80 hover:text-white hover:bg-white/15"
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === "study" ? "text-indigo-600" : "text-indigo-200"}`} />
            <span className="hidden sm:inline">1. Estudar Conteúdo</span>
            <span className="sm:hidden">1. Estudar</span>
          </button>

          <button
            id="tab-student"
            onClick={() => setActiveTab("student")}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition duration-240 flex items-center justify-center gap-2 ${
              activeTab === "student"
                ? "bg-white text-indigo-950 shadow-xl"
                : "text-white/80 hover:text-white hover:bg-white/15"
            }`}
          >
            <Gamepad2 className={`w-4 h-4 ${activeTab === "student" ? "text-indigo-600" : "text-purple-200"}`} />
            <span className="hidden sm:inline">2. Minha Cartela</span>
            <span className="sm:hidden">2. Cartela</span>
          </button>

          <button
            id="tab-teacher"
            onClick={() => setActiveTab("teacher")}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition duration-240 flex items-center justify-center gap-2 ${
              activeTab === "teacher"
                ? "bg-white text-indigo-950 shadow-xl"
                : "text-white/80 hover:text-white hover:bg-white/15"
            }`}
          >
            {isTeacherVerified ? (
              <Tv2 className={`w-4 h-4 ${activeTab === "teacher" ? "text-indigo-600" : "text-pink-200"}`} />
            ) : (
              <Lock className={`w-4 h-4 ${activeTab === "teacher" ? "text-red-500" : "text-amber-200 animate-pulse"}`} />
            )}
            <span className="hidden sm:inline">3. Modo Professor {isTeacherVerified ? "(Sorteio)" : "🔒"}</span>
            <span className="sm:hidden">3. Professor {isTeacherVerified ? "" : "🔒"}</span>
          </button>
        </div>
      </nav>

      {/* BODY CONTENT VIEWPORT */}
      <main className="container mx-auto px-4 max-w-5xl flex-1 mt-2">
        <AnimatePresence mode="wait">
          {activeTab === "study" && (
            <motion.div
              key="study-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              <Instructions />
            </motion.div>
          )}

          {activeTab === "student" && (
            <motion.div
              key="student-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              <CardGrid 
                drawnTerms={drawnTerms}
                activeCards={activeCards}
                onAddCard={handleAddCard}
                onUpdateCardMarkings={handleUpdateCardMarkings}
                onRemoveCard={handleRemoveCard}
                winnerName={celebrationWinner}
                onTriggerWinAnimation={handleTriggerWinAnimation}
                alertUser={showCustomAlert}
                confirmUser={showCustomConfirm}
              />
            </motion.div>
          )}

          {activeTab === "teacher" && (
            <motion.div
              key="teacher-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {!isTeacherVerified ? (
                <TeacherLoginGate onVerify={handleVerifyTeacher} />
              ) : (
                <CallerPanel 
                  drawnTerms={drawnTerms}
                  allTerms={BINGO_TERMS}
                  activeCards={activeCards}
                  onDrawTerm={handleDrawTerm}
                  onResetGame={handleResetGame}
                  onVerifyCard={handleVerifyCard}
                  isGameFinished={drawnTerms.length === BINGO_TERMS.length}
                  onLogout={handleTeacherLogout}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* CELEBRATION WINNER MODAL / OVERLAY COMPONENT */}
      <AnimatePresence>
        {celebrationWinner && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            
            {/* Visual Confetti-like floating objects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 25 }).map((_, i) => {
                const colors = ["#818cf8", "#34d399", "#f59e0b", "#f43f5e", "#22d3ee"];
                const randomColor = colors[i % colors.length];
                return (
                  <motion.div
                    key={i}
                    initial={{ 
                      y: -50, 
                      x: Math.random() * window.innerWidth,
                      rotate: 0,
                      scale: Math.random() * 0.6 + 0.4
                    }}
                    animate={{ 
                      y: window.innerHeight + 100,
                      x: `calc(${Math.random() * 100}vw)`,
                      rotate: 360,
                    }}
                    transition={{ 
                      duration: Math.random() * 3 + 2, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute w-4 h-4 rounded-sm"
                    style={{ backgroundColor: randomColor }}
                  />
                );
              })}
            </div>

            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-10 max-w-lg w-full text-center border-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.4)] relative"
            >
              <button
                id="btn-close-celebration"
                onClick={() => setCelebrationWinner(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 duration-150"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                
                {/* Shiny Trophy */}
                <div className="relative mx-auto w-24 h-24 bg-yellow-100 rounded-full border-4 border-yellow-300 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-yellow-500 fill-yellow-200 animate-bounce" />
                  <Crown className="w-8 h-8 text-amber-500 absolute -top-4 left-1/2 -translate-x-1/2 -rotate-12" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-0 animate-ping" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full uppercase">
                    VALIDAÇÃO CONCLUÍDA LEGALMENTE!
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-2">
                    BINGO!
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Grande feito intelectual na Aula de Fundamentos de UI/UX!
                  </p>
                </div>

                {/* Winner Name Banner */}
                <div className="bg-yellow-50 py-4 px-6 rounded-2xl border-2 border-yellow-200 inline-block font-black text-2xl text-yellow-950 tracking-tight">
                  🏆 {celebrationWinner} 🏆
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 leading-normal max-w-sm mx-auto">
                  A cartela passou na validação de integridade. Todos os termos marcados corresponderam ao histórico oficial do professor! Sinta-se orgulhoso pela sua compreensão do Direito Autoral em produtos digitais.
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                  <button
                    id="btn-win-continue"
                    onClick={() => setCelebrationWinner(null)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition duration-150"
                  >
                    Olhar Cartela
                  </button>
                  <button
                    id="btn-win-restart"
                    onClick={() => {
                      setCelebrationWinner(null);
                      setDrawnTerms([]);
                    }}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition duration-150 shadow-md shadow-indigo-100"
                  >
                    Iniciar Nova Partida
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* School Footer Design Element */}
      <footer className="mt-auto pt-10 text-center text-[10px] text-slate-400 font-mono tracking-widest uppercase pb-4">
        © Curso Técnico de Desenvolvimento de Sistemas • Piauí Governo do Estado
      </footer>

      {/* CUSTOM NON-BLOCKING ALERT AND CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {dialogState.isOpen && (
          <div id="custom-dialog-overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-5"
            >
              <div className="space-y-2 text-left">
                <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                  {dialogState.title}
                </h3>
                <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                  {dialogState.message}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {dialogState.type === "confirm" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
                      className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-[10px] font-bold uppercase hover:bg-white/10 duration-150 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDialogState(prev => ({ ...prev, isOpen: false }));
                        if (dialogState.onConfirm) dialogState.onConfirm();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase shadow-lg duration-150 cursor-pointer"
                    >
                      Confirmar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase duration-150 cursor-pointer"
                  >
                    OK
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

function TeacherLoginGate({ onVerify }: { onVerify: () => void }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneNumber, setPhoneNumber] = useState("(86) 99401-2026");
  const [smsCode, setSmsCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stealthMode, setStealthMode] = useState(true); // Projector protection mode
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  const handleSendSms = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro de rede ao solicitar envio.");
      }

      const data = await response.json();
      if (data.sentRealSms) {
        setSuccessMessage(`Mensagem REAL de texto enviada com sucesso para ${phoneNumber}!`);
        setGeneratedCode(""); // hide from sandbox simulated display since real carrier send was successful
      } else {
        setGeneratedCode(data.code || "");
        if (data.errorDetails) {
          if (data.errorDetails.includes("Configuracoes do Twilio ausentes")) {
            setError(`Configuração do Twilio necessária para envio de SMS Real. O código de segurança foi carregado com sucesso no simulador de celular à direita.`);
          } else {
            setError(`O Twilio retornou um alerta: "${data.errorDetails}". Isso geralmente ocorre porque a sua conta Twilio é de testes (Trial) e o celular destino não foi cadastrado como verificado na plataforma deles. Entretanto, para sua aula continuar, seu código de acesso já foi gerado e exibido no simulador do celular à direita!`);
          }
        } else {
          setError(`Modo simulado ativo. O código foi carregado no simulador de celular à direita.`);
        }
      }
      setStep("code");
    } catch (err: any) {
      setError(err.message || "Erro ao conectar-se ao servidor de verificação.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, code: smsCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Código inválido.");
      }

      const data = await response.json();
      if (data.success) {
        onVerify();
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar validação.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-white mt-4 grid grid-cols-1 md:grid-cols-12 gap-6" id="teacher-verification-gate">
      
      {/* LEFT COLUMN: Main login card (8-span) */}
      <div className="md:col-span-7 bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <div className="text-center md:text-left space-y-2 mb-6">
            <div className="w-14 h-14 bg-white/10 text-white border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-7 h-7 text-indigo-300 animate-pulse" />
            </div>
            <div className="pt-2">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Área do Professor 🔒
              </h3>
              <p className="text-indigo-100/70 text-xs md:text-sm leading-normal mt-1">
                Para garantir que estudantes não tenham acesso ao sorteador (já que estão proibidos de usar celular na sala), autentique-se via mensagem de texto (SMS).
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.form
                key="step-phone"
                onSubmit={handleSendSms}
                className="space-y-4"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/80 uppercase tracking-widest block font-mono">
                    Celular do Professor Chico Dias
                  </label>
                  <p className="text-[10px] text-indigo-200/50 -mt-1 italic">
                    O código SMS será enviado para o celular pré-cadastrado do docente.
                  </p>
                  <div className="relative pt-1">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/70" />
                    <input
                      id="input-teacher-sms-phone"
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Ex: (86) 99401-2026"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 focus:border-white/40 rounded-xl font-bold focus:ring-2 focus:ring-white/10 duration-150 outline-hidden text-sm text-white"
                    />
                  </div>
                </div>

                <button
                  id="btn-teacher-submit-phone"
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-white text-indigo-950 font-black py-4 rounded-xl hover:bg-indigo-50 active:scale-98 transition duration-150 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin" />
                      <span>Transmitindo p/ Rede Móvel...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-indigo-950" />
                      <span>Enviar Código por SMS 📱</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step-code"
                onSubmit={handleVerifyCode}
                className="space-y-4"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.15 }}
              >
                {successMessage && (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {error && (
                  <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 p-3 rounded-xl text-[11px] leading-relaxed flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-white/80 uppercase tracking-widest block font-mono">
                      Código de 6 dígitos recebido
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="text-[10px] text-indigo-300 font-bold hover:underline"
                    >
                      Alterar celular
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/70" />
                    <input
                      id="input-teacher-sms-code"
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Digite os 6 números"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 focus:border-white/40 rounded-xl font-bold focus:ring-2 focus:ring-white/10 duration-150 outline-hidden tracking-widest text-base text-white placeholder:tracking-normal placeholder:text-sm"
                    />
                  </div>
                </div>

                <button
                  id="btn-teacher-submit-otp"
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-emerald-500 text-[#090d16] font-black py-4 rounded-xl hover:bg-emerald-400 active:scale-98 transition duration-150 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-2xl cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Validando código...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirmar e Liberar Sorteador 🔓</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-indigo-950/40 p-3.5 rounded-2xl border border-white/10 text-xs text-indigo-200 mt-6 md:mt-4 space-y-1">
          <p className="leading-relaxed font-semibold text-center">
            🔒 Acesso Docente Privativo: <strong className="text-white">Prof. Chico Dias</strong>
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Simulator Appartment (5-span) - Provides the mock SMS phone */}
      <div className="md:col-span-5 flex flex-col justify-start">
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-4 shadow-2xl space-y-4 text-left relative overflow-hidden flex flex-col">
          {/* Top Speaker phone bar */}
          <div className="flex justify-center items-center gap-1.5 pb-2 border-b border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
            <span className="text-[9px] font-mono text-slate-500 ml-auto">Rede: GOV-PI</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">SIMULADOR DE TELEFONE CELULAR</span>
            </div>

            <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5 space-y-3 text-xs leading-relaxed relative">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-300">
                <MessageSquare className="w-3 h-3" />
                <span>Aplicativo Mensagens • Agora</span>
              </div>

              {generatedCode ? (
                <div className="space-y-2">
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    SMS de <strong className="text-white">BINGO-AUTORAL</strong>:
                  </p>
                  
                  {/* Stealth Mode / Projector protection toggle */}
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 text-center relative overflow-hidden">
                    {stealthMode ? (
                      <div>
                        {isCodeVisible ? (
                          <div className="space-y-1.5">
                            <span className="text-xl font-mono font-black text-emerald-400 tracking-widest block select-all">
                              {generatedCode}
                            </span>
                            <span className="text-[8px] text-slate-400 block font-sans">Este é o seu código de acesso</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-lg font-mono font-black text-amber-300 tracking-widest block select-none">
                              ••••••
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCodeVisible(true);
                                setTimeout(() => setIsCodeVisible(false), 9000); // auto-hide for security
                              }}
                              className="text-[9px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded font-bold uppercase text-indigo-300 tracking-wide mt-1 cursor-pointer"
                            >
                              👁️ Revelar Código (Stealth para Projetor)
                            </button>
                            <span className="text-[8px] text-yellow-300/60 block leading-tight pt-1">
                              ⚠️ Esconda o projetor ou use a revelação rápida de 9s se estiver transmitindo à sala!
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <span className="text-xl font-mono font-black text-emerald-400 tracking-widest block">
                          {generatedCode}
                        </span>
                        <span className="text-[8px] text-indigo-200/55 block">Código Dinâmico Livre</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[9px] text-slate-400 leading-normal italic text-center">
                    "Professor Chico Dias, insira este token para obter os privilégios da regência do Bingo."
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500 space-y-1">
                  <p className="font-semibold text-[11px]">Nenhuma nova mensagem na tela</p>
                  <p className="text-[9px] leading-relaxed text-slate-600">
                    Se você possuir credenciais do Twilio configuradas, o SMS real já foi despachado para a operadora do seu celular! Caso contrário, o código aparecerá aqui como fallback.
                  </p>
                </div>
              )}
            </div>

            {/* Simulated hardware controls */}
            <div className="pt-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white transition select-none">
                <input
                  type="checkbox"
                  checked={stealthMode}
                  onChange={(e) => setStealthMode(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Modo Projetor (Proteção)</span>
              </label>
              
              <span className="text-[8px] font-mono text-slate-500">Vol+ Vol-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
