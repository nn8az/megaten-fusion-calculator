// Imports for foundational functionalities
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Imports for data
import * as Models from './data/data-models';
import { DemonCompendium } from './data/demon-compendium';

// Imports for UI components
import Button from '@material-ui/core/Button';
import IngredientsTable from './ui-components/ingredients-table';
import ResultsTable from './ui-components/results-table';
import SettingsPanel, { UserSettings, SettingsPanelEventHandlers } from './ui-components/settings-panel';
import DemonAdder from './ui-components/demon-adder';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import ReplayIcon from '@material-ui/icons/Replay';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SettingsIcon from '@material-ui/icons/Settings';
import styles from './fusion-calculator.module.scss';
import { Route, Router, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import DemonDisplayer from './demon-displayer';

const MAX_FUSION_INGREDIENT_HARD_CAP = 5;

async function calculateAllFusionCombinationsAsync(ingredients: Models.Ingredients, demonCompendium: DemonCompendium, settings: UserSettings, ingredientsSettings: Models.IngredientsSettings): Promise<Models.FusionResults> {
  const promise = new Promise<Models.FusionResults>(function(resolver) {
    setTimeout(function () {
      resolver(calculateAllFusionCombinations(ingredients, demonCompendium, settings, ingredientsSettings));
    }, 100);
  });
  return promise;
}

function calculateAllFusionCombinations(ingredients: Models.Ingredients, demonCompendium: DemonCompendium, userSettings: UserSettings, ingredientsSettings: Models.IngredientsSettings): Models.FusionResults {
  const specialRecipes: Models.SpecialRecipes = demonCompendium.getSpecialRecipes();
  const viableSpecialRecipes: Models.SpecialRecipes = {};
  const maxIngredient: number = (userSettings.maxIngredient < MAX_FUSION_INGREDIENT_HARD_CAP) ? userSettings.maxIngredient : MAX_FUSION_INGREDIENT_HARD_CAP;
  const fusionResults = new Models.FusionResults(maxIngredient);

  for (const demonId in ingredients) {
    const demon: Models.Demon | undefined = demonCompendium.getDemonById(Number(demonId));
    if (!demon) { continue; }
    const fusedDemon: Models.FusedDemon = new Models.FusedDemon(demon);
    if (!fusionResults.data[1][demon.id]) {
      fusionResults.data[1][demon.id] = [];
    }
    fusionResults.data[1][demon.id].push(fusedDemon);
  }
  updateViableSpecialRecipes(fusionResults, 1, specialRecipes, viableSpecialRecipes);

  // Compute double fusions
  for (let ingCountR = 2; ingCountR <= maxIngredient; ingCountR++) {
    for (let ingCountA = ingCountR - 1; ingCountA >= (ingCountR / 2); ingCountA--) {
      const ingCountB: number = ingCountR - ingCountA;
      const speciesUsedAsA: { [id: number]: boolean } = {}; // id of the demon species that have already been used in the calculation as demon A
      for (const idA in fusionResults.data[ingCountA]) {
        if (fusionResults.data[ingCountA][idA].length === 0) { continue; }
        const speciesA: Models.Demon = fusionResults.data[ingCountA][idA][0].demon;
        for (const idB in fusionResults.data[ingCountB]) {
          if (fusionResults.data[ingCountB][idB].length === 0) { continue; }
          const speciesB: Models.Demon = fusionResults.data[ingCountB][idB][0].demon;

          // skip calculating fusions that should have already been calculated since A+B produces the same results as B+A
          if (speciesUsedAsA[speciesB.id]) { continue; }

          const speciesR: Models.Demon | undefined = demonCompendium.fuseDemons(speciesA, speciesB);
          if (!speciesR) { continue; }
          if (!filterDemonsAfterSpeciesFusion(fusionResults, userSettings, speciesR, ingCountR, [speciesA, speciesB])) { continue; }

          const resultingFusedDemons: Models.FusedDemon[] = crissCrossFusedDemons(speciesR, ingredientsSettings, fusionResults.data[ingCountA][idA], fusionResults.data[ingCountB][idB]);
          fusionResults.addFusedDemonsOfSameSpecies(resultingFusedDemons);
        }
        speciesUsedAsA[speciesA.id] = true;
      }
    }

    // Compute triple fusions
    if (userSettings.useTripleFusion) {
      calculateTripleFusionCombinations(demonCompendium, userSettings, ingredientsSettings, fusionResults, ingCountR);
    }

    // Compute special recipe fusions
    calculateSpecialRecipeFusion(demonCompendium, userSettings, ingredientsSettings, fusionResults, ingCountR, viableSpecialRecipes);

    // Update viable special recipes
    updateViableSpecialRecipes(fusionResults, ingCountR, specialRecipes, viableSpecialRecipes);
  }

  // At this point, we're completely finished with all fusion combinations
  // Re-traverse through all of the results and purge fusions that don't satisfy various constraints/settings
  const mustUseDemons: Models.MustUseDemonsMap = prepareIngredientsSettingsForFinalFilter(ingredientsSettings, ingredients);
  let filterFunction = filterDemonsAfterCalculation.bind(undefined, mustUseDemons);
  fusionResults.filter(filterFunction);

  return fusionResults;
}

function updateViableSpecialRecipes(fusionResults: Models.FusionResults, ingCountNodeToUpdate: number, specialRecipes: Models.SpecialRecipes, viableSpecialRecipes: Models.SpecialRecipes) {
  for (const demonId in fusionResults.data[ingCountNodeToUpdate]) {
    for (let recipeIngCount = 2; recipeIngCount <= fusionResults.getMaxIngredient(); recipeIngCount++) {
      if (!specialRecipes[recipeIngCount]) { continue; }
      for (const recipe of specialRecipes[recipeIngCount]) {
        const registrationSuccessful: boolean = recipe.registerIngredient(Number(demonId), ingCountNodeToUpdate);
        if (registrationSuccessful && recipe.isViable()) {
          const recipeCost: number = recipe.totalBaseIngredientsCost();
          if (!viableSpecialRecipes[recipeCost]) {
            viableSpecialRecipes[recipeCost] = [];
          }
          viableSpecialRecipes[recipeCost].push(recipe);
        }
      }
    }
  }
}

function calculateTripleFusionCombinations(demonCompendium: DemonCompendium, userSettings: UserSettings, ingredientsSettings: Models.IngredientsSettings, fusionResults: Models.FusionResults, ingCountR: number): void {
  let ingCounts: number[] = [];
  while (getNextCombinationTuple(ingCounts, 3, ingCountR)) {
    const [ingCountA, ingCountB, ingCountC] = ingCounts;
    const alreadyCalculatedAsA: { [id: number]: boolean } = {};
    for (const idA in fusionResults.data[ingCountA]) {
      if (fusionResults.data[ingCountA][idA].length === 0) { continue; }
      const speciesA: Models.Demon = fusionResults.data[ingCountA][idA][0].demon;

      const alreadyCalculatedAsB: { [id: number]: boolean } = {};
      for (const idB in fusionResults.data[ingCountB]) {
        if (alreadyCalculatedAsA[Number(idB)]) { continue; }
        if (fusionResults.data[ingCountB][idB].length === 0) { continue; }
        const speciesB: Models.Demon = fusionResults.data[ingCountB][idB][0].demon;

        for (const idC in fusionResults.data[ingCountC]) {
          if (alreadyCalculatedAsA[Number(idC)]) { continue; }
          if (alreadyCalculatedAsB[Number(idC)]) { continue; }
          if (fusionResults.data[ingCountC][idC].length === 0) { continue; }
          const speciesC: Models.Demon = fusionResults.data[ingCountC][idC][0].demon;
          const speciesR: Models.Demon | undefined = demonCompendium.tripleFuseDemons(speciesA, speciesB, speciesC);
          if (!speciesR) { continue; }
          if (!filterDemonsAfterSpeciesFusion(fusionResults, userSettings, speciesR, ingCountR, [speciesA, speciesB, speciesC])) { continue; }
          const resultFusedDemons: Models.FusedDemon[] = crissCrossFusedDemons(speciesR, ingredientsSettings, fusionResults.data[ingCountA][idA], fusionResults.data[ingCountB][idB], fusionResults.data[ingCountC][idC]);
          fusionResults.addFusedDemonsOfSameSpecies(resultFusedDemons);
        }
        alreadyCalculatedAsB[speciesB.id] = true;
      }
      alreadyCalculatedAsA[speciesA.id] = true;
    }
  }
}

function calculateSpecialRecipeFusion(demonCompendium: DemonCompendium, userSettings: UserSettings, ingredientsSettings: Models.IngredientsSettings, fusionResults: Models.FusionResults, ingCountR: number, viableSpecialRecipes: Models.SpecialRecipes): void {
  const currSpecialRecipes: Models.Recipe[] | undefined = viableSpecialRecipes[ingCountR];
  if (!currSpecialRecipes) { return; }
  for (const specialRecipe of currSpecialRecipes) {
    const speciesR: Models.Demon | undefined = demonCompendium.getDemonById(specialRecipe.resultId);
    if (!speciesR) { continue; }

    const ingredientsSpecies: Models.Demon[] = [];
    const ingredientsFusedDemons: Models.FusedDemon[][] = [];
    let missingIngredient: boolean = false;
    for (const ingredientId in specialRecipe.ingredients) {
      const ingredientSpecies: Models.Demon | undefined = demonCompendium.getDemonById(Number(ingredientId));
      if (!ingredientSpecies) {
        missingIngredient = true;
        break;
      }
      ingredientsSpecies.push(ingredientSpecies);
      const ingredientCost: number = specialRecipe.ingredients[ingredientId];
      ingredientsFusedDemons.push(fusionResults.data[ingredientCost][ingredientSpecies.id]);
    }
    if (missingIngredient) { continue; }
    if (!filterDemonsAfterSpeciesFusion(fusionResults, userSettings, speciesR, ingCountR, ingredientsSpecies)) { continue; }

    const resultingFusedDemons: Models.FusedDemon[] = crissCrossFusedDemons(speciesR, ingredientsSettings, ...ingredientsFusedDemons);
    fusionResults.addFusedDemonsOfSameSpecies(resultingFusedDemons);
  }
}

function getNextCombinationTuple(currentTuple: number[], tupleSize: number, sumRequirement: number): boolean {
  if (sumRequirement < tupleSize) { return false; }
  if (currentTuple.length > tupleSize) { return false; }

  // Initialize the tuple if given an empty tuple
  if (currentTuple.length === 0) { 
    currentTuple[0] = sumRequirement - tupleSize + 1;
    for (let i = 1; i < tupleSize; i++) {
      currentTuple[i] = 1;
    }
    return true;
  }

  // If not given an empty tuple, compute the next tuple
  for (let i = currentTuple.length - 2; i >= 0; i--) {
    const j: number = i + 1;
    if (currentTuple[i] - currentTuple[j] >= 2) {
      currentTuple[i] = currentTuple[i] - 1;
      currentTuple[j] = currentTuple[j] + 1;
      return true;
    }
  }
  return false;
}

function filterDemonsAfterSpeciesFusion(fusionResults: Models.FusionResults, settings: UserSettings, speciesR: Models.Demon, ingCountR: number, speciesIngs: Models.Demon[]): boolean {
  // throw out the resulting species if we knew how to make it with fewer ingredients
  let canBeMadeWithLessIngredient: boolean = false;
  for (let sizeCheck = ingCountR - 1; sizeCheck >= 1; sizeCheck--) {
    if (fusionResults.data[sizeCheck][speciesR.id]) {
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

function filterDemonsAfterCrissCross(ingSettings: Models.IngredientsSettings, demon: Models.FusedDemon): boolean {
  const baseIngCount = demon.getBaseIngredientsCounts();
  for (const id in baseIngCount) {
    if (baseIngCount[id] > 1 && !ingSettings[id].multipleUse) { return false; }
  }
  return true;
}

function filterDemonsAfterCalculation(mustUseDemons: Models.MustUseDemonsMap, demon: Models.FusedDemon): boolean {
  if (demon.isWeakerThanBaseIngredients()) { return false; }
  const myMustUseDemons = {...mustUseDemons};
  const demonBaseIngCount = demon.getBaseIngredientsCounts();
  for (const demonId in demonBaseIngCount) {
    delete myMustUseDemons[demonId];
  }
  if (Object.keys(myMustUseDemons).length > 0) { return false; }
  return true;
}

function prepareIngredientsSettingsForFinalFilter(ingSettings: Models.IngredientsSettings, ingredients: Models.Ingredients): Models.MustUseDemonsMap {
  const mustUseDemons: Models.MustUseDemonsMap = {};
  for (const id in ingredients) {
    if (ingSettings[id].mustUse) { mustUseDemons[id] = true };
  }
  return mustUseDemons;
}

function crissCrossFusedDemons(resultSpecies: Models.Demon, ingredientsSettings: Models.IngredientsSettings, ...ingredients: Models.FusedDemon[][]): Models.FusedDemon[] {
  const indeces: number[] = [];
  const ret: Models.FusedDemon[] = [];
  for (let i = 0; i < ingredients.length; i++) {
    indeces.push(0);
  }
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
  
  return ret.filter(filterDemonsAfterCrissCross.bind(undefined, ingredientsSettings));;
}

//====================================================================================================

function initializeUserSettings(demonCompendium: DemonCompendium): UserSettings {
  const settings = new UserSettings();
  settings.useTripleFusion = demonCompendium.enableTripleFusion;
  settings.useTripleFusionSettingIsVisible = demonCompendium.enableTripleFusion;
  return settings;
}

export default function FusionCalculator(props: { demonCompendium: DemonCompendium }): JSX.Element {
  const { demonCompendium } = props;

  const [ingredients, setIngredients] = useState<Models.Ingredients>({});
  let [fusionResults, setFusionResults] = useState<Models.FusionResults>(new Models.FusionResults());
  const [fusionResultsPromise, setFusionResultsPromise] = useState<Promise<Models.FusionResults> | undefined>(undefined);
  let [resetterKey, setResetterKey] = useState<number>(1); // This key is meant to be used to reset components. Changes to this key will trigger components to reset.
  const history = useHistory();
  const routeMatcher = useRouteMatch();

  let [nonRenderingStates] = useState<[UserSettings, Models.IngredientsSettings]>([initializeUserSettings(demonCompendium), {}]);
  const settings = nonRenderingStates[0];
  const ingredientsSettings = nonRenderingStates[1];
  const settingsPanelEventHandlers: SettingsPanelEventHandlers = {};
  const refResultsTable = useRef<HTMLHeadingElement>(null);

  useEffect(()=>{
    let isMounted: boolean = true;

    if (fusionResultsPromise) {
      fusionResultsPromise.then((fr)=>{
        if (isMounted) {
          setFusionResults(fr);
          setFusionResultsPromise(undefined);
          if (fr.hasFusionResult()) {
            refResultsTable.current?.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    }

    return ()=>{ isMounted = false; }
  }, [fusionResults, fusionResultsPromise]);

  const removeDemonFromIngredientsHandler = useCallback(function (demonId: number): void {
    const newIngredients = { ...ingredients };
    delete newIngredients[demonId];
    setIngredients(newIngredients);
  }, [ingredients]);

  function addDemonToIngredientsHandler(demons: Models.Demon[]): void {
    const newIngredients = { ...ingredients };
    for (const demon of demons) {
      newIngredients[demon.id] = true;
    }
    setIngredients(newIngredients);
  };

  function calculateButtonHandler(): void {
    setFusionResultsPromise(calculateAllFusionCombinationsAsync(ingredients, demonCompendium, settings, ingredientsSettings));
  }

  function settingsButtonHandler(): void {
    if (settingsPanelEventHandlers.toggleVisibility) {
      settingsPanelEventHandlers.toggleVisibility();
    }
  }

  function resetButtonHandler(): void {
    const newIngredients = {};
    setIngredients(newIngredients);
    for (const key in ingredientsSettings) {
      delete ingredientsSettings[key];
    }
    
    setFusionResults(new Models.FusionResults());

    setResetterKey((resetterKey + 1) % 2);
  }

  function openDemonRecipesHandler(demonId: number) {
    history.push(`${routeMatcher.url}/creature/${demonId}`);
  }
  
  return (
    <Router history={history}>
      <Switch>
        <Route path={`${routeMatcher.path}/creature/:demonId`}>
          <DemonDisplayer demonCompendium={demonCompendium} goBackUrlPath={routeMatcher.url} fusionResults={fusionResults} />
        </Route>
        <Route path={`${routeMatcher.path}/`}>

          <div className={styles.fusionCalculator + (fusionResultsPromise ? " " + styles.loading : "")}>
            <div className={styles.section}>
              <h2>Add Creatures to Use as Fusion Ingredients</h2>
              <div className={styles.addDemonsAndButtonsRowContainer}>
                <DemonAdder key={resetterKey} demonCompendium={demonCompendium} onAddDemon={addDemonToIngredientsHandler} />
                <div className={styles.buttonsRow}>
                  <Button className={styles.calculateButton} variant="outlined" onClick={calculateButtonHandler} disabled={Object.keys(ingredients).length === 0} ><PlayArrowIcon />Calculate</Button>
                  <Button className={styles.settingsButton} variant="outlined" onClick={settingsButtonHandler}><SettingsIcon /></Button>
                  <Button className={styles.resetButton} variant="outlined" onClick={resetButtonHandler}><ReplayIcon />Reset</Button>
                </div>
              </div>
              <SettingsPanel key={resetterKey} settings={settings} eventHandlers={settingsPanelEventHandlers} />
            </div>
            <div className={styles.section} hidden={Object.keys(ingredients).length === 0}>
              <h2>Fusion Ingredients</h2>
              <IngredientsTable
                demonCompendium={demonCompendium}
                ingredients={ingredients}
                ingredientsSettings={ingredientsSettings}
                onRemoveIngredient={removeDemonFromIngredientsHandler} />
            </div>
            <div className={styles.section} hidden={!fusionResults.hasFusionResult()}>
              <h2>Results</h2>
              <div ref={refResultsTable}>
                <ResultsTable fusionResults={fusionResults} onOpenDemonRecipes={openDemonRecipesHandler} />
              </div>
            </div>
            
            <Backdrop open={fusionResultsPromise !== undefined} hidden={fusionResultsPromise === undefined}>
              <CircularProgress color="inherit" />
            </Backdrop>
          </div>

        </Route>
      </Switch>
    </Router>
  );
}