import { GridRow, GridRowProps } from "@mui/x-data-grid";
import React, { useState } from "react";

const CustomOpportunityRow = React.memo((props: GridRowProps) => {



    return (
        <>
            <GridRow {...props} />

        </>

    );
});
export default CustomOpportunityRow;