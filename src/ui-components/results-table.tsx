import React from 'react';

import * as Models from '../data/data-models';

import DataTable, * as DataTables from './data-table';
import TableCell from '@material-ui/core/TableCell';
import {WarningBanner} from './minor-ui-components';

import styles from './scss/results-table.module.scss';
import Button from '@material-ui/core/Button';

class FusionResultsDataTableProvider implements DataTables.DataTableProvider<Models.FusedDemon> {

    pageSize: number = 50;

    getColumnDefinition(): DataTables.ColDef[] {
        const colDefs: DataTables.ColDef[] = [
            { headerContent: "Demon", sortSpec: { sortType: "string" }, headerProps: { className: styles.nameColumn } },
            { headerContent: "Level", sortSpec: { sortType: "number" }, headerProps: { className: styles.lvlColumn } },
            { headerContent: "Race", sortSpec: { sortType: "string" }, headerProps: { className: styles.raceColumn } },
        ];
        const statsName: string[] = Models.Demon.statsName;
        for (let i = 0; i < statsName.length; i++) {
            colDefs.push(
                { headerContent: statsName[i], headerProps: { className: styles.statColumn }, sortSpec: { sortType: "number" } }
            );
        }
        colDefs.push({ headerContent: "" });
        return colDefs;
    }

    getAllRowsData(): Models.FusedDemon[] {
        const resultsAsRowsArray: Models.FusedDemon[] = [];
        for (const ingCount in this.fusionResults) {
            if (Number(ingCount) === 1) { continue; }
            for (const demonId in this.fusionResults[ingCount]) {
                for (const fusedDemon of this.fusionResults[ingCount][demonId]) {
                    resultsAsRowsArray.push(fusedDemon);
                    break;
                }
            }
        }
        return resultsAsRowsArray;
    }

    renderRow(fusedDemon: Models.FusedDemon): JSX.Element {
        const renderedRow: JSX.Element[] = [];
        let keyId: number = 0;
        renderedRow.push(<React.Fragment key={keyId}>
            <TableCell className={styles.nameColumn}>
                {fusedDemon.demon.name}
            </TableCell>
            <TableCell className={styles.lvlColumn}>
                {fusedDemon.demon.lvl}
            </TableCell>
            <TableCell className={styles.raceColumn}>
                {fusedDemon.demon.race}
            </TableCell>
        </React.Fragment>);
        keyId++;
        for (const stat of fusedDemon.demon.stats) {
            renderedRow.push(<React.Fragment key={keyId}>
                <TableCell className={styles.statColumn}>
                    {stat}
                </TableCell>
            </React.Fragment>);
            keyId++;
        }
        renderedRow.push(<React.Fragment key={keyId}>
            <TableCell>
            <Button variant="outlined" onClick={this.recipesButtonHandler.bind(undefined, fusedDemon.demon.id)} className={styles.recipeButton}>View recipes</Button>
            </TableCell>
        </React.Fragment>);
        keyId++;
        return <React.Fragment>{renderedRow}</React.Fragment>;
    }
    
    getSortValue(rowData: Models.FusedDemon, sortByCol: number): string | number {
        switch(sortByCol) {
            case 0: { 
                return rowData.demon.name; }
            case 1: { 
                return rowData.demon.lvl; }
            case 2: { 
                return rowData.demon.race; }
            default: {
                return rowData.demon.stats[sortByCol-3]; }
        };
    }

    renderBanner(): JSX.Element {
        return <WarningBanner message="No results found" />
    }

    fusionResults: Models.FusionResults;
    recipesButtonHandler: (...x: any) => void;

    constructor(params: FusionResultsTableProps, onRecipesButtonClick: (demonId: number) => void) {
        this.recipesButtonHandler = onRecipesButtonClick;
        this.fusionResults = params.fusionResults;
    }
}

type FusionResultsTableProps = {
    fusionResults: Models.FusionResults,
    onOpenDemonRecipes: (demonId: number) => void
}
const ResultsTable = (props: FusionResultsTableProps): JSX.Element => {

    function openDemonRecipesHandler(demonId: number) {
      props.onOpenDemonRecipes(demonId);
    }
    
    const dataProvider = new FusionResultsDataTableProvider(props, openDemonRecipesHandler);
    return <DataTable dataTableProvider={dataProvider} className={styles.dataTable}/>
};
export default React.memo(ResultsTable);