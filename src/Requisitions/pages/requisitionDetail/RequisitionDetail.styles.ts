const styles = {
  requisitionPageContainer: {
    width: "100%",
    border: "1px solid #d3d6db",
    height: "100%",
    backgroundColor: "white",
    margin: "auto",
  },
  alertEditionNotAllowed: {
    top: "10%",
    width: "400px",
    position: "absolute",
    left: "50%",
    marginLeft: "-200px",
  },
  alertProjectAltered: {
    top: "10%",
    width: "400px",
    position: "absolute",
    left: "50%",
    marginLeft: "-200px",
  },
  requisitionPageHeader: {
    padding: "1rem",
    display: "flex",
    alignItems: "center",
  },
  requisitionTitle: {
    fontSize: {
      xs: "12px",
      md: "16px",
    },
  },
  requisitionStepper: {
    padding: "0.5rem",
  },
  requisitionChilds: {
    border: "1px solid #e3e3e3",
  },
  actionsStack: {
    paddingX: "2rem",
    flexWrap: "wrap",
    direction: "row",
    justifyContent: "end",
  },
  materialsServicesButton: {
    border: "none",
    height: "30px",
    borderRadius: "0px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  materialsServicesText: {
    textDecoration: "underline",
    color: "#2B3990",
  },
  materialsServicesBadge: {
    color: "secondary",
  },
  requisitionContent: {
    flexWrap: "wrap",
    height: {
      xs: "1080px",
      sm: "800px",
      lg: "600px",
    },
  },
  requisitionDetails: {
    padding: "0.5rem",
    maxHeight: "60vh",
    overflowY: "auto",
    width: {
      xs: "100%",
      md: "50%",
      lg: "25%",
    },
    display: "flex",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  detailsStack: {
    width: "100%",
    padding: "1rem",
  },
  detailsTitle: {},
  detailsField: {
    width: "100%",
  },
  fieldContainer: {
    padding: "4px",
    borderRadius: "4px",
  },
  projectAutocomplete: {
    width: "100%",
    outline: "none",
  },
  saveButton: {},
  fieldInput: {
    width: "100%",
    backgroundColor: "white",
    fontSize: "0.875rem", // equivalent to text-sm
    textTransform: "lowercase",
    focusOutline: "none",
  },
  editButton: {
    cursor: "pointer",
  },
  requisitionItemsTableContainer: {
    height: 500,
    width: '100%',
    border: "0.5px solid #e3e3e3",
    overflowY: "auto",
    display: "flex",
    flexDirection: 'column',
    padding: 1,
    flexGrow: 1
  },
};

export default styles;
