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
        height: {
            xs: "90%",
            xl: '85%'
        },
        bgcolor: "background.paper",
        boxShadow: 24,
        overFlow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 1,
        gap: 0.5,
    }
};