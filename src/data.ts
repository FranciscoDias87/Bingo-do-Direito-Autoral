import { BingoTerm } from "./types";

export const BINGO_TERMS: BingoTerm[] = [
  {
    id: "term-1",
    term: "Direito Autoral",
    description: "Ramo jurídico que garante proteção às criações intelectuais contra cópias não autorizadas e plágio na indústria digital."
  },
  {
    id: "term-2",
    term: "Originalidade",
    description: "Valor do design que não significa necessariamente reinventar a roda, mas sim reinterpretar inovando sobre o que já existe."
  },
  {
    id: "term-3",
    term: "Plágio",
    description: "Cópia não autorizada ou imitação fraudulenta de elementos artísticos, visuais ou interativos de autoria alheia."
  },
  {
    id: "term-4",
    term: "Usabilidade",
    description: "Fator crucial de UX que vai além da aparência estética; trata da eficácia e facilidade com que as pessoas interagem com o sistema."
  },
  {
    id: "term-5",
    term: "Arquitetura de Informação",
    description: "Organização conceitual da informação por trás das telas, dos fluxos e diagramações, que é passível de proteção legal."
  },
  {
    id: "term-6",
    term: "Ricardo Martins",
    description: "Designer que usou registros de autoria para processar uma grande empresa de pagamentos, provando plágio de seu projeto de interface."
  },
  {
    id: "term-7",
    term: "Avctoris Copyright",
    description: "A empresa de registro e proteção de direitos autorais que deu suporte de documentação oficial ao designer Ricardo Martins."
  },
  {
    id: "term-8",
    term: "Stone Pagamentos",
    description: "Corporação que enfrentou disputas legais por plágio de design de interface de máquina de transações, sendo responsabilizada."
  },
  {
    id: "term-9",
    term: "Kenjiro Sano",
    description: "Designer japonês que teve o uso do seu logotipo suspenso após acusações fundamentadas de plágio no cenário internacional."
  },
  {
    id: "term-10",
    term: "Olimpíadas de Tóquio 2020",
    description: "Evento global que sofreu com suspensão de identidade visual devido ao plágio da mascote/emblema, mostrando a relevância internacional do direito autoral."
  },
  {
    id: "term-11",
    term: "Designer Belga",
    description: "O profissional criador que notificou plagiarismo e contestou legalmente a autoria do logotipo japonês de Tóquio 2020."
  },
  {
    id: "term-12",
    term: "Registro Prévio",
    description: "Medida essencial que documenta cada insight, esboço e decisão criativa, gerando comprovação robusta em disputas judiciais."
  },
  {
    id: "term-13",
    term: "Processo Criativo",
    description: "Toda a trajetória do designer, estendendo-se dos primeiros esboços e rascunhos em papel até a iteração final da interface."
  },
  {
    id: "term-14",
    term: "Ilustrações",
    description: "Desenhos e artes visuais originais criados pelo profissional para compor e dar vida à estética da interface do produto."
  },
  {
    id: "term-15",
    term: "Animações e Áudio",
    description: "Elementos de movimento e áudio que enriquecem e dão fluidez à experiência de interações nas telas e também são protegidos."
  },
  {
    id: "term-16",
    term: "Esboços Iniciais",
    description: "Rascunhos e wireframes iniciais (drafts) que documentam a tese evolutiva e a autoria inicial de um design de telas."
  },
  {
    id: "term-17",
    term: "Personalidade da Marca",
    description: "Elemento abstrato de identidade e tom que expressa a essência de um produto digital e ajuda no engajamento dos usuários."
  },
  {
    id: "term-18",
    term: "Padrões de Interação",
    description: "Fórmulas de layout e de comportamento interativo que guiam o utilizador na navegação e são protegidas se tiverem expressão criativa singular."
  },
  {
    id: "term-19",
    term: "Acessibilidade",
    description: "Capacidade da interface de incluir e acolher todas as pessoas, fundamental em UI/UX para gerar engajamento humano legítimo."
  },
  {
    id: "term-20",
    term: "Relações Contratuais",
    description: "Esfera que define formalmente os direitos e deveres das partes em projetos de design, evitando desentendimentos futuros."
  },
  {
    id: "term-21",
    term: "Direitos e Deveres",
    description: "Responsabilidades estabelecidas em contratos de UI/UX, esclarecendo a quem pertence o código e a autoria intelectual."
  },
  {
    id: "term-22",
    term: "Integridade da Interação",
    description: "A preservação de toda a jornada lógica, fluxo de informações e experiência do consumidor de uma cópia descarada."
  },
  {
    id: "term-23",
    term: "Conexão Emocional",
    description: "Vínculo gerado pela originalidade e profundidade do UX que diferencia o produto no mercado e o torna memorável."
  },
  {
    id: "term-24",
    term: "Aula 09 - Direito Autoral em UI/UX",
    description: "Tema central e identificação desta atividade didática para o Curso Técnico de Desenvolvimento de Sistemas."
  }
];

export interface StudySection {
  title: string;
  pageNumber: string;
  summary: string;
  keyTakeaways: string[];
}

export const STUDY_SECTIONS: StudySection[] = [
  {
    title: "Desafios do Direito Autoral em UI/UX",
    pageNumber: "Página 3",
    summary: "O design moderno de interfaces lida com a complexidade de proteger não apenas a estética (aparência), mas a interação, usabilidade, arquitetura da informação e relações contratuais. A originalidade não é reinventar a roda, mas sim reinterpretar e propor caminhos autênticos sob preceitos éticos.",
    keyTakeaways: [
      "Proteção além da aparência superficial",
      "Garantia de usabilidade e conexão emocional do usuário",
      "Desafios com proliferação de ferramentas de compartilhamento fácil de assets",
      "Definição contratual clara de direitos para evitar disputas no futuro"
    ]
  },
  {
    title: "O Que Pode Ser Registrado?",
    pageNumber: "Página 4",
    summary: "O escopo de proteção do direito autoral no design digital é amplo e cobre todo o ecossistema criativo. Desde os primeiros rascunhos até o produto interativo final.",
    keyTakeaways: [
      "Designs de aplicativos completos e layouts de telas",
      "Arquitetura de dados, fluxos de informação e navegação",
      "Elementos artísticos: ilustrações, fotografias originais, músicas e vídeos",
      "Animações sutis e transações que enriquecem e direcionam a experiência",
      "Padrões de interação, organização de conteúdo e personalidade da marca"
    ]
  },
  {
    title: "Estudo de Caso: Ricardo Martins vs. Stone",
    pageNumber: "Página 5",
    summary: "Mostra o poder de deter evidências de autoria. Ricardo Martins, designer autônomo e usuário do Avctoris Copyright, documentou e registrou as telas de seu design e contestou a Stone Pagamentos por prática de plágio.",
    keyTakeaways: [
      "A proteção legal é vital independentemente do tamanho da empresa envolvida",
      "Documentação prévia e registro oficial garantem argumentos robustos e vitória jurídica",
      "Estabelece precedentes éticos importantes para empresas na contratação de criadores"
    ]
  },
  {
    title: "Estudo de Caso: Olimpíadas Tóquio 2020",
    pageNumber: "Página 5-6",
    summary: "Caso de repercussão internacional envolvendo o designer japonês Kenjiro Sano. Ele foi acusado por um designer belga de plagiar de forma descarada um logotipo de teatro belga existente.",
    keyTakeaways: [
      "A proteção de design age em escala nacional e também em competições globais",
      "Análises minuciosas sobre coincidências visuais levaram especialistas a cassar o emblema",
      "Resultou na suspensão imediata e vergonhosa do logotipo de Tóquio 2020"
    ]
  }
];
