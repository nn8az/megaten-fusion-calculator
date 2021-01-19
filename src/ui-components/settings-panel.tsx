import React, { useState } from 'react';

import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import styles from './scss/settings-panel.module.scss';

export class Settings {
    charLvl: number = 99;
    maxIngredient: number = 3;
    useTripleFusion: boolean = false;

    useTripleFusionSettingIsVisible: boolean = false;
}

export default function SettingsPanel(params: { visible: boolean, settings: Settings }) : JSX.Element {
    const {visible, settings } = params;
    const [charLvlFieldValue, setCharLvlFieldValue] = useState<number | string>(settings.charLvl);
    const [maxIngFieldValue, setMaxIngFieldValue] = useState<number | string>(settings.maxIngredient);

    function onSetCharLvl(newValue: number): void {
        settings.charLvl = newValue;
    }

    function onSetMaxIng(newValue: number): void {
        settings.maxIngredient = newValue;
    }

    function onSetUseTripleFusion(newValue: boolean): void {
        settings.useTripleFusion = newValue;
    }

    const settingsPanelStyle: React.CSSProperties = {};
    if (!visible) { settingsPanelStyle.display = "none"; }
    return <div style={settingsPanelStyle} className={styles.settingsPanel}>
        <h2>Settings</h2>
        <NumberSettings
            label="Character level"
            min={1}
            max={99}
            emptyFieldValue={99}
            fieldStateValueAndSetter={[charLvlFieldValue, setCharLvlFieldValue]}
            onSetSettings={onSetCharLvl} />
        <NumberSettings
            label="Max ingredients per recipe"
            min={2}
            max={5}
            emptyFieldValue={3}
            fieldStateValueAndSetter={[maxIngFieldValue, setMaxIngFieldValue]}
            onSetSettings={onSetMaxIng} />
        {settings.useTripleFusionSettingIsVisible ?
            <CheckboxSettings
                label="Allow triple fusion"
                checked={settings.useTripleFusion}
                onSetSettings={onSetUseTripleFusion}
            /> : undefined}
    </div>
}

type NumberSettingsProp = {
    label: string,
    fieldStateValueAndSetter: [number | string, React.Dispatch<React.SetStateAction<number | string>>],
    onSetSettings: (newValue: number) => void,
    min: number,
    max: number,
    emptyFieldValue: number
}
function NumberSettings(params: NumberSettingsProp): JSX.Element {
    const {label, fieldStateValueAndSetter: stateValueAndSetter, onSetSettings, min, max, emptyFieldValue} = params;
    const [stateValue, stateSetter] = stateValueAndSetter;

    function onNumberFieldChange(event: React.ChangeEvent<HTMLInputElement>) {
        let value: number | string = event.target.value;
        if (value === "") {
            stateSetter("");
            onSetSettings(emptyFieldValue);
            return;
        }
        const valueAsNumber = Number(value);
        if (valueAsNumber >= min && valueAsNumber <= max) {
            stateSetter(valueAsNumber);
            onSetSettings(valueAsNumber);
        }
    }
    return <div className={`${styles.settingsLine} ${styles.numberSettings}`}>
        <span className={styles.numberFieldLabel}>{label}</span>
        <TextField
            style={{ width: "50px" }}
            type="number"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: min, max: max, step: 1 }}
            variant="outlined"
            value={stateValue}
            onChange={onNumberFieldChange}
        />
    </div>;
}

type CheckboxSettingsProps = {
    label: string,
    checked: boolean,
    onSetSettings: (newValue: boolean) => void
}
function CheckboxSettings(params: CheckboxSettingsProps): JSX.Element {
    const {label, checked, onSetSettings} = params;

    function onCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
        onSetSettings(event.target.checked);
    }

    return <div className={`${styles.settingsLine}`}>
        <FormControlLabel
            control={
                <Checkbox
                    defaultChecked={checked}
                    onChange={onCheckboxChange}
                    color="default"
                />}
            label={label} />
    </div>;
}