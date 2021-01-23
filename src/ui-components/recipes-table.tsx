import React from "react";

import * as Models from '../data/data-models';

import Card from '@material-ui/core/Card';
import CardContent from "@material-ui/core/CardContent";
import Divider from '@material-ui/core/Divider';
import Pagination from "@material-ui/lab/Pagination";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import styles from './scss/recipes-table.module.scss';

function renderDemonName(demon: Models.FusedDemon): JSX.Element {
    if (demon.isFused()) {
        return <React.Fragment>{demon.demon.name}</React.Fragment>;
    } else {
        return <span className={styles.baseIngredientName}>{demon.demon.name}</span>;
    }
}

function renderRecipe(demon: Models.FusedDemon): JSX.Element {
    let priorRecipes: JSX.Element = <React.Fragment />;
    if (demon.ingredients) {
        let curRecipe: JSX.Element = <React.Fragment />;
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
            <Divider light />
            <div>{curRecipe}</div><div>&darr;</div><div>{nameR}</div>
        </React.Fragment>;
    }
    return priorRecipes;
}

function DemonCard(props: {demon: Models.FusedDemon}): JSX.Element {
    return <Card className={styles.recipeCard}>
      <CardContent>
          {renderRecipe(props.demon)}
      </CardContent>
    </Card>
}

//====================================================================================================

type FilterMap = { [demonId: number]: boolean};
type FilterOption = { demonId: number, demonName: string};

function createFilterOptions(recipesAry: Models.FusedDemon[], currFilter: FilterOption[]): FilterOption[] {
    const filterOptions: FilterOption[] = [];
    let ingDemonsMap: { [demonId: number]: string} = {};
    for (const fusedDemon of recipesAry) {
        const ingDemons = fusedDemon.getBaseIngredients();
        for (const ingDemon in ingDemons) {
            ingDemonsMap[Number(ingDemon)] = ingDemons[ingDemon].name;
        }
    }
    currFilter.map((filterOption: FilterOption, i) => ingDemonsMap[filterOption.demonId] = filterOption.demonName);
    for (const ingDemonId in ingDemonsMap) {
        filterOptions.push({ demonId: Number(ingDemonId), demonName: ingDemonsMap[ingDemonId]});
    }
    return filterOptions;
}

function filterRecipesAry(recipesAry: Models.FusedDemon[], filterMap: FilterMap): Models.FusedDemon[] {
    const filteredAry: Models.FusedDemon[] = [];
    for (const fusedDemon of recipesAry) {
        const ingDemonsCount: { [demonId: number]: number } = fusedDemon.getBaseIngredientsCounts();
        const filterCheckList = {...filterMap};
        for (const ingDemonId in ingDemonsCount) {
            delete filterCheckList[ingDemonId];
        }
        if (Object.keys(filterCheckList).length === 0) {
            filteredAry.push(fusedDemon);
        }
    }
    return filteredAry
}


export default function RecipesTable(props: {demonId: number, recipesAry: Models.FusedDemon[]}): JSX.Element {
    const pageSize: number = 100;
    const [page, setPage] = React.useState<number>(1);
    const [filter, setFilter] = React.useState<FilterOption[]>([]);
    
    const filteredRecipesAry = React.useMemo(()=>{
        const filterMap: FilterMap = {};
        filter.map((filterOption: FilterOption, i: number) => filterMap[filterOption.demonId] = true);
        return filterRecipesAry(props.recipesAry, filterMap)
    }, [props.recipesAry, filter]);

    function handlePageChange(event: React.ChangeEvent<unknown>, page: number) {
        setPage(page);
    }
    
    function handleFilterChange(event: React.ChangeEvent<{}>, value: FilterOption[]) {
        setPage(1);
        setFilter(value);
    }

    const filterOptions = createFilterOptions(filteredRecipesAry, filter);

    const maxPage: number = Math.ceil(filteredRecipesAry.length / pageSize);

    return (
    <div className={styles.componentContainer}>
            <Autocomplete
            multiple
            className={styles.filterField}
            size="small"
            onChange={handleFilterChange}
            value={filter}
            defaultValue={filter}
            options={filterOptions}
            getOptionLabel={(option) => option.demonName}
            getOptionSelected={(option, value) => option.demonId === value.demonId}
            autoHighlight={true}
            filterSelectedOptions
            renderInput={(params) => (<TextField {...params} variant="outlined" label="Filter" /> )}
        />
        <Pagination count={maxPage} page={page} onChange={handlePageChange} size="small" className={styles.pagination} hidden={maxPage <= 1}/>
        <div className={styles.recipeCardsContainer}>
            {filteredRecipesAry
            .filter((demon, i) => (i >= (page - 1) * pageSize) && (i < page * pageSize))
            .map((demon, i) => <DemonCard key={i} demon={demon} />)}
        </div>
    </div>
    );
}