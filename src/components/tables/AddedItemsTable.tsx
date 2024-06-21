import React, { useEffect, useState } from "react";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Stack } from "@mui/material";
import { Item, postRequistionItem } from "../../utils";
import { AddedItemsTableProps } from "../../types";

const AddedItemsTable: React.FC<AddedItemsTableProps> = ({
  addedItems,
  handleOpen,
  handleDelete,
  setIsCreating
}) => { 

  const handleSave = async ( ) =>  {
    const requestBody: { QUANTIDADE: number; ID_PRODUTO: number; ID_REQUISICAO: number; }[] = [];
    addedItems?.map((item) => { 
      const { QUANTIDADE, ID_PRODUTO, ID_REQUISICAO } = item;
      requestBody.push( 
        { 
          QUANTIDADE,
          ID_PRODUTO,
          ID_REQUISICAO
        }
      );
    });
    const reqIDParam = requestBody[0].ID_REQUISICAO;
    const response = await postRequistionItem(
      requestBody,
      `/requisition/requisitionItems/${reqIDParam}`
    );
    if( response ){ 
      console.log('response: ', response);
      setIsCreating && setIsCreating(false);
    }
}

  const [items, setItems ] = useState<Item[] | null>();
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
                    {item.nome_fantasia}
                  </td>
                  <td
                    scope="row"
                    className="flex text-center bg-blue-100 px-8 py-2 font-medium text-blue-900"
                  >
                    <Stack direction="row" spacing={2}>
                      <p>{item.QUANTIDADE}</p>
                      <button
                        id={String(item.ID_PRODUTO)}
                        onClick={(e) =>
                         handleOpen && handleOpen(e,  item.nome_fantasia ? item.nome_fantasia : "", addedItems)
                        }
                        className="text-blue-600 underline font-normal"
                      >
                        <EditIcon />
                      </button>
                      <button
                        id={String(item.ID_PRODUTO)}
                        key="delete"
                        className="delete text-blue-600 underline font-normal"
                        onClick={(e) => handleDelete && handleDelete(e)}
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
      {addedItems && <Button onClick={handleSave}>Salvar</Button>}
    </div>
  );

};

export default AddedItemsTable;
