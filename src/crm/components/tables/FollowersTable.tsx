/* eslint-disable @typescript-eslint/no-unused-vars */
import { Follower, Opportunity } from "../../types";
import { DataGrid, GridCallbackDetails, GridColDef, GridFilterPanel, GridRowSelectionModel } from "@mui/x-data-grid";
import { Box, createTheme, IconButton, Stack, ThemeProvider } from "@mui/material";
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
// import AddFollowersModal from "./modals/AddFollowersModal";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { GridFilterPanelProps } from "@mui/x-data-grid/components/panel/filterPanel/GridFilterPanel";
import AddFollowersModal from "../modals/AddFollowersModal/AddFollowersModal";

// eslint-disable-next-line react-refresh/only-export-components
export const followersDummyData: Follower[] = [];

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

const columns: GridColDef[] = [
  {
    field: "nome",
    headerName: "Nome",
    align: "left",
    headerAlign: "center",
  },
];
interface FollowersTableProps {
  opportunity: Opportunity;
  setCurrentOpportunity: React.Dispatch<React.SetStateAction<Opportunity>>;
  handleSaveOpportunity:  () => Promise<void>;
}
const  FollowersTable = ({
  opportunity,
  setCurrentOpportunity,
  handleSaveOpportunity,
}: FollowersTableProps) => {
  const [previousSelectedList, setPreviousSelectedList] = useState<number[]>(
    []
  );

  const deleteFollowers = () => {
    const newFollowersList = opportunity.seguidores.filter(
      (follower) => !previousSelectedList.includes(follower.codpessoa)
    );
    setCurrentOpportunity({ ...opportunity, seguidores: newFollowersList });
    setPreviousSelectedList([]);
  };

  const handleRowSelection = (
    currentSelecionList: GridRowSelectionModel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details: GridCallbackDetails<any>
  ) => {
    console.log(details);
    setPreviousSelectedList(currentSelecionList as number[]);
  };

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <Stack direction="row" gap={1}>
        <AddFollowersModal
          opportunity={opportunity}
          setCurrentOpportunity={setCurrentOpportunity}
          handleSaveOpportunity={handleSaveOpportunity}
        />
        <IconButton onClick={() => deleteFollowers()}>
          <DeleteIcon />
        </IconButton>
      </Stack>
      <ThemeProvider theme={theme}>
        <DataGrid
          disableColumnSelector
          slots={{
            filterPanel: (props: GridFilterPanelProps) => (
              <GridFilterPanel
                {...props}
                disableAddFilterButton
                sx={{
                  "& .MuiDataGrid-filterFormColumnInput": {
                    display: "none",
                  },
                  "& .MuiDataGrid-filterFormOperatorInput": {
                    display: "none",
                  },
                }}
              ></GridFilterPanel>
            ),
          }}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "blue",
            },
            "& .MuiDataGrid-row": {
              cursor: "pointer",
            },
          }}
          paginationModel={{
            pageSize: 100,
            page: 0,
          }}
          autosizeOnMount
          pageSizeOptions={[]}
          getRowId={(row: Follower) => row.codpessoa}
          rows={opportunity.seguidores.map((row,index) => ({
            ...row,
            id: row.codpessoa,
            key: index
          }))}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={(newSelection, details) =>
            handleRowSelection(newSelection, details)
          }
          disableRowSelectionOnClick
        />
      </ThemeProvider>
    </Box>
  );
}

FollowersTable.displayName = "FollowersTable";
export default FollowersTable;