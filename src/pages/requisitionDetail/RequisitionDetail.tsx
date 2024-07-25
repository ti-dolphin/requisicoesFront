import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "./components/Stepper";
import { Badge, BadgeProps, IconButton, Stack, styled, Typography } from "@mui/material";
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
import { useNavigate, useParams } from "react-router-dom";
import RequisitionItemsTable from "../../components/tables/RequisitionItemsTable";
import Loader from "../../components/Loader";
import { ProductsTableModal } from "../../components/modals/ProductsTableModal";
import OpenFileModal from "../../components/modals/OpenFileModal";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { RequisitionContext } from "../../context/RequisitionContext";
import { ItemsContext } from "../../context/ItemsContext";
import { useContext } from "react";
import { userContext } from "../../context/userContext";
const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const [requisitionItems, setRequisitionItems] = useState<Item[]>([]);
  const {editingField, handleChangeEditingField, seteditingField, refreshRequisition, toggleRefreshRequisition } = useContext(RequisitionContext);
  const { refreshItems, adding, toggleAdding } = useContext(ItemsContext);
  const { logedIn } = useContext(userContext);
  const navigate = useNavigate();
  const fetchRequisitionData = async () => {
    const data = await fetchRequsitionById(Number(id));
    if (data) {
      const personData = await fetchPersonById(data.ID_RESPONSAVEL);
      if (personData) {
        setRequisitionData({ ...data, ['RESPONSAVEL']: personData?.NOME });
      }
    }
  }
  const fetchItemsData = async ( ) => { 
    const itemsData = await fetchItems(Number(id));
    if (itemsData){
      setRequisitionItems(itemsData)
      return
    }
    setRequisitionItems([]);
  }
  useEffect(() => { 
    if (!logedIn) navigate('/');
  });

  useEffect(() => {
    console.log('fetchRequisitionData');
    fetchRequisitionData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshRequisition]);

  useEffect(() => { 
    console.log('fetchItemsData');
    fetchItemsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshItems, adding]);
  
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleAdding();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    requisitionData && setRequisitionData(
      {
        ...requisitionData,
        [id]: value,
      }
    )
  }


  const handleSave = async() => {
      seteditingField({...editingField, isEditing : false });
      requisitionData && await updateRequisition(requisitionData);
      toggleRefreshRequisition();
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
  const handleNavigateHome = ( ) => { 
    navigate('/requisitions');
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
          <IconButton onClick={() => handleNavigateHome()}><ArrowCircleLeftIcon /></IconButton>
          <Typography sx={{fontSize: { 
            xs: '12px',
            md: '16px'
          }}}>
            Nº {requisitionData?.ID_REQUISICAO} | {requisitionData?.DESCRIPTION} | Projeto {requisitionData?.DESCRICAO}
          </Typography>

      </Box>

      <Box sx={{padding: '0.5rem'}}>
        {requisitionData
          && <HorizontalLinearStepper
            requisitionData={requisitionData}
            setRequisitionData={setRequisitionData}
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
                      <Typography color="primary"
                        sx={{textDecoration: 'underline'}}>
                            Materiais/ Serviços
                        </Typography>
                  <StyledBadge badgeContent={requisitionItems.length} color="secondary">
                    < AssignmentIcon />
                  </StyledBadge>
                </IconButton>
                <OpenFileModal
                  ID_REQUISICAO={Number(id)}
                />
        </Stack>
      </Box>

      <Stack direction="row" sx={{ flexWrap: 'wrap',  height: { 
        xs: '1080px',
        sm: '800px',
        lg: '600px'
      } }}>

        <Box
          sx={{
            padding: "0.5rem",
      
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
                      sx={editingField.isEditing && editingField.field.key === item.key ?
                         { border: '1px solid blue', padding: '4px', borderRadius: '4px', height: '36px' } :
                        { border: '1px solid #d3d6db', padding: '4px', borderRadius: '4px', height: '36px' }}

                          >
                        <input
                          id={item.key}
                          className="w-full bg-transparent text-xs focus:outline-none"
                          type="text"
                          disabled={!editingField.isEditing}
                          value={
                              requisitionData && (
                              item.key === 'LAST_UPDATE_ON' || item.key === 'CREATED_ON' ?
                                dateRenderer(
                                  requisitionData[item.key as keyof Requisition]) :
                                  requisitionData[item.key as keyof Requisition]
                            )
                          }
                          onChange={handleChange}
                          autoFocus={editingField.isEditing}
                          />
                    {
                      (item.key === 'DESCRIPTION' || item.key === 'OBSERVACAO') &&
                        <button
                            onClick={() => handleChangeEditingField(item)}>
                            <EditIcon color="primary"
                            className="cursor-pointer hover:text-blue-400" />
                        </button>
                        
                      }
                      {editingField.isEditing && editingField.field.key === item.key &&
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
          {requisitionData && (
            <ProductsTableModal
              requisitionID={requisitionData.ID_REQUISICAO}
            />
          )}
        </Box>{" "}

        <Box sx={{
          width: { 
            xs: '100%',
            md: '50%',
            lg: '70%'
          },
          height: { 
            lg: '100%'
          },
          border: "0.5px solid #e3e3e3 ",
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {
              <RequisitionItemsTable
                items={requisitionItems} />           
          }
        </Box>

      </Stack>

    </Box>
  );
};

export default RequisitionDetail;
