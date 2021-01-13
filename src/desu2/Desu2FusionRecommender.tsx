import FusionRecommender from '../data/FusionRecommender';
import {DemonCompendium} from '../data/demon-compendium';
import {default as demonListJSON} from './demon-list.json';
import {default as fusionChartJSON} from './fusion-chart.json';
import {default as presetJSON} from './demon-preset.json';

export default function Desu2FusionRecommender(): JSX.Element {
    return <FusionRecommender demonCompendium={new DemonCompendium(demonListJSON, fusionChartJSON, presetJSON)}/>;
}