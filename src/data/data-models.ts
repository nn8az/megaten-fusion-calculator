export class Demon {
    id: number = 0;
    name: string;
    lvl: number;
    race: string;
    specialRecipe: boolean = false;
    stats: number[] = [];
    rank?: number;

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
    private baseIngredientsMetadata: { [baseIngId: number]: { count: number, demon: Demon} } = {};

    constructor(demon: Demon, ingredients?: FusedDemon[]) {
        this.demon = demon;
        this.ingredients = ingredients;

        if (!ingredients) {
            this.baseIngredientsMetadata[demon.id] = { count: 1, demon: demon};
        } else {
            for (const fusedDemon of ingredients) {
                const baseIngsMetadata = fusedDemon.getBaseIngredientsInfo()
                for (const baseIngId in baseIngsMetadata) {
                    this.baseIngredientsMetadata[baseIngId] = this.baseIngredientsMetadata[baseIngId] || {};
                    this.baseIngredientsMetadata[baseIngId].count =  (this.baseIngredientsMetadata[baseIngId].count || 0 ) + 
                        baseIngsMetadata[baseIngId].count;
                    this.baseIngredientsMetadata[baseIngId].demon = baseIngsMetadata[baseIngId].demon;
                };
            }
        }
    }

    public isFused(): boolean {
        if (!this.ingredients) { return false; }
        return this.ingredients.length > 0;
    }

    public getBaseIngredientsInfo(): { [id: number]: { count: number, demon: Demon } } {
        return this.baseIngredientsMetadata;
    }

    public getBaseIngredientsDemons(): { [id: number]: Demon } {
        let ret: { [id: number]: Demon } = {};
        for (const ingId in this.baseIngredientsMetadata) {
            ret[ingId] = this.baseIngredientsMetadata[ingId].demon;
        }
        return ret;
    }

    public getBaseIngredientsCounts(): { [id: number]: number } {
        let ret: { [id: number]: number } = {};
        for (const ingId in this.baseIngredientsMetadata) {
            ret[ingId] = this.baseIngredientsMetadata[ingId].count;
        }
        return ret;
    }

    public toBaseIngredientSearchString(): string {
        return Object.values(this.getBaseIngredientsDemons()).map(demon => demon.name).join(" ");
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