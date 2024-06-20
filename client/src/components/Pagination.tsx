import { Pagination } from "@mui/material";

type Props = {
    page: number
    limit: number
    rows: number
    setPage: (page: number) => void
}

export default function CustomPagination({ page, setPage, limit, rows }: Props) {
    const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };
    return (
        <div style={{marginLeft: 'auto'}}>
            {rows / limit > 1 && <Pagination sx={{
                'button': {
                    color: '#ffffff',
                },
                'Mui-selected': {
                    backgroundColor: '#ffffff',
                },
            }} count={Math.ceil(rows / limit)} shape="rounded" page={page} onChange={handleChange} size="large" />}
        </div>
    );
}