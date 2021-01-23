import React from "react";

import * as Models from '../data/data-models';

import Card from '@material-ui/core/Card';
import CardContent from "@material-ui/core/CardContent";

import styles from './scss/recipes-table.module.scss';
import Pagination from "@material-ui/lab/Pagination";

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
            <div className={styles.recipeLine}>
                {curRecipe} = {nameR}
            </div>
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

export default function RecipesTable(props: {demonId: number, recipesAry: Models.FusedDemon[]}): JSX.Element {
    const pageSize: number = 100;
    const [page, setPage] = React.useState<number>(1);
    const maxPage: number = Math.ceil(props.recipesAry.length / pageSize);

    function handlePageChange(event: React.ChangeEvent<unknown>, page: number) {
        setPage(page);
    }

    return (
    <div className={styles.componentContainer}>
        <Pagination count={maxPage} page={page} onChange={handlePageChange} size="small" className={styles.pagination} hidden={maxPage <= 1}/>
        <div className={styles.recipeTable}>
            {props.recipesAry
            .filter((demon, i) => (i >= (page - 1) * pageSize) && (i < page * pageSize))
            .map((demon, i) => <DemonCard key={i} demon={demon} />)}
        </div>
    </div>
    );
}