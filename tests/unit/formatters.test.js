import { formatCPF, formatCEP, formatPhone } from "../../src/utils/formatters.js";

describe("Utilitários de Formatação (Formatters)", () => {
  
  describe("formatCPF()", () => {
    test("Deve retornar string vazia para entrada vazia", () => {
      expect(formatCPF("")).toBe("");
      expect(formatCPF(null)).toBe("");
    });

    test("Deve aplicar a máscara de CPF corretamente", () => {
      expect(formatCPF("12345678900")).toBe("123.456.789-00");
    });

    test("Deve lidar com CPFs incompletos (cobertura de branches)", () => {
      expect(formatCPF("12")).toBe("12");
      expect(formatCPF("12345")).toBe("123.45");
      expect(formatCPF("12345678")).toBe("123.456.78");
    });
  });

  describe("formatCEP()", () => {
    test("Deve retornar string vazia para entrada vazia", () => {
      expect(formatCEP("")).toBe("");
      expect(formatCEP(undefined)).toBe("");
    });

    test("Deve aplicar a máscara de CEP corretamente", () => {
      expect(formatCEP("06654000")).toBe("06654-000");
    });

    test("Deve lidar com CEPs incompletos (cobertura de branches)", () => {
      expect(formatCEP("123")).toBe("123");
    });
  });

  describe("formatPhone()", () => {
    test("Deve retornar string vazia para entrada vazia", () => {
      expect(formatPhone("")).toBe("");
    });

    test("Deve aplicar a máscara de telefone celular corretamente", () => {
      expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    });

    test("Deve lidar com telefones incompletos (cobertura de branches)", () => {
      expect(formatPhone("abc")).toBe("");
      expect(formatPhone("1")).toBe("(1");
      expect(formatPhone("112")).toBe("(11) 2");
      expect(formatPhone("112345")).toBe("(11) 2345");
      expect(formatPhone("112345678")).toBe("(11) 2345-678");
    });
  });

});
