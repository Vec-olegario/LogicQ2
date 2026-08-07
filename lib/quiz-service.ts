import { Question, getPerguntaByIndex, getPerguntasByTopico, getAllPerguntasIndices } from "./quiz-data";

export type ModoJogo = "rapido" | "padrao" | "completo" | "topico";

export interface QuizSession {
  state: "MENU" | "PLAYING" | "FINISHED";
  modo: ModoJogo;
  topico?: string;
  perguntasIds: number[];
  opcoesOrders: number[][]; // Cada array tem 4 itens [0..3] embaralhados
  idx: number;
  pontuacao: number;
  respostas: Record<string, { correta: boolean; topico: string }>;
}

/**
 * Gera permutações aleatórias das alternativas (0 a 3) para cada questão.
 */
function gerarOrdensOpcoes(indices: number[]): number[][] {
  return indices.map(() => {
    const perm = [0, 1, 2, 3];
    for (let i = perm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return perm;
  });
}

/**
 * Cria uma nova sessão limpa de Quiz configurada para o modo e tópico escolhidos.
 */
export function inicializarSessaoQuiz(modo: ModoJogo, topico: string = "Recebimento"): QuizSession {
  let indices = getAllPerguntasIndices();
  
  // Shuffle array
  const shuffle = (arr: number[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  if (modo === "rapido") {
    indices = shuffle(indices).slice(0, 5);
  } else if (modo === "padrao") {
    indices = shuffle(indices).slice(0, 15);
  } else if (modo === "completo") {
    indices = shuffle(indices);
  } else if (modo === "topico") {
    indices = shuffle(getPerguntasByTopico(topico));
  }

  return {
    state: "PLAYING",
    modo,
    topico,
    perguntasIds: indices,
    opcoesOrders: gerarOrdensOpcoes(indices),
    idx: 0,
    respostas: {},
    pontuacao: 0,
  };
}

export interface QuestionForDisplay extends Question {
  originalCorreta: number; // Índice correto na lista embaralhada
}

/**
 * Retorna a pergunta com as alternativas ordenadas conforme a permutação informada,
 * ajustando automaticamente o índice da resposta correta.
 */
export function obterPerguntaComOrdem(pIdx: number, perm: number[]): QuestionForDisplay | null {
  const qOrig = getPerguntaByIndex(pIdx);
  if (!qOrig) return null;

  const opcoesOrig = qOrig.opcoes;
  const corretaOrig = qOrig.correta;

  const novasOpcoes = perm.map(i => opcoesOrig[i]);
  const novaCorreta = perm.indexOf(corretaOrig);

  return {
    ...qOrig,
    opcoes: novasOpcoes,
    correta: novaCorreta,
    originalCorreta: novaCorreta,
  };
}

export interface AnaliseDesempenho {
  [topico: string]: {
    total: number;
    acertos: number;
  };
}

/**
 * Calcula o desempenho do operador por setor/tópico no Quiz finalizado.
 */
export function calcularAnaliseDesempenho(
  perguntasIds: number[],
  respostas: Record<string, { correta: boolean; topico: string }>
): AnaliseDesempenho {
  const analise: AnaliseDesempenho = {};
  
  perguntasIds.forEach((pIdx, i) => {
    const q = getPerguntaByIndex(pIdx);
    if (!q) return;
    
    const topico = q.topico;
    if (!analise[topico]) {
      analise[topico] = { total: 0, acertos: 0 };
    }
    
    analise[topico].total += 1;
    const resp = respostas[i.toString()];
    if (resp && resp.correta) {
      analise[topico].acertos += 1;
    }
  });

  return analise;
}
