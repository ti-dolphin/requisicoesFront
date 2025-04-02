import { useCallback, useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridSortModel,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Box, Typography, CircularProgress } from "@mui/material";
import { RequisitionContext } from "../../context/RequisitionContext";
import { userContext } from "../../context/userContext";
import { deleteRequisition, fecthRequisitions } from "../../utils";
import { Requisition } from "../../utils";
import DeleteRequisitionModal from "../modals/warnings/DeleteRequisitionModal";
import SearchAppBar from "../../pages/requisitionHome/components/SearchAppBar";
import typographyStyles from "../../utilStyles";

const columns: GridColDef[] = [
  {
    field: "DESCRIPTION",
    headerName: "Descrição",
    flex: 1,
    minWidth: 300,
    renderCell: (params) => (
      <Typography
        textTransform="capitalize"
        sx={{ ...typographyStyles.bodytext }}
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
  {
    field: "STATUS",
    headerName: "Status",
    width: 120,
    minWidth: 200,
    renderCell: (params) => (
      <Typography
        sx={{ ...typographyStyles.bodytext }}
        textTransform="capitalize"
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
  {
    field: "NOME_RESPONSAVEL",
    headerName: "Responsável",
    width: 180,
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Typography
        sx={{ ...typographyStyles.bodytext }}
        textTransform="capitalize"
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
  {
    field: "ID_REQUISICAO",
    headerName: "Nº",
    width: 80,
    type: "number",
  },
  {
    field: "CREATED_ON",
    headerName: "Data de Criação",
    width: 180,
    minWidth: 200,
    valueFormatter: (value: string) => {
      if (typeof value === "string") {
        const date = value.substring(0, 10).replace(/-/g, "/");
        const time = value.substring(11, 19);
        return `${date}, ${time}`;
      }
      return "";
    },
  },
  {
    field: "LAST_UPDATE_ON",
    headerName: "Última Alteração",
    width: 180,
    minWidth: 200,
    valueFormatter: (value: string) => {
      if (typeof value === "string") {
        const date = value.substring(0, 10).replace(/-/g, "/");
        const time = value.substring(11, 19);
        return `${date}, ${time}`;
      }
      return "";
    },
  },
  {
    field: "LAST_MODIFIED_BY_NAME",
    headerName: "Alterado Por",
    width: 150,
    flex: 1,
    minWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <Typography
        sx={{ ...typographyStyles.bodytext }}
        textTransform="capitalize"
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
  {
    field: "DESCRICAO",
    headerName: "Projeto",
    width: 150,
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Typography
        sx={{ ...typographyStyles.smallText, color: "black" }}
        textTransform="capitalize"
      >
        {params.value}
      </Typography>
    ),
  },
];

export default function RequisitionsDataGrid() {

  // const [currentSelectedId, setCurrentSelectedId] = useState<number>(-1);
  const [isDeleteRequisitionModalOpen, setIsDeleteRequisitionModalOpen] =
    useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "ID_REQUISICAO", sort: "asc" },
  ]);
  const [filteredRows, setFilteredRows] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableHeight, setTableHeight] = useState<number>(600);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
   
  const {
    refreshRequisition,
    currentKanbanFilter,
    toggleRefreshRequisition,
    currentSubFilter,
  } = useContext(RequisitionContext);
  const { user } = useContext(userContext);

  const fetchRequisitionData = useCallback(async () => {
    if (user && currentKanbanFilter) {
      setLoading(true);
      try {
        const data = await fecthRequisitions(user, currentKanbanFilter.label);
        if (data) {
          if (
            currentSubFilter?.label === "Minhas" &&
            currentKanbanFilter.label !== "A Fazer"
          ) {
            const filtered = data.filter(
              (requisition) =>
                requisition.LAST_MODIFIED_BY_NAME.toUpperCase() ===
                user.NOME?.toUpperCase()
            );
            setFilteredRows(filtered);
          } else {
            setFilteredRows(data);
          }
        } else {
          setFilteredRows([]);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [currentKanbanFilter, user, currentSubFilter]);



  // const handleOpenDeleteModal = (id: number) => {
  //   setCurrentSelectedId(id);
  //   setIsDeleteRequisitionModalOpen(true);
  // };

  const handleDelete = async (id: number) => {
    await deleteRequisition(id);
    setIsDeleteRequisitionModalOpen(false);
    toggleRefreshRequisition();
  };

  const handleRowClick = (params: any) => {
    navigate(`requisitionDetail/${params.row.ID_REQUISICAO}`);
  };

    useEffect(() => {
      fetchRequisitionData();
    }, [
      refreshRequisition,
      currentKanbanFilter,
      fetchRequisitionData,
      currentSubFilter,
    ]);

  useEffect(() => {
    if (containerRef.current) {
      console.log("client height: ", containerRef.current.clientHeight);
      setTableHeight(containerRef.current.clientHeight);
    }
  }, [containerRef]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
      }}
    >
      <SearchAppBar />
      {loading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          rows={filteredRows}
          getRowId={(row: Requisition) => row.ID_REQUISICAO}
          columns={columns}
          pageSizeOptions={[20, 50, 100]}
          rowHeight={40}
          showColumnVerticalBorder
          showCellVerticalBorder
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          onRowClick={handleRowClick}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500, placeholder: "Pesquisar" },
              sx: {
                display: "!important flex",
                flexDirection: "row-reverse",
                justifyContent: "center",
                border: "1px solid lightgray",
                padding: 1,
                "& .MuiButtonBase-root": {
                  display: "none",
                },
              },
            },
          }}
          sx={{
            width: "100%",
            maxHeight: tableHeight,
            "& .MuiDataGrid-row": {
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-menuIcon": {
              display: "none",
            },
          }}
        />
      )}
      <DeleteRequisitionModal
        isDeleteRequisitionModalOpen={isDeleteRequisitionModalOpen}
        setIsDeleteRequisitionModalOpen={setIsDeleteRequisitionModalOpen}
        handleDelete={handleDelete}
        requisitionId={0}
      />
    </Box>
  );
}
