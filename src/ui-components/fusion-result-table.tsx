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
    let ret: JSX.Element = <React.Fragment/>;
    if (demon.ingredientA && demon.ingredientB) {
        ret = <React.Fragment>{ret}{renderRecipe(demon.ingredientA)}</React.Fragment>;
        ret = <React.Fragment>{ret}{renderRecipe(demon.ingredientB)}</React.Fragment>;
        const nameA = renderDemonName(demon.ingredientA);
        const nameB = renderDemonName(demon.ingredientB);
        const nameR = renderDemonName(demon);
        return <React.Fragment>
            {ret}
            <div className={styles.recipeLine}>
                {nameA} + {nameB} = {nameR}
            </div>
        </React.Fragment>;
    }
    return ret;
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
      { field: "race", headerName: "Race", width: 100, headerAlign: "center", resizable: false },
      { field: "recipe", headerName: "Recipe", width: 1000, renderCell: renderRecipeWrapper, valueGetter: getRecipeAsString}
    ]

    type Row = { id: number, name: string, lvl: number, race: string, recipe: Models.FusedDemon }
    const ingredientsAsRowsArray:Row[] = [];
    for (const size in fusionResults) {
        if (Number(size) === 1) { continue; }
        for (const demonName in fusionResults[size]) {
            for (const fusedDemon of fusionResults[size][demonName]) {
                const {demon} = fusedDemon;
                ingredientsAsRowsArray.push({
                    "id": 0,
                    "name": demon.name,
                    "lvl": demon.lvl,
                    "race": demon.race,
                    "recipe": fusedDemon
                });
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