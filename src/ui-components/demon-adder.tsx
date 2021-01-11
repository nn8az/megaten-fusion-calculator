import React, { KeyboardEvent, useState } from 'react';

import * as Models from '../data/data-models';
import { DemonCompendium } from '../data/demon-compendium';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Autocomplete from '@material-ui/lab/Autocomplete';

import AddIcon from '@material-ui/icons/Add';
import styles from './ui-components.module.scss';

export default function DemonAdder(params: {
    demonCompendium: DemonCompendium,
    onAddDemon: (demon: Models.Demon[]) => void
}): JSX.Element {
    const { demonCompendium, onAddDemon } = params;
    return <div className={styles.demonAdderContainer}>
        <h3>Add by searching</h3>
        <AddByDemon demonCompendium={demonCompendium} onAddDemon={onAddDemon} />
        <h3>Add by using level range</h3>
        <AddByLevelRange demonCompendium={demonCompendium} onAddDemon={onAddDemon} />
        <h3>Add from presets</h3>
        <AddByPreset demonCompendium={demonCompendium} onAddDemon={onAddDemon} />
    </div>
}

function AddByDemon(params: {
    demonCompendium: DemonCompendium,
    onAddDemon: (demon: Models.Demon[]) => void
}): JSX.Element {
    const { demonCompendium, onAddDemon } = params;
    let [selectedDemon, setSelectedDemon] = useState<Models.Demon | null>(null);
    let searchOptions: Models.Demon[] = demonCompendium.getDemonArray();

    const onSearchBarSelectionChange: any = (event: React.ChangeEvent<HTMLInputElement>, selection: Models.Demon) => {
        setSelectedDemon(selection);
    };

    function onAddButtonClick() {
        raiseOnAddDemonEvent();
    }

    function onKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Enter") {
            raiseOnAddDemonEvent();
        }
    }

    function raiseOnAddDemonEvent() {
        if (selectedDemon) {
            onAddDemon([selectedDemon]);
            setSelectedDemon(null);
        }
    }

    return (<div className={styles.subAdderContainer}>
        <Autocomplete
            id="demon-search-bar"
            value={selectedDemon}
            options={searchOptions}
            onChange={onSearchBarSelectionChange}
            onKeyPress={onKeyPress}
            getOptionLabel={(option) => option.name}
            getOptionSelected={(option, value) => { return option.id === value.id }}
            style={{ width: 300 }}
            autoHighlight={true}
            autoSelect={true}
            renderInput={(params) => <TextField {...params} label="Enter demon name" variant="outlined" />}
        />
        <AddButton onClick={onAddButtonClick} />
    </div>
    );
}

function AddByLevelRange(params: {
    demonCompendium: DemonCompendium,
    onAddDemon: (demon: Models.Demon[]) => void
}): JSX.Element {
    const { demonCompendium, onAddDemon } = params;

    const [minLvl, setMinLvl] = useState<number>(1);
    const [maxLvl, setMaxLvl] = useState<number>(99);

    function onAddButtonClick(): void {
        const demons: Models.Demon[] = [];
        for (const demon of demonCompendium.getDemonArray()) {
            if (demon.lvl >= minLvl && demon.lvl <= maxLvl) {
                demons.push(demon);
            }
        }
        onAddDemon(demons);
    }

    function onKeyPress(event: KeyboardEvent<HTMLDivElement>): void {
        const {key} = event;
        if (key === "-" || key === "+" || key === ".") {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    function onChange(valueSetterFunc: Function, event: React.ChangeEvent<HTMLInputElement>): void {
        const value: number | string = event.target.value;
        const valueAsNumber = Number(value)
        if (value === "" || (valueAsNumber >= 1 && valueAsNumber <= 99)) {
            valueSetterFunc(event.target.value);
        }
    }

    return (
        <div className={styles.subAdderContainer}>
            <div className={styles.lvlFieldsContainer}>
                <TextField
                    label="Min Lv"
                    style={{ width: "147px" }}
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="outlined"
                    value={minLvl}
                    onChange={onChange.bind(undefined, setMinLvl)}
                    onKeyPress={onKeyPress}
                />
                <TextField
                    label="Max Lv"
                    style={{ width: "147px" }}
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="outlined"
                    value={maxLvl}
                    onKeyPress={onKeyPress}
                    onChange={onChange.bind(undefined, setMaxLvl)}
                />
            </div>
            <AddButton onClick={onAddButtonClick} />
        </div>
    );
}

function AddByPreset(params: {
    demonCompendium: DemonCompendium,
    onAddDemon: (demon: Models.Demon[]) => void
}): JSX.Element {
    const { demonCompendium, onAddDemon } = params;

    type searchOption = { id: number, preset: Models.DemonsPreset };

    let [selectedOption, setSelectedOption] = useState<searchOption | null>(null);

    let searchOptions: searchOption[] = [];
    let id: number = 1;
    for (const preset of demonCompendium.getDemonPresets()) {
        searchOptions.push({ id: id, preset: preset });
        id++;
    }

    const onSearchBarSelectionChange: any = (event: React.ChangeEvent<HTMLInputElement>, selection: searchOption) => {
        setSelectedOption(selection);
    };

    function onAddButtonClick() {
        raiseOnAddDemonEvent();
    }

    function onKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Enter") {
            raiseOnAddDemonEvent();
        }
    }

    function raiseOnAddDemonEvent() {
        if (selectedOption) {
            onAddDemon(selectedOption.preset.demons);
            setSelectedOption(null);
        }
    }

    return (<div className={styles.subAdderContainer}>
        <Autocomplete
            id="demon-search-bar"
            value={selectedOption}
            options={searchOptions}
            onChange={onSearchBarSelectionChange}
            onKeyPress={onKeyPress}
            getOptionLabel={(option) => option.preset.caption}
            getOptionSelected={(option, value) => { return option.id === value.id }}
            style={{ width: 300 }}
            autoHighlight={true}
            autoSelect={true}
            renderInput={(params) => <TextField {...params} label="Select a preset" variant="outlined" />}
        />
        <AddButton onClick={onAddButtonClick} />
    </div>
    );
}

function AddButton(params: {onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void}): JSX.Element {
    const {onClick} = params;
    return <Button variant="outlined" onClick={onClick} className={styles.addDemonButton}><AddIcon />Add</Button>;
}