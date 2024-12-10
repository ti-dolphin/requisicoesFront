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
import { dateTimeRenderer, getPatrimonyInfo } from "../../utils";
import { PatrimonyInfoContext } from "../../context/patrimonyInfoContext";
import {
  Box,
  Checkbox,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { userContext } from "../../../Requisitions/context/userContext";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { useNavigate } from "react-router-dom";
interface ColumnData {
  dataKey: string;
  label: string;
  numeric?: boolean;
  width: number;
}

const columns: ColumnData[] = [
  {
    width: 90, // Reduzi um pouco para economizar espaço
    label: "Patrimônio",
    dataKey: "id_patrimonio",
  },
  {
    width: 90, // Mantive um tamanho razoável para a visualização do nome
    label: "Nome",
    dataKey: "nome",
  },
  {
    width: 80,
    label: "Valor de Compra",
    dataKey: "valor_compra",
  },
  {
    width: 170,
    label: "Tipo",
    dataKey: "nome_tipo",
  },
  {
    width: 150, // Reduzi para economizar espaço, mantendo a descrição legível
    label: "Descrição",
    dataKey: "descricao",
  },
  {
    width: 100, // Mantido similar ao nome
    label: "Responsável",
    dataKey: "responsavel",
  },
  {
    width: 100, // Mantido igual ao responsável
    label: "Gerente",
    dataKey: "gerente",
  },
  {
    width: 150, // Projeto precisa de um pouco mais de espaço
    label: "Projeto",
    dataKey: "projeto",
  },
  {
    width: 80, // Reduzido um pouco para última movimentação
    label: "Ultima Movimentação",
    dataKey: "dataMovimentacao",
  },
  {
    width: 70, // Coluna vazia para possíveis ações, mantive um valor baixo
    label: "",
    dataKey: "",
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

export default function MovementsTable() {
  const {
    refreshPatrimonyInfo,
    currentFilter,
    changeColumnFilters,
    columnFilter,
    filteredRows,
    setFilteredRows,
  } = useContext(PatrimonyInfoContext);
  const { user } = useContext(userContext);
  const [rows, setRows] = useState<PatrimonyInfo[]>();
  const [selectedItems, setSelectedItems] = useState<PatrimonyInfo[]>([]);

  const navigate = useNavigate();

  const fetchData = async () => {
    const patrimonyInfoData =
      user && (await getPatrimonyInfo(user, currentFilter));
    if (currentFilter === "Todos") {
      if (patrimonyInfoData) {
        const activeFilters = columnFilter.filter(
          (filter) => filter.filterValue.trim() !== ""
        );
        if (activeFilters.length) {
          const filteredByColumns = filterByActiveColumnFilters(
            patrimonyInfoData,
            activeFilters
          );
          setFilteredRows(filteredByColumns);
          setRows(patrimonyInfoData);
          return;
        }
        setFilteredRows(patrimonyInfoData);
        setRows(patrimonyInfoData);
      }
      return;
    }

    if (currentFilter === "Meus") {
      if (patrimonyInfoData) {
        const activeFilters = columnFilter.filter(
          (filter) => filter.filterValue.trim() !== ""
        );
        if (activeFilters.length) {
          const filteredByColumns = filterByActiveColumnFilters(
            patrimonyInfoData,
            activeFilters
          );
          setFilteredRows(filteredByColumns);
          setRows(patrimonyInfoData);
          return;
        }
        setFilteredRows(patrimonyInfoData);
        setRows(patrimonyInfoData);
      }
      return;
    }
  };

  const filterByActiveColumnFilters = (
    patrimonyInfoData: PatrimonyInfo[],
    activeFilters: { dataKey: string; filterValue: string }[]
  ) => {
    return patrimonyInfoData.filter((patrimonyInfo) => {
      return activeFilters.every((filter) => {
        const { dataKey, filterValue } = filter;
        if (dataKey === "id_patrimonio") {
          console.log("coluna numérica");
          return (
            String(patrimonyInfo[dataKey as keyof PatrimonyInfo]) ===
            String(filterValue)
          );
        }
        if (dataKey === "dataMovimentacao") {
          const renderedDate = renderDateValue(dataKey, patrimonyInfo);
          return renderedDate?.includes(filterValue);
        }
        return String(patrimonyInfo[dataKey as keyof PatrimonyInfo])
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      });
    });
  };

  const renderDateValue = (dataKey: string, row: PatrimonyInfo) => {
    const date = dateTimeRenderer(row[dataKey as keyof PatrimonyInfo] || "");
    return date === "Invalid Date, Invalid Date" ? "" : date;
  };

  const handleOpenChecklists = (row: PatrimonyInfo) => {
    navigate("/patrimony/checklist/" + row.id_patrimonio); //
  };

  function RowContent(
    _index: number,
    row: PatrimonyInfo,
    setSelectedItems: Dispatch<SetStateAction<PatrimonyInfo[]>>,
    selectedItems: PatrimonyInfo[]
  ) {
    const handleSelectItem = (
      e: React.ChangeEvent<HTMLInputElement>,
      row: PatrimonyInfo
    ) => {
      if (e.target.checked) {
        const currentSelectedItems = [...selectedItems];
        currentSelectedItems.push(row);
        setSelectedItems([...currentSelectedItems]);
        console.log("currentSelected: \n", currentSelectedItems);
        return;
      }
      const currentSelectedItems = [...selectedItems];
      currentSelectedItems.splice(currentSelectedItems.indexOf(row), 1);
      setSelectedItems([...currentSelectedItems]);
    };

    const handleOpenPatrimonyDetail = (id_patrimonio: number) => {
      // setResponsable(row.id_responsavel);
      navigate(`/patrimony/details/${id_patrimonio}`);
    };

    const isOnSelectedItems = (row: PatrimonyInfo) => {
      if (selectedItems.find((item) => row === item)) {
        return true;
      }
      return false;
    };

    return (
      <React.Fragment>
        {columns.map((column) =>
          column.label !== "" ? (
            <TableCell
              key={column.dataKey}
              onClick={() => handleOpenPatrimonyDetail(row.id_patrimonio)}
              sx={{
                cursor: "pointer",
                paddingX: "0.2rem",
                paddingY: "0.1rem",
                textTransform: "capitalize",
              }}
              align={column.numeric ? "left" : "center"}
            >
              {column.dataKey === "dataMovimentacao" ? (
                <Typography fontSize="small">
                  {dateTimeRenderer(row[column.dataKey])}
                </Typography>
              ) : (
                <Typography
                  fontSize="12px"
                  sx={{
                    textAlign:
                      column.dataKey === "descricao" ? "left" : "center",
                  }}
                >
                  {column.dataKey === "projeto"
                    ? String(row[column.dataKey])
                    : column.dataKey === "id_patrimonio"
                    ? String(row[column.dataKey]).padStart(6, "0")
                    : column.dataKey === "valor_compra"
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Number(row[column.dataKey]))
                    : String(
                        row[column.dataKey as keyof PatrimonyInfo]
                      ).toLowerCase()}
                </Typography>
              )}
            </TableCell>
          ) : (
            <TableCell
              key={column.dataKey}
              sx={{
                cursor: "pointer",
                paddingX: "0.2",
                paddingY: "0.1rem",
                textTransform: "capitalize",
              }}
              align="center"
            >
              <Stack direction="row">
                {""}
                {/* <IconButton
                  onClick={() => handleOpenPatrimonyDetail(row.id_patrimonio)}
                >
                  <LoopIcon />
                </IconButton> */}
                <IconButton onClick={() => handleOpenChecklists(row)}>
                  <ChecklistIcon />
                </IconButton>
                <Checkbox
                  checked={isOnSelectedItems(row)}
                  onChange={(e) => handleSelectItem(e, row)}
                  sx={{ margin: "0", padding: "0" }}
                />
              </Stack>
            </TableCell>
          )
        )}
      </React.Fragment>
    );
  }

  function fixedHeaderContent() {
    return (
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={column.numeric ? "left" : "center"}
            style={{ width: column.width }}
            sx={{
              backgroundColor: "background.paper",
              padding: "0.2",
            }}
          >
            <Typography fontSize="small" sx={{ fontWeight: "bold" }}>
              {column.label}
            </Typography>
            {column.label !== "" && (
              <TextField
                id="standard-basic"
                label=""
                variant="standard"
                sx={{ fontSize: "10px", color: "red" }}
                onChange={(e) => handleFilterByColumn(e, column)}
                value={
                  columnFilter?.find(
                    (filter) => filter.dataKey === column.dataKey
                  )?.filterValue
                }
              />
            )}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  const handleFilterByColumn = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    column: ColumnData
  ) => {
    const { value } = e.target;
    const activeFilters = getActiveFilters(column, value);

    let newFilteredRows = rows && [...rows];
    if (activeFilters && newFilteredRows) {
      console.log("activeFilters: ", activeFilters);

      for (const filter of activeFilters) {
        if (filter.dataKey === "id_patrimonio") {
          const numericValue = Number(filter.filterValue);
          newFilteredRows = newFilteredRows.filter(
            (row) =>
              Number(row[filter.dataKey as keyof PatrimonyInfo]) ===
              numericValue
          );
          continue;
        }
        if (filter.dataKey === "dataMovimentacao") {
          newFilteredRows = newFilteredRows.filter((row) =>
            dateTimeRenderer(
              row[filter.dataKey as keyof PatrimonyInfo]
            )?.includes(filter.filterValue)
          );
          continue;
        }
        newFilteredRows = newFilteredRows.filter((row) =>
          String(row[filter.dataKey as keyof PatrimonyInfo])
            .toLowerCase()
            .includes(filter.filterValue.toLowerCase())
        );
      }
      setFilteredRows(newFilteredRows);
      return;
    }
    setFilteredRows(rows);
  };

  const getActiveFilters = (column: ColumnData, value: string) => {
    const updatedColumnFilters = columnFilter.map((currrentColumnFilter) => {
      if (currrentColumnFilter.dataKey === column.dataKey) {
        return {
          ...currrentColumnFilter,
          filterValue: value,
        };
      }
      return currrentColumnFilter;
    });

    changeColumnFilters(updatedColumnFilters);
    const activeFilters: { dataKey: string; filterValue: string }[] = [
      ...updatedColumnFilters.filter((filter) => {
        if (filter.filterValue !== "") {
          return filter;
        }
      }),
    ];

    return activeFilters;
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (e.key === "Enter") {
      setFilteredRows((prevRows) => {
        const searchValue = value.toLowerCase();
        return (
          prevRows &&
          prevRows.filter(
            (moviment) =>
              moviment.gerente.toLowerCase().includes(searchValue) ||
              moviment.projeto.toLowerCase().includes(searchValue) ||
              moviment.responsavel.toLowerCase().includes(searchValue) ||
              moviment.id_patrimonio === Number(searchValue) ||
              moviment.patrimonio.toLowerCase().includes(searchValue) ||
              moviment.descricao.toLowerCase().includes(searchValue) ||
              moviment.dataMovimentacao.toLowerCase().includes(searchValue)
          )
        );
      });
      return;
    }
    if (e.key === "Backspace") {
      setFilteredRows(rows);
      return;
    }
  };

  React.useEffect(() => {
    localStorage.setItem("currentFilter", currentFilter);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPatrimonyInfo, currentFilter]);

  return (
    <Paper style={{  width: "100%", padding: 2, flexGrow: 1, height: "75%" }}>
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
      <Box
        display="flex"
        justifyContent="flex-end"
        paddingY="0.4rem"
        paddingX="2rem"
        gap={4}
      >
        {filteredRows && (
          <>
            <Typography
              variant="body2"
              color="blue"
              fontWeight="semibold"
              fontFamily="Roboto"
            >
              {`Total: ${new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(
                filteredRows.reduce(
                  (total, row) => total + Number(row.valor_compra || 0),
                  0
                )
              )}`}
            </Typography>
            <Typography
              variant="body2"
              color="blue"
              fontWeight="semibold"
              fontFamily="Roboto"
            >
              {filteredRows.length} Itens encontrados
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}
