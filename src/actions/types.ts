// ============================================================================
// Tipos compartilhados entre Server Actions (LogiQ)
// ============================================================================

/**
 * Envelope padronizado de retorno de todas as Server Actions.
 *
 * O componente que consome a action pode checar `resultado.sucesso` e obter
 * `resultado.dados` ou `resultado.erro` de forma type-safe, sem precisar
 * de try/catch no client.
 */
export type ActionResult<T> =
  | { sucesso: true; dados: T }
  | { sucesso: false; erro: string };
