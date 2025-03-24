import { SxProps, Theme } from "@mui/material/styles";

export const styles = {
    appBar: {
        display: "flex",
        flexDirection: { 
            xs: "column",
            sm: "row",
            md: "row",
            lg: "row",
        },
        flexWrap: 'noWrap',

        position: "static",
        backgroundColor: "#2B3990",
        alignItems: "start",
        justifyContent: "start",
        zIndex: 10,
       
        gap: 0.4,
        padding: 1,
        boxShadow: "none",
    } as SxProps<Theme>,

    stack: {
        flexDirection: "row",
        alignItems: "center",
        padding: 0,
    } as SxProps<Theme>,

    toolbar: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "fit-content",
        justifyContent: "start",
        flexWrap: "wrap",
        width: "fit-content",
        gap: {
            xs: 4,
            sm: 3,
            md: 2,
            lg: 1,
        },
        overflowX: "auto",
        "&::-webkit-scrollbar": {
            padding: "10px",
            width: "4px",
            height: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
            height: "2px",
            backgroundColor: "white",
            borderRadius: "4px",
        },
        overflowY: "hidden",
        padding: 1,
    } as SxProps<Theme>,



    stackButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 1,
        alignItems: "center",
    } as SxProps<Theme>,

   

    textField: {
        borderRadius: 1,
        height: 30,
        backgroundColor: "white",
        color: "black",
        "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderColor: "white",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "2px solid",
            borderColor: "#8dc6ff",
        },
        maxWidth: 150,
    } as SxProps<Theme>,

    checkbox: {
        color: "white",
        "& .Mui-checked": {
            color: "white",
        },
    } as SxProps<Theme>,
};