const styles = {
    modalContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        width:  {
            xs: '100%',
            sm: '90%',
            md: '80%',
            lg: '50%',
            xl: '40%'
        },
        display: 'flex',
        flexDirection: 'column',
        gap: 2
    },
    rowStyle:  {
        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
        border: '1px solid lightgray',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderRadius: 2,
        cursor: 'pointer'
    }

}
export default styles;