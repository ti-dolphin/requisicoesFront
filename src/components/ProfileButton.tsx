import { useContext, useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { userContext } from "../Requisitions/context/userContext";
import { buttonStylesMobile } from "../utilStyles";
// Estilo para o botão (assumindo que já existe)


function ProfileButton() {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);
  const {toggleLogedIn } = useContext(userContext);

  const handleClick = (event : React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogOut = () => {
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("token");
    toggleLogedIn(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        sx={{ ...buttonStylesMobile, position: "absolute", right: 4 }}
        onClick={handleClick}
      >
        <AccountCircleIcon sx={{ color: "white" }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleClose}>Perfil</MenuItem>
        <MenuItem onClick={handleClose}>Configurações</MenuItem>
        <MenuItem onClick={handleLogOut}>Sair</MenuItem>
      </Menu>
    </>
  );
}

export default ProfileButton;
