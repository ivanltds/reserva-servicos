/**
 * ⚡ Barramento de eventos global do Reserva Serviços (PubSub)
 * Fornece desacoplamento completo entre componentes do frontend.
 */
class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Inscreve um callback para escutar um evento específico.
   * Retorna uma função de limpeza para desinscrição automática.
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Desinscreve um callback de um evento.
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  /**
   * Emite um evento com dados associados para todos os ouvintes ativos.
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }
}

export const events = new EventBus();
