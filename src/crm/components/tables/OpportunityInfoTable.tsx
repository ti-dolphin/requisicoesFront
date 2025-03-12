/* eslint-disable @typescript-eslint/no-unused-vars */
import { ThemeProvider } from "@emotion/react";
import { createTheme, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FixedSizeGrid } from "react-window";
import { Loader } from "../../../generalUtilities";
import { OpportunityGridStyles } from "../../../utilStyles";
import { OpportunityInfo } from "../../types";
import CustomOpportunityRow from "../CustomOpportunityRow/CustomOpportunityRow";
import { OpportunityModal } from "../modals/OpportunityModal/OpportunityModal";
import OpportunityCard from "../OpportunityCard/OpportunityCard";
import OpportunityTableSearchBar from "../OpportunityTableSearchBar/OpportunityTableSearchBar";
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
import UseOpportunityInfoTable from "../hooks/OpportunityInfoTableHook";
const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  ptBR,
  pickersPtBr,
  corePtBr
);

const gridCardColumns: { headerName: string; field: keyof OpportunityInfo }[] = [
  {
    field: "numeroOs",
    headerName: "Nº OS",
  },
  { field: "numeroProjeto", headerName: "Nº Projeto" },
  { field: "numeroAdicional", headerName: "Nº Adicional" }, // os.ID_ADICIONAL
  { field: "nomeDescricaoProposta", headerName: "Descrição" },
  { field: "nomeCliente", headerName: "Cliente" },
  {
    field: "valorTotal",
    headerName: "Valor Total",
  },
  { field: "nomeStatus", headerName: "Status" }, // s.NOME

];
const OpportunityInfoTable: React.FC = () => {
  const {
    rows,
    allRows,
    isCardViewActive,
    gridOuterContainerHeight,
    gridColumnsCount,
    cardWidth,
    gridRowCount,
    isLoading,
    GridOuterContainerRef,
    setRows,
    setIsCardViewActive,
    shouldShowGrid,
    selectOpportunity,
    columns,
    GridFooter,
  } = UseOpportunityInfoTable();
 
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        display: "flex",
        boxSizing: 'border-box',
        flexDirection: "column",
        gap: 0,
        flex: 1,
      }}
    >
      <OpportunityTableSearchBar
        columns={columns}
        allRows={allRows}
        setRows={setRows}
        isCardViewActive={isCardViewActive}
        setIsCardViewActive={setIsCardViewActive}
      />
      <Box
        ref={GridOuterContainerRef}
        sx={{
          display: 'flex',
          flexDirection: "column",
          alignItems: "center",
          boxSizing: 'border-box',
          width: "100%",
          flexGrow: 1,
        }}
      >
        {!isCardViewActive && !isLoading && gridOuterContainerHeight > 0 && (
          <ThemeProvider theme={theme}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.numeroOs}
              rowHeight={36}
              density="compact"
              columnHeaderHeight={40}
              autosizeOnMount
              autosizeOptions={{
                expand: true,
              }}
              sx={{ ...OpportunityGridStyles, maxHeight: gridOuterContainerHeight }}
              onRowClick={selectOpportunity}
              disableRowSelectionOnClick
              slots={{
                footer: GridFooter,
                row: CustomOpportunityRow,
                
              }}
            />
          </ThemeProvider>
        )}


        {!isLoading && shouldShowGrid() && (
          <FixedSizeGrid
            columnCount={gridColumnsCount}
            columnWidth={cardWidth} // Width of each column
            height={gridOuterContainerHeight} // Height of the grid
            rowCount={gridRowCount}
            rowHeight={320} // Height of each row
            width={gridColumnsCount * cardWidth + 20} // Width of the grid
          >
            {({ columnIndex, rowIndex, style }) => {
              console.log(columnIndex);
              return ( 
                (
                  <OpportunityCard
                    key={rows[rowIndex].numeroOs}
                    row={rows[rowIndex]}
                    gridCardColumns={gridCardColumns}
                    style={style}
                  />
                )
              )
            }}
          </FixedSizeGrid>
        )}

        {isLoading && (
          <Loader />
        )}


      </Box>

      <OpportunityModal />
    </Box>
  );
};

OpportunityInfoTable.displayName = "OpportunityInfoTable";

export default OpportunityInfoTable;
