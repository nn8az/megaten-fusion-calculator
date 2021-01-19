import React from 'react';

import * as Models from '../data/data-models';
import { DemonCompendium } from '../data/demon-compendium';

import DataTable, * as DataTables from './data-table';
import TableCell from '@material-ui/core/TableCell';
import Checkbox from '@material-ui/core/Checkbox';
import {WarningBanner} from './minor-ui-components';

import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';

import styles from './scss/ingredients-table.module.scss';

//====================================================================================================

type RemoveDemonButtonProps = {
    demonId: number;
    onRemoveIngredient?: (deletedId: number) => void;
}
function RemoveDemonButton(params: RemoveDemonButtonProps): JSX.Element {

    function onIconButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        if (params.onRemoveIngredient) {
            params.onRemoveIngredient(params.demonId);
        }
    }

    return <IconButton onClick={onIconButtonClick} className={styles.removeDemonButton}>
    <CancelIcon className={styles.removeDemonButtonIcon}/>
  </IconButton>
}

//====================================================================================================

enum IngredientsSettingsEnum {
    multipleUse = 1,
    mustUse = 2
}
type CheckboxSettingProps = {
    demonId: number,
    setting: IngredientsSettingsEnum,
    ingredientsSettings: Models.IngredientsSettings
}
function CheckboxSetting(params: CheckboxSettingProps): JSX.Element {
    const {demonId, setting, ingredientsSettings} = params;
    let defaultChecked: boolean = false;
    switch (setting) {
        case IngredientsSettingsEnum.mustUse: {
            defaultChecked = ingredientsSettings[demonId].mustUse;
            break;
        }
        case IngredientsSettingsEnum.multipleUse: 
        default: {
            defaultChecked = ingredientsSettings[demonId].multipleUse;
        }
    }

    function onCheckboxChange(event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void {
        switch (setting) {
            case IngredientsSettingsEnum.mustUse: {
                ingredientsSettings[demonId].mustUse = event.target.checked;
                break;
            }
            case IngredientsSettingsEnum.multipleUse: 
            default: {
                ingredientsSettings[demonId].multipleUse = event.target.checked;
            }
        }
    }

    return <Checkbox
        className={styles.checkBox}
        defaultChecked={defaultChecked}
        onChange={onCheckboxChange}
        color="default"
    />;
}

//====================================================================================================

function initializeIngredientsSettings(ingredients: Models.Ingredients, ingredientsSettings: Models.IngredientsSettings) {
    for (const demonId in ingredients) {
        if (!ingredientsSettings[demonId]) {
            ingredientsSettings[demonId] = { mustUse: false, multipleUse: false };
        }
    }
}

//====================================================================================================

type FusionIngredientsTableProps = {
    demonCompendium: DemonCompendium
    ingredients: Models.Ingredients
    ingredientsSettings: Models.IngredientsSettings
    onRemoveIngredient?: (deletedId: number) => void;
}
class FusionIngredientsDataTableProvider implements DataTables.DataTableProvider<Models.Demon> {

    pageSize: number = 25;
    getColumnDefinition(): DataTables.ColDef[] {
        return [{ headerContent: "Demon", sortSpec: { sortType: "string" } },
        { headerContent: "Level", sortSpec: { sortType: "number" } },
        { headerContent: "Race", sortSpec: { sortType: "string" } },
        { headerContent: "Must Use in Fusion", headerProps: { width: 70, align: "center" } },
        { headerContent: "Can Use Multiple per Recipe", headerProps: { width: 120, align: "center" } },
        {}];
    }

    getRowData(): Models.Demon[] {
        return this.rowData;
    }

    renderRow(rowData: Models.Demon): JSX.Element {
        return <React.Fragment>
            <TableCell>
                {rowData.name}
            </TableCell>
            <TableCell>
                {rowData.lvl}
            </TableCell>
            <TableCell>
                {rowData.race}
            </TableCell>
            <TableCell align="center">
                <CheckboxSetting demonId={rowData.id} setting={IngredientsSettingsEnum.mustUse} ingredientsSettings={this.ingredientsSettings} />
            </TableCell>
            <TableCell align="center">
                <CheckboxSetting demonId={rowData.id} setting={IngredientsSettingsEnum.multipleUse} ingredientsSettings={this.ingredientsSettings} />
            </TableCell>
            <TableCell>
                <RemoveDemonButton demonId={rowData.id} onRemoveIngredient={this.onRemoveIngredient} />
            </TableCell>
        </React.Fragment>;
    }
    
    getSortValue(rowData: Models.Demon, sortByCol: number): string | number {
        switch(sortByCol) {
            case 0: { 
                return rowData.name; }
            case 1: { 
                return rowData.lvl; }
            case 2: { 
                return rowData.race; }
            default: {
                return rowData.name; }
        };
    }

    renderBanner(): JSX.Element {
        return <WarningBanner message="No ingredient demons. Use the above section to add in demons to use in your fusions."/>
    }

    demonCompendium: DemonCompendium;
    ingredients: Models.Ingredients;
    ingredientsSettings: Models.IngredientsSettings;
    onRemoveIngredient?: (deletedId: number) => void;

    rowData: Models.Demon[];

    constructor(params: FusionIngredientsTableProps, rowData: Models.Demon[]) {
        this.demonCompendium = params.demonCompendium;
        this.ingredients = params.ingredients;
        this.ingredientsSettings = params.ingredientsSettings;
        this.onRemoveIngredient = params.onRemoveIngredient;

        this.rowData = rowData;
    }
}
const FusionIngredientsTable = (params: FusionIngredientsTableProps): JSX.Element => {
    initializeIngredientsSettings(params.ingredients, params.ingredientsSettings);
    const rowData: Models.Demon[] = React.useMemo(() => {
        let rowData: Models.Demon[] = [];
        for (const demonId in params.ingredients) {
            const demon = params.demonCompendium.getDemonById(Number(demonId));
            if (!demon) { continue; }
            rowData.push(demon);
        }
        return rowData;
    }, [params.ingredients, params.demonCompendium]);
    const dataProvider = new FusionIngredientsDataTableProvider(params, rowData);
    return <DataTable dataTableProvider={dataProvider}/>
}
export default React.memo(FusionIngredientsTable);