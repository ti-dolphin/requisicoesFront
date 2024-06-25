import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { Item } from "../../utils";
import { AddedItemsTableProps } from "../../types";

const AddedItemsTable: React.FC<AddedItemsTableProps> = ({
  addedItems
}) => { 


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
                className="border font-semibold capitalize  text-[1rem]  border-gray-300 px-6 py-3"
              >
                Material / Serviço
              </th>
              <th
                scope="col"
                className="border font-semibold capitalize  text-[1rem] border-gray-300  px-6 py-3"
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
                    </Stack>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );

};

export default AddedItemsTable;
