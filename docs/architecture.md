# Arquitetura do frontend

O frontend é uma aplicação React de página única que apresenta os fluxos de negócio, mantém estado compartilhado no Redux e consome a API por Axios.

```text
main.tsx -> App.tsx -> routes.tsx -> pages -> components/hooks -> services -> API
```

## Inicialização

- `src/main.tsx` monta a aplicação.
- `src/App.tsx` configura tema, Redux, roteamento, feedback global e retorno do Mercado Livre.
- `src/routes.tsx` associa URLs às páginas.
- `src/redux/store.ts` registra o estado global.
- `src/api.ts` configura a API principal.
- `src/apiLocal.ts` configura o serviço local auxiliar.

## Fluxo de dados

1. Uma página ou componente inicia uma ação.
2. Um hook ou service prepara a operação.
3. O service chama a API.
4. A resposta atualiza estado local ou Redux.
5. Os componentes renderizam o novo estado.

O token é lido do `localStorage` e enviado em `Authorization`. Uma resposta `401` remove os dados locais de autenticação e redireciona para `/auth`.

## Responsabilidades

- **Pages:** composição das telas e navegação.
- **Components:** interface; componentes gerais ficam em `components/shared`.
- **Hooks:** comportamento reutilizável, permissões, filtros e tabelas.
- **Services:** comunicação com APIs.
- **Models:** contratos de dados do frontend.
- **Redux:** estado compartilhado.
- **Utils:** funções puras sem domínio mais apropriado.

Regras centrais de negócio e persistência pertencem ao backend. Mudanças no contrato HTTP devem ser coordenadas com a API.
