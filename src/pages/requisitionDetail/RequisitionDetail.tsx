import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "./components/Stepper";
import { Button, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import {
  Item,
  Requisition,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fetchItems,
  fetchPersonById,
  fetchRequsitionById,
} from "../../utils";
// import { useLocation } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import RequisitionItemsTable from "../../components/tables/RequisitionItemsTable";
import Loader from "../../components/Loader";
import { ProductsTableModal } from "../../components/modals/ProductsTableModal";


const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  const [IsAddItemsOpen, setIsAddItemsOpen] = useState<boolean>(false);
  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const [refreshToggler, setRefreshToggler] = useState<boolean>(false); //refreshes Data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [requisitionItems, setRequisitionItems] = useState<Item[]>([]);
  const fetchData = async () => {
    const data = await fetchRequsitionById(Number(id));
    if (data) {
      console.log(data);
      const personData = await fetchPersonById(data.ID_RESPONSAVEL);
      const itemsData = await fetchItems(data.ID_REQUISICAO);
      if (itemsData) setRequisitionItems(itemsData);
      if (personData) {
        // console.log('req items: ', itemsData)

        setRequisitionData({ ...data, ['RESPONSAVEL']: personData?.NOME });
        console.log('requisitionData: ', data);
      }
    }
  }
  useEffect(() => {

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, IsAddItemsOpen, refreshToggler]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAddItemsOpen(true);
  };
  const fields = [
    { label: "Descrição", key: "DESCRIPTION" },
    { label: "Responsável", key: "RESPONSAVEL" },
    { label: "Projeto", key: "ID_PROJETO" },
  ];

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
          && <HorizontalLinearStepper requisitionData={requisitionData} />
        }
      </div>
      <Stack direction="row">
        <Box
          sx={{
            padding: "1rem",
            border: "1px solid #e3e3e3",
            width: "50%",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <Stack direction="column" spacing={2} sx={{ width: "50%" }}>
            <h1 className="">Detalhes</h1>
            {requisitionData ?
              fields.map((item) => (
                <>
                  <label htmlFor="">{item.label}</label>
                  <div className="py-1 w-[90%] border flex justify-between px-1 border-gray-400">
                    <input
                      className="bg-transparent w-full px-1 focus:outline-none text-slate-600"
                      type="text"
                      value={String(requisitionData[item.key as keyof Requisition]).toLowerCase()}
                      disabled
                    />
                    <EditIcon className="cursor-pointer text-gray-500" />
                  </div>
                </>
              )) : <Loader />}
          </Stack>
          <Stack direction="row" spacing={1}>
            <a
              onClick={(e) => handleOpen(e)}
              className="text-blue-400 underline"
              href=""
            >
              Adicionar Materiais / Serviços
            </a>
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
          width: "66%",
          maxHeight: '400px',
          border: "0.5px solid #e3e3e3",
          overflowY: 'auto'
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
