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

    public isWeakerThanBaseIngredients(): boolean {
        let lvl: number = 0;
        for (const demon of Object.values(this.getBaseIngredientsDemons())) {
            if (demon.lvl > lvl) {
                lvl = demon.lvl
            }
        }
        return this.demon.lvl < lvl;
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
    private metadata: {
        ingredientCountMap: { [demonId: number]: number },
        maxIngredient: number
    };

    constructor(maxIngredient?: number) {
        this.data = {};
        this.metadata = { ingredientCountMap: {}, maxIngredient: 0 };

        if (maxIngredient) {
            this.metadata.maxIngredient = maxIngredient;
            for (let size = 1; size <= maxIngredient; size++) {
                this.data[size] = {};
            }
        }
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

    public addFusedDemonsOfSameSpecies(fusedDemons: FusedDemon[]): void {
        if (fusedDemons.length === 0) { return; }
        let ingCount: number = 0;
        Object.values(fusedDemons[0].getBaseIngredientsCounts()).map(count => ingCount += count);
        const species: Demon = fusedDemons[0].demon;
        if (!this.addNewSpecies(species, ingCount)) { return; }
        for (const fusedDemon of fusedDemons) {
            this.data[ingCount][species.id].push(fusedDemon);
        }
    }

    public updateMetaData(): void {
        this.populateFusionResultsIngCountMap();
    }

    public filter(filterFunc: (demon: FusedDemon) => boolean): void {
        for (const ingCount in this.data) {
            if (Number(ingCount) === 1) { continue; }
            for (const id in this.data[ingCount]) {
                let demonAry: FusedDemon[] = this.data[ingCount][id];
                demonAry = demonAry.filter(filterFunc);
                this.data[ingCount][id] = demonAry;
                if (demonAry.length === 0) {
                    delete this.data[ingCount][id];
                    delete this.metadata.ingredientCountMap[id];
                }
            }
        }
    }

    public getMaxIngredient(): number {
        return this.metadata.maxIngredient;
    }

    private addNewSpecies(species: Demon, ingCount: number): boolean {
        if (ingCount > this.metadata.maxIngredient) { return false; }
        const existingIngCount: number | undefined = this.getIngredientCountForSpecies(species);
        if (existingIngCount !== undefined && existingIngCount < ingCount) { return false; }

        if (!this.data[ingCount][species.id]) {
            this.data[ingCount][species.id] = [];
            this.metadata.ingredientCountMap[species.id] = ingCount;
        }
        return true;
    }

    private getIngredientCountForSpecies(species: Demon): number | undefined {
        return this.metadata.ingredientCountMap[species.id];
    }

    private populateFusionResultsIngCountMap(): void {
        for (const ingCount in this.data) {
            for (const id in this.data[ingCount]) {
                this.metadata.ingredientCountMap[Number(id)] = Number(ingCount);
            }
        }
    }
}

export class Recipe {
    resultId: number;
    ingredients: { [demonId: number]: number } = {};

    constructor(resultId: number) {
        this.resultId = resultId;
    }

    public static clone(recipe: Recipe): Recipe {
        const clonedRecipe = new Recipe(recipe.resultId);
        clonedRecipe.ingredients = {...recipe.ingredients};
        return clonedRecipe;
    }

    public addIngredient(ingredientId: number) {
        this.ingredients[ingredientId] = 0;
    }

    public registerIngredient(ingredientId: number, baseIngredientCost?: number): boolean {
        if (this.ingredients[ingredientId] === undefined) {
            return false;
        }
        if (baseIngredientCost !== undefined && baseIngredientCost > 0) {
            this.ingredients[ingredientId] = baseIngredientCost;
        }
        else {
            this.ingredients[ingredientId] = 1;
        }
        return true;
    }

    public isViable(): boolean {
        for (const ingId in this.ingredients) {
            if (this.ingredients[ingId] === 0) {
                return false;
            }
        }
        return true;
    }

    public totalBaseIngredientsCost(): number {
        let sum: number = 0;
        for (const ingId in this.ingredients) {
            sum += this.ingredients[ingId];
        }
        return sum;
    }
}

export type Ingredients = { [demonId: number]: boolean };
export type IngredientsSettings = { [demonId: number]: { mustUse: boolean, multipleUse: boolean } };
export type MustUseDemonsMap = { [demonId: number]: boolean };
export type SpecialRecipes = { [ingredientCount: number]: Recipe[] };