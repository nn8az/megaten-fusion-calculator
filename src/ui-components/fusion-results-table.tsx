import React from 'react';

import * as Models from '../data/data-models';

import DataTable, * as DataTables from './data-table';
import TableCell from '@material-ui/core/TableCell';
import {WarningBanner} from './minor-ui-components';

import styles from './scss/fusion-results-table.module.scss';

class FusionResultsDataTableProvider implements DataTables.DataTableProvider<Models.FusedDemon> {

    pageSize: number = 25;

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
        colDefs.push({ headerContent: "Recipe" });
        return colDefs;
    }

    getAllRowsData(): Models.FusedDemon[] {
        const resultsAsRowsArray: Models.FusedDemon[] = [];
        for (const ingCount in this.fusionResults) {
            if (Number(ingCount) === 1) { continue; }
            for (const demonId in this.fusionResults[ingCount]) {
                for (const fusedDemon of this.fusionResults[ingCount][demonId]) {
                    resultsAsRowsArray.push(fusedDemon);
                }
            }
        }
        return resultsAsRowsArray;
    }

    renderRow(fusedDemon: Models.FusedDemon, cellKeys: string[]): JSX.Element {
        const renderedRow: JSX.Element[] = [];
        renderedRow.push(<React.Fragment>
            <TableCell className={styles.nameColumn} key={cellKeys[0]}>
                {fusedDemon.demon.name}
            </TableCell>
            <TableCell className={styles.lvlColumn} key={cellKeys[1]}>
                {fusedDemon.demon.lvl}
            </TableCell>
            <TableCell className={styles.raceColumn} key={cellKeys[2]}>
                {fusedDemon.demon.race}
            </TableCell>
        </React.Fragment>);
        let cellKeyIndex: number = 3;
        for (const stat of fusedDemon.demon.stats) {
            renderedRow.push(<React.Fragment>
                <TableCell className={styles.statColumn} key={cellKeys[cellKeyIndex]}>
                    {stat}
                </TableCell>
            </React.Fragment>);
            cellKeyIndex++;
        }
        renderedRow.push(<React.Fragment>
            <TableCell key={cellKeys[cellKeyIndex]}>
                {this.renderRecipe(fusedDemon)}
            </TableCell>
        </React.Fragment>);
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

    private renderDemonName(demon: Models.FusedDemon): JSX.Element {
        if (demon.isFused()) {
            return <React.Fragment>{demon.demon.name}</React.Fragment>;
        } else {
            return <span className={styles.baseIngredientName}>{demon.demon.name}</span>;
        }
    }

    private renderRecipe(demon: Models.FusedDemon): JSX.Element {
    let priorRecipes: JSX.Element = <React.Fragment/>;
    if (demon.ingredients) {
        let curRecipe: JSX.Element = <React.Fragment/>;
        let isFirstLoop: boolean = true;
        for (const ingDemon of demon.ingredients) {
            priorRecipes = <React.Fragment>{priorRecipes}{this.renderRecipe(ingDemon)}</React.Fragment>;
            const separator = isFirstLoop ? undefined : <React.Fragment> + </React.Fragment>;
            curRecipe = <React.Fragment>{curRecipe}{separator}{this.renderDemonName(ingDemon)}</React.Fragment>
            isFirstLoop = false;
        }
        const nameR = this.renderDemonName(demon);
        return <React.Fragment>
            {priorRecipes}
            <div className={styles.recipeLine}>
                {curRecipe} = {nameR}
            </div>
        </React.Fragment>;
    }
    return priorRecipes;
}

    fusionResults: Models.FusionResults;

    constructor(params: FusionResultsTableProps) {
        this.fusionResults = params.fusionResults;
    }
}

type FusionResultsTableProps = {
    fusionResults: Models.FusionResults
}
const FusionResultsTable = (params: FusionResultsTableProps): JSX.Element => {
    const dataProvider = new FusionResultsDataTableProvider(params);
    return <DataTable dataTableProvider={dataProvider} className={styles.dataTable}/>
}
export default React.memo(FusionResultsTable);