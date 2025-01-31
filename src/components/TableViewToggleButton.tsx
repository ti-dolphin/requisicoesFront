import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import {  buttonStylesMobile } from "../utilStyles";

interface ViewToggleButtonProps {
  isCardViewActive: boolean;
  setIsCardViewActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const TableViewToggleButton: React.FC<ViewToggleButtonProps> = ({
  isCardViewActive,
  setIsCardViewActive,
}) => {

  const handleChangeView = () => {
    console.log({ isCardViewActive: !isCardViewActive });
    setIsCardViewActive(!isCardViewActive);
  };
  return (
    <Tooltip
      title={`Mudar para ${isCardViewActive ?  "Tabela" : "Cards"}`}
    >
      <IconButton
        onClick={handleChangeView}
        sx={{
            ...buttonStylesMobile
        }}
      >
        {isCardViewActive ?  <GridViewIcon /> : <TableRowsIcon /> }
      </IconButton>
    </Tooltip>
  );
};

export default TableViewToggleButton;
