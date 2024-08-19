import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import { PatrimonyInfo } from "../../types";
import SearchAppBar from "../SearchAppBar";
import { useContext, useState } from "react";
import { dateTimeRenderer, getPatrimonyInfo } from "../../utils";
import { PatrimonyInfoContext } from "../../context/patrimonyInfoContext";

interface ColumnData {
  dataKey: keyof PatrimonyInfo;
  label: string;
  numeric?: boolean;
  width: number;
}

// Exemplo de dados fictícios

 const columns: ColumnData[] = [
  {
    width: 100,
    label: "Patrimônio",
    dataKey: "patrimonio",
  },
  {
    width: 100,
    label: "Nome",
    dataKey: "nome",
  },
  {
    width: 200,
    label: "Descrição",
    dataKey: "descricao",
  },
  {
    width: 100,
    label: "Responsável",
    dataKey: "responsavel",
  },
  {
    width: 100,
    label: "Gerente",
    dataKey: "gerente",
  },
  {
    width: 280,
    label: "Projeto",
    dataKey: "projeto",
  },

  {
    width: 100,
    label: "Nº Mov",
    dataKey: "numeroMovimentacao",
    numeric: true,
  },
  {
    width: 100,
    label: "Data Mov",
    dataKey: "dataMovimentacao",
  },
];

const VirtuosoTableComponents: TableComponents<PatrimonyInfo> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric ? "right" : "left"}
          style={{ width: column.width }}
          sx={{
            backgroundColor: "background.paper",
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

function RowContent(_index: number, row: PatrimonyInfo) {
  const handleOpenPatrimonyDetail = (id_patrimonio : number ) => { 
    window.location.href = `/patrimony/details/${id_patrimonio}`
  };
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          sx={{ cursor: "pointer", padding: "0.5rem", textTransform: 'capitalize' }}
          key={column.dataKey}
          onClick={() => handleOpenPatrimonyDetail(row.id_patrimonio)}
          align={column.numeric ? "right" : "left"}
        >
          {column.dataKey === "dataMovimentacao"
            ? dateTimeRenderer(row[column.dataKey])
            : String(row[column.dataKey]).toLowerCase()}
        </TableCell>
      ))}
    </React.Fragment>
  );
}


export default function MovementsTable() {
  const {refreshPatrimonyInfo}= useContext(PatrimonyInfoContext);

  const [rows, setRows] = useState<PatrimonyInfo[]>();
  const [filteredRows, setFilteredRows] = useState<PatrimonyInfo[]>();
  const fetchData = async ( ) => { 
      const patrimonyInfoData = await getPatrimonyInfo();
      if(patrimonyInfoData){ 
        console.log("patrimonyInfoData: ", patrimonyInfoData);
        setRows(patrimonyInfoData);
        setFilteredRows(patrimonyInfoData);
      }
  }
  const handleSearch = (e : React.KeyboardEvent<HTMLInputElement> ) =>  {
    const { value } = e.currentTarget;
      if(e.key === 'Enter'){ 
       setFilteredRows(prevRows => {
        const searchValue = value.toLowerCase();
        return prevRows &&  prevRows.filter((moviment) => (
            moviment.gerente.toLowerCase().includes(searchValue) ||
            moviment.projeto.toLowerCase().includes(searchValue) ||
            moviment.responsavel.toLowerCase().includes(searchValue) ||
            moviment.id_patrimonio === Number(searchValue) ||
            moviment.patrimonio.toLowerCase().includes(searchValue) ||
            moviment.descricao.toLowerCase().includes(searchValue) ||
            moviment.dataMovimentacao.toLowerCase().includes(searchValue)
          ));
      });
      return;
      }
      if( e.key === 'Backspace'){ 
        setFilteredRows(rows);
        return;
      }

}
  React.useEffect(() => {
    console.log("fetchData");
    fetchData();
  }, [refreshPatrimonyInfo]);
  // React.useEffect(() =>  {
  //     setRows(movimentacaoDetailsList);
  //     setFilteredRows(movimentacaoDetailsList);
  // }, []);

  return (
    <Paper style={{ height: "86%", width: "100%" }}>
      <SearchAppBar handleSearch={handleSearch} />
      <TableVirtuoso
        data={filteredRows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={RowContent}
      />
    </Paper>
  );
  }
