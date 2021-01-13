// Imports for foundational functionalities
import React, { useRef, useState } from 'react';

// Imports for data
import * as Models from './data-models';
import { DemonCompendium } from './demon-compendium';

// Imports for UI components
import Button from '@material-ui/core/Button';
import FusionIngredientsTable from '../ui-components/ingredients-table';
import FusionResultTable from '../ui-components/fusion-result-table';
import DemonAdder from '../ui-components/demon-adder';

import ReplayIcon from '@material-ui/icons/Replay';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import './FusionRecommender.scss';

const MAX_FUSION_INGREDIENT = 3;

function FusionRecommender(params: { demonCompendium: DemonCompendium }): JSX.Element {
  const { demonCompendium } = params;
  let [ingredients, setIngredients] = useState<Models.IngredientDemons>({});
  let [fusionResults, setFusionResults] = useState<Models.FusionResults>({});
  let [resetterKey, setResetterKey] = useState<number>(1); // This key is meant to be used to reset components. Changes to this key will trigger components to reset.
  const fusionResultSectionHeader = useRef<HTMLHeadingElement>(null);

  function addDemonToIngredients(demons: Models.Demon[]): void {
    const newIngredients = { ...ingredients };
    for (const demon of demons) {
      newIngredients[demon.id] = true;
    }
    setIngredients(newIngredients);
  };

  function removeDemonFromIngredients(demonId: number): void {
    const newIngredients = { ...ingredients };
    delete newIngredients[demonId];
    setIngredients(newIngredients);
  }

  function onResetButtonClick(): void {
    const newIngredients = {};
    setIngredients(newIngredients);

    const newFusionResults = {};
    setFusionResults(newFusionResults);

    setResetterKey((resetterKey + 1) % 2);
  }

  function calculateAllFusionCombinations(): void {
    const myFusionResults: Models.FusionResults = {};
    for (let size = 1; size <= MAX_FUSION_INGREDIENT; size++) {
      myFusionResults[size] = {};
    }

    for (const demonId in ingredients) {
      const demon: Models.Demon | undefined = demonCompendium.getDemonById(Number(demonId));
      if (!demon) { continue; }
      const fusedDemon: Models.FusedDemon = new Models.FusedDemon(demon);
      if (!myFusionResults[1][demon.name]) {
        myFusionResults[1][demon.name] = [];
      }
      myFusionResults[1][demon.name].push(fusedDemon);
    }

    for (let fusMatCount = 2; fusMatCount <= MAX_FUSION_INGREDIENT; fusMatCount++) {
      for (let matCountA = fusMatCount - 1; matCountA >= (fusMatCount / 2); matCountA--) {
        const matCountB: number = fusMatCount - matCountA;
        const speciesUsedAsA: { [id: number]: boolean } = {}; // id of the demon species that have already been used in the calculation as demon A
        for (const nameA in myFusionResults[matCountA]) {
          if (myFusionResults[matCountA][nameA].length === 0) { continue; }
          const speciesA: Models.Demon = myFusionResults[matCountA][nameA][0].demon;
          for (const nameB in myFusionResults[matCountB]) {
            if (myFusionResults[matCountB][nameB].length === 0) { continue; }
            const speciesB: Models.Demon = myFusionResults[matCountB][nameB][0].demon;

            // skip calculating fusions that should have already been calculated since A+B produces the same results as B+A
            if (speciesUsedAsA[speciesB.id]) { continue; }

            const speciesR: Models.Demon | undefined = demonCompendium.fuseDemons(speciesA, speciesB);
            if (!speciesR) { continue; }

            // throw out inefficient fusions that the user can already make using fewer ingredients
            let canBeMadeWithLessIngredient: boolean = false;
            for (let sizeCheck = fusMatCount - 1; sizeCheck >= 1; sizeCheck--) {
              if (myFusionResults[sizeCheck][speciesR.name]) {
                canBeMadeWithLessIngredient = true;
                break;
              }
            }
            if (canBeMadeWithLessIngredient) { continue; }

            // if this is the final round of fusions, throw out fusions that produce demons that are lower level 
            if (fusMatCount === MAX_FUSION_INGREDIENT && (speciesA.lvl > speciesR.lvl || speciesB.lvl > speciesR.lvl)) { continue; }

            for (const demonA of myFusionResults[matCountA][nameA]) {
              for (const demonB of myFusionResults[matCountB][nameB]) {
                const demonR = new Models.FusedDemon(speciesR, demonA, demonB);
                if (!myFusionResults[fusMatCount][speciesR.name]) {
                  myFusionResults[fusMatCount][speciesR.name] = [];
                }
                myFusionResults[fusMatCount][speciesR.name].push(demonR);
              }
            }
          }
          speciesUsedAsA[speciesA.id] = true;
        }
      }
    }

    // Re-traverse the entire results and fully purge fusions that produce demons of lower level
    for (const fusionMatCount in myFusionResults) {
      if (Number(fusionMatCount) === 1) { continue; }
      for (const name in myFusionResults[fusionMatCount]) {
        const demonAry: Models.FusedDemon[] = myFusionResults[fusionMatCount][name];
        const filteredDemonAry = demonAry.filter((demon) => { return !demon.isWeakerThanIngredients() })
        myFusionResults[fusionMatCount][name] = filteredDemonAry;
      }
    }

    setFusionResults(myFusionResults);

    // Scroll to the fusion result section by using a setTimeout() so it can happen after the section is rendered
    setTimeout(()=>{
      if (fusionResultSectionHeader.current != null) {
        fusionResultSectionHeader.current.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      }
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Megami Tensei Fusion Recommender</h1>
      </header>
      <h2>Add demons to use as fusion ingredient</h2>
      <div className="addDemonsAndCalcResetButtonContainer">
        <DemonAdder key={resetterKey} demonCompendium={demonCompendium} onAddDemon={addDemonToIngredients} />
        <div className="calcResetButtonContainer">
          <Button className="calculateButton" variant="outlined" onClick={calculateAllFusionCombinations} disabled={Object.keys(ingredients).length === 0} ><PlayArrowIcon />Calculate</Button>
          <Button className="resetButton" variant="outlined" onClick={onResetButtonClick}><ReplayIcon />Reset</Button>
        </div>
      </div>
      <h2>Fusion Ingredients</h2>
      <FusionIngredientsTable demonCompendium={demonCompendium} ingredients={ingredients} onRemoveIngredient={removeDemonFromIngredients} />
      <h2 ref={fusionResultSectionHeader}>Results</h2>
      <FusionResultTable demonCompendium={demonCompendium} fusionResults={fusionResults} />
    </div>
  );
}

export default FusionRecommender;