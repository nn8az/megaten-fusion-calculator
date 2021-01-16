import * as Models from './data-models';

const ELEMENT_RACE: string = "Element";

type DemonInfo = { lvl: number, race: string, stats: number[] };
type DemonJson = { demons: {[demonName: string]: DemonInfo}, statsName: string[] };
type FusionChartJson = {
    races: string[],
    raceFusionTable: string[][],
    
    elements?: string[],
    elementFusionTable?: number[][],
    usePersonaSameRaceFusionMechanic?: boolean,
    usePersonaTripleFusionMechanic?: boolean,
    specialRecipes?: { [resultName: string]: string[] }
}
type Preset = { caption: string, demons: string[] };
type PresetJSON = { presets: Preset[] };

export class DemonCompendium {
    private demonJson: DemonJson;
    private fusionChartJson: FusionChartJson;
    private presetJson?: PresetJSON;

    private demonAry: Models.Demon[] = [];
    private normalFusionChart: { [race: string]: { [race: string]: string } } = {}; // Maps 2 races to the race that results from their fusion. Example usage: x["Fairy"]["Genma"] gives you race that results from fusing a Fairy demon with a Genma demon. Special case: when both of the 2 races are the same, the result is a demon's name instead of a race.
    private tripleFusionChart: { [race: string]: { [race: string]: string } } = {}; 
    private demonsPresets: Models.DemonsPreset[] = [];
    private gameHasElements: boolean = false;

    private idMap: { [demonId: number]: Models.Demon } = {}; // Maps id to a demon model object
    private nameMap: { [demonName: string]: Models.Demon } = {} // Maps name to a demon model object
    private raceLvlDemonMap: { [race: string]: { [lvl: number]: Models.Demon } } = {}; // Maps race-lv a demon with that race and lv. Example usage: x["Fairy"][32] gives you a demon that is a lv32 fairy

    constructor(demonListJSON: DemonJson, fusionChartJSON: FusionChartJson, presetJSON?: PresetJSON) {
        this.demonJson = demonListJSON;
        this.fusionChartJson = fusionChartJSON;
        this.presetJson = presetJSON;

        this.parseDemons();
        this.prepDemonIds();

        this.parseFusionChart();
        this.prepRaceLvlInfo();
        
        this.parsePresets();
    }

    public getDemonById(id: number): Models.Demon | undefined {
        return this.idMap[id];
    }

    public getDemonByName(name: string): Models.Demon | undefined {
        return this.nameMap[name];
    }

    public getDemonArray(): Models.Demon[] {
        return this.demonAry;
    }

    public getDemonPresets(): Models.DemonsPreset[] {
        return this.demonsPresets;
    }

    public fuseDemons(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
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

    private testGetRandomDemon(): Models.Demon | undefined {
        if (this.demonAry.length === 0) { return undefined };
        const randomDemonIndex: number = Math.floor(Math.random() * this.demonAry.length);
        return this.demonAry[randomDemonIndex];
    }

    private testGetRandomElement(): Models.Demon | undefined {
        if (!this.fusionChartJson.elements || this.fusionChartJson.elements.length === 0) {return undefined};
        const randomElementIndex: number = Math.floor(Math.random() * this.fusionChartJson.elements.length);
        return this.getDemonByName(this.fusionChartJson.elements[randomElementIndex]);
    }

    private testFuseDemonWithAll(demonName?: string): void {
        const demon = demonName ? this.getDemonByName(demonName): this.testGetRandomDemon();
        if (!demon) { return; }
        const results: { [name: string]: Models.Demon} = {};
        for (let i = 0; i < this.demonAry.length; i++) {
            const demonB = this.demonAry[i];
            const demonR = this.fuseDemons(demon, this.demonAry[i]);
            if (!demonR) {continue;}
            results[demonB.name] = demonR;
        }
        
        console.log(demon);
        console.log(results);
    }

    private parseDemons(): void {
        Models.Demon.statsName = this.demonJson.statsName;
        const demons = this.demonJson.demons;
        for (const demonName in demons) {
            const demon = demons[demonName]
            this.demonAry.push(new Models.Demon(
                0,
                demonName,
                demon.lvl,
                demon.race,
                demon.stats
            ));
        }
    }

    private parseFusionChart(): void {
        if (this.fusionChartJson.elements && this.fusionChartJson.elements.length > 0) { this.gameHasElements = true; }

        for (let row: number = 0; row < this.fusionChartJson.raceFusionTable.length; row++) {
            for (let col: number = 0; col < this.fusionChartJson.raceFusionTable[row].length; col++) {
                if (col < row) { continue; }
                const raceA: string = this.fusionChartJson.races[row];
                const raceB: string = this.fusionChartJson.races[col];
                const raceC: string = this.fusionChartJson.raceFusionTable[row][col];

                // Set the .raceA.raceB property of the parsed fusion table
                if (!this.normalFusionChart[raceA]) {
                    this.normalFusionChart[raceA] = {};
                }
                this.normalFusionChart[raceA][raceB] = raceC;

                // Set the .raceB.raceA property of the parsed fusion table
                if (!this.normalFusionChart[raceB]) {
                    this.normalFusionChart[raceB] = {};
                }
                this.normalFusionChart[raceB][raceA] = raceC;
            }
        }

        if (this.fusionChartJson.specialRecipes) {
            for (const demonName in this.fusionChartJson.specialRecipes) {
                const demon = this.getDemonByName(demonName);
                if (!demon) { continue; }
                demon.specialRecipe = true;
                demon.rank = 1000;
            }
        }
    }

    private parsePresets(): void {
        if (!this.presetJson) { return; }
        for (const preset of this.presetJson.presets) {
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
        this.demonAry = this.demonAry.sort((demon1: Models.Demon, demon2: Models.Demon) => { return demon1.lvl > demon2.lvl ? 1 : -1 }); // sort demons alphabetically
        let id: number = 1;
        for (const demon of this.demonAry) {
            demon.id = id;
            this.idMap[demon.id] = demon;
            this.nameMap[demon.name] = demon;
            id++;
        }
    }

    private prepRaceLvlInfo(): void {
        for (const demon of this.demonAry) {
            if (!this.raceLvlDemonMap[demon.race]) {
                this.raceLvlDemonMap[demon.race] = {};
            }
            this.raceLvlDemonMap[demon.race][demon.lvl] = demon;
        }
        for (const demon of this.demonAry) {
            if (demon.specialRecipe) { continue; }
            demon.rank = this.getLvlTableForRace(demon.race, true).indexOf(demon.lvl);
        }
    }

    private getLvlTableForRace(race: string, excludeDemonsWithUniqueRecipe?: boolean): number[] {
        if (!this.raceLvlDemonMap[race]) {
            return [];
        }
        const lvlTable: number[] = [];
        for (const lvl in this.raceLvlDemonMap[race]) {
            if (excludeDemonsWithUniqueRecipe && this.raceLvlDemonMap[race][lvl].specialRecipe) {
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

    private getFusionResultRace(raceA: string, raceB: string): string | undefined {
        if (this.normalFusionChart[raceA]) {
            if (this.normalFusionChart[raceA][raceB]) {
                return this.normalFusionChart[raceA][raceB];
            }
        }
        return undefined
    }

    private fuseDemonDiffRaceNoElement(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
        const raceR: string | undefined = this.getFusionResultRace(demonA.race, demonB.race);
        if (!raceR) { return undefined; }
        const lvlTableR: number[] = this.getLvlTableForRace(raceR, true);
        if (lvlTableR.length === 0) { return undefined; }
        const modedLvlTableR: number[] = lvlTableR.map((lvl) => { return 2 * lvl - demonA.lvl - 1 });
        let lvlIndexR = 0;
        for (let i = 0; i < modedLvlTableR.length; i++) {
            if (demonB.lvl > modedLvlTableR[i]) {
                lvlIndexR++;
            }
        }
        if (lvlIndexR >= lvlTableR.length) { lvlIndexR = lvlTableR.length - 1 };
        const lvlR: number = lvlTableR[lvlIndexR];
        return this.getDemonFromRaceLvl(raceR, lvlR)
    }

    private fuseDemonSameRaceNoElement(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
        if (this.gameHasElements) {
            const elementNameR: string | undefined = this.getFusionResultRace(demonA.race, demonB.race);
            if (!elementNameR) { return undefined; }
            return this.getDemonByName(elementNameR);
        } else if (this.fusionChartJson.usePersonaSameRaceFusionMechanic) {
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

        const raceId: number = this.fusionChartJson.races.indexOf(demon.race);
        if (raceId < 0 || raceId >= this.fusionChartJson.elementFusionTable!.length) {return undefined;}
        const demonRankChange: number = this.fusionChartJson.elementFusionTable![raceId][element.rank];
        const lvlTable: number[] = this.getLvlTableForRace(demon.race);
        const resultRank: number = demon.rank + demonRankChange;
        if (resultRank < 0 || resultRank >= lvlTable.length) { return undefined };
        return this.getDemonFromRaceLvl(demon.race, lvlTable[resultRank]);
    }
}