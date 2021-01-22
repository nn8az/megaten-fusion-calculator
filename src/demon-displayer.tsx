import Button from '@material-ui/core/Button';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import * as Models from './data/data-models';
import { DemonCompendium } from './data/demon-compendium';
import RecipesTable from './ui-components/recipes-table';

export default function DemonDisplayer(props: { demonCompendium: DemonCompendium, goBackUrlPath: string, fusionResults?: Models.FusionResults}): JSX.Element {
    const demonIdStr = useParams<{ demonId: string }>().demonId;
    const demonId = Number(demonIdStr);
    const history = useHistory();

    if (isNaN(demonId)) {
        history.push(props.goBackUrlPath);
        return <React.Fragment/>;
    }
    const demon = props.demonCompendium.getDemonById(demonId);
    if (!demon) {
        history.push(props.goBackUrlPath);
        return <React.Fragment/>;
    }

    function goBackHandler() {
        history.push(props.goBackUrlPath);
    }
    
    let fusionResultsSection: JSX.Element | undefined = undefined;
    if (props.fusionResults) {
        let recipesAry: Models.FusedDemon[] | undefined = undefined;
        for (const ingCount in props.fusionResults) {
            for (const id in props.fusionResults[ingCount]) {
                if (Number(id) === demonId) {
                    recipesAry = props.fusionResults[ingCount][id];
                    break;
                }
            }
            if (recipesAry) {
                break;
            }
        }
        if (recipesAry) {
        fusionResultsSection = <React.Fragment>
            <h2>Recipes</h2>
            <RecipesTable demonId={demonId} recipesAry={recipesAry} />
        </React.Fragment>;
        }
    }

    return <div>
        <Button variant="outlined" onClick={goBackHandler}>Go back</Button>
        <h2>{demon.name}</h2>
        <div><b>Race:</b> {demon.race} | <b>Lvl:</b> {demon.lvl}</div>
        <h2>Stats</h2>
        <div>{demon.stats.map((stat, i) => <React.Fragment key={i}>{(i > 0)?<React.Fragment children={" | "}/>: undefined}<b>{Models.Demon.statsName[i]}:</b> {stat}</React.Fragment>)}</div>
        <div>{fusionResultsSection}</div>
    </div>
}