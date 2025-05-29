import { MenuListboxSlotProps } from "@mui/base/Menu";
import { MenuButton as BaseMenuButton } from "@mui/base/MenuButton";
import { MenuItem as BaseMenuItem, menuItemClasses } from "@mui/base/MenuItem";
import { styled } from "@mui/system";
import { CssTransition } from "@mui/base/Transitions";
import { PopupContext } from "@mui/base/Unstable_Popup";
import { buttonStylesMobile } from "../../../../utilStyles";
import React, { useContext, useEffect } from "react";
import { blue, grey } from "@mui/material/colors";
import { ItemsContext } from "../../../context/ItemsContext";
import { AlertInterface } from "../../../types";

export const useItemActions = (
  handleCopyContent: any,
  handleCancelItems: any,
  handleActivateItems: any,
  selectedItems: any,
  handleDelete: any
  
) => {
  const [deleteItemModal, setDeleteItemModal] = React.useState<boolean>(false);
  const [executeSelectedAction, setExecuteSelectedAction] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);
  const {setChangingProduct } = useContext(ItemsContext);
  const [alert, setAlert] = React.useState<AlertInterface>();

  const handleOpenChange = (isOpen: boolean) => {
    console.log("open change: ", isOpen);
    setOpen(isOpen);
  };

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  const menuActions = [
    {
      label: "Excluir",
      onClick: () => {
        setDeleteItemModal(true);
      },
    },
    { 
      label: 'Substituir',
      onClick: () => {
        if(selectedItems.length > 1) { 
          displayAlert('error', 'Selecione apenas um item para substituir por vez');
          return;
        }
        setChangingProduct([true, selectedItems[0]]);
      }
    },
    {
      label: "Copiar",
      onClick: () => handleCopyContent(selectedItems),
    },
    {
      label: "Inativar",
      onClick: () => handleCancelItems(selectedItems),
    },
    {
      label: "Ativar",
      onClick: () => handleActivateItems(selectedItems),
    },
    {
      label: "Gerar cotação",
      onClick: () => {},
    },
  ];

  const Listbox = styled("ul")(
    ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  box-shadow: 0px 4px 30px ${
    theme.palette.mode === "dark" ? grey[900] : grey[200]
  };
  z-index: 1;

  .closed & {
    opacity: 0;
    transform: scale(0.95, 0.8);
    transition: opacity 200ms ease-in, transform 200ms ease-in;
  }
  
  .open & {
    opacity: 1;
    transform: scale(1, 1);
    transition: opacity 100ms ease-out, transform 100ms cubic-bezier(0.43, 0.29, 0.37, 1.48);
  }

  .placement-top & {
    transform-origin: bottom;
  }

  .placement-bottom & {
    transform-origin: top;
  }
  `
  );

  const AnimatedListbox = React.forwardRef(function AnimatedListbox(
    props: MenuListboxSlotProps,
    ref: React.ForwardedRef<HTMLUListElement>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ownerState, ...other } = props;
    const popupContext = React.useContext(PopupContext);

    if (popupContext == null) {
      throw new Error(
        "The `AnimatedListbox` component cannot be rendered outside a `Popup` component"
      );
    }

    const verticalPlacement = popupContext.placement.split("-")[0];


    return (
      <CssTransition
        className={`placement-${verticalPlacement}`}
        enterClassName="open"
        exitClassName="closed"
      >
        <Listbox {...other} ref={ref} sx={{display: open ? 'block' : 'none'}}/>
      </CssTransition>
    );
  });

  const MenuItem = styled(BaseMenuItem)(
    ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;
  &:last-of-type {
    border-bottom: none;
  }

  &.${menuItemClasses.focusVisible} {
    outline: 3px solid ${theme.palette.mode === "dark" ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[100]};
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === "dark" ? grey[700] : grey[400]};
  }

  &:hover:not(.${menuItemClasses.disabled}) {
    background-color: ${theme.palette.mode === "dark" ? blue[900] : blue[50]};
    color: ${theme.palette.mode === "dark" ? blue[100] : blue[900]};
  }
  `
  );

  const MenuButton = styled(BaseMenuButton)(() => {
    return { ...buttonStylesMobile, height: 35, width: 30 };
  });

  useEffect(() => {
    if (executeSelectedAction === "delete") {
      handleDelete(selectedItems);
      setExecuteSelectedAction("");
    }
  }, [executeSelectedAction]);

  return {
    deleteItemModal,
    setDeleteItemModal,
    executeSelectedAction,
    setExecuteSelectedAction,
    menuActions,
    AnimatedListbox,
    alert,
    MenuItem,
    MenuButton,
    open,
    setOpen,
    handleOpenChange,
  };
};
