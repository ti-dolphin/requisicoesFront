import { GlobalStyles } from "@mui/material"

export const KANBAN_COLUMN_WIDTH = 300

export const kanbanGlobalStyles = (
  <GlobalStyles
    styles={{
      '.react-kanban-board': {
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        height: '100%',
        minHeight: 0,
        padding: '16px',
        boxSizing: 'border-box',
        // "safe center": centraliza quando cabe tudo, mas evita o bug de
        // justify-content:center cortar a primeira coluna e deixá-la inacessível
        // via scroll quando as colunas não cabem na largura da tela.
        justifyContent: 'safe center',
      },
      // O wrapper do Droppable (@hello-pangea/dnd) não tem classe própria, só esse
      // data-attribute fixo da lib. Ele precisa de altura explícita porque a coluna
      // usa height:100% — sem isso, o pai fica em auto e o 100% da coluna também
      // vira auto (trap clássico de percentage height), impedindo o scroll interno.
      '[data-rfd-droppable-id="board-droppable"]': {
        height: '100%',
        minHeight: 0,
      },
      // O cabeçalho "sticky" não funciona de forma confiável dentro de uma coluna que
      // rola inteira (a coluna usa o layout inline-block/nowrap legado da lib). Em vez
      // disso, só a lista de cards rola: a coluna vira flex-column, o cabeçalho fica
      // fora da área de scroll (não precisa de sticky) e só o Droppable dos cards cresce
      // e rola. O seletor abaixo pega o Droppable de cards (droppableId = id da coluna,
      // ex: "1", "2") como descendente de .react-kanban-column — diferente do Droppable
      // do board inteiro (droppableId fixo "board-droppable"), que é ancestral dela.
      '.react-kanban-column': {
        width: KANBAN_COLUMN_WIDTH,
        minWidth: KANBAN_COLUMN_WIDTH,
        maxWidth: KANBAN_COLUMN_WIDTH,
        height: '100%',
        minHeight: 0,
        marginRight: 20,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderTop: '4px solid #2B3990',
        boxShadow: '0 2px 8px rgba(43, 57, 144, 0.15)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'inline-flex !important',
        flexDirection: 'column !important',
        verticalAlign: 'top',
      },
      '.react-kanban-column [data-rfd-droppable-id]': {
        flex: '1 1 0',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: 8,
      },
    }}
  />
)
