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
import { deleteRequisition, fecthRequisitions, getRequisitionKanban } from "../../utils";
import { Requisition } from "../../utils";
import DeleteRequisitionModal from "../modals/warnings/DeleteRequisitionModal";
import SearchAppBar from "../../pages/requisitionHome/components/SearchAppBar";
import typographyStyles from "../../utilStyles";
import { AlertInterface, kanban_requisicao, RequisitionStatus } from "../../types";
import { Pessoa } from "../../../crm/types";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";

const columns: GridColDef[] = [
  {
    field: "ID_REQUISICAO",
    headerName: "Nº",
    flex: 0.3,
    type: "number",
    align: "center",
  },
  {
    field: "DESCRIPTION",
    headerName: "Descrição",
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
    flex: 1,
    valueGetter: (status: RequisitionStatus) => status?.nome || "",
    renderCell: (params) => (
      <Typography
        sx={{
          ...typographyStyles.smallText,
          color: "black",
          fontWeight: "semibold",
        }}
        textTransform="uppercase"
      >
        {String(params.value).toLowerCase()}
      </Typography>
    ),
  },
  {
    field: "projeto_descricao",
    headerName: "Projeto",
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
    flex: 1,
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
    field: "projeto_responsavel",
    headerName: "Responsável Projeto",
    flex: 1,
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
      responsavel: {
        NOME: string;
        CODPESSOA: number;
      };
    }) => projeto.responsavel.NOME || "",
  },
  {
    field: "responsavel_pessoa",
    headerName: "Responsável",
    flex: 1,
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
    field: "data_criacao",
    headerName: "Data de Criação",
    flex: 1,
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
    flex: 1,
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
    flex: 1,
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
  const [kanbans, setKabans] = useState<kanban_requisicao[]>([]);
  const [kanban, setKanban] = useState<kanban_requisicao>();
  const [subFilter, setSubFilter ] = useState<string>('Minhas');
  const [refresh, setRefresh] = useState<boolean>(false);

  const  navigate  = useNavigate();

  const { user } = useContext(userContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const {
    toggleRefreshRequisition,
  } = useContext(RequisitionContext);
  
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

  const setDefaultKanban = (kanbans : kanban_requisicao[]) => {
    const defaultKanban = kanbans.find(
      (kanban: kanban_requisicao) => kanban.id_kanban_requisicao === 1
    );
    setKanban(defaultKanban);
  };

  const filterBysubFilter = (requisitions: Requisition[]) => {
    console.log("requisitions: ", requisitions)
    if (subFilter === "Minhas") {
      const rows = requisitions.filter(
        (row: Requisition) =>
          row.ID_RESPONSAVEL === user?.CODPESSOA ||
          row.alterado_por_pessoa?.CODPESSOA === user?.CODPESSOA ||
          row.projeto_gerente?.gerente.CODPESSOA === user?.CODPESSOA ||
          user?.PERM_DIRETOR
      );
      console.log("filtered rows by subfilter: ", rows);
      setFilteredRows(rows);
      return;
    }
    setFilteredRows(allRows);
  };

  const startAutoRefresh = ( ) =>  {
    const twoMinutes = 2* 60 * 1000;
    setTimeout(() => {
      setRefresh(!refresh);
    }, twoMinutes);
  }

  useEffect(() => {
    const fetchKanbans = async ( ) => { 
        const kanbans = await getRequisitionKanban();
        setKabans(kanbans);
        setDefaultKanban(kanbans)
    } 
    const fetchRequisitionData = async () => {
      try {
        if(!user) throw new Error('Usuário não está logado');
        if(!kanban) throw new Error('Kanban não selecionado');
        setLoading(true);
        const requisitions = await fecthRequisitions(kanban, user );
        if(subFilter === 'Minhas'){ 
          filterBysubFilter(requisitions);
          setAllRows(requisitions);
          return;
        }
        setAllRows(requisitions)
        setFilteredRows(requisitions);
        
      } catch (e) {
        console.log(e);
        displayAlert("error", "Erro ao buscar requisições");
      } finally {
        setLoading(false);
      }
    };
    if(!kanban) {
      fetchKanbans();
    }
    if(kanban){ 
      fetchRequisitionData();
    }
    startAutoRefresh();
  }, [kanban, refresh]);

  useEffect(() => { 
     filterBysubFilter(filteredRows);
  }, [subFilter])

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
        kanbans={kanbans}
        setSubFilter={setSubFilter}
        subFilter={subFilter}
        setKanban={setKanban}
        currentKanban={kanban}
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