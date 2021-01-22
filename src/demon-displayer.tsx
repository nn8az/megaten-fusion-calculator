import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import * as Models from './data/data-models';
import { DemonCompendium } from './data/demon-compendium';
import RecipesTable from './ui-components/recipes-table';

export default function DemonDisplayer(props: {demonCompendium: DemonCompendium, invalidUrlRedirect: string, fusionResults?: Models.FusionResults}): JSX.Element {
    const demonIdStr = useParams<{ demonId: string }>().demonId;
    const demonId = Number(demonIdStr);
    const history = useHistory();

    if (isNaN(demonId)) {
        history.push(props.invalidUrlRedirect);
        return <React.Fragment/>;
    }
    const demon = props.demonCompendium.getDemonById(demonId);
    if (!demon) {
        history.push(props.invalidUrlRedirect);
        return <React.Fragment/>;
    }

    let fusionResultsSection: JSX.Element | undefined;
    if (props.fusionResults) {
        fusionResultsSection = <React.Fragment>
            <h2>Recipes</h2>
            <RecipesTable />
        </React.Fragment>;
    }

    return <div>
        <h2>{demon.name}</h2>
        <div><b>Race:</b> {demon.race} | <b>Lvl:</b> {demon.lvl}</div>
        <h2>Stats</h2>
        <div>{demon.stats.map((stat, i) => <React.Fragment key={i}>{(i > 0)?<React.Fragment children={" | "}/>: undefined}<b>{Models.Demon.statsName[i]}:</b> {stat}</React.Fragment>)}</div>
        <div>{fusionResultsSection}</div>
    </div>
}