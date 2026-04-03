import { Box, Button, Stack } from "@mui/material";

const PageComponent = ({ serverData, movePage }) => {
  return (
    <Box mt={3} display="flex" justifyContent="center">
      <Stack direction="row" spacing={1}>
        {serverData.prev && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => movePage({ page: serverData.prevPage })}
          >
            Prev
          </Button>
        )}

        {serverData.pageNumList?.map((pageNum) => (
          <Button
            key={pageNum}
            variant={serverData.current === pageNum ? "contained" : "outlined"}
            color="primary"
            onClick={() => movePage({ page: pageNum })}
          >
            {pageNum}
          </Button>
        ))}

        {serverData.next && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => movePage({ page: serverData.nextPage })}
          >
            Next
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default PageComponent;