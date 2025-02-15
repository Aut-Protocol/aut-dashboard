import { forwardRef, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";

const Datatable = ({
  apiRef,
  data,
  loading,
  columns,
  onStateChange,
  ...rest
}: any) => {
  const theme = useTheme();

  const handleDoubleCellClick = useCallback((params, event) => {
    event.defaultMuiPrevented = true;
  }, []);

  const handleCellKeyDown = useCallback((params, event) => {
    if (["Escape", "Delete", "Backspace", "Enter"].includes(event.key)) {
      event.defaultMuiPrevented = true;
    }
  }, []);

  const handleCellFocusOut = useCallback((params, event) => {
    if (params.cellMode === "edit" && event) {
      event.defaultMuiPrevented = true;
    }
  }, []);

  return (
    <div
      className="sw-datatable"
      style={{
        border: `qpx solid ${theme.palette.offWhite.main}`,
        padding: "35px"
      }}
    >
      <DataGrid
        autoHeight
        apiRef={apiRef}
        editMode="row"
        loading={loading}
        onCellDoubleClick={handleDoubleCellClick}
        onCellFocusOut={handleCellFocusOut}
        onCellKeyDown={handleCellKeyDown}
        onStateChange={onStateChange}
        hideFooter
        hideFooterPagination
        hideFooterSelectedRowCount
        disableColumnFilter
        showCellRightBorder={false}
        showColumnRightBorder={false}
        disableColumnMenu
        disableColumnSelector
        density="compact"
        sx={{
          border: "none",
          backgroundColor: "transparent",
          flexDirection: "column-reverse",
          color: "offWhite.main",
          ".MuiInputBase-input": {
            color: "offWhite.main",
            fontSize: "16px",
            textAlign: "left"
          },
          ".MuiDataGrid-columnHeaders": {
            borderBottom: "2px solid",
            borderColor: "offWhite.main"
          },
          ".MuiDataGrid-columnSeparator": {
            display: "none"
          },
          ".MuiDataGrid-cell": {
            fontSize: "16px",
            textAlign: "left",
            backgroundColor: "transparent !important"
          },
          ".MuiDataGrid-columnHeaderTitle": {
            width: "100%",
            textAlign: "left"
          },
          ".MuiDataGrid-columnHeader": {
            fontSize: "20px"
          },
          "& .actions": {
            color: "offWhite.main"
          },
          "& .textPrimary": {
            color: "offWhite.main"
          },
          ".MuiDataGrid-columnHeaderTitleContainer": {
            padding: 0
          }
        }}
        headerHeight={70}
        columns={columns}
        rows={data}
        {...rest}
      />
    </div>
  );
};

const AutDatatable = forwardRef((props: any, ref) => (
  <Datatable innerRef={ref} {...props} />
));

export default AutDatatable;
