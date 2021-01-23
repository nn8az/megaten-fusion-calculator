import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import * as Models from './data/data-models';
import { DemonCompendium } from './data/demon-compendium';
import RecipesTable from './ui-components/recipes-table';

import styles from './demon-displayer.module.scss';

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

    return <div className={styles.componentContainer}>
        <div className={styles.section}>
            <h2>{demon.name}</h2>
            <div><Label text="Race" />{demon.race}<Label text="Level" />{demon.lvl}</div>
        </div>
        <div className={styles.section}>
            <h2>Stats</h2>
            <div>{demon.stats.map((stat, i) => <React.Fragment key={i}><Label text={Models.Demon.statsName[i]} />{stat}</React.Fragment>)}</div>
        </div>
        <div className={styles.section}>{fusionResultsSection}</div>
    </div>
}

function Label(props: { text: string }): JSX.Element {
    return <span className={styles.label}>{props.text}</span>;
}