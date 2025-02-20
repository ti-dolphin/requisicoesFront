export const styles = {
    modal :  {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: {
            //responsive width
            xs: "95%",
            md: "40%",
            lg: "50%"
        },
        height: '95%',
        bgcolor: "background.paper",
        boxShadow: 24,
        overFlow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 1,
        gap: 2
    },
    sliderContainer: {
        height: { xs: 450, md: "auto" },
        overflowY: "scroll",
        "&::-webkit-scrollbar": {
            width: "4px", // Largura da barra de scroll
        },
        "&::-webkit-scrollbar-track": {
            background: "#f1f1f1", // Cor de fundo da trilha da barra de scroll
            borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
            borderRadius: "4px",
        },
    },
    saveButtonContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundColor: 'white',
        position: "fixed",
        padding: 2,
        bottom: 2,
        zIndex: 20,
    }
};