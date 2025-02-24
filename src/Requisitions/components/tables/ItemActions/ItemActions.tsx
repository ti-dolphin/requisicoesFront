/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { Dropdown } from "@mui/base/Dropdown";
import { Menu, MenuListboxSlotProps } from "@mui/base/Menu";
import { MenuButton as BaseMenuButton } from "@mui/base/MenuButton";
import { MenuItem as BaseMenuItem, menuItemClasses } from "@mui/base/MenuItem";
import { Box, styled } from "@mui/system";
import { CssTransition } from "@mui/base/Transitions";
import { PopupContext } from "@mui/base/Unstable_Popup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Item } from "../../../types";
import { buttonStylesMobile } from "../../../../utilStyles";
import DeleteRequisitionItemModal from "../../modals/warnings/DeleteRequisitionFileModal";
import { useItemActions } from "./hooks";
import { useEffect } from "react";
import { ItemsContext } from "../../../context/ItemsContext";
import { ProductsTableModal } from "../../modals/ProductsTableModal";
import { useParams } from "react-router-dom";


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


      <Dropdown
        display={open ? "block" : "none"}
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
