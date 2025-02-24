import { Button, Stack } from '@mui/material'
import ItemActions from '../ItemActions/ItemActions'
import { Item } from '../../../types'
import { BaseButtonStyles } from '../../../../utilStyles';
import { ItemsContext } from '../../../context/ItemsContext';
import { useContext } from 'react';
import { ProductsTableModal } from '../../modals/ProductsTableModal';

interface props {
  handleCancelItems: (items: Item[]) => Promise<void>;
  handleActivateItems: (items: Item[]) => Promise<void>;
  handleCopyContent: (selectedItems: Item[]) => Promise<void>;
  handleDelete: (requisitionItems: Item[]) => Promise<void>;
  selectedRows: Item[] | undefined;
}

const ItemsToolBar = ({
    handleCancelItems,
    handleActivateItems,
    handleCopyContent,
    handleDelete,
    selectedRows,
} : props) => {

  const {adding, toggleAdding } = useContext(ItemsContext);

  return (
     <Stack direction="row" sx={{ height: 30, alignItems: "center", gap: 2 }}>
            {
              <ItemActions
                handleCancelItems={handleCancelItems}
                handleActivateItems={handleActivateItems}
                handleCopyContent={handleCopyContent}
                handleDelete={handleDelete}
                selectedItems={selectedRows}
              />
            }
            <Button onClick={() => toggleAdding()}  sx={{ ...BaseButtonStyles, height: 30 }}>
              Adicionar items
            </Button>

            <ProductsTableModal requisitionID={1}/>
          </Stack>
  )
}

export default ItemsToolBar