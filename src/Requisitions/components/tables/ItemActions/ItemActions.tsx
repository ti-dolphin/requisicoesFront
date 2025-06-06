/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { Dropdown } from "@mui/base/Dropdown";
import { Menu } from "@mui/base/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Item } from "../../../types";
import DeleteRequisitionItemModal from "../../modals/warnings/DeleteRequisitionFileModal";
import { useItemActions } from "./useItemActions";
import { Alert, AlertColor } from "@mui/material";


interface ItemActionsProps {
  handleDelete: (requisitionItem: Item[]) => Promise<void>;
  handleCancelItems: (item: Item[]) => Promise<void>;
  handleActivateItems: (item: Item[]) => Promise<void>;
  handleCopyContent: (selectedItems: Item[]) => Promise<void>;
  selectedItems?: Item[];
}
const ItemActions = ({
  handleCancelItems,
  handleActivateItems,
  handleCopyContent,
  handleDelete,
  selectedItems

}: ItemActionsProps) => {
 const {
   deleteItemModal,
   setDeleteItemModal,
   setExecuteSelectedAction,
   menuActions,
   AnimatedListbox,
   MenuButton,
   MenuItem,
   setOpen,
   open,
   alert,
   handleOpenChange,
 } = useItemActions(
   handleCopyContent,
   handleCancelItems,
   handleActivateItems,
   selectedItems,

   handleDelete
 );
  return (
    <>
      <DeleteRequisitionItemModal
        deleteItemModal={deleteItemModal}
        setDeleteItemModal={setDeleteItemModal}
        setExecuteSelectedAction={setExecuteSelectedAction}
        setIsMenuActionsOpen={setOpen}
      />
      {alert && (
        <Alert severity={alert?.severity as AlertColor}>{alert?.message}</Alert>
      )}
      <Dropdown
        display={open ? "block" : "none"}
        sx={{
          ".base-Popup-root": {
            display: open ? "block" : "none",
          },
        }}
        open={open}
        onOpenChange={(
          _event:
            | React.MouseEvent
            | React.KeyboardEvent
            | React.FocusEvent
            | null,
          open: boolean
        ) => handleOpenChange(open)}
      >
        <MenuButton>
          <ArrowDropDownIcon />
        </MenuButton>
        <Menu slots={{ listbox: AnimatedListbox }}>
          {open &&
            menuActions.map((action, index) => (
              <MenuItem key={index} onClick={action.onClick}>
                {action.label}
              </MenuItem>
            ))}
        </Menu>
      </Dropdown>
    </>
  );
};



export default ItemActions;
