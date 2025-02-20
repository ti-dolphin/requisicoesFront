const style = {
    observationField: {
        borderRadius: 2, // Bordas arredondadas
        backgroundColor: "#f9f9f9", // Fundo claro para destacar
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Efeito de profundidade
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "#1976d2", // Cor da borda inicial
            },
            "&:hover fieldset": {
                borderColor: "#1565c0", // Cor da borda ao passar o mouse
            },
            "&.Mui-focused fieldset": {
                borderColor: "#0d47a1", // Cor da borda ao focar
                borderWidth: "2px", // Aumenta a espessura ao focar
            },
        },
        "& .MuiInputLabel-root": {
            color: "#757575", // Cor do label
        },
        "& .MuiInputLabel-root.Mui-focused": {
            color: "#0d47a1", // Cor do label ao focar
        },
    }
}
export default style;