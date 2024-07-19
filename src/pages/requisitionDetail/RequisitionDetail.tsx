import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "./components/Stepper";
import { Badge, BadgeProps, Button, IconButton, Stack, styled, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import SaveIcon from '@mui/icons-material/Save';
import {
  Item,
  Requisition,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fetchItems,
  fetchPersonById,
  fetchRequsitionById,
  updateRequisition,
} from "../../utils";
// import { useLocation } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import RequisitionItemsTable from "../../components/tables/RequisitionItemsTable";
import Loader from "../../components/Loader";
import { ProductsTableModal } from "../../components/modals/ProductsTableModal";
import OpenFileModal from "../../components/modals/OpenFileModal";
import AssignmentIcon from '@mui/icons-material/Assignment';

interface Field { 
  key : string;
  label : string;
}
const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  const [IsAddItemsOpen, setIsAddItemsOpen] = useState<boolean>(false);
  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const [refreshToggler, setRefreshToggler] = useState<boolean>(false); //refreshes Data
  const [requisitionItems, setRequisitionItems] = useState<Item[]>([]);
  const [editMode, setEditMode] = useState<{ isEditing: boolean, field: Field }>({isEditing : false, field  : { label: '', key: ''}});
  const [fieldsBeingEdited, setFieldsBeingEdited] = useState<Requisition>();

  const fetchData = async () => {
    const data = await fetchRequsitionById(Number(id));
    console.log('fetchData')
    if (data) {
      console.log(data);
      const personData = await fetchPersonById(data.ID_RESPONSAVEL);
      const itemsData = await fetchItems(data.ID_REQUISICAO);
      if (itemsData) setRequisitionItems(itemsData);
      if (personData) {
        setRequisitionData({ ...data, ['RESPONSAVEL']: personData?.NOME });
        setFieldsBeingEdited({ ...data, ['RESPONSAVEL']: personData?.NOME })
      }
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, IsAddItemsOpen, refreshToggler]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, IsAddItemsOpen]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAddItemsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    fieldsBeingEdited && setFieldsBeingEdited(
      {
        ...fieldsBeingEdited,
        [id]: value,
      }
    )
  }
  const handleChangeEditMode = (item : Field ) =>  {
    console.log('editMode: ', { isEditing: true, field: item });
    setEditMode({ isEditing: true, field: item })
  }

  const handleSave = () => {
      setEditMode({...editMode, isEditing : false });
      fieldsBeingEdited && updateRequisition(fieldsBeingEdited);
      setRefreshToggler(!refreshToggler);
  }

  const fields = [
    { label: "Descrição", key: "DESCRIPTION" },
    { label: "Responsável", key: "RESPONSAVEL" },
    { label: "Projeto", key: "DESCRICAO" },
    { label: "Observação", key: "OBSERVACAO" },
    { label: "Ultima atualização", key: 'LAST_UPDATE_ON' },
    { label: "Data de Criação", key: 'CREATED_ON' }
  ];
  const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
      ...theme
    },
  }));
  const dateRenderer = (value: string | number) => {
    if (typeof value === 'string') {
      const date = value.substring(0, 10).replace(/-/g, '/');
      const time = value.substring(11, 19);
      const formatted = `${date}, ${time}`;
      return formatted;
    }

  }

  return (
    <Box
      sx={{
        width: "100%",
        border: '1px solid #d3d6db',
        height: "100%",
        backgroundColor: "#fafafa",
        margin: "auto",
      }}
    >
      <Box sx={{ padding: '1rem', display: 'flex', alignItems: 'center'}}>
          <Button><Link to="/"><ArrowCircleLeftIcon /></Link></Button>
          <Typography >
            Nº {requisitionData?.ID_REQUISICAO} | {requisitionData?.DESCRIPTION} | Projeto {requisitionData?.DESCRICAO}
          </Typography>

      </Box>

      <Box sx={{padding: '0.5rem'}}>
        {requisitionData
          && <HorizontalLinearStepper
            requisitionData={requisitionData}
            setRequisitionData={setRequisitionData}
            setRefreshToggler={setRefreshToggler}
            refreshToggler={refreshToggler}
          />
        }
      </Box>

      <Box sx={{ border: '1px solid #e3e3e3', }}>
        <Stack sx={{paddingX: '2rem', flexWrap: 'wrap'}} direction="row" justifyContent="end">
                <IconButton
                  sx={{
                    border: 'none',
                    height: '30px',
                    borderRadius: '0px',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                  onClick={handleOpen}>
                  <Typography >Materiais/ Serviços</Typography>
                  <StyledBadge badgeContent={requisitionItems.length} color="secondary">
                    < AssignmentIcon />
                  </StyledBadge>
                </IconButton>
                <OpenFileModal
                  ID_REQUISICAO={Number(id)}
                />
        </Stack>
      </Box>

      <Stack direction="row" sx={{flexWrap: 'wrap'}}>

        <Box
          sx={{
            padding: "0.5rem",
            border: "1px solid #d3d6db ",
            maxHeight: '60vh',
            overflowY: 'auto',
            width: { 
              xs: '100%',
              md: '50%',
              lg: '30%'
            },
            display: "flex",
            justifyContent: "space-around",
            alignItems: 'flex-start'
          }}
        >
          <Stack direction="column"
            alignItems="center"
             spacing={2}
               sx={{ width: "100%", padding: '1rem' }}>
            <Typography >Detalhes</Typography>
            {requisitionData ?
              fields.map((item) => (
                <Stack sx={{ width: '100%'}} direction="column" spacing={0.5}>
                  <label>{item.label}</label>
                  <Stack  
                      direction="row"
                      spacing={1}
                      key={item.key}
                      sx={editMode.isEditing && editMode.field.key === item.key ?
                         { border: '1px solid blue', padding: '4px', borderRadius: '4px' } :
                         { border: '1px solid #d3d6db',  padding: '4px', borderRadius: '4px' }}
                          >
                        <input
                          id={item.key}
                          className="w-full bg-transparent text-xs focus:outline-none"
                          type="text"
                          disabled={!editMode.isEditing}
                          value={
                              fieldsBeingEdited && (
                              item.key === 'LAST_UPDATE_ON' || item.key === 'CREATED_ON' ?
                                dateRenderer(
                                  fieldsBeingEdited[item.key as keyof Requisition]) :
                                  fieldsBeingEdited[item.key as keyof Requisition]
                            )
                          }
                          onChange={handleChange}
                          autoFocus={editMode.isEditing}
                          />
                    {
                      (item.key === 'DESCRIPTION' || item.key === 'OBSERVACAO') &&
                        <button
                            onClick={() => handleChangeEditMode(item)}>
                            <EditIcon color="primary"
                            className="cursor-pointer hover:text-blue-400" />
                        </button>
                        
                      }
                      {editMode.isEditing && editMode.field.key === item.key &&
                       <button
                        onClick={handleSave}
                       >
                       <SaveIcon className="hover:text-blue-400"  color="primary"/>
                       </button>  } 
                  </Stack>

                </Stack>
              )) : <Loader />
           
              }
              
          </Stack>
          {IsAddItemsOpen && requisitionData && (
            <ProductsTableModal
              isOpen={IsAddItemsOpen}
              setIsOpen={setIsAddItemsOpen}
              requisitionID={requisitionData.ID_REQUISICAO}
              setIsCreating={setIsAddItemsOpen}
            />
          )}
        </Box>{" "}

        <Box sx={{
          width: { 
            xs: '100%',
            md: '50%',
            lg: '70%'
          },
          maxHeight: '400px',
          border: "0.5px solid #e3e3e3",
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {requisitionItems && (
            <RequisitionItemsTable
              setRefreshToggler={setRefreshToggler}
              refreshToggler={refreshToggler}
              items={requisitionItems} />
          )}
        </Box>

      </Stack>

    </Box>
  );
};

export default RequisitionDetail;
