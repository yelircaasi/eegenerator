import type {
    EEGData,
    FormFields,
} from "./types";
import {
    fetchJson,
    getSelectedOptions,
    getSelectedTexts,
    getText,
    joinParts,
} from "./utils";

const data = await fetchJson<EEGData>('/data.json');
const relevantDiagnosisKeys = ["focalDischarges"];
const relevantFindingsKeys = ["photicStimulation", "hyperventilation", "focalSlowing"];
const EDITME_PLACEHOLDER = "____";

function renderText(template: string, replacements = []) {
    let out = template;
    for (const value of replacements) {
        out = out.replace("${EDITME}", value ?? EDITME_PLACEHOLDER);
    }
    return out.replace(/\$\{EDITME\}/g, EDITME_PLACEHOLDER);
}

function makeDescription(fields: FormFields) {
    const meds = fields.medications
        ? `The patient is currently maintained on ${fields.medications}.`
        : `The patient is not currently maintained on antiepileptic medications.`;

    return (
        `This is a 21 channel digital video EEG recording performed on `
        + `${fields.age} y.o. ${fields.sex}. `
        + `(${meds})`
    );
}

function makeBackground() {
    const presets = getSelectedOptions("backgroundPresets");

    const parts = presets.map(k =>
        renderText(data.descriptionBackgroundOptions[k].text)
    );



    function makedescriptionBetaActivity() {
        const presets = getSelectedOptions("betaPresets");

        return presets
            .map(k => renderText(data.descriptionBetaActivityOptions[k].text))
            .join(" ");
    }

    function makeDescriptionSleep() {
        const presets = getSelectedOptions("sleepPresets");

        return presets
            .map(k => renderText(data.descriptionSleepOptions[k].text))
            .join(" ");
    }

    parts.push(getText("backgroundFreeform"));
    parts.push(`\n\n${makedescriptionBetaActivity()}`);
    parts.push(`\n\n${makeDescriptionSleep()}`);

    return joinParts(parts).trim();
}

function makeFindings(fields: FormFields) {
    const presets = getSelectedOptions("findingsPresets");

    function renderFindingsText(key: string) {
        const text = data.findingsOptions[key].text;
        if (key === relevantFindingsKeys[0]) {
            const newText = getSelectedTexts(
                "findingsPhoticStimulationPresets",
                data.findingsSuboptions[relevantFindingsKeys[0]],
            )[0];
            console.log(newText);
            return text.replace("{0}", newText);
        } else if (key === relevantFindingsKeys[1]) {
            const newText = getSelectedTexts(
                "findingsHyperventilationPresets",
                data.findingsSuboptions[relevantFindingsKeys[1]],
            )[0];
            console.log(newText);
            return text.replace("{0}", newText);
        } else if (key === relevantFindingsKeys[2]) {
            const newText = getSelectedTexts(
                "findingsFocalSlowingPresets",
                data.findingsSuboptions[relevantFindingsKeys[2]],
            )[0];
            console.log(newText);
            return text.replace("{0}", newText);
        }
        return text;
    }

    const parts = presets.map(k =>
        renderFindingsText(k)
    );
    parts.push(getText("findingsFreeform"));

    return joinParts(parts);
}

function makeDiagnosis() {
    const presets = getSelectedOptions("diagnosisPresets");

    function renderDiagnosisText(key: string) {
        const text = data.diagnosisOptions[key].text;
        if (relevantDiagnosisKeys.includes(key)) {
            const newText = getSelectedTexts(
                "dischargePresets",
                data.epileptiformDischargeSuboptions,
            )[0];
            console.log(newText);
            return text.replace("{0}", newText);
        }
        return text;
    }

    const parts = presets.map(k =>
        renderDiagnosisText(k)
    );

    parts.push(getText("diagnosisFreeform"));

    return joinParts(parts);
}

function makeInterpretation() {
    const presets = getSelectedOptions("interpretationPresets");

    const parts = presets.map(k =>
        renderText(data.interpretationOptions[k].text)
    );

    parts.push(getText("interpretationFreeform"));

    return joinParts(parts);
}

function writeProse(fields: FormFields) {
    const sections = {
        background: makeBackground(),
        description: makeDescription(fields),
        findings: makeFindings(fields),
        diagnosis: makeDiagnosis(),
        interpretation: makeInterpretation(),
    };
    return sections
}

export {
    data,
    relevantDiagnosisKeys,
    relevantFindingsKeys,
    writeProse,
}
