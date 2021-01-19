import React from 'react';

import * as Models from '../data/data-models';
import { DemonCompendium } from '../data/demon-compendium';

import { DataGrid, ColDef, CellParams } from '@material-ui/data-grid';
import { useRef, useEffect } from 'react';

import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import styles from './scss/ui-components.module.scss';

const FusionIngredientsDataGrid = (params: {
  demonCompendium: DemonCompendium
  ingredients: Models.Ingredients
  onRemoveIngredient?: (deletedId: number) => void;
}): JSX.Element => {
  const { demonCompendium, ingredients, onRemoveIngredient } = params;

  const columns: ColDef[] = [
    { field: "name", headerName: "Demon", flex: 1, resizable: false },
    { field: "lvl", headerName: "Level", width: 70, headerAlign: "center", resizable: false, disableColumnMenu: true },
    { field: "race", headerName: "Race", width: 100, headerAlign: "center", resizable: false, disableColumnMenu: true },
    { field: "remove", headerName: " ", width: 50, sortable: false, disableColumnMenu: true, renderCell: createRemoveButtonForCell }
  ]

  function raiseRemoveIngredientEvent(deletedId: number): void {
    if (onRemoveIngredient) {
      onRemoveIngredient(deletedId);
    }
  }

  function createRemoveButtonForCell(cellParams: CellParams): JSX.Element {
    const demonId = cellParams.value as number;
    return <IconButton aria-label="delete" onClick={raiseRemoveIngredientEvent.bind(undefined, demonId)}>
      <CancelIcon className={styles.removeDemonButtonIcon}/>
    </IconButton>;
  }

  const ingredientsAsRowsArray = Object.keys(ingredients).map(
    (demonId, index) => {
      const demonIdAsNumber: number = (demonId as unknown) as number;
      const demon: Models.Demon = demonCompendium.getDemonById(demonIdAsNumber)!;
      return {
        id: index,
        "name": demon.name,
        "lvl": demon.lvl,
        "race": demon.race,
        "remove": demon.id
      }
    });

  // This trick is needed to prevent the table from running into other content
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const gridDiv = gridWrapperRef.current;
    if (gridDiv) {
      const gridEl: HTMLDivElement = gridDiv.firstElementChild as HTMLDivElement;
      gridEl.style.height = "";
    }
  }, []);

  return (
    <div style={{ maxWidth: "600px" }} ref={gridWrapperRef}>
      <DataGrid
        rows={ingredientsAsRowsArray}
        columns={columns}
        disableSelectionOnClick={true}
        autoHeight={true}
        density='compact'
        pageSize={25}
        rowsPerPageOptions={[25]}
      />
    </div>
  );
}
export default React.memo(FusionIngredientsDataGrid);