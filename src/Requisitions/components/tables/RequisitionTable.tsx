/* eslint-disable @typescript-eslint/no-unused-vars */
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { visuallyHidden } from "@mui/utils";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Stack } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SearchAppBar from "../../pages/requisitionHome/components/SearchAppBar";
import { useCallback, useState } from "react";
import { deleteRequisition, fecthRequisitions } from "../../utils";
import { useEffect } from "react";
import { Requisition } from "../../utils";
import { useNavigate } from "react-router-dom";
import {
  EnhancedTableProps,
  EnhancedTableToolbarProps,
  HeadCell,
  Order,
} from "../../types";
import Loader from "../Loader";
import DeleteRequisitionModal from "../modals/warnings/DeleteRequisitionModal";
import React from "react";
import { useContext } from "react";
import { RequisitionContext } from "../../context/RequisitionContext";
import { userContext } from "../../context/userContext";


const headCells: readonly HeadCell[] = [
  {
    id: "DESCRIPTION",
    numeric: false,
    disablePadding: false,
    label: "Descrição",
  },
  {
    id: "STATUS",
    numeric: false,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "ID_RESPONSAVEL",
    numeric: true,
    disablePadding: false,
    label: "Responsável",
  },
  {
    id: "ID_REQUISICAO",
    numeric: true,
    disablePadding: false,
    label: "Nº",
  },
  {
    id: "CREATED_ON",
    numeric: false,
    disablePadding: false,
    label: "Data de Criação",
  },
  {
    id: "LAST_UPDATE_ON",
    numeric: false,
    disablePadding: false,
    label: "Ultima Alteração",
  },
  {
    id: "LAST_MODIFIED_BY_NAME",
    numeric: false,
    disablePadding: false,
    label: "Alterado Por",
  },
  {
    id: "ID_PROJETO",
    numeric: true,
    disablePadding: false,
    label: "Projeto",
  },
];
//HELPER COMPONENTS

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        display: "none",
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      <Stack>
        <OutlinedInput
          sx={{ height: "30px", marginX: "1rem" }}
          id="outlined-adornment-weight"
          aria-describedby="outlined-weight-helper-text"
          placeholder="Pesquisar"
          inputProps={{
            "aria-label": "weight",
          }}
        />
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <SearchIcon />
        )}
      </Stack>

      <Stack direction={"row"} spacing={4}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Toolbar>
  );
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Requisition) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={"left"}
            padding={"normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={
                headCell.label !== "Status"
                  ? createSortHandler(headCell.id)
                  : undefined
              }
            >
              {headCell.label === "Status" ? "Status" : headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

//REQUISITIONS TABLE
export default function EnhancedTable() {
  const [currentSelectedId, setCurrentSelectedId] = useState<number>(-1);
  const [RefreshToggler, setRefreshToggler] = useState(false);
  const [isDeleteRequisitionModalOpen, setIsDeleteRequisitionModalOpen] =
    useState(false);
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] =
    React.useState<keyof Requisition>("ID_REQUISICAO");
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [filteredRows, setFilteredRows] = useState<Requisition[]>([]);
  
  const navigate = useNavigate();

  const {
    refreshRequisition,
    currentKanbanFilter,
    toggleRefreshRequisition,
    currentSubFilter
  } = useContext(RequisitionContext);
  const { user } = useContext(userContext);



  const dateRenderer = (value?: string | number) => {
    if (typeof value === "string") {
      const date = value.substring(0, 10).replace(/-/g, "/");
      const time = value.substring(11, 19);
      let formatted = `${date}, ${time}`;
      const localeDate = new Date(formatted).toLocaleDateString();
      formatted = `${localeDate}, ${time}`;
      return formatted;
    }
  };

  const fetchRequisitionData = useCallback(async () => {
    if (user && currentKanbanFilter) {
      const data = await fecthRequisitions(user, currentKanbanFilter.label);
      if (data) {
        if(currentSubFilter?.label === 'Minhas' && currentKanbanFilter.label !== 'A Fazer'){ 
          const filtered = data.filter(
            (requisition) =>
              requisition.LAST_MODIFIED_BY_NAME.toUpperCase() === user.NOME?.toUpperCase()
          );
          console.log('filtered ', filtered);
          setFilteredRows(filtered);
          return;
        }

        setFilteredRows(data);
      } else {
        setFilteredRows([]);
      }
    }
  }, [currentKanbanFilter, user, currentSubFilter]);

  useEffect(() => {
    fetchRequisitionData();
  }, [refreshRequisition, currentKanbanFilter, fetchRequisitionData, currentSubFilter]);

  const handleOpenDeleteModal = (id: number) => {
    setCurrentSelectedId(id);
    setIsDeleteRequisitionModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteRequisition(id);
    setIsDeleteRequisitionModalOpen(false);
    toggleRefreshRequisition();
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (e.key === "Enter" && user && currentKanbanFilter) {
      setFilteredRows(
        filteredRows.filter(
          (item) =>
            item.NOME_RESPONSAVEL.toUpperCase().includes(value.toUpperCase()) ||
            item.DESCRICAO.toUpperCase().includes(value.toUpperCase()) ||
            item.DESCRIPTION.toUpperCase().includes(value.toUpperCase()) ||
            item.ID_REQUISICAO === Number(value)
        )
      );
      return;
    } else if (e.key === "Backspace" && user && currentKanbanFilter) {
      toggleRefreshRequisition();
    }
  };
  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Requisition
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredRows.map((n) => n.ID_REQUISICAO);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, id: number) => {
    navigate(`requisitionDetail/${id}`);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <SearchAppBar
          filteredRows={filteredRows}
          setFilteredRows={setFilteredRows}
          caller="requisitionTable"
          handleSearch={handleSearch}
          refreshToggler={RefreshToggler}
          setRefreshTooggler={setRefreshToggler}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={filteredRows.length}
              handleSearch={handleSearch}
            />
            <TableBody>
              {filteredRows ? (
                filteredRows.map((row, index) => {
                  const isItemSelected = isSelected(Number(row.ID_REQUISICAO));
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.ID_REQUISICAO}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                        padding="checkbox"
                      ></TableCell>

                      <TableCell
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        align="left"
                      >
                        <Typography fontSize="" textTransform="capitalize">
                          {String(row.DESCRIPTION).toLowerCase()}
                        </Typography>
                      </TableCell>

                      <TableCell
                        align="left"
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                      >
                        <Typography fontSize="small" textTransform="capitalize">
                          {String(row.STATUS).toLowerCase()}
                        </Typography>
                      </TableCell>

                      <TableCell
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                        align="left"
                        sx={{ textTransform: "lowercase" }}
                      >
                        <Typography fontSize="small" textTransform="capitalize">
                          {String(row.NOME_RESPONSAVEL).toLowerCase()}
                        </Typography>
                      </TableCell>

                      <TableCell
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                        align="left"
                      >
                        <Typography fontSize="small">
                          {row.ID_REQUISICAO}
                        </Typography>
                      </TableCell>

                      <TableCell
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                        sx={{
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                        align="left"
                      >
                        <Typography fontSize="small" textTransform="capitalize">
                          {dateRenderer(row.CREATED_ON)}
                        </Typography>
                      </TableCell>

                      <TableCell
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                        sx={{
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                        align="left"
                      >
                        <Typography fontSize="small">
                          {dateRenderer(row.LAST_UPDATE_ON)}
                        </Typography>
                      </TableCell>

                      <TableCell
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                        sx={{
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                        align="left"
                      >
                        <Typography fontSize="small" textTransform="capitalize">
                          {String(row.LAST_MODIFIED_BY_NAME).toLowerCase()}
                        </Typography>
                      </TableCell>

                      <TableCell
                        onClick={(event) =>
                          handleClick(event, Number(row.ID_REQUISICAO))
                        }
                        sx={{
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                        align="left"
                      >
                        <Typography
                          fontSize="small"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {row.DESCRICAO}
                        </Typography>
                      </TableCell>

                      {/* {EXCLUSÂO} */}
                      <TableCell align="left">
                        <Stack direction="row" spacing={2}>
                          <IconButton
                            id={String(row.ID_REQUISICAO)}
                            onClick={() =>
                              handleOpenDeleteModal(Number(row.ID_REQUISICAO))
                            }
                            className="hover:bg-red-100 p-[2px]"
                          >
                            <DeleteIcon sx={{ color: "#F7941E" }} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <Loader />
              )}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 40, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {isDeleteRequisitionModalOpen && (
          <DeleteRequisitionModal
            isDeleteRequisitionModalOpen={isDeleteRequisitionModalOpen}
            setIsDeleteRequisitionModalOpen={setIsDeleteRequisitionModalOpen}
            handleDelete={handleDelete}
            requisitionId={currentSelectedId}
          />
        )}
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Linhas Finas"
      />
      <EnhancedTableToolbar numSelected={0} />
    </Box>
  );
}
