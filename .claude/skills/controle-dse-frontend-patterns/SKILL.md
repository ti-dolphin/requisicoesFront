---
name: controle-dse-frontend-patterns
description: "Use this skill when writing, editing, or reviewing frontend code for the controle.dse project. Covers: creating new pages, components, services, hooks, Redux slices, MUI styling, API integration patterns, TypeScript models, and form patterns. Trigger for any task involving React/TypeScript code in this project."
project: controle.dse — Frontend (controle.dse-frontend)
stack: React 18, TypeScript, Vite, MUI v5, Redux Toolkit, React Query (tanstack), Axios
---

# Controle DSE — Padrões de Código Frontend

## Comentários

**Não escrever comentários ao alterar ou criar código.** Nada de comentários explicando o que a mudança faz, por que foi feita, ou anotando o comportamento anterior. Código novo vai sem comentários; comentários pré-existentes no arquivo devem ser preservados.

---

## Stack e Dependências Principais

| Lib | Versão | Uso |
|-----|--------|-----|
| React | 18 | UI |
| TypeScript | 5.5 | Tipagem |
| Vite | 5 | Build |
| MUI (Material UI) | v5 | Componentes UI |
| @mui/x-data-grid | v7 | Tabelas |
| Redux Toolkit | latest | Estado global |
| @tanstack/react-query | v5 | Cache de dados servidor |
| Axios | v1.7 | HTTP |
| React Router | v6 | Rotas |
| date-fns / dayjs / luxon | — | Datas (projeto usa os 3) |
| recharts | — | Gráficos |

---

## Tema MUI (nunca sobrescrever inline)

```ts
// Cores do tema — usar sempre via theme, não hardcoded
primary.main:    "#2B3990"   // azul DSE
primary.light:   "#e4f1fe"
secondary.main:  "#F7941E"   // laranja DSE
background.default: "#e7eaf6"
text.primary:    "#222831"
text.secondary:  "#606470"
error.main:      "#d32f2f"
success.main:    "#4caf50"
```

Botões já têm override global: cor primária, `borderRadius: 8`, `textTransform: capitalize`. Não reescrever esses estilos nos componentes.

---

## Estrutura de Arquivos por Módulo

Para criar um novo módulo, replicar esta estrutura:

```
src/
├── pages/novoModulo/
│   ├── NovoModuloListPage.tsx
│   └── NovoModuloDetailPage.tsx
├── components/novoModulo/
│   ├── NovoModuloForm.tsx
│   ├── NovoModuloCard.tsx
│   └── NovoModuloTable.tsx
├── services/novoModulo/
│   └── NovoModuloService.ts
├── hooks/novoModulo/
│   └── useNovoModuloOptions.ts
├── models/novoModulo/
│   └── NovoModulo.ts
└── redux/slices/novoModulo/
    └── novoModuloSlice.ts
```

---

## Padrão Service (chamadas API)

Services são classes estáticas que encapsulam todas as chamadas ao backend. Sempre importar `api` de `../../api`.

```ts
// services/novoModulo/NovoModuloService.ts
import api from "../../api";
import { NovoModulo } from "../../models/novoModulo/NovoModulo";

const API_ENDPOINT = '/novo_modulo';

export default class NovoModuloService {
  static async getMany(params?: any) {
    const response = await api.get(API_ENDPOINT, { params });
    return response.data;
  }

  static async getById(id: number) {
    const response = await api.get(`${API_ENDPOINT}/${id}`);
    return response.data;
  }

  static async create(data: Partial<NovoModulo>) {
    const response = await api.post(API_ENDPOINT, data);
    return response.data;
  }

  static async update(id: number, data: Partial<NovoModulo>) {
    const response = await api.put(`${API_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async delete(id: number) {
    const response = await api.delete(`${API_ENDPOINT}/${id}`);
    return response.data;
  }
}
```

---

## Padrão Model (TypeScript Interface)

**Interface tem lugar próprio: `src/models/`. Nunca declarar interface dentro de `.tsx`/`.ts` de componente, página, hook ou service** — isso vale também para props de componente e para payloads de service. O arquivo de model recebe o nome de quem ele descreve, dentro da pasta do módulo.

```ts
// models/novoModulo/NovoModulo.ts
export interface NovoModulo {
  id_novo_modulo: number;
  nome: string;
  descricao?: string;
  ativo?: boolean;
  criado_em?: string;
  criado_por?: number;
}
```

Props de componente seguem a mesma regra, em arquivo com o nome do componente:

```ts
// models/novoModulo/NovoModuloForm.ts
import { NovoModulo } from "./NovoModulo";

export interface NovoModuloFormProps {
  item: NovoModulo | null;
  onSaved: () => void;
}
```

```tsx
// components/novoModulo/NovoModuloForm.tsx
import { NovoModuloFormProps } from "../../models/novoModulo/NovoModuloForm";

const NovoModuloForm = ({ item, onSaved }: NovoModuloFormProps) => {
```

Payload de service também é interface em `models/`, não tipo inline na assinatura:

```ts
// models/novoModulo/NovoModulo.ts
export interface NovoModuloUpdatePayload {
  nome: string;
  ativo: boolean;
}
```

---

## Padrão Redux Slice

```ts
// redux/slices/novoModulo/novoModuloSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NovoModulo } from "../../../models/novoModulo/NovoModulo";

interface NovoModuloState {
  item: NovoModulo | null;
  creating: boolean;
}

const initialState: NovoModuloState = {
  item: null,
  creating: false,
};

const novoModuloSlice = createSlice({
  name: "novoModulo",
  initialState,
  reducers: {
    setItem: (state, action: PayloadAction<NovoModulo | null>) => {
      state.item = action.payload;
    },
    setCreating: (state, action: PayloadAction<boolean>) => {
      state.creating = action.payload;
    },
  },
});

export const { setItem, setCreating } = novoModuloSlice.actions;
export default novoModuloSlice.reducer;
```

Registrar no `store.ts`:
```ts
import novoModuloReducer from './slices/novoModulo/novoModuloSlice';
// dentro de configureStore:
novoModulo: novoModuloReducer,
```

---

## Padrão de Componente com Redux + Service

Padrão observado em `OpportunityForm.tsx`, `PatrimonyForm.tsx`:

```tsx
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setItem } from '../../redux/slices/novoModulo/novoModuloSlice';
import { setFeedback } from '../../redux/slices/feedBackSlice';
import NovoModuloService from '../../services/novoModulo/NovoModuloService';
import { Button, TextField, Box } from '@mui/material';

const NovoModuloForm = () => {
  const dispatch = useDispatch();
  const item = useSelector((state: RootState) => state.novoModulo.item);
  const user = useSelector((state: RootState) => state.user.user);

  const handleSubmit = async () => {
    try {
      const resultado = await NovoModuloService.create({ ...item });
      dispatch(setItem(resultado));
      dispatch(setFeedback({ message: 'Salvo com sucesso!', type: 'success' }));
    } catch (error) {
      dispatch(setFeedback({ message: 'Erro ao salvar', type: 'error' }));
    }
  };

  return (
    <Box>
      <TextField
        label="Nome"
        value={item?.nome ?? ''}
        onChange={(e) => dispatch(setItem({ ...item!, nome: e.target.value }))}
      />
      <Button onClick={handleSubmit}>Salvar</Button>
    </Box>
  );
};

export default NovoModuloForm;
```

### Feedback Global
Sempre usar `setFeedback` do slice global para toasts/snackbars:
```ts
dispatch(setFeedback({ message: 'Texto aqui', type: 'success' })); // 'success' | 'error' | 'warning' | 'info'
```

---

## Padrão Custom Hook para Opções de Autocomplete

Padrão recorrente para popular Autocomplete/Select com dados da API:

```ts
// hooks/novoModulo/useNovoModuloOptions.ts
import { useState, useEffect } from 'react';
import NovoModuloService from '../../services/novoModulo/NovoModuloService';

export const useNovoModuloOptions = () => {
  const [options, setOptions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    NovoModuloService.getMany().then((data) => {
      setOptions(data.map((item: any) => ({
        label: item.nome,
        value: item.id_novo_modulo,
      })));
    });
  }, []);

  return { options };
};
```

---

## Tabelas com MUI DataGrid

O projeto usa `@mui/x-data-grid` v7. Padrão de uso:

```tsx
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'nome', headerName: 'Nome', flex: 1 },
  { field: 'criado_em', headerName: 'Data', width: 150 },
];

<DataGrid
  rows={data}
  columns={columns}
  getRowId={(row) => row.id_novo_modulo}
  autoHeight
  disableRowSelectionOnClick
  pageSizeOptions={[10, 25, 50]}
/>
```

---

## Padrão de Página

```tsx
// pages/novoModulo/NovoModuloListPage.tsx
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import NovoModuloService from '../../services/novoModulo/NovoModuloService';
import { setFeedback } from '../../redux/slices/feedBackSlice';

const NovoModuloListPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await NovoModuloService.getMany();
        setData(result);
      } catch {
        dispatch(setFeedback({ message: 'Erro ao carregar dados', type: 'error' }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h5">Novo Módulo</Typography>
      {/* conteúdo */}
    </Box>
  );
};

export default NovoModuloListPage;
```

---

## Configuração do Axios (`api.ts`)

- **baseURL**: `https://apicontrole.dse.com.br` (produção)
- **Auth**: token lido de `localStorage.getItem('token')` e enviado como `Authorization` header (sem prefixo "Bearer")
- **401 interceptor**: limpa localStorage e redireciona para `/auth`

Para desenvolvimento local, descomentar `baseURL: 'http://localhost:3001'` em `src/api.ts`.

---

## Convenções TypeScript

| Item | Convenção | Exemplo |
|------|-----------|---------|
| Interfaces | PascalCase | `Requisition`, `OpportunityComment` |
| Arquivos de model | PascalCase | `Requisition.ts` |
| Arquivos de componente | PascalCase | `RequisitionForm.tsx` |
| Arquivos de hook | camelCase com `use` | `useRequisitionStatus.ts` |
| Arquivos de service | PascalCase + Service | `RequisitionService.ts` |
| Arquivos de slice | camelCase + Slice | `requisitionSlice.ts` |
| Props de componente | Interface em `models/`, sufixo Props | `models/requisicoes/RequisitionItemsTable.ts` → `RequisitionItemsTableProps` |

---

## Organização de Rotas

Rotas definidas em `src/routes.tsx`. Usar React Router v6:

```tsx
import { Routes, Route } from 'react-router-dom';
import NovoModuloListPage from './pages/novoModulo/NovoModuloListPage';

// dentro do componente de rotas:
<Route path="/novo-modulo" element={<NovoModuloListPage />} />
<Route path="/novo-modulo/:id" element={<NovoModuloDetailPage />} />
```

---

## Firebase (Notificações Push)

Config em `firebaseConfig.ts`. Serviço encapsulado em `src/services/FireBaseService.ts`. Para novas features de notificação, sempre usar esse service, não instanciar Firebase diretamente nos componentes.
