export const similarOpportunitiesModalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column",
  p: 3,
  borderRadius: 2,
  minWidth: {
    xs: 320,
    sm: 500,
  },
  maxWidth: 600,
  maxHeight: "80vh",
  zIndex: 1400,
};
