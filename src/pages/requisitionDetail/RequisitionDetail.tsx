import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "./components/Stepper";
import { Badge, BadgeProps, Button, IconButton, Stack, styled } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
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

const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  const [IsAddItemsOpen, setIsAddItemsOpen] = useState<boolean>(false);
  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const [refreshToggler, setRefreshToggler] = useState<boolean>(false); //refreshes Data
  const [requisitionItems, setRequisitionItems] = useState<Item[]>([]);
  const [disabled, setDisabled ] = useState<boolean>(true);
  const [fieldsBeingEdited, setFieldsBeingEdited] = useState<Requisition>();

  const fetchData = async () => {
    const data = await fetchRequsitionById(Number(id));
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
        [id] : value,
      }
    )
  }

  const handleSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if(e.key === 'Enter'){ 
        setDisabled(true);
       fieldsBeingEdited && updateRequisition(fieldsBeingEdited);
     }
  }

  const fields = [
    { label: "Descrição", key: "DESCRIPTION" },
    { label: "Responsável", key: "RESPONSAVEL" },
    { label: "Projeto", key: "DESCRICAO" },
    { label: "Observação", key: "OBSERVACAO" },
    { label: "Ultima atualização", key: 'LAST_UPDATE_ON'},
    { label: "Data de Criação", key: 'CREATED_ON'}
  ];
  const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
      ...theme
    },
  }));
  const dateRenderer = (value: string | number) => {
     if(typeof value === 'string'){ 
       const date = value.substring(0, 10).replace(/-/g, '/');
       const time = value.substring(11, 19);
       const formatted = `${date}, ${time}`;
       return formatted;
     }
    
  }

  return (
    <Box
      sx={{
        width: "96%",
        height: "fit-content",
        backgroundColor: "#fafafa",
        margin: "auto",
      }}
    >
      <div className="Header w-full h-1/2  border">
        <div className="h-1/2 w-full bg-[#fafafa]">
          <Button><Link to="/"><ArrowCircleLeftIcon /></Link></Button>
          <h1 className="font-semibold px-6 py-4">
           Nº {requisitionData?.ID_REQUISICAO} | {requisitionData?.DESCRIPTION} | Projeto {requisitionData?.DESCRICAO}
          </h1>
        </div>
      </div>
      <div className="Stepper w-full border  p-2">
        {requisitionData
          && <HorizontalLinearStepper 
            requisitionData={requisitionData}
               setRequisitionData={setRequisitionData}
                 setRefreshToggler={setRefreshToggler}
                    refreshToggler={refreshToggler}
                    />
        }
      </div>
      <div className="w-full border border-1 px-8 flex justify-end items-center gap-8 h-[50px] ">
        <IconButton
          sx={{ border: 'none',
               height: '30px',
                 borderRadius: '0px',
                  display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={handleOpen}>
          <a className='text-[16px] text-blue-700 hover:text-blue-400 underline'>Materiais/ Serviços</a>
          <StyledBadge badgeContent={requisitionItems.length} color="secondary">
            < AssignmentIcon />
          </StyledBadge>
        </IconButton>
        <OpenFileModal
         ID_REQUISICAO={Number(id)}
         />
      </div>
      <Stack  direction="row">
        <Box
          sx={{
            padding: "0.5rem",
            border: "1px solid #e3e3e3",
            maxHeight: '60vh',
            overflowY: 'auto',
            width: "40%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: 'flex-start'
          }}
        >
          <Stack direction="column" spacing={2} sx={{ width: "100%",  padding: '1rem' }}>
            <h1 className="">Detalhes</h1>
            {requisitionData ?
              fields.map((item) => (
                <Stack direction="column" spacing={0.5}>
                  <label htmlFor="">{item.label}</label>
                  <div 
                          className={`py-1 px-2 rounded-md  w-[90%] flex justify-between border-2 bg-white 
                                      ${(item.key === 'DESCRIPTION' || item.key === 'OBSERVACAO')
                                      && !disabled ? 'border border-blue-500' : ''}`}>
                           <input
                              id={item.key}
                              className="bg-transparent w-full px-1 text-xs focus:outline-none"
                              type="text"
                              value={
                                fieldsBeingEdited && (
                                  item.key === 'LAST_UPDATE_ON' || item.key === 'CREATED_ON'? 
                                    dateRenderer(
                                        fieldsBeingEdited[item.key as keyof Requisition] ) :
                                        fieldsBeingEdited[item.key as keyof Requisition]
                                ) 
                              } 

                              onChange={handleChange}
                              onKeyDown={(e) => handleSave(e)}
                              disabled={item.key === 'DESCRIPTION' || item.key === 'OBSERVACAO' ? disabled : true}
                              autoFocus={disabled} />
                            { 
                              (item.key === 'DESCRIPTION' || item.key === 'OBSERVACAO') &&
                              <EditIcon 
                                onClick={() => 
                                  setDisabled(!disabled)
                                }
                                  className="cursor-pointer hover:text-blue-400 text-blue-700" />
                            }
                  </div>

                </Stack>
              )) : <Loader />}
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
          width: "100%",
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
