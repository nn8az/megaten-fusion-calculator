import React from 'react';

import * as Models from '../data/data-models';
import { DemonCompendium } from '../data/demon-compendium';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';

import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';

import styles from './ingredients-table.module.scss';

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
const FusionIngredientsTable = (params: FusionIngredientsTableProps): JSX.Element => {
    let [page, setPage] = React.useState<number>(0);
    const pageSize: number = 25;
    
    initializeIngredientsSettings(params.ingredients, params.ingredientsSettings);

    let rowData: {id: number, data: Models.Demon}[] = React.useMemo(()=>{
        let id = 1;
        let rowDataInner: {id: number, data: Models.Demon}[] = [];
        for (const demonId in params.ingredients) {
            const demon = params.demonCompendium.getDemonById(Number(demonId));
            if (!demon) { continue; }
            rowDataInner.push({id: id, data: demon});
            id++;
        }
        return rowDataInner;
    }, [params.ingredients, params.demonCompendium]);
    const totalRow: number = rowData.length;
    rowData = rowData.filter((demon, index) => (index >= page * pageSize) && (index < (page + 1) * pageSize));

    function changePage(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) {
        setPage(page);
    }

    if (Object.keys(params.ingredients).length === 0) { return <React.Fragment /> }
    return <Paper className={styles.ingredientsTableContainer} elevation={1}>
        <TableContainer className={styles.ingredientsTable}>
            <Table>
                <TableHead className={styles.ingredientsTableHeader}>
                    <TableRow>
                        <TableCell className={styles.demonColumnHeader}>Demon</TableCell>
                        <TableCell>Level</TableCell>
                        <TableCell>Race</TableCell>
                        <TableCell width="100" align="center">Must Use in Fusion</TableCell>
                        <TableCell width="150" align="center">Can Use Multiple per Recipe</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className={styles.ingredientsTableBody}>
                    {rowData.map((row) => <TableRow key={row.data.id}>
                        <TableCell>
                            {row.data.name}
                        </TableCell>
                        <TableCell>
                            {row.data.lvl}
                        </TableCell>
                        <TableCell>
                            {row.data.race}
                        </TableCell>
                        <TableCell align="center">
                            <CheckboxSetting demonId={row.data.id} setting={IngredientsSettingsEnum.mustUse} ingredientsSettings={params.ingredientsSettings} />
                        </TableCell>
                        <TableCell align="center">
                            <CheckboxSetting demonId={row.data.id} setting={IngredientsSettingsEnum.multipleUse} ingredientsSettings={params.ingredientsSettings} />
                        </TableCell>
                        <TableCell>
                            <RemoveDemonButton demonId={row.data.id} onRemoveIngredient={params.onRemoveIngredient} />
                        </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
            <TablePagination
                            rowsPerPageOptions={[pageSize]}
                            component="div"
                            count={totalRow}
                            rowsPerPage={pageSize}
                            page={page}
                            onChangePage={changePage}
                        />
        </TableContainer>
    </Paper>
}
export default React.memo(FusionIngredientsTable);