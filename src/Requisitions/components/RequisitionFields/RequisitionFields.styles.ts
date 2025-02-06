const styles = { 
        fieldsGridContainer :  { 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            padding: 1,
            width: {
                xs: '100%',
                md: '80%',
              
            },
            border: '1px solid lightgray'
        },
        fieldsGrid : { 
            display: 'grid',
            gridTemplateColumns : {
                xs: '1fr',
                md: `1fr 1fr`,
                lg: `1fr 1fr 1fr 1fr`
            },
            gap : 1,
            rowGap: 2
        },
        autoComplete: { 
            gridColumn : `span 2`
        },
        actionsStack: { 
            alignItems: 'center',
            gap: 2
        }
}

export default styles;