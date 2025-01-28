export const BaseButtonStyles = {
  backgroundColor: "orange",
  color: "white",
  borderRadius: "8px",
  padding: "8px 12px",
  textTransform: "capitalize",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px", // Espaçamento entre o ícone e o texto
  "&:hover": {
    backgroundColor: "#ff9800",
  },
};

export const buttonStylesMobile = {
  backgroundColor: "orange",
  color: "white",
  borderRadius: "100%",
  padding: 0,
  minWidth: 40,
  height: 40,
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Sombra para elegância
  "&:hover": {
    backgroundColor: "#ff9800",
  },
};
export const basicAppbarStyles = {
  backgroundColor: "#2B3990",
  display: "flex",
  justifyContent: "center",
  padding: "0.2rem",
};

export const basicCardStyles = {
  boxShadow: "none",
  display: "flex",
  justifyContent: "center",
  flexShrink: 1,
  flexGrow: 1,
  paddingBottom: "5px",
  paddingLeft: "5px",
  paddingRight: "5px",
  paddingTop: "5px",
};
export const basicCardContentStyles = {
  display: "flex",
  flexDirection: "column",
  width: "fit-content",
  alignItems: "start",
  gap: 0.8,
  padding: 1,
  justifyContent: "center",
  borderRadius: "16px",
};