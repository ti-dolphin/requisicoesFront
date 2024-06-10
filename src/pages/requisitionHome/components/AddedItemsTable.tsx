import React, { useEffect, useState } from "react";
import { addedItemsType } from "./ItemsTable";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Stack } from "@mui/material";
import { postRequistionItem } from "../../../utils";

interface AddedItemsTableProps {
  addedItems: addedItemsType[];
  handleOpen: (
    e: React.MouseEvent<HTMLButtonElement>,
    quantities: addedItemsType[],
    nome: string
  ) => void;
  handleDelete :  ( e : React.MouseEvent<HTMLButtonElement>) => void;
}


const AddedItemsTable: React.FC<AddedItemsTableProps> = ({
  addedItems,
  handleOpen,
  handleDelete,

}) => { 

  const handleSave = async ( ) =>  {
    const requestBody: { quantidade: number; id_produto: number; id_requisicao: number; }[] = [];
    addedItems.map((item) => { 
      const { quantidade, id_produto, id_requisicao } = item;
      requestBody.push( 
        { 
          quantidade,
          id_produto,
          id_requisicao
        }
      );
    });
    const reqIDParam = requestBody[0].id_requisicao;
    const response = await postRequistionItem(
      requestBody,
      `/requisition/requisitionItems/${reqIDParam}`
    );
    if( response ){ 
      console.log('response: ', response);
    }
}

  const [items, setItems ] = useState<addedItemsType[] | null>();
  useEffect(( ) => { 
    console.log('change');
    setItems(addedItems);
  }, [addedItems]);

  return (
    <div className="w-[90%] max-h-[90%] mt-10 flex flex-col gap-6 overflow-y-auto">
      {items?.length && (
        <table className="w-full bg-blue-100 text-sm text-left rtl:text-right">
          <thead className="text-xs text-blue-900 uppercase ">
            <tr className="border">
              <th
                scope="col"
                className="border font-semibold  text-[1rem]  border-gray-300 px-6 py-3"
              >
                Nome
              </th>
              <th
                scope="col"
                className="border font-semibold  text-[1rem] border-gray-300  px-6 py-3"
              >
                Quantidade
              </th>
            </tr>
          </thead>
          <tbody>
            {items &&
              items.map((item) => (
                <tr className="border border-gray-300">
                  <td
                    scope="row"
                    className="px-6 py-2  bg-blue-100 font-medium text-blue-900 whitespace-nowrap "
                  >
                    {item.nome}
                  </td>
                  <td
                    scope="row"
                    className="flex text-center bg-blue-100 px-8 py-2 font-medium text-blue-900"
                  >
                    <Stack direction="row" spacing={2}>
                      <p>{item.quantidade}</p>
                      <button
                        id={String(item.id_produto)}
                        onClick={(e) =>
                          handleOpen(e, addedItems, item.nome ? item.nome : "")
                        }
                        className="text-blue-600 underline font-normal"
                      >
                        <EditIcon />
                      </button>
                      <button
                        id={String(item.id_produto)}
                        key="delete"
                        className="delete text-blue-600 underline font-normal"
                        onClick={(e) => handleDelete(e)}
                      >
                        <DeleteForeverIcon />
                      </button>
                    </Stack>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
      {addedItems.length && <Button onClick={handleSave}>Salvar</Button>}
    </div>
  );
};

export default AddedItemsTable;
