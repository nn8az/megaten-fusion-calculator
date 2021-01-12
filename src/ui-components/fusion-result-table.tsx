import React from 'react';

import * as Models from '../data/data-models';
import { DemonCompendium } from '../data/demon-compendium';
import { DataGrid, ColDef } from '@material-ui/data-grid';
import { useRef, useEffect } from 'react';
import styles from './ui-components.module.scss';

export default function FusionResultTable(params: {
    demonCompendium?: DemonCompendium
    fusionResults: Models.FusionResults
  }): JSX.Element {
    const { fusionResults } = params;
  
    const columns: ColDef[] = [
      { field: "name", headerName: "Demon", width: 120 },
      { field: "lvl", headerName: "Level", width: 70, headerAlign: "center", resizable: false, disableColumnMenu: true },
      { field: "race", headerName: "Race", width: 100, headerAlign: "center", resizable: false },
      { field: "recipe", headerName: "Recipe", width: 1000, cellClassName: styles.recipeCell }
    ]

    type Row = { id: number, name: string, lvl: number, race: string, recipe: string }
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
                    "recipe": fusedDemon.toRecipeString()
                });
            }
        }
    }
    ingredientsAsRowsArray.sort((a, b) => { return a.lvl - b.lvl});
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
            className={styles.fusionResultsTable}
            columns={columns}
            disableSelectionOnClick={true}
            autoHeight={true}
            rowsPerPageOptions={[10]}
            density='compact'
        />
    );
  }