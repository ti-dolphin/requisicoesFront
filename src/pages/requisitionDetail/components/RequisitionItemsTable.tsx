import React, { useEffect, useState } from 'react'
import { Item, deleteRequisitionItem, updateRequisitionItems } from '../../../utils'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from "@mui/icons-material/Edit";
import { Button } from '@mui/material';
interface props { 
    items : Item[];
}

const RequisitionItemsTable: React.FC<props> = ({items}) => {

  const [requisitionItems, setRequisitionItems ] = useState<Item[]>([]);
  const [itemsBeingEdited, setItemsBeingEdited ] = useState<Item[]>([]);
  const columns = ['Produto', 'Quantidade'];
  const [editMode, setEditMode ] = useState<boolean>(false);
  const [editModeStyle, setEditModeStyle ] = useState('');
  useEffect(( ) => { 
    console.log('items: ', items)
    setRequisitionItems(items);
  }, [items]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, item: Item) => { 
    const { value } = e.target;
    const currentItems = requisitionItems.map(item => ({...item}));
    const editedItem = currentItems.find(value => (value.NOME.includes(item.NOME)));
    if(editedItem){ 
      const editedItemIndex = currentItems.indexOf(editedItem);
      editedItem.QUANTIDADE = Number(value);
      currentItems[editedItemIndex] = editedItem;
      console.log('new items: ', ...currentItems);
    }
     setItemsBeingEdited([...currentItems]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSave = async (_e: React.MouseEvent) => { 
    setRequisitionItems([...itemsBeingEdited]);
    setItemsBeingEdited([]);
    try{ 
      const requisitionID = Number(itemsBeingEdited[0].ID_REQUISICAO);
      await updateRequisitionItems(itemsBeingEdited, requisitionID);
    }catch(e){
      console.log(e);
    }
    setEditMode(false);
    setEditModeStyle('');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleActivateInput = (_e: React.MouseEvent) =>{ 
      setEditMode(true);
      setEditModeStyle('border border-blue-500 ');
  }
  const handleDelete = async (requisitionItem : Item ) => { 
     const items = [...requisitionItems]
     try{ 
      await deleteRequisitionItem(Number(requisitionItem.ID_PRODUTO), requisitionItem.ID_REQUISICAO);
        items.splice(items.indexOf(requisitionItem), 1);
         setRequisitionItems(items);
     }catch(e ) {
      console.log(e);
     }
     
  }
  return (
    // <div  className="border w-full p-2 overflow-auto overflow-y-scroll border-blue-100 flex flex-col items-center">
       <div className="relative overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
          <thead className="text-xs text-white uppercase bg-gray-50 ">
            <tr className='bg-blue-900'>
              {columns.map((columnName) => (
                <th className="px-6 py-3">{columnName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requisitionItems.map((item) => (
              <tr className="bg-white border-b ">
                <td
                  scope="row"
                  className="px-4 py-2  text-sm text-gray-900 whitespace-nowrap"
                >
                  {item.NOME}
                </td>
                <td className="px-6 py-2 flex gap-1 justify-center">
                    <input
                     onChange={(e) => handleChange(e, item)}
                     className={`${editModeStyle} w-[6rem] bg-blue-100 rounded-md p-1`} type="text" disabled={editMode ? false : true}
                     value={editMode ? itemsBeingEdited.find((value) => (value === item))?.QUANTIDADE : item.QUANTIDADE}
                     />
                     <button
                        id={String(item.ID_PRODUTO)}
                        className="delete hover:bg-slate-300 rounded-sm p-[0.5]"
                        onClick={(e) => handleActivateInput(e)}
                      >
                        <EditIcon className="cursor-pointer text-blue-600" />
                      </button>
                        <button
                        id={String(item.ID_PRODUTO)}
                        className="edit text-red-700 hover:bg-slate-300 rounded-sm p-[0.5] underline font-normal"
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onClick={(_e) => handleDelete(item)}
                      >
                        <DeleteForeverIcon />
                      </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        { editMode && 
        <Button
          onClick={(e) => handleSave(e)}
          sx={{padding: '1rem', margin: '2rem'}}>SALVAR</Button> }
      </div>
    // </div>
  );
}

export default RequisitionItemsTable