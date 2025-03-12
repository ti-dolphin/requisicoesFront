import { SxProps, Theme } from "@mui/material";

const styles = {

    mainContainer: {
        display: { 
            xs: 'none',
            md: 'flex',
        },
        backgroundColor: 'white',
        flexDirection: "column",
        borderRadius: '5px',
        height: 'fit-content',
        gap: 1, 
        padding: 0.5,
        
    },
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
        gridTemplateRows: "repeat(3, 1fr)", // 3 linhas com tamanho igual
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
}
export default styles;