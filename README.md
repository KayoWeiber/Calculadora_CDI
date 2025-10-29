# Calculadora de CDI

Simule rendimentos compostos atrelados ao CDI com percentuais customizáveis e escolha de calendário (365 dias corridos ou 252 dias úteis).

## Sumário

- [Funcionalidades](#-funcionalidades)
- [Fórmulas](#-fórmulas)
- [Tecnologias](#-tecnologias)
- [Executar localmente](#️-executar-localmente)
- [Como usar](#-como-usar)
- [Scripts npm](#-scripts-npm)
- [Solução de problemas](#-solução-de-problemas)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Limitações e observações](#️-limitações-e-observações)
- [Licença](#-licença)

## ✨ Funcionalidades

- Entradas principais:
	- Valor aplicado (R$)
	- CDI anual (% a.a.) — padrão: 13,15
	- % do CDI — padrão: 120
	- Calendário: Todos os dias (365) ou Apenas dias úteis (252)
- Ações:
	- Calcular, Limpar e Restaurar padrões (redefine para Valor 10.000,00; CDI 13,15; % do CDI 120)
	- Copiar CSV e Exportar CSV da tabela de resultados
- Resultados:
	- Cartões de resumo: Principal, CDI anual, % do CDI e Taxa diária
	- Tabela com períodos: 1–4 semanas, 1 mês (30d), 3 meses (90d), 6 meses (180d) e 1 ano
- Visual moderno em Tailwind CSS com ícones do Lucide

## 🧮 Fórmulas

- Taxa anual efetiva: `taxa_anual = (CDI_anual/100) * (%_CDI/100)`
- Base de dias: `365` (todos os dias) ou `252` (dias úteis)
- Taxa diária: `taxa_diaria = (1 + taxa_anual)^(1/base) - 1`
- Montante após n dias: `M(n) = principal * (1 + taxa_diaria)^n`

No modo “dias úteis”, a capitalização ocorre apenas de segunda a sexta. Feriados nacionais não são considerados (apenas fins de semana são excluídos).

## 🧰 Tecnologias

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Lucide React (ícones)
- clsx e tailwind-merge

## ▶️ Executar localmente

Pré-requisitos: Node.js 18+ e npm.

1) Instalar dependências

```powershell
npm install
```

2) Rodar em desenvolvimento

```powershell
npm run dev
```

3) Gerar build de produção

```powershell
npm run build
```

4) Pré-visualizar build

```powershell
npm run preview
```

## 🚀 Como usar

1. Informe o Valor aplicado (R$). Ex.: `10.000,00`.
2. Ajuste o CDI anual (% a.a.) se desejar (padrão: `13,15`).
3. Defina o % do CDI (padrão: `120`).
4. Escolha o calendário de capitalização: Todos os dias (365) ou Apenas dias úteis (252).
5. Clique em “Calcular”.
6. Opcional: use “Copiar CSV” ou “Exportar CSV” para salvar/compartilhar os resultados.
7. “Limpar” zera os campos; “Restaurar padrões” volta aos valores iniciais.

## 🧩 Scripts npm

```powershell
# Ambiente de desenvolvimento (Vite)
npm run dev

# Build de produção (TypeScript + Vite)
npm run build

# Pré-visualização do build
npm run preview

# Lint
npm run lint
```

## 🛠️ Solução de problemas

- Números inválidos ou “Calcular” desabilitado
	- Verifique o formato PT-BR: use vírgula como decimal (ex.: `13,15`) e ponto como milhar (ex.: `10.000,00`).
	- Todos os campos precisam ser positivos para habilitar o cálculo.

- Copiar CSV não funciona
	- Alguns navegadores exigem conexão HTTPS ou interação do usuário recente para permitir acesso à área de transferência.

- Estilização do Tailwind não carrega
	- Confirme que as dependências foram instaladas e o servidor dev está rodando. Reinicie o processo se necessário.

## 📁 Estrutura do projeto

```
Calculadora_CDI/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ index.css
│  └─ lib/
│     ├─ cdi.ts      # Cálculos: taxa diária, cronograma e dias úteis
│     └─ utils.ts    # Utilitários de classe (Tailwind)
└─ public/
```

## ⚠️ Limitações e observações

- Feriados nacionais não são considerados no modo de dias úteis (apenas fins de semana são excluídos).
- As entradas aceitam texto livre em PT-BR: `.` como separador de milhar e `,` como separador decimal.
- Não há persistência de dados; ao recarregar a página os valores retornam ao padrão.

## 📜 Licença

Este projeto é licenciado sob a licença MIT. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

