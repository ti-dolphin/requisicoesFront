/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { MutableRefObject, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  createTheme,
  IconButton,
  Modal,
  Stack,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import { Follower, Guide } from "../../../types";
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridColumnMenu,
  GridColumnMenuProps,
  GridFilterPanel,
  GridFooterContainer,
  GridPagination,
  GridRowSelectionModel,
  GridSelectedRowCount,
} from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
import CloseIcon from "@mui/icons-material/Close";
import { fetchPersonList } from "../../../utils";
import { Person } from "../../../../Requisitions/types";
import { GridFilterPanelProps } from "@mui/x-data-grid/components/panel/filterPanel/GridFilterPanel";
import { BaseButtonStyles, buttonStylesMobile } from "../../../../utilStyles";

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
    field: "NOME",
    headerName: "Nome",
    type: "string",
    align: "left",
    headerAlign: "center",
    filterable: true,
    width: 300,
  },
];

interface AddFollowersModalProps {
  setFollowers: React.Dispatch<React.SetStateAction<Follower[]>>;
  followers: Follower[];
  guide: Guide;
  guidesReference: MutableRefObject<Guide[] | undefined>;
}
const AddFollowersModal = ({
  setFollowers,
  followers,
  guide,
  guidesReference,
}: AddFollowersModalProps) => {  
  const [addingFollowrs, setAddingFollowers] = useState<boolean>(false);
  const [personList, setPersonList] = useState<Person[]>([]);
  const [previousSelectedList, setPreviousSelectedList] = useState<number[]>(
    []
  );
  const [filteredPersonList, setFilteredPersonList] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [newFollowers, setNewFollowers] = useState<Follower[]>();

  const GridFooter = () => {
    return (
      <GridFooterContainer
        sx={{
          color: "black",
          paddingX: 1,
          paddingY: 1,
          display: "flex",
          justifyContent: "end",
          flexGrow: 1,

          overFlowY: "scroll",
          zIndex: 20,
          backgroundColor: "white",
          borderRadius: 2,
          height: "30px",
        }}
      >
        <Button sx={BaseButtonStyles} onClick={() => handleConclude()}>
          <Typography fontSize="small" textTransform="capitalize">
            Concluir
          </Typography>
        </Button>
        <GridSelectedRowCount selectedRowCount={previousSelectedList.length} />

        <GridPagination
          sx={{
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            overflowY: "hidden",
            "& .MuiTablePagination-displayedRows": {
              display: "none",
            },
            height: "30px",
          }}
        />
      </GridFooterContainer>
    );
  };

  const fetchOptions = async () => {
    const peopleList = await fetchPersonList();
    setPersonList(peopleList || []);
    setFilteredPersonList(peopleList || []);
  };

  const handleConclude = async () => {
    if (newFollowers && guidesReference.current) {
      const newOppFollowers = newFollowers.filter(
        (newFollower) =>
          !followers.find(
            (follower) => follower.codpessoa === newFollower.codpessoa
          )
      );
      guide.fields[0].data = [...followers, ...newOppFollowers];
      guidesReference.current[4] = guide;
      setFollowers([...followers, ...newOppFollowers]);
    }

    setAddingFollowers(false);
  };

  const handleRowSelection = (
    currentSelectionList: GridRowSelectionModel,
    _details: GridCallbackDetails<any>
  ) => {
    setPreviousSelectedList(currentSelectionList as number[]);
    const selectedFollowers: Follower[] = currentSelectionList.map((id) => {
      const selectedPerson = personList.find(
        (person) => person.CODPESSOA === id
      );
      return {
        id_seguidor_projeto: 0, // ID fictício, pode ser gerado ou obtido do backend
        id_projeto: 0, // ID do projeto (deve ser passado como prop ou contexto)
        codpessoa: selectedPerson?.CODPESSOA || 0,
        ativo: 1, // Define como ativo por padrão
        nome: selectedPerson?.NOME || "",
      };
    });
    setNewFollowers(selectedFollowers);
  };

  useEffect(() => {
    fetchOptions();
  }, [addingFollowrs]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = personList.filter((person) =>
        person.NOME.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPersonList(filtered);
    } else {
      setFilteredPersonList(personList); // Se não houver termo de busca, exibe a lista completa
    }
  }, [searchTerm, personList]);

  return (
    <Box>
      <IconButton
        sx={buttonStylesMobile}
        onClick={() => setAddingFollowers(!addingFollowrs)}
      >
        <Tooltip title="adicionar seguidores">
          <AddIcon />
        </Tooltip>
      </IconButton>
      <Modal open={addingFollowrs}>
        <Box
          sx={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            top: "50%",
            justifyContent: "center",
            alignItems: "center",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90%",
              md: "80%",
              lg: "30%",
            },
            height: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              right: 1,
              top: 1,
            }}
            onClick={() => setAddingFollowers(false)}
          >
            <CloseIcon />
          </IconButton>{" "}
          <Stack>
            <Typography fontWeight="bold" className="text-gray-600">
              Adicionar seguidores à proposta
            </Typography>
            <TextField
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              margin="normal"
              InputProps={{
                sx: { borderRadius: 10, height: 40 },
                placeholder: "busque por nome...",
              }}
            />
          </Stack>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxHeight: "80%",
              width: "100%",
            }}
          >
            <ThemeProvider theme={theme}>
              <DataGrid
                rows={filteredPersonList}
                columns={columns}
                getRowId={(row: Person) => row.CODPESSOA} // Usando CODPESSOA como ID único
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "blue",
                    display: "none",
                  },

                  maxWidth: {
                    xs: "100%",
                    md: "100%",
                    lg: "90%",
                  },
                }}
                pageSizeOptions={[100]}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 100,
                    },
                  },
                }}
                slots={{
                  columnMenu: (props: GridColumnMenuProps) => (
                    <Box
                      sx={{
                        "& .MuiMenuItem-root": {
                          display: "flex",
                          flexWrap: "wrap",
                        },
                        maxWidth: {
                          xs: 260,
                          sm: 300,
                        },
                      }}
                    >
                      <GridColumnMenu {...props}></GridColumnMenu>
                    </Box>
                  ),
                  footer: GridFooter,
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
                rowSelection
                disableMultipleRowSelection={false}
                onRowSelectionModelChange={(newSelection, details) =>
                  handleRowSelection(newSelection, details)
                }
                disableColumnSelector
                checkboxSelection
                density="compact"
              />
            </ThemeProvider>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};
AddFollowersModal.displayName = "AddFollowersModal";
export default AddFollowersModal;
