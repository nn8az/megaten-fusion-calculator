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

    public toBaseIngredientSearchString(): string {
        let str: string = "";
        if (this.ingredients) {
            for (const ingDemon of this.ingredients) {
                str += ingDemon.toBaseIngredientSearchString();
            }
            return str;
        } else {
            return this.demon.name;
        }
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

export type IngredientDemons = {[demonId: number]: boolean};
export type FusionResults = { [ingredientCount: number]: { [id: string]: FusedDemon[] } };