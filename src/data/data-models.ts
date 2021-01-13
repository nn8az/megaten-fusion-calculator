export class Demon {
    id: number;
    name: string;
    lvl: number;
    race: string;
    rank: number = 0; // rank will be set to 1000 for demons that need unique recipe
    uniqueRecipe: boolean = false;

    constructor(id: number, name: string, lvl: number, race: string) {
        this.id = id;
        this.name = name;
        this.lvl = lvl;
        this.race = race;
    }
}

export class FusedDemon {
    demon: Demon;
    ingredientA?: FusedDemon;
    ingredientB?: FusedDemon;

    constructor(demon: Demon, ingredientA?: FusedDemon, ingredientB?: FusedDemon) {
        this.demon = demon;
        this.ingredientA = ingredientA;
        this.ingredientB = ingredientB;
    }

    public isFused(): boolean {
        return this.ingredientA !== undefined && this.ingredientB !== undefined;
    }

    public toRecipeString(): string {
        let str: string = "";
        const separator: string = " | ";
        if (this.ingredientA && this.ingredientB) {
            const strA: string = this.ingredientA.toRecipeString();
            if (strA) { if (str) {str += separator} str += strA };
            const strB: string = this.ingredientB.toRecipeString();
            if (strB) { if (str) {str += separator} str += strB };
            if (str) {str += separator}
            str += this.ingredientA.demon.name + " + " + this.ingredientB.demon.name + " = " + this.demon.name;
        }
        return str;
    }

    public toBaseIngredientSearchString(): string {
        let str: string = "";
        if (this.ingredientA && this.ingredientB) {
            str += this.ingredientA.toBaseIngredientSearchString();
            str += this.ingredientB.toBaseIngredientSearchString();
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
        if (this.ingredientA && this.ingredientB) {
            let matLvlA: number = this.ingredientA.getHighestIngredientLvl();
            if (matLvlA > lvl) { lvl = matLvlA; }
            let matLvlB: number = this.ingredientB.getHighestIngredientLvl();
            if (matLvlB > lvl) { lvl = matLvlB };
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
export type FusionResults = { [ingredientCount: number]: { [demonName: string]: FusedDemon[] } };