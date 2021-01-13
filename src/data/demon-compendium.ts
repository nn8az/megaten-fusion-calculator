import * as Models from './data-models';

const ELEMENT_RACE: string = "Element";

type DemonInfo = { lvl: number, race: string};
type DemonListJSON = { [demonName: string]: DemonInfo};
type FusionChartJSON = {
    races: string[],
    elements: string[],
    elementFusionTable: number[][],
    raceFusionTable: string[][]
}
type Preset = { caption: string, demons: string[] };
type PresetJSON = { presets: Preset[] };

export class DemonCompendium {
    private demonListJSON: DemonListJSON;
    private fusionChartJSON: FusionChartJSON;
    private presetJSON?: PresetJSON;

    private demonAry: Models.Demon[] = [];
    private raceFusionTable: { [race: string]: { [race: string]: string } } = {}; // Maps 2 races to the race that results from their fusion. Example usage: x["Fairy"]["Genma"] gives you race that results from fusing a Fairy demon with a Genma demon. Special case: when both of the 2 races are the same, the result is a demon's name instead of a race.
    private demonsPresets: Models.DemonsPreset[] = [];

    private idMap: { [demonId: number]: Models.Demon } = {}; // Maps id to a demon model object
    private nameMap: { [demonName: string]: Models.Demon } = {} // Maps name to a demon model object
    private raceLvlDemonMap: { [race: string]: { [lvl: number]: Models.Demon } } = {}; // Maps race-lv a demon with that race and lv. Example usage: x["Fairy"][32] gives you a demon that is a lv32 fairy

    constructor(demonListJSON: DemonListJSON, fusionChartJSON: FusionChartJSON, presetJSON?: PresetJSON) {
        this.demonListJSON = demonListJSON;
        this.fusionChartJSON = fusionChartJSON;
        this.presetJSON = presetJSON;

        this.parseDemons();
        this.prepDemonIds();

        this.parseRaceFusionTable();
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
            return this.fuseDemonSameRaceNoEle(demonA, demonB);
        } else {
            return this.fuseDemonDiffRaceNoEle(demonA, demonB);
        }
    }

    private testGetRandomDemon(): Models.Demon | undefined {
        if (this.demonAry.length === 0) { return undefined };
        const randomDemonIndex: number = Math.floor(Math.random() * this.demonAry.length);
        return this.demonAry[randomDemonIndex];
    }

    private testGetRandomElement(): Models.Demon | undefined {
        if (this.fusionChartJSON.elements.length === 0) {return undefined};
        const randomElementIndex: number = Math.floor(Math.random() * this.fusionChartJSON.elements.length);
        return this.getDemonByName(this.fusionChartJSON.elements[randomElementIndex]);
    }

    private parseDemons(): void {
        for (const demonName in this.demonListJSON) {
            this.demonAry.push(new Models.Demon(
                0,
                demonName,
                this.demonListJSON[demonName].lvl,
                this.demonListJSON[demonName].race
            ));
        }
    }

    private parseRaceFusionTable(): void {
        for (let row: number = 0; row < this.fusionChartJSON.raceFusionTable.length; row++) {
            for (let col: number = 0; col < this.fusionChartJSON.raceFusionTable[row].length; col++) {
                const raceA: string = this.fusionChartJSON.races[row];
                const raceB: string = this.fusionChartJSON.races[col];
                const raceC: string = this.fusionChartJSON.raceFusionTable[row][col];

                // Set the .raceA.raceB property of the parsed fusion table
                if (!this.raceFusionTable[raceA]) {
                    this.raceFusionTable[raceA] = {};
                }
                this.raceFusionTable[raceA][raceB] = raceC;

                // Set the .raceB.raceA property of the parsed fusion table
                if (!this.raceFusionTable[raceB]) {
                    this.raceFusionTable[raceB] = {};
                }
                this.raceFusionTable[raceB][raceA] = raceC;
            }
        }
    }

    private parsePresets(): void {
        if (!this.presetJSON) { return; }
        for (const preset of this.presetJSON.presets) {
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
            demon.rank = this.getLvlTableForRace(demon.race).indexOf(demon.lvl);
        }
    }

    private getLvlTableForRace(race: string): number[] {
        if (!this.raceLvlDemonMap[race]) {
            return [];
        }
        return Object.keys(this.raceLvlDemonMap[race]).map((key) => { return Number(key) });
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
        if (this.raceFusionTable[raceA]) {
            if (this.raceFusionTable[raceA][raceB]) {
                return this.raceFusionTable[raceA][raceB];
            }
        }
        return undefined
    }

    private fuseDemonDiffRaceNoEle(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
        const raceR: string | undefined = this.getFusionResultRace(demonA.race, demonB.race);
        if (!raceR) { return undefined; }
        const lvlTableR: number[] = this.getLvlTableForRace(raceR);
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

    private fuseDemonSameRaceNoEle(demonA: Models.Demon, demonB: Models.Demon): Models.Demon | undefined {
        const elementNameR: string | undefined = this.getFusionResultRace(demonA.race, demonB.race);
        if (!elementNameR) { return undefined; }
        return this.getDemonByName(elementNameR);
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
            return undefined;
        }

        const raceId: number = this.fusionChartJSON.races.indexOf(demon.race);
        if (raceId < 0 || raceId >= this.fusionChartJSON.elementFusionTable.length) {return undefined;}
        const demonRankChange: number = this.fusionChartJSON.elementFusionTable[raceId][element.rank];
        const lvlTable: number[] = this.getLvlTableForRace(demon.race);
        const resultRank: number = demon.rank + demonRankChange;
        if (resultRank < 0 || resultRank >= lvlTable.length) { return undefined };
        return this.getDemonFromRaceLvl(demon.race, lvlTable[resultRank]);
    }
}