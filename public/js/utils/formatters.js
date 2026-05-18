/**
 * Utilitários de formatação de strings do Reserva Serviços
 */

export function formatCPF(value) {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  return numbers; // TODO: Implementar máscara reativa CPF: 000.000.000-00
}

export function formatCEP(value) {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  return numbers; // TODO: Implementar máscara reativa CEP: 00000-000
}

export function formatPhone(value) {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  return numbers; // TODO: Implementar máscara reativa Telefone: (00) 00000-0000
}
