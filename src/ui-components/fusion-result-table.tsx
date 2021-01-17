import React from 'react';

import * as Models from '../data/data-models';
import { DemonCompendium } from '../data/demon-compendium';
import { DataGrid, ColDef, CellParams, ValueGetterParams } from '@material-ui/data-grid';
import { useRef, useEffect } from 'react';
import styles from './ui-components.module.scss';

function renderDemonName(demon: Models.FusedDemon): JSX.Element {
    if (demon.isFused()) {
        return <React.Fragment>{demon.demon.name}</React.Fragment>;
    } else {
        return <span className={styles.baseIngredientName}>{demon.demon.name}</span>;
    }
}

function renderRecipe(demon: Models.FusedDemon): JSX.Element {
    let priorRecipes: JSX.Element = <React.Fragment/>;
    if (demon.ingredients) {
        let curRecipe: JSX.Element = <React.Fragment/>;
        let isFirstLoop: boolean = true;
        for (const ingDemon of demon.ingredients) {
            priorRecipes = <React.Fragment>{priorRecipes}{renderRecipe(ingDemon)}</React.Fragment>;
            const separator = isFirstLoop ? undefined : <React.Fragment> + </React.Fragment>;
            curRecipe = <React.Fragment>{curRecipe}{separator}{renderDemonName(ingDemon)}</React.Fragment>
            isFirstLoop = false;
        }
        const nameR = renderDemonName(demon);
        return <React.Fragment>
            {priorRecipes}
            <div className={styles.recipeLine}>
                {curRecipe} = {nameR}
            </div>
        </React.Fragment>;
    }
    return priorRecipes;
}

function renderRecipeWrapper(cellParams: CellParams): JSX.Element {
    return <div>{renderRecipe(cellParams.value as Models.FusedDemon)}</div>;
}

function getRecipeAsString(valueParam: ValueGetterParams): string {
    return (valueParam.value as Models.FusedDemon).toBaseIngredientSearchString();
}

export default function FusionResultTable(params: {
    demonCompendium?: DemonCompendium
    fusionResults: Models.FusionResults
  }): JSX.Element {
    const { fusionResults } = params;
  
    const columns: ColDef[] = [
      { field: "name", headerName: "Demon", width: 120 },
      { field: "lvl", headerName: "Level", width: 70, headerAlign: "center", resizable: false, disableColumnMenu: true },
      { field: "race", headerName: "Race", width: 100, headerAlign: "center", resizable: false }
    ]
    const statsName: string[] = Models.Demon.statsName;
    for (let i = 0; i < statsName.length; i++) {
        columns.push(
            { field: "stat" + i, headerName: statsName[i], width: 60, headerAlign: "center", resizable: false, disableColumnMenu: true}
        );
    }
    columns.push(
        { field: "recipe", headerName: "Recipe", flex: 1, renderCell: renderRecipeWrapper, valueGetter: getRecipeAsString});

    const ingredientsAsRowsArray = [];
    for (const size in fusionResults) {
        if (Number(size) === 1) { continue; }
        for (const demonId in fusionResults[size]) {
            for (const fusedDemon of fusionResults[size][demonId]) {
                const {demon} = fusedDemon;
                const demonRow: any = {
                    "id": 0,
                    "name": demon.name,
                    "lvl": demon.lvl,
                    "race": demon.race,
                    "recipe": fusedDemon
                };
                for (let i = 0; i < statsName.length; i++) {
                    demonRow["stat" + i] = demon.stats[i];
                }
                ingredientsAsRowsArray.push(demonRow);
            }
        }
    }
    ingredientsAsRowsArray.sort((a, b) => { return b.lvl - a.lvl});
    let id: number = 1;
    for (const row of ingredientsAsRowsArray) {
        row.id = id;
        id++;
    }
  
    // This trick is needed to prevent the table from running into other content
    const gridWrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const gridDiv = gridWrapperRef.current;
        if (gridDiv){
            const gridEl: HTMLDivElement = gridDiv.querySelector('div')!;
            gridEl.style.height = "";
            gridEl.style.width = "";
        }
    }, []);
  
    return (
        <DataGrid
            rows={ingredientsAsRowsArray}
            rowHeight={75}
            className={styles.fusionResultsTable}
            columns={columns}
            disableSelectionOnClick={true}
            autoHeight={true}
            rowsPerPageOptions={[10]}
            density='compact'
        />
    );
  }