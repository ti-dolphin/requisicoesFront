/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { dateTimeRenderer, getInactivePatrimonyInfo, getPatrimonyInfo } from "../../utils";
import { PatrimonyInfoContext } from "../../context/patrimonyInfoContext";
import { ResponsableContext } from "../../context/responsableContext";
import { Checkbox, Typography } from "@mui/material";

interface ColumnData {
  dataKey: keyof PatrimonyInfo;
  label: string;
  numeric?: boolean;
  width: number;
}


 const columns: ColumnData[] = [
   {
     width: 70,
     label: "Patrimônio",
     dataKey: "patrimonio",
   },
   {
     width: 130,
     label: "Nome",
     dataKey: "nome",
   },
   {
     width: 200,
     label: "Descrição",
     dataKey: "descricao",
   },
   {
     width: 130,
     label: "Responsável",
     dataKey: "responsavel",
   },
   {
     width: 130,
     label: "Gerente",
     dataKey: "gerente",
   },
   {
     width: 300,
     label: "Projeto",
     dataKey: "projeto",
   },
   {
     width: 140,
     label: "Ultima Movimentação",
     dataKey: "dataMovimentacao",
   },
   {
     width: 40,
     label: "",
     dataKey: "id_patrimonio",
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

function RowContent(
  _index: number,
  row: PatrimonyInfo,
  setSelectedItems: Dispatch<SetStateAction<PatrimonyInfo[]>>,
  selectedItems: PatrimonyInfo[]
) {
  const { setResponsable } = useContext(ResponsableContext);

  const handleSelectItem = (e : React.ChangeEvent<HTMLInputElement> ,row : PatrimonyInfo) => {
    if(e.target.checked){ 
        const currentSelectedItems = [...selectedItems];
        currentSelectedItems.push( 
          row
        );
        setSelectedItems([...currentSelectedItems]);
        console.log("currentSelected: \n", currentSelectedItems);
        return;
    }
      const currentSelectedItems = [...selectedItems];
      currentSelectedItems.splice(currentSelectedItems.indexOf(row), 1);
      setSelectedItems([...currentSelectedItems]);

      console.log('currentSelected: \n', currentSelectedItems)

  };

  const handleOpenPatrimonyDetail = (id_patrimonio: number) => {
    setResponsable(row.id_responsavel);
    window.location.href = `/patrimony/details/${id_patrimonio}`;
  };

  return (
    <React.Fragment>
      {columns.map((column) =>
        column.dataKey !== "id_patrimonio" ? (
          <TableCell
            sx={{
              cursor: "pointer",
              padding: "0",
              textTransform: "capitalize",
         
            }}
            key={column.dataKey}
            onClick={() => handleOpenPatrimonyDetail(row.id_patrimonio)}
            align={column.numeric ? "center" : "left"}
          >
            {column.dataKey === "dataMovimentacao" ? (
       
                <Typography fontSize="small">
                  {dateTimeRenderer(row[column.dataKey])}
                </Typography>
  
            ) : (
              <Typography fontSize="small">
                {String(row[column.dataKey]).toLowerCase()}
              </Typography>
            )}
          </TableCell>
        ) : (
          <TableCell align="center">
            <Checkbox onChange={(e) => handleSelectItem(e, row)} sx={{ margin: "0", padding: "0" }} />
          </TableCell>
        )
      )}
    </React.Fragment>
  );
}


export default function MovementsTable() {
  const {refreshPatrimonyInfo, currentFilter}= useContext(PatrimonyInfoContext);

  const [rows, setRows] = useState<PatrimonyInfo[]>();
  const [filteredRows, setFilteredRows] = useState<PatrimonyInfo[]>();
  const [selectedItems, setSelectedItems ] = useState<PatrimonyInfo[]>([]);

  const fetchData = async ( ) => { 
     if(currentFilter === 'Ativos'){ 
       const patrimonyInfoData = await getPatrimonyInfo();
       if (patrimonyInfoData) {
         console.log("patrimonyInfoData ACTIVE: ", patrimonyInfoData);
         setRows(patrimonyInfoData);
         setFilteredRows(patrimonyInfoData);
       }
       return
     }
     const patrimonyInfoData = await getInactivePatrimonyInfo();
      if (patrimonyInfoData) {
        console.log("patrimonyInfoData INACTIVE: ", patrimonyInfoData);
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
  }, [refreshPatrimonyInfo, currentFilter]);
 
  return (
    <Paper style={{ height: "86%", width: "100%" }}>
      <SearchAppBar
        setFilteredRows={setFilteredRows}
        selectedItems={selectedItems}
        handleSearch={handleSearch}
        setSelectedItems={setSelectedItems}
      />
      <TableVirtuoso
        data={filteredRows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={(index, row) =>
          RowContent(index, row, setSelectedItems, selectedItems)
        }
      />
    </Paper>
  );
  }
