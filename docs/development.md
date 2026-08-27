# Desenvolvimento do frontend

## Preparação

Use Node.js 20 para reduzir diferenças em relação ao backend.

```powershell
npm ci
npm run dev
```

## Configuração

| Variável | Finalidade |
| --- | --- |
| `VITE_API_LOCAL_URL` | URL do serviço local auxiliar |
| `VITE_FIREBASE_API_KEY` | Configuração pública do Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação |
| `VITE_FIREBASE_PROJECT_ID` | Projeto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Identificador do remetente |
| `VITE_FIREBASE_APP_ID` | Identificador da aplicação |

O cliente principal em `src/api.ts` usa atualmente `http://localhost:3001`. Se a URL passar a variar por ambiente, centralize-a em uma variável Vite.

## Build e validação

```powershell
npm run build
npm run preview
```

O build executa `tsc --noEmit` antes do Vite. Não há testes automatizados configurados; execute o build e valide manualmente os fluxos afetados, incluindo carregamento, vazio, erro e autorização.

Não exponha tokens ou dados pessoais em logs e coordene mudanças de contrato com o backend.
