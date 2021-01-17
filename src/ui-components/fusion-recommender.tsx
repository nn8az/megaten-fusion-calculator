// Imports for foundational functionalities
import React, { useRef, useState } from 'react';

// Imports for data
import * as Models from '../data/data-models';
import { DemonCompendium } from '../data/demon-compendium';

// Imports for UI components
import Button from '@material-ui/core/Button';
import FusionIngredientsTable from './ingredients-table';
import FusionResultTable from './fusion-result-table';
import SettingsPanel, { Settings } from './settings-panel';
import DemonAdder from './demon-adder';

import ReplayIcon from '@material-ui/icons/Replay';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SettingsIcon from '@material-ui/icons/Settings';
import styles from './fusion-recommender.module.scss';

const MAX_FUSION_INGREDIENT_HARD_CAP = 7;

function calculateAllFusionCombinations(ingredients: Models.IngredientDemons, demonCompendium: DemonCompendium, settings: Settings): Models.FusionResults {
  const myFusionResults: Models.FusionResults = {};
  for (let size = 1; size <= settings.maxIngredient && size <= MAX_FUSION_INGREDIENT_HARD_CAP; size++) {
    myFusionResults[size] = {};
  }

  for (const demonId in ingredients) {
    const demon: Models.Demon | undefined = demonCompendium.getDemonById(Number(demonId));
    if (!demon) { continue; }
    const fusedDemon: Models.FusedDemon = new Models.FusedDemon(demon);
    if (!myFusionResults[1][demon.id]) {
      myFusionResults[1][demon.id] = [];
    }
    myFusionResults[1][demon.id].push(fusedDemon);
  }

  for (let ingCountR = 2; ingCountR <= settings.maxIngredient && ingCountR <= MAX_FUSION_INGREDIENT_HARD_CAP; ingCountR++) {
    for (let ingCountA = ingCountR - 1; ingCountA >= (ingCountR / 2); ingCountA--) {
      const ingCountB: number = ingCountR - ingCountA;
      const speciesUsedAsA: { [id: number]: boolean } = {}; // id of the demon species that have already been used in the calculation as demon A
      for (const idA in myFusionResults[ingCountA]) {
        if (myFusionResults[ingCountA][idA].length === 0) { continue; }
        const speciesA: Models.Demon = myFusionResults[ingCountA][idA][0].demon;
        for (const idB in myFusionResults[ingCountB]) {
          if (myFusionResults[ingCountB][idB].length === 0) { continue; }
          const speciesB: Models.Demon = myFusionResults[ingCountB][idB][0].demon;

          // skip calculating fusions that should have already been calculated since A+B produces the same results as B+A
          if (speciesUsedAsA[speciesB.id]) { continue; }

          const speciesR: Models.Demon | undefined = demonCompendium.fuseDemons(speciesA, speciesB);
          if (!speciesR) { continue; }
          if (!postSpeciesFusionCheck(myFusionResults, settings, speciesR, ingCountR, [speciesA, speciesB])) { continue; }

          const resultFusedDemons: Models.FusedDemon[] = crossFuseIngredients(speciesR, myFusionResults[ingCountA][idA], myFusionResults[ingCountB][idB]);
          if (!myFusionResults[ingCountR][speciesR.id]) { myFusionResults[ingCountR][speciesR.id] = []; }
          for (const fusedDemon of resultFusedDemons) {
            myFusionResults[ingCountR][speciesR.id].push(fusedDemon);
          }
        }
        speciesUsedAsA[speciesA.id] = true;
      }
    }

    if (settings.useTripleFusion) {
      calculateTripleFusionCombinations(ingredients, demonCompendium, settings, myFusionResults, ingCountR);
    }
  }

  // Re-traverse the entire results and fully purge fusion recipes that produce demons of lower level
  for (const ingCount in myFusionResults) {
    if (Number(ingCount) === 1) { continue; }
    for (const id in myFusionResults[ingCount]) {
      const demonAry: Models.FusedDemon[] = myFusionResults[ingCount][id];
      const filteredDemonAry = demonAry.filter((demon) => { return !demon.isWeakerThanIngredients() })
      myFusionResults[ingCount][id] = filteredDemonAry;
    }
  }

  return myFusionResults;
}

function calculateTripleFusionCombinations(ingredients: Models.IngredientDemons, demonCompendium: DemonCompendium, settings: Settings, fusionResults: Models.FusionResults, ingCountR: number): void {
  let ingCounts: number[] = [];
  while (getNextTripleFusionIngCounts(ingCounts, ingCountR)) {
    const [ingCountA, ingCountB, ingCountC] = ingCounts;
    const alreadyCalculatedAsA: { [id: number]: boolean } = {};
    for (const idA in fusionResults[ingCountA]) {
      if (fusionResults[ingCountA][idA].length === 0) { continue; }
      const speciesA: Models.Demon = fusionResults[ingCountA][idA][0].demon;

      const alreadyCalculatedAsB: { [id: number]: boolean } = {};
      for (const idB in fusionResults[ingCountB]) {
        if (alreadyCalculatedAsA[Number(idB)]) { continue; }
        if (fusionResults[ingCountB][idB].length === 0) { continue; }
        const speciesB: Models.Demon = fusionResults[ingCountB][idB][0].demon;

        for (const idC in fusionResults[ingCountC]) {
          if (alreadyCalculatedAsA[Number(idC)]) { continue; }
          if (alreadyCalculatedAsB[Number(idC)]) { continue; }
          if (fusionResults[ingCountC][idC].length === 0) { continue; }
          const speciesC: Models.Demon = fusionResults[ingCountC][idC][0].demon;
          const speciesR: Models.Demon | undefined = demonCompendium.tripleFuseDemons(speciesA, speciesB, speciesC);
          if (!speciesR) { continue; }
          if (!postSpeciesFusionCheck(fusionResults, settings, speciesR, ingCountR, [speciesA, speciesB, speciesC])) { continue; }
          const resultFusedDemons: Models.FusedDemon[] = crossFuseIngredients(speciesR, fusionResults[ingCountA][idA], fusionResults[ingCountB][idB], fusionResults[ingCountC][idC]);
          if (!fusionResults[ingCountR][speciesR.id]) { fusionResults[ingCountR][speciesR.id] = []; }
          for (const fusedDemon of resultFusedDemons) {
            fusionResults[ingCountR][speciesR.id].push(fusedDemon);
          }
        }
        alreadyCalculatedAsB[speciesB.id] = true;
      }
      alreadyCalculatedAsA[speciesA.id] = true;
    }
  }
}

function getNextTripleFusionIngCounts(fusionIngCounts: number[], ingCountR: number): boolean {
  if (ingCountR < 3) { return false; }
  if (fusionIngCounts.length < 3) { 
    fusionIngCounts[0] = ingCountR - 2;
    fusionIngCounts[1] = 1;
    fusionIngCounts[2] = 1;
    return true;
  }
  for (let i = fusionIngCounts.length - 2; i >= 0; i--) {
    const j: number = i + 1;
    if (fusionIngCounts[i] - fusionIngCounts[j] >= 2) {
      fusionIngCounts[i] = fusionIngCounts[i] - 1;
      fusionIngCounts[j] = fusionIngCounts[j] + 1;
      return true;
    }
  }
  return false;
}

function postSpeciesFusionCheck(fusionResults: Models.FusionResults, settings: Settings, speciesR: Models.Demon, ingCountR: number, speciesIngs: Models.Demon[]): boolean {
  // throw out inefficient fusions that the user can already make using fewer ingredients
  let canBeMadeWithLessIngredient: boolean = false;
  for (let sizeCheck = ingCountR - 1; sizeCheck >= 1; sizeCheck--) {
    if (fusionResults[sizeCheck][speciesR.id]) {
      canBeMadeWithLessIngredient = true;
      break;
    }
  }
  if (canBeMadeWithLessIngredient) { return false; }

  if (speciesR.lvl > settings.charLvl) { return false; }

  // if this is the final round of fusions, throw out fusions that produce demons that are lower level 
  if (ingCountR === settings.maxIngredient) {
    for (const speciesIng of speciesIngs) {
      if (speciesR.lvl < speciesIng.lvl) {
        return false;
      }
    }
  }
  return true;
}

function crossFuseIngredients(resultSpecies: Models.Demon, ...ingredients: Models.FusedDemon[][]): Models.FusedDemon[] {
  const indeces: number[] = [];
  const ret: Models.FusedDemon[] = [];
  for (let i = 0; i < ingredients.length; i++) { indeces.push(0); }
  while (true) {
    const fusedDemonIngredientsHistory: Models.FusedDemon[] = [];
    for (let i = 0; i < ingredients.length; i++) {
      fusedDemonIngredientsHistory.push(ingredients[i][indeces[i]]);
    }
    ret.push(new Models.FusedDemon(resultSpecies, fusedDemonIngredientsHistory));

    // Increment the indeces
    let hasCarry: boolean = true;
    for (let i = indeces.length - 1; i >= 0; i--) {
      let index: number = indeces[i];
      if (hasCarry) { index = index + 1; hasCarry = false; }
      if (index >= ingredients[i].length) { index = 0; hasCarry = true; }
      indeces[i] = index;
      if (!hasCarry) { break; }
    }
    if (hasCarry) { break; }
  }
  return ret;
}

export default function FusionRecommender(params: { demonCompendium: DemonCompendium }): JSX.Element {
  const { demonCompendium } = params;
  let [ingredients, setIngredients] = useState<Models.IngredientDemons>({});
  let [fusionResults, setFusionResults] = useState<Models.FusionResults>({});
  let [settingsIsVisible, setSettingsIsVisible] = useState<boolean>(false);
  let [resetterKey, setResetterKey] = useState<number>(1); // This key is meant to be used to reset components. Changes to this key will trigger components to reset.
  
  let settings = new Settings();
  settings.useTripleFusion = demonCompendium.usePersonaTripleFusionMechanic ? true : undefined;

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

  function onCalculateButtonClick(): void {
    setFusionResults(calculateAllFusionCombinations(ingredients, demonCompendium, settings));
  }

  function onSettingsButtonClick(): void {
    setSettingsIsVisible(!settingsIsVisible);
  }

  function onResetButtonClick(): void {
    const newIngredients = {};
    setIngredients(newIngredients);

    const newFusionResults = {};
    setFusionResults(newFusionResults);

    console.log(settings);
    setResetterKey((resetterKey + 1) % 2);
  }
  
  return (
    <div className={styles.fusionRecommender}>
      <h2>Add demons to use as fusion ingredients</h2>
      <div className={styles.addDemonsAndButtonsRowContainer}>
        <DemonAdder key={resetterKey} demonCompendium={demonCompendium} onAddDemon={addDemonToIngredients} />
        <div className={styles.buttonsRow}>
          <Button className={styles.calculateButton} variant="outlined" onClick={onCalculateButtonClick} disabled={Object.keys(ingredients).length === 0} ><PlayArrowIcon />Calculate</Button>
          <Button className={styles.settingsButton} variant="outlined" onClick={onSettingsButtonClick}><SettingsIcon /></Button>
          <Button className={styles.resetButton} variant="outlined" onClick={onResetButtonClick}><ReplayIcon />Reset</Button>
        </div>
      </div>
      <SettingsPanel key={resetterKey} visible={settingsIsVisible} settings={settings} />
      <h2>Fusion Ingredients</h2>
      <FusionIngredientsTable demonCompendium={demonCompendium} ingredients={ingredients} onRemoveIngredient={removeDemonFromIngredients} />
      <h2 ref={fusionResultSectionHeader}>Results</h2>
      <FusionResultTable demonCompendium={demonCompendium} fusionResults={fusionResults} />
    </div>
  );
}