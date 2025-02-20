import { BaseButtonStyles } from "../../../utilStyles";

const styles = {
    container: {
        width: "100%",
        overflowY: "scroll",
        overflowX: "hidden",
        "::-webkit-scrollbar": {
            width: '4px'
        },
    },
    uploadButton: {
        ...BaseButtonStyles,
        width: "fit-content"
    },
    gallery: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 2,
        mt: 2,
        maxHeight: 300
    },
    fileContainer: {
        position: "relative",
        height: "150px",
        objectFit: "cover",
        cursor: "pointer",
        padding: 0.5,
    },
    deleteButton: {
        backgroundColor: "white",
        position: "absolute",
        right: -1,
        top: -2,
        zIndex: 20,
        "&:hover": { backgroundColor: "white" },
    },
    pdfPreview: {
        display: "block",
        height: "150px",
        width: "100%",
        textDecoration: "none",
    },
    iframe: {
        height: "100%",
        width: "100%",
        objectFit: "fill",
        pointerEvents: "none",
    },
    imagePreview: {
        cursor: "pointer",
        width: "100%",
        height: "100%",
        
        borderRadius: "5px",
    },
};
export default styles;