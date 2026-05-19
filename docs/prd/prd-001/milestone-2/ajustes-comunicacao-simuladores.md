# Especificação de Ajustes: Comunicação Escalável e Simuladores (Milestone 2.1)

## 1. Objetivo
Refinar a comunicação da plataforma para torná-la escalável e focada na proposta de valor de proximidade ("Perto de Você"), permitindo a expansão para diversas regiões e cidades, mantendo a segurança jurídica e a coerência dos simuladores.

## 2. Redação e Tom de Voz (Foco em Escala)
O tom sai do "Reserva Raposo exclusivo" para o "Hiperlocal Regional".

| Local | Texto Atual | Nova Proposta (Escalável) | Justificativa |
|-------|-------------|---------------------------|---------------|
| Hero LP | "A plataforma oficial na região do Reserva Raposo." | "A plataforma oficial de serviços na sua vizinhança." | Foco na proximidade, independente do bairro/cidade. |
| Chamada Cliente | "Facilitando a vida de quem mora no Reserva" | "Ajuda de confiança, bem do seu lado" | Enfatiza a ajuda comunitária e vizinha. |
| Chamada Prestador | "Atenda centenas de moradores no Reserva Raposo" | "Trabalhe perto de casa, na sua própria região" | Resolve a dor do deslocamento e foca na qualidade de vida. |
| Onboarding | "Tudo pronto para você entrar com segurança" | "Segurança e confiança na sua vizinhança" | Mantém o pilar de confiança local. |

## 3. Unificação dos Simuladores (Unit Economics)
*Mantido o modelo 80/20 conforme especificação anterior.*
- **Orçamento (Cliente) = Ganhos (Prestador) / 0.8**
- **Margem da Plataforma = Orçamento * 0.2**

### 3.2. Tabelas de Referência
| Categoria | Base Prestador (Revenue) | Base Cliente (Budget) | Adicionais (Cliente) |
|-----------|--------------------------|-----------------------|----------------------|
| **Diarista** | R$ 120,00 | R$ 150,00 | +R$ 40/quarto, +R$ 30/banheiro |
| **Marido de Aluguel (Leve)** | R$ 64,00 | R$ 80,00 | N/A |
| **Marido de Aluguel (Média)** | R$ 104,00 | R$ 130,00 | N/A |
| **Marido de Aluguel (Alta)** | R$ 144,00 | R$ 180,00 | N/A |

## 4. Salvaguardas Jurídicas e UX
- **Tooltips:** Adicionar em cada simulador um ícone `(i)` com o texto: *"Valores fictícios baseados em médias de mercado para fins de simulação. O valor final é definido no momento do agendamento."*
- **Aviso de Margem:** Nos simuladores de ganhos, incluir texto discreto: *"Valor líquido estimado. A taxa de intermediação de 20% cobre seguro e suporte."*
- **Badge de Status:** Manter o selo "Plataforma Independente e Hiperlocal" no rodapé para reforçar a neutralidade C2C.

## 5. Arquivos a serem alterados
- `src/app/page.js`
- `src/app/cliente/cadastro/page.js`
- `src/app/prestador/cadastro/page.js`
- `src/app/globals.css` (para estilos de tooltip se necessário)
