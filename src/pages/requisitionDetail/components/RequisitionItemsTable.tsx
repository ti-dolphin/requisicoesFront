import React, { useEffect, useState } from 'react'
import { Item } from '../../../utils'

interface props { 
    items : Item[];
}

const RequisitionItemsTable: React.FC<props> = ({items}) => {

  const [requistionItems, setRequisitionItems ] = useState<Item[]>([]);
  const columns = ['Produto', 'Quantidade'];

  useEffect(( ) => { 
    setRequisitionItems(items);
  }, [items]);

  return (
    <div>
      <div className="relative">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
          <thead className="text-xs text-white uppercase bg-gray-50 ">
            <tr>
              {columns.map((columnName) => (
                <th className="px-6 py-3">{columnName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requistionItems.map((item) => (
              <tr className="bg-white border-b ">
                <th
                  scope="row"
                  className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                >
                  {item.nome}
                </th>
                <td className="px-6 py-2">
                    {item.quantidade}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequisitionItemsTable