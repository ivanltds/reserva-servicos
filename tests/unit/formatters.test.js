import { formatCPF, formatCEP, formatPhone } from "../../public/js/utils/formatters.js";

describe("Utilitários de Formatação (Formatters)", () => {
  
  describe("formatCPF()", () => {
    test("Deve retornar string vazia para entrada vazia", () => {
      expect(formatCPF("")).toBe("");
      expect(formatCPF(null)).toBe("");
    });

    test("Deve remover caracteres não numéricos do CPF", () => {
      expect(formatCPF("123.456.789-00")).toBe("12345678900");
    });
  });

  describe("formatCEP()", () => {
    test("Deve retornar string vazia para entrada vazia", () => {
      expect(formatCEP("")).toBe("");
      expect(formatCEP(undefined)).toBe("");
    });

    test("Deve remover caracteres não numéricos do CEP", () => {
      expect(formatCEP("06654-000")).toBe("06654000");
    });
  });

  describe("formatPhone()", () => {
    test("Deve retornar string vazia para entrada vazia", () => {
      expect(formatPhone("")).toBe("");
    });

    test("Deve remover caracteres não numéricos do telefone", () => {
      expect(formatPhone("(11) 98765-4321")).toBe("11987654321");
    });
  });

});
