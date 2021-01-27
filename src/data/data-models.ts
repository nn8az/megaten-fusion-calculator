export class Demon {
    id: number = 0;
    name: string;
    lvl: number;
    race: string;
    rank: number = 0;
    specialRecipe: boolean = false;
    stats: number[] = [];
    static statsName: string[] = [];

    constructor(id: number, name: string, lvl: number, race: string, stats: number[]) {
        this.id = id;
        this.name = name;
        this.lvl = lvl;
        this.race = race;
        this.stats = stats;
    }
}

export class FusedDemon {
    demon: Demon;
    ingredients?: FusedDemon[];

    constructor(demon: Demon, ingredients?: FusedDemon[]) {
        this.demon = demon;
        this.ingredients = ingredients;
    }

    public isFused(): boolean {
        if (!this.ingredients) { return false; }
        return this.ingredients.length > 0;
    }

    public getBaseIngredients(): { [id: number]: Demon } {
        if (this.ingredients) {
            let ret: { [id: number]: Demon } = {};
            for (const ingDemon of this.ingredients) {
                ret = {...ret, ...ingDemon.getBaseIngredients()};
            }
            return ret;
        } else {
            const ret: { [id: number]: Demon } = {};
            ret[this.demon.id] = this.demon;
            return ret;
        }
    }

    public getBaseIngredientsCounts(): { [id: number]: number } {
        if (this.ingredients) {
            let ret: { [id: number]: number } = {};
            for (const parentDemon of this.ingredients) {
                const parentIngCount = parentDemon.getBaseIngredientsCounts();
                for (const baseDemonId in parentIngCount) {
                    ret[baseDemonId] = (ret[baseDemonId] || 0) + parentIngCount[baseDemonId];
                }
            }
            return ret;
        } else {
            const ret: { [id: number]: number } = {};
            ret[this.demon.id] = 1;
            return ret;
        }
    }

    public toBaseIngredientsIdCode(): string {
        return Object.keys(this.getBaseIngredients()).join("-");
    }

    public toBaseIngredientSearchString(): string {
        return Object.values(this.getBaseIngredients()).map(demon => demon.name).join(" ");
    }

    public isWeakerThanIngredients(): boolean {
        return this.demon.lvl < this.getHighestIngredientLvl();
    }

    private getHighestIngredientLvl(): number {
        let lvl: number = 0;
        if (this.ingredients) {
            for (const ingDemon of this.ingredients) {
                let highestIngLvl: number = ingDemon.getHighestIngredientLvl();
                if (highestIngLvl > lvl) { lvl = highestIngLvl; }
            }
            return lvl;
        } else {
            return this.demon.lvl;
        }
    }
}

export class DemonsPreset {
    caption: string = "";
    demons: Demon[] = [];

    constructor(caption: string, demons: Demon[]) {
        this.caption = caption;
        this.demons = demons;
    }
}

export class FusionResults {
    data: { [ingredientCount: number]: { [demonId: number]: FusedDemon[] } };
    metadata: {
        ingredientCountMap: { [demonId: number]: number }
    };

    constructor() {
        this.data = {};
        this.metadata = { ingredientCountMap: {} };
    }

    public updateMetaData(): void {
        this.populateFusionResultsIngCountMap();
    }

    public getIngredientCount(demonId: number): number | undefined {
        return this.metadata.ingredientCountMap[demonId];
    }

    public hasFusionResult(): boolean {
        let hasFusionResult = false;
        for (const ingCount in this.data) {
            if (Number(ingCount) === 1) { continue; }
            if (Object.keys(this.data[ingCount]).length > 0) { 
                hasFusionResult = true;
                break; }
        }
        return hasFusionResult;
    }

    private populateFusionResultsIngCountMap(): void {
        for (const ingCount in this.data) {
            for (const id in this.data[ingCount]) {
                this.metadata.ingredientCountMap[Number(id)] = Number(ingCount);
            }
        }
    }
}

export type Ingredients = { [demonId: number]: boolean };
export type IngredientsSettings = { [demonId: number]: { mustUse: boolean, multipleUse: boolean } };
export type MustUseDemonsMap = {[demonId: number]: boolean};