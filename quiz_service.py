"""
=============================================================================
  SERVIÇOS DE QUIZ (quiz_service.py) — LogiQ
  Lógica puramente funcional para gerenciamento de perguntas, alternativas,
  embaralhamento e cálculo de pontuação e estatísticas.
=============================================================================
"""
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from .perguntas import BANCO_PERGUNTAS, get_pergunta_by_index, get_perguntas_by_topico, get_all_perguntas_indices


def gerar_ordens_opcoes(indices: List[int]) -> List[List[int]]:
    """
    Gera permutações aleatórias das alternativas (0 a 3) para cada questão.

    Por que armazenar apenas ordens no cookie?
    O cookie de sessão padrão do Flask (client-side) possui limite de 4 KB.
    Armazenar textos completos de perguntas e respostas causaria estouro de cookie.
    Armazenamos apenas os IDs das questões e as permutações [0..3].

    Args:
        indices (List[int]): Lista com os índices de perguntas selecionadas.

    Returns:
        List[List[int]]: Lista de permutações para cada pergunta.
    """
    orders: List[List[int]] = []
    for _ in indices:
        perm = [0, 1, 2, 3]
        random.shuffle(perm)
        orders.append(perm)
    return orders


def obter_pergunta_com_ordem(p_idx: int, perm: List[int]) -> Dict[str, Any]:
    """
    Retorna a pergunta com as alternativas ordenadas conforme a permutação informada,
    ajustando automaticamente o índice da resposta correta.

    Args:
        p_idx (int): Índice da pergunta original em BANCO_PERGUNTAS.
        perm (List[int]): Ordem embaralhada das alternativas (ex: [2, 0, 3, 1]).

    Returns:
        Dict[str, Any]: Dicionário formatado para renderização no template.
    """
    q_orig = get_pergunta_by_index(p_idx)
    if not q_orig:
        raise IndexError(f"Índice de pergunta inválido: {p_idx}")

    opcoes_orig = q_orig["opcoes"]
    correta_orig = q_orig["correta"]

    novas_opcoes = [opcoes_orig[i] for i in perm]
    nova_correta = perm.index(correta_orig)

    return {
        "id": q_orig["id"],
        "topico": q_orig["topico"],
        "dificuldade": q_orig["dificuldade"],
        "pergunta": q_orig["pergunta"],
        "opcoes": novas_opcoes,
        "correta": nova_correta,
        "explicacao": q_orig["explicacao"],
    }


def calcular_analise_desempenho(
    perguntas_ids: List[int],
    respostas: Dict[str, Dict[str, Any]]
) -> Dict[str, Dict[str, int]]:
    """
    Calcula o desempenho do operador por setor/tópico no Quiz finalizado.

    Args:
        perguntas_ids (List[int]): Lista dos índices de perguntas do Quiz.
        respostas (Dict[str, Dict[str, Any]]): Dicionário de respostas dadas na sessão.

    Returns:
        Dict[str, Dict[str, int]]: Dicionário mapeando cada tópico com {"total": x, "acertos": y}.
    """
    analise: Dict[str, Dict[str, int]] = {}
    for i, p_idx in enumerate(perguntas_ids):
        q = get_pergunta_by_index(p_idx)
        if not q:
            continue
        topico = q["topico"]
        if topico not in analise:
            analise[topico] = {"total": 0, "acertos": 0}

        analise[topico]["total"] += 1
        resp = respostas.get(str(i))
        if resp and resp.get("correta"):
            analise[topico]["acertos"] += 1

    return analise


def inicializar_sessao_quiz(modo: str, topico: str = "Recebimento") -> Dict[str, Any]:
    """
    Cria uma nova sessão limpa de Quiz configurada para o modo e tópico escolhidos.

    Args:
        modo (str): Modo de jogo ('rapido', 'padrao', 'completo' ou 'topico').
        topico (str): Tópico filtrado quando o modo for 'topico'.

    Returns:
        Dict[str, Any]: Estrutura do quiz para armazenamento na sessão do Flask.
    """
    indices = get_all_perguntas_indices()
    if modo == "rapido":
        random.shuffle(indices)
        indices = indices[:5]
    elif modo == "padrao":
        random.shuffle(indices)
        indices = indices[:15]
    elif modo == "completo":
        random.shuffle(indices)
    elif modo == "topico":
        indices = get_perguntas_by_topico(topico)
        random.shuffle(indices)
    else:
        random.shuffle(indices)
        indices = indices[:15]

    return {
        "state": "PLAYING",
        "modo": modo,
        "topico": topico,
        "perguntas_ids": indices,
        "opcoes_orders": gerar_ordens_opcoes(indices),
        "idx": 0,
        "respostas": {},
        "pontuacao": 0,
        "inicio": datetime.now().isoformat(),
        "fim": None,
    }
