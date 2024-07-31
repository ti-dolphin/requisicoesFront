import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';

// interface FilterProps { 
//     handleSearch: ( e: React.KeyboardEvent<HTMLInputElement>) => void;
// }



export default function Filter() {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
        // handleSearch(e);
    };

    return (
        <div>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{gap: '0.5rem'}}
            >
               <p>Status</p>
               <ArrowDropDownCircleIcon />
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                { 
                    ["Todos", "Em edição" , "Requisitado" , "Em cotação", "Cotado", "Comprar", "Concluído"].map((item) => ( 
                        <MenuItem onClick={() => handleClose() }>{item}</MenuItem>
                    ))
                }
            </Menu>
        </div>
    );
}
