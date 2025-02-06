import { GridRow, GridRowProps } from "@mui/x-data-grid";
import React from "react";

const CustomOpportunityRow = React.memo((props: GridRowProps) => {



    return (
        <>
            <GridRow {...props} />

        </>

    );
});
export default CustomOpportunityRow;