import * as React from "react";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { IconButton } from "@mui/material";
import { buttonStylesMobile } from "../../utilStyles";

interface ChecklistFiltersMobileMenuProps {
  filterByStatus: (
    checklistStatus: string,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

export default function ChecklistFiltersMobileMenu({filterByStatus}: ChecklistFiltersMobileMenuProps) {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFilterByStatus = (
    filterName: string
  ) => {
    filterByStatus(filterName);
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{...buttonStylesMobile}}
      >
        <FilterAltIcon sx={{ color: "white" }} />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleFilterByStatus}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => handleFilterByStatus( "problemas")}>
          problemas
        </MenuItem>
        <MenuItem onClick={() => handleFilterByStatus( "atrasados")}>
          atrasados
        </MenuItem>
        <MenuItem onClick={() => handleFilterByStatus( "aprovar")}>
          para aprovar
        </MenuItem>
        <MenuItem onClick={() => handleFilterByStatus( "todos")}>
          todos
        </MenuItem>
      </Menu>
    </div>
  );
}
