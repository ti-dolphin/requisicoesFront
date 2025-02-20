export const styles = { 
    guideSelectorContainer: {
        display: "flex",
        width: "100%",
        gap: 1,
        alignItems: "center",
        overflowX: "scroll",
        padding: 2,
        backgroundColor: "white", // Cor de fundo
        zIndex: 20,
        border: '1px solid lightgray',
        borderRadius: 10,
        height: 50,
        "&::-webkit-scrollbar": {
            width: "4px", // Largura da barra de rolagem
            height: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
            display: 'none',
            height: "2px",
            backgroundColor: "#888", // Cor da barra de rolagem
            borderRadius: "4px", // Bordas arredondadas
        },
        
      }
}