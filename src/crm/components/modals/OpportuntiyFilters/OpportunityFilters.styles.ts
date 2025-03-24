import { SxProps, Theme } from "@mui/material";

const styles = {

    mainContainer: {
        display: 'flex',
        backgroundColor: 'white',
        flexDirection: "column",
        borderRadius: '5px',
        height: 'fit-content',
        gap: 1, 
        padding: 0.5,
        
    },
    search: {
        maxWidth: {
            xs: 200,
            sm: 200,
            md: 250,
        },
        padding: 0.1,
        border: "0.5px solid #e3e3e3",
    } as SxProps<Theme>,
    container: {
        flexGrow: 1,
        flexShrink: 1,
        display: {
            xs: 'none',
            md: 'grid'
        },
        height: 'fit-content',
        padding: 1,
        borderRadius: '5px',
        gridTemplateColumns: "repeat(5, 1fr)", // 5 colunas com tamanho igual
        gap: 1.2,
        alignItems: 'center'
    },
    input: { 
        height: 36,
        borderRadius: 0,
        lineHeight: "normal",
        padding: 0,
        
    },
    formControl: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1.5,
        borderRadius: 0.5,
        zIndex: 20,
    } as SxProps<Theme>,
    checkbox: {
        color: "black",
        "& .Mui-checked": {
            color: "white",
        },
    }
}
export default styles;