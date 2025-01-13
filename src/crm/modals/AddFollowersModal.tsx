/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, createTheme, IconButton, Modal, ThemeProvider, Tooltip, Typography } from '@mui/material';
import { Opportunity } from '../types';
import { DataGrid, GridCallbackDetails, GridColDef, GridFooterContainer, GridPagination, GridRowSelectionModel, GridSelectedRowCount } from '@mui/x-data-grid';
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
import CloseIcon from "@mui/icons-material/Close";
import { fetchPersonList } from '../utils';
import { Person } from '../../Requisitions/types';

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
    field: 'NOME',
    headerName: 'Nome',
    width: 300,
    type: 'string',
    align: 'left',
    headerAlign: 'center',
  }
];



  interface AddFollowersModalProps {
    opportunity: Opportunity;
    setCurrentOpportunity: React.Dispatch<React.SetStateAction<Opportunity>>;
    handleSaveOpportunity: ( ) =>   Promise<void>;
  }
const AddFollowersModal = ({
  opportunity,
  setCurrentOpportunity, handleSaveOpportunity } : AddFollowersModalProps) => {

  const [addingFollowrs, setAddingFollowers] = useState<boolean>(false);
  const [personList, setPersonList] = useState<Person[]>([]);
  const [previousSelectedList, setPreviousSelectedList] = useState<number[]>([]);
  const GridFooter = () => {

    const handleConclude = async (  ) =>   {
        await handleSaveOpportunity();
        setAddingFollowers(false); //
    };

    return (
      <GridFooterContainer
        sx={{
          color: "black",
          paddingX: 4,
          paddingY: 0,
          display: "flex",
          justifyContent: "end",
          flexGrow: 1,
          flexWrap: "wrap",
          overFlowY: "scroll",
          zIndex: 20,
          backgroundColor: "white",
          borderRadius: 2,
          height: "30px",
        }}
      >
        <Button variant="contained" onClick={() => handleConclude()}>
          <Typography fontSize="Medium" textTransform="capitalize">
            Concluir
          </Typography>
        </Button>
        <GridSelectedRowCount selectedRowCount={456} />

        <GridPagination
          sx={{
            padding: 0,
            display: "flex",
            maxWidth: "200px",
            alignItems: "center",
            justifyContent: "end",
            overflowY: "hidden",
            overflowX: "hidden",
            height: "30px",
          }}
        />
      </GridFooterContainer>
    );
  };

  const fetchOptions = async( ) =>  { 
    const peopleList = await fetchPersonList();
    console.log({ 
        peopleList
    })
    setPersonList(peopleList || []);
  }

  const handleRowSelection = (
    currentSelecionList: GridRowSelectionModel,
    details: GridCallbackDetails<any>
  ) => {
    console.log(details);
    setPreviousSelectedList(currentSelecionList as number[]);
    const currentFolowersId = opportunity.seguidores.map((seguidor) => seguidor.codpessoa);
    const newFollowerIds = currentSelecionList.filter((codpessoa) => currentFolowersId.indexOf(Number(codpessoa)) < 0);
    const removedFollowersIds = previousSelectedList.filter((codpessoa) => currentSelecionList.indexOf(codpessoa) < 0);
    console.log({newFollowerIds});
    if(newFollowerIds.length){ 
        const newOppFollowers = [...opportunity.seguidores];
        for (const newFollowerId of newFollowerIds) {
            const person = personList.find(person => person.CODPESSOA === newFollowerId);
            if(person){
                newOppFollowers.push({
                    id_seguidor_projeto: 0,
                    id_projeto: opportunity.idProjeto || 0,
                    codpessoa: person.CODPESSOA,
                    ativo: 1,
                    nome: person.NOME,
                });
            }
        }
        setCurrentOpportunity({ 
            ...opportunity,
            seguidores: newOppFollowers,
        });
          console.log({newOppFollowers});
          return;
    }
    if(removedFollowersIds.length > 0){
        const newOppFollowers = opportunity.seguidores.filter(seguidor => removedFollowersIds.indexOf(seguidor.codpessoa) < 0);
        setCurrentOpportunity({ 
           ...opportunity,
            seguidores: newOppFollowers,
        });
        console.log({newOppFollowers});
        return;
    }
    
  };

  useEffect( () => {
    console.log('current followers: ', opportunity.seguidores)
    fetchOptions();
  }, []);
  return (
    <div>
      <IconButton onClick={() => setAddingFollowers(!addingFollowrs)}>
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
            width: "fit-content",
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
          <Typography fontWeight="bold" className="text-gray-600">
            Adicionar seguidores à proposta
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              maxHeight: "90%",
            }}
          >
            <ThemeProvider theme={theme}>
              <DataGrid
                rows={personList}
                columns={columns}
                getRowId={(row: Person) => row.CODPESSOA} // Usando CODPESSOA como ID único
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f5f5f5",
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
                  footer: GridFooter,
                }}
                rowSelection
                disableMultipleRowSelection={false}
                onRowSelectionModelChange={(newSelection, details) =>
                  handleRowSelection(newSelection, details)
                }
                
                checkboxSelection
                density="compact"
              />
            </ThemeProvider>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default AddFollowersModal