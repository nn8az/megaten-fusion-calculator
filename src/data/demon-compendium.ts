import * as Models from './data-models';

const ELEMENT_RACE: string = "Element";

type DemonInfo = { lvl: number, race: string, stats: number[] };
type DemonJson = { demons: {[demonName: string]: DemonInfo}, statsName: string[] };
type FusionSettingsJson = {
    sameRaceFusionMechanic?: string,
    tripleFusionMechanic?: string,
    disableSameDemonFusion?: boolean,
}
type FusionChartJson = {
    races: string[],
    raceFusionTable: string[][],
    
    elements?: string[],
    elementFusionTable?: number[][],
    specialRecipes?: { [resultName: string]: string[] }
}
type Preset = { caption: string, demons: string[] };
type PresetsJson = { presets: Preset[] };

export class DemonCompendium {
    private demonsAry: Models.Demon[] = [];
    private normalFusionChart: { [race: string]: { [race: string]: string } } = {}; // Maps 2 races to the race that results from their fusion. Example usage: x["Fairy"]["Genma"] gives you race that results from fusing a Fairy demon with a Genma demon. Special case: when both of the 2 races are the same, the result is a demon's name instead of a race.
    private tripleFusionChart: { [race: string]: { [race: string]: string } } = {};
    private elementsMap: { [demonId: number]: Models.Demon } = {};
    private elementFusionChart: { [race: string]: { [elementId: string]: number } } = {};
    private demonsPresets: Models.DemonsPreset[] = [];

    private gameHasElements: boolean = false;
    private _usePersonaSameRaceFusionMechanic: boolean = false;
    private _usePersonaTripleFusionMechanic: boolean = false;
    private disableSameDemonFusion: boolean = false;

    private idMap: { [demonId: number]: Models.Demon } = {}; // Maps id to a demon model object
    private nameMap: { [demonName: string]: Models.Demon } = {} // Maps name to a demon model object
    private raceIdMap: { [race: string]: number } = {}
    private raceLvlDemonMap: { [race: string]: { [lvl: number]: Models.Demon } } = {}; // Maps race-lv a demon with that race and lv. Example usage: x["Fairy"][32] gives you a demon that is a lv32 fairy

    constructor(demonListJson: DemonJson, fusionChartJson: FusionChartJson, fusionSettingsJson?: FusionSettingsJson, presetJson?: PresetsJson) {
        this.parseDemons(demonListJson);
        this.prepDemonIds();

        if (fusionSettingsJson) {
            this.parseSettings(fusionSettingsJson);
        }

        this.parseFusionChart(fusionChartJson);
        this.prepRaceLvlInfo();
        
        if (presetJson) {
            this.parsePresets(presetJson);
        }
    }

    public getDemonById(id: number): Models.Demon | undefined {
        return this.idMap[id];
    }

    public getDemonByName(name: string): Models.Demon | undefined {
        return this.nameMap[name];
    }

    public getDemonArray(): Models.Demon[] {
        return this.demonsAry;
    }

    public getDemonPresets(): Models.DemonsPreset[] {
        return this.demonsPresets;
    }

    public get usePersonaTripleFusionMechanic(): boolean {
        return this._usePersonaTripleFusionMechanic;
    }

    public get usePersonaSameRaceFusionMechanic(): boolean {
        return this._usePersonaSameRaceFusionMechanic;
    }

    public fuseDemons(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
        if (demonA.id === demonB.id && this.disableSameDemonFusion) { return undefined; }
        
        if (demonA.race === ELEMENT_RACE && demonB.race === ELEMENT_RACE) {
            return undefined;
        } else if (demonA.race === ELEMENT_RACE || demonB.race === ELEMENT_RACE) {
            return this.fuseDemonWithElement(demonA, demonB);
        } else if (demonA.race === demonB.race) {
            return this.fuseDemonSameRaceNoElement(demonA, demonB);
        } else {
            return this.fuseDemonDiffRaceNoElement(demonA, demonB);
        }
    }

    public tripleFuseDemons(demonA: Models.Demon, demonB: Models.Demon, demonC: Models.Demon): Models.Demon | undefined {
        if (this.disableSameDemonFusion) {
            if (demonA.id === demonB.id ||
                demonA.id === demonC.id ||
                demonB.id === demonC.id) { return undefined; }
        }

        const [demonWeak, demonMid, demonStrong] = [demonA, demonB, demonC].sort((x, y) => (x.lvl !== y.lvl) ? x.lvl - y.lvl : this.getRaceOrder(y.race) - this.getRaceOrder(x.race)); // sort from lowest to highest lv. If lvs are the same, sort by race order from highest to lowest.
        const intermediateRace: string | undefined = this.getFusionRace(demonWeak.race, demonMid.race);
        if (!intermediateRace) { return undefined; }
        const resultRace: string | undefined = this.getTripleFusionRace(intermediateRace, demonStrong.race);
        if (!resultRace) { return undefined; }
        const resultLvlTable: number[] = this.getLvlTableForRace(resultRace, true);
        const resultLvlTest: number = (demonWeak.lvl + demonMid.lvl + demonStrong.lvl + 12.75) / 3;
        let resultLvl: number = this.findResultLvlFromLvlTable(resultLvlTable, resultLvlTest, true);
        let demonResult: Models.Demon | undefined = this.getDemonFromRaceLvl(resultRace, resultLvl);
        if (!demonResult) { return undefined; }
        if (demonResult.id !== demonWeak.id && demonResult.id !== demonMid.id && demonResult.id !== demonStrong.id) {
            return demonResult;
        } else {
            let resultLvlIndex = resultLvlTable.indexOf(resultLvl);
            if (resultLvlIndex < 0) { return undefined; }
            if (resultLvlIndex + 1 < resultLvlTable.length) {
                resultLvl = resultLvlTable[resultLvlIndex + 1];
                return this.getDemonFromRaceLvl(resultRace, resultLvl);
            } else {
                return undefined;
            }
        }
    }

    private testGetDemon(demonName?: string): Models.Demon | undefined {
        if (demonName) { return this.getDemonByName(demonName); }
        if (this.demonsAry.length === 0) { return undefined };
        const randomDemonIndex: number = Math.floor(Math.random() * this.demonsAry.length);
        return this.demonsAry[randomDemonIndex];
    }

    private testGetRandomElement(): Models.Demon | undefined {
        const elementsIds = Object.keys(this.elementsMap);
        const elementsCount = elementsIds.length;
        if (elementsCount === 0) { return undefined };
        const randomElementIdIndex: number = Math.floor(Math.random() * elementsCount);
        const randomElementId: number = Number(elementsIds[randomElementIdIndex]);
        return this.elementsMap[randomElementId];
    }

    private testFuseDemonWithAll(demonName?: string): void {
        const demon = this.testGetDemon(demonName);
        if (!demon) { return; }
        const results: { [name: string]: Models.Demon} = {};
        for (let i = 0; i < this.demonsAry.length; i++) {
            const demonB = this.demonsAry[i];
            const demonR = this.fuseDemons(demon, demonB);
            if (!demonR) {continue;}
            results[demonB.name] = demonR;
        }
        
        console.log(demon);
        console.log(results);
    }

    private testTripleFuseDemonWithAll(demonName?: string): void {
        const demon = this.testGetDemon(demonName);
        if (!demon) { return; }
        const results: { [resultName: string]: Models.Demon[][] } = {};
        const results2: { [resultName: string]: { [ing2Name: string]: string[] } } = {};
        for (let i = 0; i < this.demonsAry.length; i++) {
            const demonB = this.demonsAry[i];
            for (let j = i; j < this.demonsAry.length; j++) {
                const demonC = this.demonsAry[j];
                const demonR = this.tripleFuseDemons(demon, demonB, demonC);
                if (!demonR) {continue;}
                if (!results[demonR.name]) { results[demonR.name] = []; }
                if (!results2[demonR.name]) { results2[demonR.name] = {}; }
                if (!results2[demonR.name][demonB.name]) { results2[demonR.name][demonB.name] = []; }
                if (!results2[demonR.name][demonC.name]) { results2[demonR.name][demonC.name] = []; }
                results[demonR.name].push([demonB, demonC]);
                results2[demonR.name][demonB.name].push(demonC.name);
                results2[demonR.name][demonC.name].push(demonB.name);
            }
        }
        console.log(demon);
        console.log(results);
        console.log(results2);
    }

    private parseDemons(demonsJson: DemonJson): void {
        Models.Demon.statsName = demonsJson.statsName;
        const demons = demonsJson.demons;
        for (const demonName in demons) {
            const demon = demons[demonName]
            this.demonsAry.push(new Models.Demon(
                0,
                demonName,
                demon.lvl,
                demon.race,
                demon.stats
            ));
        }
    }

    private parseSettings(fusionSettingsJson: FusionSettingsJson): void {
        this._usePersonaSameRaceFusionMechanic = fusionSettingsJson.sameRaceFusionMechanic === "persona";
        this._usePersonaTripleFusionMechanic = fusionSettingsJson.tripleFusionMechanic === "persona";
        this.disableSameDemonFusion = Boolean(fusionSettingsJson.disableSameDemonFusion);
    }

    private parseFusionChart(fusionChartJson: FusionChartJson): void {
        for (let row: number = 0; row < fusionChartJson.raceFusionTable.length; row++) {
            for (let col: number = 0; col < fusionChartJson.raceFusionTable[row].length; col++) {
                const chartsToUpdate = [];
                if (this._usePersonaTripleFusionMechanic) {
                    if (col < row) {
                        chartsToUpdate.push(this.tripleFusionChart);
                    } else if (col === row) {
                        chartsToUpdate.push(this.tripleFusionChart);
                        chartsToUpdate.push(this.normalFusionChart);
                    } else {
                        chartsToUpdate.push(this.normalFusionChart);
                    }
                } else {
                    if (col > row) { 
                        continue;
                    }
                    chartsToUpdate.push(this.normalFusionChart);
                }

                const raceA: string = fusionChartJson.races[row];
                const raceB: string = fusionChartJson.races[col];
                const raceC: string = fusionChartJson.raceFusionTable[row][col];

                // Set the .raceA.raceB property of the parsed fusion table
                for (const chart of chartsToUpdate) {
                    if (!chart[raceA]) {
                        chart[raceA] = {};
                    }
                    chart[raceA][raceB] = raceC;

                    // Set the .raceB.raceA property of the parsed fusion table
                    if (!chart[raceB]) {
                        chart[raceB] = {};
                    }
                    chart[raceB][raceA] = raceC;
                }
            }
        }

        if (fusionChartJson.specialRecipes) {
            for (const demonName in fusionChartJson.specialRecipes) {
                const demon = this.getDemonByName(demonName);
                if (!demon) { continue; }
                demon.specialRecipe = true;
                demon.rank = 1000;
            }
        }

        for (let i = 0; i < fusionChartJson.races.length; i++) {
            this.raceIdMap[fusionChartJson.races[i]] = i;
        }

        if (fusionChartJson.elements && fusionChartJson.elements.length > 0) {
            this.gameHasElements = true;
            const elementIdIndexMap: { [elementId: number]: number } = {};
            for (let i = 0; i < fusionChartJson.elements.length; i++) {
                const elementName = fusionChartJson.elements[i];
                const demon = this.getDemonByName(elementName);
                if (!demon) { continue; };
                this.elementsMap[demon.id] = demon;
                elementIdIndexMap[demon.id] = i;
            }

            if (fusionChartJson.elementFusionTable) {
                for (const race in this.raceIdMap) {
                    this.elementFusionChart[race] = {};
                    const raceId: number = this.raceIdMap[race];
                    for (const elementId in this.elementsMap) {
                        const elementIndex = elementIdIndexMap[elementId];
                        if (fusionChartJson.elementFusionTable[raceId]) {
                            this.elementFusionChart[race][elementId] = fusionChartJson.elementFusionTable[raceId][elementIndex];
                        }
                    }
                }
            }
        }
    }

    private parsePresets(presetsJson: PresetsJson): void {
        if (!presetsJson) { return; }
        for (const preset of presetsJson.presets) {
            const demons: Models.Demon[] = [];
            for (const demonName of preset.demons) {
                const demon: Models.Demon | undefined = this.getDemonByName(demonName);
                if (!demon) { continue; }
                demons.push(demon);
            }
            const presetModel = new Models.DemonsPreset(preset.caption, demons);
            this.demonsPresets.push(presetModel);
        }
    }

    private prepDemonIds(): void {
        this.demonsAry = this.demonsAry.sort((demon1: Models.Demon, demon2: Models.Demon) => { return demon1.lvl > demon2.lvl ? 1 : -1 }); // sort demons alphabetically
        let id: number = 1;
        for (const demon of this.demonsAry) {
            demon.id = id;
            this.idMap[demon.id] = demon;
            this.nameMap[demon.name] = demon;
            id++;
        }
    }

    private prepRaceLvlInfo(): void {
        for (const demon of this.demonsAry) {
            if (!this.raceLvlDemonMap[demon.race]) {
                this.raceLvlDemonMap[demon.race] = {};
            }
            this.raceLvlDemonMap[demon.race][demon.lvl] = demon;
        }
        for (const demon of this.demonsAry) {
            if (demon.specialRecipe) { continue; }
            demon.rank = this.getLvlTableForRace(demon.race, true).indexOf(demon.lvl);
        }
    }

    private getLvlTableForRace(race: string, excludeDemonsWithSpecialRecipe?: boolean): number[] {
        if (!this.raceLvlDemonMap[race]) {
            return [];
        }
        const lvlTable: number[] = [];
        for (const lvl in this.raceLvlDemonMap[race]) {
            if (excludeDemonsWithSpecialRecipe && this.raceLvlDemonMap[race][lvl].specialRecipe) {
                continue;
            }
            lvlTable.push(Number(lvl));
        }
        return lvlTable;
    }

    private getDemonFromRaceLvl(race: string, lvl: number): Models.Demon | undefined {
        if (this.raceLvlDemonMap[race]) {
            if (this.raceLvlDemonMap[race][lvl]) {
                return this.raceLvlDemonMap[race][lvl];
            }
        }
        return undefined;
    }

    private getFusionRace(raceA: string, raceB: string): string | undefined {
        if (this.normalFusionChart[raceA]) {
            if (this.normalFusionChart[raceA][raceB]) {
                return this.normalFusionChart[raceA][raceB];
            }
        }
        return undefined;
    }

    private getTripleFusionRace(raceA: string, raceB: string): string | undefined {
        if (this.tripleFusionChart[raceA]) {
            if (this.tripleFusionChart[raceA][raceB]) {
                return this.tripleFusionChart[raceA][raceB];
            }
        }
        return undefined;
    }

    private getRaceOrder(race: string): number {
        return this.raceIdMap[race];
    }

    private findResultLvlFromLvlTable(lvlTable: number[], lvlToCheck: number, isTripleFusion?: boolean) {
        let index = 0;
        for (let i = 0; i < lvlTable.length; i++) {
            if (lvlToCheck > lvlTable[i]) {
                index++;
            }
        }
        if (index >= lvlTable.length) { 
            if (isTripleFusion) { return -1; }
            index = lvlTable.length - 1 
        };
        return lvlTable[index];
    }

    private fuseDemonDiffRaceNoElement(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
        const raceR: string | undefined = this.getFusionRace(demonA.race, demonB.race);
        if (!raceR) { return undefined; }
        const lvlTableR: number[] = this.getLvlTableForRace(raceR, true);
        if (lvlTableR.length === 0) { return undefined; }
        const lvlResultTest = (demonB.lvl + demonA.lvl + 1) / 2;
        const lvlR: number = this.findResultLvlFromLvlTable(lvlTableR, lvlResultTest);
        return this.getDemonFromRaceLvl(raceR, lvlR)
    }

    private fuseDemonSameRaceNoElement(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
        if (this.gameHasElements) {
            const elementNameR: string | undefined = this.getFusionRace(demonA.race, demonB.race);
            if (!elementNameR) { return undefined; }
            return this.getDemonByName(elementNameR);
        } else if (this._usePersonaSameRaceFusionMechanic) {
            const resultLvlTable = this.getLvlTableForRace(demonB.race, true).filter(lvl => lvl !== demonA.lvl);
            let resultLvlIndex = -1;
            for (const resultLvl of resultLvlTable) {
                if (demonA.lvl + demonB.lvl >= 2 * resultLvl) { resultLvlIndex = resultLvlIndex + 1 }
            }

            if (resultLvlTable[resultLvlIndex] === demonB.lvl) {
                resultLvlIndex = resultLvlIndex - 1;
            }

            if (resultLvlIndex < 0) { return undefined; }
            const resultLvl = resultLvlTable[resultLvlIndex];
            return this.getDemonFromRaceLvl(demonA.race, resultLvl);
        }
    }

    private fuseDemonWithElement(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
        let element, demon;
        if (demonA.race === ELEMENT_RACE) {
            element = demonA;
            demon = demonB;
        } else if (demonB.race === ELEMENT_RACE) {
            element = demonB;
            demon = demonA;
        } else {
            return this.fuseDemonSameRaceNoElement(demonA, demonB);
        }

        const demonRankChange = this.elementFusionChart[demon.race][element.rank];
        if (demonRankChange === undefined) { return undefined; }
        const lvlTable: number[] = this.getLvlTableForRace(demon.race);
        const resultRank: number = demon.rank + demonRankChange;
        if (resultRank < 0 || resultRank >= lvlTable.length) { return undefined; }
        return this.getDemonFromRaceLvl(demon.race, lvlTable[resultRank]);
    }
}