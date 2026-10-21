import { Box, Typography, Pagination as MuiPagination } from "@mui/material";

export default function Pagination({ page = 1, totalPages = 1, totalElements = 0, onChange }) {
    if (totalPages <= 1 && totalElements <= 0) return null;

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mt: 3,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
            }}
        >
            <Typography variant="body2" color="text.secondary">
                Page {page} of {Math.max(totalPages, 1)} ({totalElements} items total)
            </Typography>

            <MuiPagination
                count={Math.max(totalPages, 1)}
                page={page}
                onChange={(_, val) => onChange(val)}
                color="primary"
                shape="rounded"
                size="small"
                showFirstButton
                showLastButton
            />
        </Box>
    );
}
