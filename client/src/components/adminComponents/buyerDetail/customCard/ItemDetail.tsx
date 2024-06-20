import { Card, CardContent, Typography } from '@mui/material';

type Props = { title?: string; borderColor?: string; children: React.ReactNode };

const ItemDetail = ({ title, children }: Props) => {
    return (
        <Card sx={{
            display: "flex",
            flexDirection: "column",
            border: `1px solid #FF9E27`,
            borderRadius: '10px',
            mb: 1,
            color: '#FFF',
            fontSize: 11
        }}>
        <CardContent
            sx={{
                display: "flex",
                flexDirection: "column"
            }}
            >
                <Typography variant="h6" component="div">
                    {title}
                </Typography>
                {children}
        </CardContent>
        </Card>
    );
};

export default ItemDetail;
