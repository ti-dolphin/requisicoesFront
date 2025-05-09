import {  useState, useEffect, useContext, useRef } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridSortModel,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Box, Typography, CircularProgress, Alert, AlertColor } from "@mui/material";
import { RequisitionContext } from "../../context/RequisitionContext";
import { deleteRequisition, fecthRequisitions } from "../../utils";
import { Requisition } from "../../utils";
import DeleteRequisitionModal from "../modals/warnings/DeleteRequisitionModal";
import SearchAppBar from "../../pages/requisitionHome/components/SearchAppBar";
import typographyStyles from "../../utilStyles";
import { AlertInterface, RequisitionStatus } from "../../types";
import { Pessoa } from "../../../crm/types";
import { useNavigate } from "react-router-dom";

const columns: GridColDef[] = [
  {
    field: "DESCRIPTION",
    headerName: "Descrição",
    minWidth: 250,
    flex: 1,
    renderCell: (params) => (
      <Typography
        textTransform="capitalize"
        sx={{ ...typographyStyles.smallText, color: "black" }}
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 250,
    valueGetter: (status: RequisitionStatus) => status?.nome || "",
    renderCell: (params) => (
      <Typography
        sx={{ ...typographyStyles.smallText, color: 'black', fontWeight: 'semibold' }}
        textTransform="uppercase"
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
  {
    field: "projeto_descricao",
    headerName: "Projeto",
    minWidth: 300,
    flex: 1,
    valueGetter: (projeto: {
      ID_PROJETO: number;
      DESCRICAO: string;
      gerente: {
        NOME: string;
        CODPESSOA: number;
      };
    }) => projeto?.DESCRICAO || "",
    renderCell: (params) => (
      <Typography
        sx={{ ...typographyStyles.smallText, color: "black" }}
        textTransform="capitalize"
      >
        {params.value}
      </Typography>
    ),
  },
  {
    field: "projeto_gerente",
    headerName: "Gerente",
    minWidth: 200,
    flex: 0.8,
    renderCell: (params) => (
      <Typography
        sx={{ ...typographyStyles.bodyText, color: "black" }}
        textTransform="capitalize"
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
    valueGetter: (projeto: {
      ID_PROJETO: number;
      DESCRICAO: string;
      gerente: {
        NOME: string;
        CODPESSOA: number;
      };
    }) => projeto?.gerente.NOME || "",
  },
  {
    field: "responsavel_pessoa",
    headerName: "Responsável",
    minWidth: 180,
    flex: 0.5 ,
    valueGetter: (responsavel_pessoa: Pessoa) => responsavel_pessoa?.NOME || "",
    renderCell: (params) => (
      <Typography
        sx={{ ...typographyStyles.bodyText, color: "black" }}
        textTransform="capitalize"
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
  {
    field: "ID_REQUISICAO",
    headerName: "Nº",
    width: 60,
    
    type: "number",
    align: "center",
  },
  {
    field: "data_criacao",
    headerName: "Data de Criação",
    width: 150,

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
    field: "data_alteracao",
    headerName: "Última Alteração",
    width: 150,

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
    field: "alterado_por_pessoa",
    headerName: "Alterado Por",
    width: 140,

    valueGetter: (alterado_por_pessoa: Pessoa) =>
      alterado_por_pessoa?.NOME || "",
    renderCell: (params: GridRenderCellParams) => (
      <Typography
        sx={{ ...typographyStyles.bodyText, color: "black" }}
        textTransform="capitalize"
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
];

export default function RequisitionsDataGrid() {
  const [isDeleteRequisitionModalOpen, setIsDeleteRequisitionModalOpen] =
    useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "ID_REQUISICAO", sort: "asc" },
  ]);
  const [allRows, setAllRows] = useState<Requisition[]>([]);
  const [filteredRows, setFilteredRows] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableHeight, setTableHeight] = useState<number>(600);
  const [alert, setAlert] = useState<AlertInterface>();
  const  navigate  = useNavigate();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    toggleRefreshRequisition,
  } = useContext(RequisitionContext);
  const fetchRequisitionData = async ( ) => { 
      try{ 
        setLoading(true)
        const requisitions = await fecthRequisitions();
        console.log('requisitions: ', requisitions);
        setFilteredRows(requisitions);
        setAllRows(requisitions);
      }catch(e){ 
        displayAlert('error', 'Erro ao buscar requisições')
      }finally{ 
        setLoading(false);
      }
  }
  
  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  const handleDelete = async (id: number) => {
    await deleteRequisition(id);
    setIsDeleteRequisitionModalOpen(false);
    toggleRefreshRequisition();
  };

  const handleRowClick = (params: any) => {
       navigate(`/requisitions/requisitionDetail/${params.row.ID_REQUISICAO}`);
  };  

  useEffect(() => {
    fetchRequisitionData();
  }, []);

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
      <SearchAppBar
        allRows={allRows}
        filteredRows={filteredRows}
        setFilteredRows={setFilteredRows}
      />
      {alert && (
        <Alert severity={alert.severity as AlertColor}>{alert.message}</Alert>
      )}
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
              padding: 2,
              "& .MuiDataGrid-row": {
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
                padding: 1,
               
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