import { events } from "./events.js";

/**
 * 💾 Gerenciador de Estado Reativo do Reserva Serviços
 * Centraliza e monitora o estado de dados da triagem e sessões do usuário.
 */
class StateManager {
  constructor() {
    this._state = {
      candidates: [],
      activeCandidate: null,
      isLoading: false,
      userSession: null,
    };
  }

  /**
   * Retorna o snapshot atual do estado.
   */
  get state() {
    return this._state;
  }

  /**
   * Atualiza frações do estado de forma atômica e emite eventos reativos.
   */
  update(newState) {
    this._state = { ...this._state, ...newState };
    events.emit("state:changed", this._state);
  }

  /**
   * Atualiza a lista da fila de triagem ativa.
   */
  setCandidates(candidates) {
    this.update({ candidates });
    events.emit("candidates:updated", candidates);
  }

  /**
   * Define o prestador que está selecionado na tela de detalhes do gestor.
   */
  setActiveCandidate(candidate) {
    this.update({ activeCandidate: candidate });
    events.emit("activeCandidate:changed", candidate);
  }

  /**
   * Define o estado global de carregamento/spinner do app.
   */
  setLoading(isLoading) {
    this.update({ isLoading });
    events.emit("loading:changed", isLoading);
  }

  /**
   * Define a sessão de autenticação ativa do Supabase Auth.
   */
  setUserSession(userSession) {
    this.update({ userSession });
    events.emit("session:changed", userSession);
  }
}

export const stateManager = new StateManager();
