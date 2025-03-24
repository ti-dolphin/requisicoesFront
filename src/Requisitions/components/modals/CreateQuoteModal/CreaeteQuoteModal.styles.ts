const styles = {
    modalContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "90%", sm: "80%", md: "60%", lg: "40%" },
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
    },
    modalTitle: {
        mb: 2,
    },
    textField: {
        width: "100%",
    },
    buttonContainer: {
        mt: 3,
        display: "flex",
        justifyContent: "flex-end",
        gap: 2
    },
    cancelButton: {
        mr: 2,
    },
    submitButton: {
        minWidth: 100,
    },
};

export default styles;