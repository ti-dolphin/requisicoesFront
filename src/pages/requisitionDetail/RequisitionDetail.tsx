import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "./components/Stepper";
import { Button, Modal, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import {
  Item,
  Person,
  Requisition,
  fetchItems,
  fetchPersonById,
  fetchRequsitionById,
} from "../../utils";
// import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import ItemsTable, { style } from "../requisitionHome/components/ItemsTable";
import RequisitionItemsTable from "./components/RequisitionItemsTable";



const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  useEffect(() => {
    async function performAsync() {
      const data = await fetchRequsitionById(Number(id));
      console.log('data: ',  data);
      if (data) {
        console.log(data);
        const personData = await fetchPersonById(data.ID_RESPONSAVEL);
        const itemsData = await fetchItems(data.ID_REQUISICAO);
        if(itemsData) setRequisitionItems(itemsData);
        if (personData) setPersonData(personData);
        setRequisitionData(data);
      }
    }
    performAsync();
  }, [id]);

  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const [personData, setPersonData] = useState<Person>();
  const [requisitionItems, setRequisitionItems ] = useState<Item[]>();
  const [isOpen, setIsOpen] = useState<boolean>();
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };
  const fields = [
    { label: "Descrição", key: "DESCRIPTION" },
    { label: "Responsável", key: "ID_RESPONSAVEL" },
    { label: "Projeto", key: "ID_PROJETO" },
  ];

  return (
    <Box
      sx={{
        width: "90%",
        height: "fit-content",
        backgroundColor: "#fafafa",
        margin: "auto",
      }}
    >
      <div className="w-full h-1/2  border">
        <div className="h-1/2 w-full bg-[#fafafa]">
          <h1 className="font-semibold px-6 py-4">
            Requisição Materiais Projeto 19487
          </h1>
        </div>
      </div>
      <div className="w-full border  p-2">
        <HorizontalLinearStepper />
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
            {requisitionData &&
              fields.map((item) => (
                <>
                  <label htmlFor="">{item.label}</label>
                  <div className="py-1 w-[90%] border flex justify-between px-1 border-gray-400">
                    <input
                      className="bg-transparent w-full px-1 focus:outline-none text-slate-600"
                      type="text"
                      value={String(
                        item.key === "id_responsavel"
                          ? personData?.NOME
                          : requisitionData[item.key as keyof Requisition]
                      ).toLowerCase()}
                      disabled
                    />
                    <EditIcon className="cursor-pointer text-gray-500" />
                  </div>
                </>
              ))}
          </Stack>
          <Stack direction="row" spacing={4}>
            <a
              onClick={(e) => handleOpen(e)}
              className="text-blue-400 underline"
              href=""
            >
              Editar Produtos
            </a>
          </Stack>
          {isOpen && (
            <>
              <Modal
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
              >
                <Box
                  sx={{
                    ...style,
                    border: "none",
                    width: "95vw",
                    height: "95vh",
                  }}
                >
                  <Stack direction="column">
                    <Stack
                      direction="column"
                      alignItems="center"
                      sx={{ height: "90vh", padding: "none" }}
                    >
                      <ItemsTable id_requisicao={Number(id)} />
                      <Stack
                        sx={{ marginTop: "8rem" }}
                        direction="row"
                        spacing={2}
                      >
                        <Button onClick={handleClose}>Voltar</Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Modal>
            </>
          )}
        </Box>{" "}
        <Box sx={{ width: "50%", maxHeight: '600px', border: "0.5px solid #e3e3e3", overflowY:'scroll' }}>
          {requisitionItems && (
            <RequisitionItemsTable items={requisitionItems} />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default RequisitionDetail;
