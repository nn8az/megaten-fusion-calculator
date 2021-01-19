import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';

import styles from './scss/data-table.module.scss';

type StatePair<T> = [T, React.Dispatch<React.SetStateAction<T>>];
export type CellProps = {
    className?: string;
    width?: number;
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
}
export type SortSpec = {
    sortType: 'number' | 'string'
}
export type ColDef = {
    headerContent?: JSX.Element | string;
    sortSpec?: SortSpec;
    headerProps?: CellProps;
}
export interface DataTableProvider<T> {
    pageSize: number;
    getColumnDefinition(): ColDef[];
    getRowData(): T[];
    renderRow(rowData: T): JSX.Element | string | undefined;
    getSortValue(rowData: T, sortByCol: number): string | number;
    renderBanner?(): JSX.Element | undefined;
}
type DataTableProps = {
    dataTableProvider: DataTableProvider<any>;
}
const DataTable = (params: DataTableProps): JSX.Element => {
    const {dataTableProvider} = params;
    const [page, setPage] = React.useState<number>(0);
    const [sortByCol, setSortByCol] = React.useState<number | undefined>(undefined);
    const [sortDirection, setSortDirection] = React.useState<"desc" | "asc" | undefined>(undefined);
    const [sortType, setSortType] = React.useState<"number" | "string">("string");
    const pageSize: number = dataTableProvider.pageSize;

    const colDefs: ColDef[] = dataTableProvider.getColumnDefinition();
    const preIdRowData: any[] = dataTableProvider.getRowData();
    const totalRowCount: number = preIdRowData.length;

    // Empty row banner
    if (totalRowCount === 0) { 
        let ret = <React.Fragment />;
        let banner = dataTableProvider.renderBanner? dataTableProvider.renderBanner() : undefined;
        if (banner) { ret = banner }
        return ret;
    }

    // ID rows
    const rowData: { id: number, data: any }[] = preIdRowData.map((rd, index) => { return { id: index, data: rd } });

    // Sort rows
    if (sortByCol && sortDirection !== undefined) {
        const sortMult: number = (sortDirection === "asc") ? 1 : -1;
        const comparitor: (...x: any) => number = (sortType === "number") ? numberComparitor : stringComparitor;
        rowData.sort((a, b) => { 
            const valA = dataTableProvider.getSortValue(a.data, sortByCol);
            const valB = dataTableProvider.getSortValue(b.data, sortByCol);
            return sortMult * comparitor(valA, valB) });
    }

    // Paginate
    const paginizedRowData = rowData.filter((data, index) => (index >= page * pageSize) && (index < (page + 1) * pageSize));
    function changePage(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) {
        setPage(page);
    }
    
    // Render headers
    const headerCells: JSX.Element[] = [];
    let colNum: number = 0;
    for (const colDef of colDefs) {
        const headerContent = colDef.sortSpec ? buildSortableHeaderCellContent(colDef.headerContent, colNum, colDef.sortSpec.sortType, [sortByCol, setSortByCol], [sortDirection, setSortDirection], [sortType, setSortType]) : colDef.headerContent;

        headerCells.push(<TableCell {...colDef.headerProps}>{headerContent}</TableCell>);
        colNum++;
    }

    // Render rows
    const renderedRows: JSX.Element[] = [];
    for (const row of paginizedRowData) {
        renderedRows.push(
            <TableRow key={row.id}>
                {dataTableProvider.renderRow(row.data)}
            </TableRow>
        )
    }

    return <Paper className={styles.paperContainer} elevation={3}>
        <TableContainer className={styles.tableContainer}>
            <Table>
                <TableHead className={styles.header}>
                    <TableRow >
                        {headerCells}
                    </TableRow>
                </TableHead>
                <TableBody className={styles.tableBody}>
                    {renderedRows}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[pageSize]}
                component="div"
                count={totalRowCount}
                rowsPerPage={pageSize}
                page={page}
                onChangePage={changePage}
            />
        </TableContainer>
    </Paper>
}
export default DataTable;

function stringComparitor(a: string, b: string): number {
    return (a > b) ? 1 : (a === b) ? 0 : -1;
}

function numberComparitor(a: number, b: number): number {
    return a - b;
}

function buildSortableHeaderCellContent(
    headerInnerContent: JSX.Element | string | undefined,
    id: number,
    colSortType: "number" | "string",
    _sortByCol: StatePair<number | undefined>,
    _sortDirection: StatePair<"desc" | "asc" | undefined>,
    _sortType: StatePair<"number" | "string">
): JSX.Element {
    const [sortByCol] = _sortByCol;
    const [sortDirection] = _sortDirection;

    return <TableSortLabel
        active={sortByCol === id && sortDirection !== undefined}
        direction={sortByCol === id ? sortDirection : undefined}
        onClick={createSortHandler(id, colSortType, _sortByCol, _sortDirection, _sortType)}>
        {headerInnerContent}
    </TableSortLabel>;
}

function createSortHandler(id: number,
    colSortType: "number" | "string",
    _sortByCol: StatePair<number | undefined>,
    _sortDirection: StatePair<"desc" | "asc" | undefined>,
    _sortType: StatePair<"number" | "string">
): (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void {
    return (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        const [sortByCol, setOrderBy] = _sortByCol;
        const [sortDirection, setSortDirection] = _sortDirection;
        const [, setSortType] = _sortType;

        let nextSortDirection = sortDirection;
        if (sortByCol === id) {
            if (sortDirection === "asc") { nextSortDirection = "desc" }
            if (sortDirection === "desc") { nextSortDirection = undefined }
            if (sortDirection === undefined) {nextSortDirection = "asc"}
        } else {
            nextSortDirection = "asc";
        }
        setSortDirection(nextSortDirection);
        setOrderBy(id);
        setSortType(colSortType);
    };
}