# CLAUDE.md — Frontend

Estas instruções complementam o `CLAUDE.md` da pasta `Controle` e aplicam-se ao repositório do frontend.

## Antes de trabalhar

Leia conforme a tarefa:

- `README.md` para visão geral e comandos.
- `docs/architecture.md` para fluxo de dados e responsabilidades.
- `docs/modules.md` para localizar o domínio correto.
- `docs/development.md` para ambiente e build.
- `AGENTS.md` para instruções operacionais adicionais.

## Comandos

```powershell
npm ci
npm run dev
npm run build
npm run preview
```

- `npm run build` executa `tsc --noEmit` antes do build do Vite.
- O projeto ainda não possui uma suíte automatizada de testes configurada nesta branch.

## Arquitetura

Fluxo esperado:

```text
main.tsx -> App.tsx -> routes.tsx -> pages -> components/hooks -> services -> API
```

- **Pages:** compõem telas e fluxos de navegação.
- **Components:** implementam interface e interação.
- **Hooks:** encapsulam comportamento reutilizável.
- **Services:** encapsulam comunicação HTTP.
- **Models e types:** representam dados e contratos.
- **Redux:** mantém estado realmente compartilhado.
- **Utils:** contêm funções puras e genéricas.

Regras centrais de negócio e persistência pertencem ao backend. Mudanças no contrato HTTP devem ser coordenadas com o repositório `controle.dse-backend`.

## Tipos e interfaces

- Mantenha tipos e interfaces específicos próximos ao módulo que os utiliza.
- Preserve a organização existente em `src/models/<domínio>` para modelos compartilhados dentro de um domínio.
- Use `src/types` para declarações e tipos realmente compartilhados entre diferentes domínios.
- Não crie uma pasta `interfaces` genérica apenas para centralizar tipos sem relação entre si.
- Evite declarar a mesma estrutura em múltiplos locais.
- Tipos que representam contratos HTTP devem permanecer alinhados com as respostas reais do backend.

## Componentes e utilitários

- Mantenha componentes específicos na pasta do domínio.
- Use `src/components/shared` somente quando houver reutilização real entre domínios.
- Use `src/utils` somente para funções puras, genéricas e reutilizáveis.
- Uma função reutilizável, mas específica de requisições, deve permanecer no módulo de requisições.
- Utils não devem acessar API, Redux, `localStorage`, DOM ou variáveis de ambiente.
- Não faça chamadas Axios diretamente em componentes quando houver um service apropriado.
- Use estado local para comportamento restrito e Redux para estado compartilhado.

## Testes

- Execute `npm run build` e valide manualmente os fluxos afetados enquanto não houver suíte automatizada.
- Quando a suíte for introduzida, mantenha testes unitários próximos ao código com `.test.ts` ou `.test.tsx` e documente os comandos.
- Teste comportamento observável, não detalhes internos de implementação.
- Simule APIs e integrações; testes unitários não devem executar chamadas externas reais.
- Cubra estados de carregamento, sucesso, vazio, erro e autorização em componentes críticos.

## Segurança

- Não exponha tokens ou dados pessoais em logs do navegador.
- Variáveis Vite são incorporadas ao bundle; não coloque segredos nelas.
- Mudanças em autenticação devem cobrir armazenamento, cabeçalho `Authorization` e tratamento de `401`.
