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
export const OpportunityGridStyles = { 
     width: "100%",
                 borderCollapse: "collapse",
                 fontFamily: "Arial, sans-serif",
                 fontSize: "12px",
                 fontWeight: "500",
                 padding: 0,
                 borderRadius: 0,
                 color: "#233142",
                 "& .MuiDataGrid-columnHeaders": {
                   color: "black",
                   
                   "& .MuiDataGrid-columnHeader": {
                     borderRadius: 0,
                     backgroundColor: '#f5f5f5', // Cinza claro
                   },
                 },
                 "& .MuiDataGrid-row" : {
                   '&:nth-of-type(odd)': {  // Linhas ímpares
                     backgroundColor: '#f5f5f5', // Cinza claro
                   },
                   '&:nth-of-type(even)': { // Linhas pares
                     backgroundColor: '#ffffff', // Branco
                   },
                   '&:hover': {
                     backgroundColor: '#e0e0e0 !important', // Cinza mais escuro ao passar o mouse
                   },
                 },
                 "& .MuiDataGrid-topContainer": {
                   borderRadius: 0,
                 },
                 "& .MuiDataGrid-columnHeaderTitle": {
                   fontWeight: "semibold",
                   fontSize: 12,
                 },
                 "& .description-cell": { 
                    color: 'blue'
                 },
                 "& .MuiDataGrid-cell": {
                   paddingLeft: 1.2,
                 },
                 "& .MuiDataGrid-menuIconButton":{ 
                  display: 'none'
                 }
               
}
export const buttonStylesMobile = {
  backgroundColor: "orange",
  color: "white",
  borderRadius: "100%",
  padding: 0,
  minWidth: 40,
  height: 40,
  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)", // Sombra para elegância
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
  alignItems: 'center',
  flexShrink: 1,
  flexGrow: 1,
  paddingBottom: "5px",
  paddingLeft: "5px",
  paddingRight: "5px",
  paddingTop: "5px",

};
export const basicCardContentStyles = {
  boxShadow: `rgba(149, 157, 165, 0.2) 0px 8px 24px`,
  display: "flex",
  flexDirection: "column",
  width: "fit-content",
  alignItems: "start",
  gap: 0.8,
  padding: 1,
  justifyContent: "center",
  borderRadius: "16px",
};
export const cardTitleStyle = {
  fontSize: 14,
  textTransform: 'uppercase',
  width: '100%',
  textAlign: 'center',
  color: "textPrimary",
  fontWeight: "500",
};
export const alertStyles = { 
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000
}
export const alertAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 }
}