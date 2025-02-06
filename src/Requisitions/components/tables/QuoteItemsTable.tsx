import  { useEffect, useState } from 'react'
import { QuoteItem } from '../../types';
import { DataGrid, GridColDef, GridColumnHeaders, GridColumnHeadersProps, GridRowSelectionModel } from '@mui/x-data-grid';
import { Box, Button, Stack, Typography } from '@mui/material';
import { BaseButtonStyles } from '../../../utilStyles';
import typographyStyles from '../../utilStyles';

interface props {
    items: QuoteItem[];
    isSupplier: boolean | undefined
}

const QuoteItemsTable = ({ items, isSupplier }: props) => {
    const [currentItems, setCurrentItems] = useState<QuoteItem[]>([...items]);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [selectionModel, setSelectionModel] = useState<number[]>();
    console.log({
        currentItems,
        isSelecting,
        selectionModel,
        setCurrentItems
    })
    const handleGenerateSupplierUrl = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('supplier', '1');
        navigator.clipboard.writeText(url.toString())
            .then(() => {
                console.log('URL copiada para a área de transferência:', url);
            })
            .catch((err) => {
                console.error('Erro ao copiar a URL:', err);
            });
        alert('Link copiado para área de transferência');
    }

    const handleSelection = (newSelectionModel: GridRowSelectionModel) => {
        setIsSelecting(true);
        if (newSelectionModel.length) {
            setIsSelecting(true);
            setSelectionModel(newSelectionModel as number[]);
            return
        }
        setIsSelecting(false);
    }

    const columns: GridColDef[] = [
        { field: "id_item_cotacao", headerName: "ID Item", width: 100, editable: true },
        { field: "descricao_item", headerName: "Descrição", width: 300, editable: true },
        {
            field: "preco_unitario",
            headerName: "Preço Unitário (R$)",
            width: 150,
            editable: true,
            valueFormatter: (value: Number) =>
                value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }),
        },
        { field: "quantidade", headerName: "Quantidade", width: 120, editable: true },
        {
            field: "subtotal",
            headerName: "Subtotal (R$)",
            width: 150,
            editable: true,
            valueFormatter: (value: Number) =>
                value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }),
        },
    ];

    const CustomColumnHeaders = (props: GridColumnHeadersProps) => {
        return (
            <GridColumnHeaders {...props} />
        );
    }

    console.log(CustomColumnHeaders)

    useEffect(() => {


    }, [])

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1, padding: 1 }}>
            {!isSupplier &&
                (<Button sx={{ ...BaseButtonStyles, width: 200 }} onClick={handleGenerateSupplierUrl}>
                    Gerar Link de fornecedor
                </Button>)}
            {isSupplier &&
                (<Button sx={{ ...BaseButtonStyles, width: 200 }} onClick={handleGenerateSupplierUrl}>
                    Enviar cotação
                </Button>)}
            { 
                   isSupplier && 
                (<Stack direction="row" gap={2} alignItems="center">
                    <Typography sx={typographyStyles.heading1}>
                        Por favor, preencha a coluna preço unitário com seus valores!
                    </Typography>
                    <Typography sx={typographyStyles.heading2}>
                            (após preencher todos os itens, clique em "Enviar Cotação"!)
                    </Typography>
                </Stack>)
                }
            <DataGrid
                rows={items.map((item) => ({
                    ...item,
                    id: item.id_item_cotacao, // O DataGrid exige um campo "id"
                }))}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 100,
                        },
                    },
                }}
                onRowSelectionModelChange={handleSelection}
                density='compact'
                autosizeOnMount
                pageSizeOptions={[50, 100]}
                disableRowSelectionOnClick
            />
        </Box>
    )
}

export default QuoteItemsTable