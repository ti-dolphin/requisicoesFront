import React, { useEffect, useState } from 'react'
import { Item, deleteRequisitionItem, updateRequisitionItems } from '../../utils';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from "@mui/icons-material/Edit";
import { Button } from '@mui/material';
import { requisitionItemsTableProps } from '../../types';
import DeleteRequisitionItemModal from '../modals/warnings/DeleteRequisitionITemModal';




const RequisitionItemsTable: React.FC<requisitionItemsTableProps> = ({ items, refreshToggler }) => {

  const [requisitionItems, setRequisitionItems] = useState<Item[]>([]);
  const [itemsBeingEdited, setItemsBeingEdited] = useState<Item[]>([]);
  const columns = ['Produto', 'Quantidade'];
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editModeStyle, setEditModeStyle] = useState('');
  const [isDeleteRequisitionItemModalOpen, setIsDeleteRequisitionItemModalOpen] = useState<boolean>(false);
  const [itemBeingDeleted, setItemBeingDeleted ] = useState<Item>();
  useEffect(() => {
    setRequisitionItems(items);
    setItemsBeingEdited(items);
  }, [items, refreshToggler]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, item: Item) => {
    const { value } = e.target;
    const currentItems = itemsBeingEdited.map(item => ({ ...item }));
    const editedItem = currentItems.find(value => (value.nome_fantasia.includes(item.nome_fantasia)));
    if (editedItem) {
      editedItem.QUANTIDADE = Number(value);
      console.log('new items: ', [...currentItems]);
    }
    setItemsBeingEdited([...currentItems]);
  }

  const handleSave = async () => {
    try {
      const requisitionID = Number(itemsBeingEdited[0].ID_REQUISICAO);
      await updateRequisitionItems(itemsBeingEdited, requisitionID);
      setRequisitionItems(itemsBeingEdited);
    } catch (e) {
      console.log(e);
    }

    setEditMode(false);
    setEditModeStyle('');
  }

  const handleActivateInput = () => {
    setEditMode(true);
    setEditModeStyle('border border-blue-500 ');
  }

  const handleDelete = async (requisitionItem: Item) => {
    const items = [...requisitionItems]
    try {
      await deleteRequisitionItem(Number(requisitionItem.ID_PRODUTO), requisitionItem.ID_REQUISICAO);
      items.splice(items.indexOf(requisitionItem), 1);
      setRequisitionItems(items);
      setIsDeleteRequisitionItemModalOpen(false);
    } catch (e) {
      console.log(e);
    }

  }
  
  return (
    // <div  className="border w-full p-2 overflow-auto overflow-y-scroll border-blue-100 flex flex-col items-center">
    <div className="realative">
      <table className="text-sm w-full text-left rtl:text-right text-gray-500 ">
        <thead className="text-xs text-white uppercase bg-gray-50 ">
          <tr className=' border border-black'>
            {columns.map((columnName) => (
              <th className="px-4 w-1/2 py-3 border text-black"><h1 className='text-center'>{columnName}</h1></th>
            ))}
          </tr>
        </thead>
        <tbody className=''>
          {requisitionItems.map((item) => (
            <tr className="bg-white border ">
              <td
                scope="row"
                className="text-sm px-4 py-2 text-gray-900 whitespace-nowrap border"
              >
                <p className='overflow-x-auto max-w-[350px]'>{item.nome_fantasia}</p>
              </td>
              <td className="px-4 py-2 flex gap-1 items-center justify-center">
                <input
                  onChange={(e) => handleChange(e, item)}
                  className={`${editModeStyle} w-[6rem] bg-blue-100 rounded-md p-1`} type="text" disabled={editMode ? false : true}
                  value={editMode ? itemsBeingEdited.find((value) => (value === item))?.QUANTIDADE : item.QUANTIDADE}
                />
                <button
                  id={String(item.ID_PRODUTO)}
                  className="delete hover:bg-slate-300 rounded-sm p-[0.5]"
                  onClick={() => handleActivateInput()}
                >
                  <EditIcon className="cursor-pointer text-blue-600" />
                </button>
                <button
                  id={String(item.ID_PRODUTO)}
                  className="edit text-red-700 hover:bg-slate-300 rounded-sm p-[0.5] underline font-normal"
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  onClick={() => { 
                    setIsDeleteRequisitionItemModalOpen(true);
                    setItemBeingDeleted(item);
                   }}
                >
                  <DeleteForeverIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editMode &&
        <Button
          onClick={() => handleSave()}
          sx={{ padding: '1rem', margin: '2rem' }}>SALVAR</Button>}
      {
        isDeleteRequisitionItemModalOpen && itemBeingDeleted && <DeleteRequisitionItemModal
          isDeleteRequisitionItemModalOpen={isDeleteRequisitionItemModalOpen}
          setIsDeleteRequisitionItemModalOpen={setIsDeleteRequisitionItemModalOpen}
          handleDelete={handleDelete}
          item={itemBeingDeleted}
        />
      } 
    </div>
    // </div>
  );
}

export default RequisitionItemsTable