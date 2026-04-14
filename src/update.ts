import {
    getFields,
    getSelectedOptions,
    getSelectedOptionsFromElement,
    placeholder,
    populateSelected,
    valueIsIn,
} from "./utils";
import type { FormFields } from "./types";
import {
    data,
    relevantDiagnosisKeys,
    relevantFindingsKeys,
    writeProse,
} from "./domain";

var isDischarge = false;

function updatePreview() {
    console.log('UPDATING PREVIEW');
    function f(id: string) {
        const inputEl = document.getElementById(id) as HTMLInputElement;
        return inputEl.value || "";
    }

    const fields: FormFields = getFields();
    const sections = writeProse(fields);

    updateFindingsSuboptionsVisibility();
    updateDischargeVisibility();

    const docContent = document.getElementById("documentContent")!;
    docContent.innerHTML = `
      <h1>${placeholder(fields.title, "EEG Report")}</h1>

      <table style="width: 100%; border-collapse: collapse;" border="0">
        <tr>
            <td style="width: 20%;"><strong>Patient Name:</strong> </td>
            <td style="width: 30%;">${placeholder(fields.patientName)}</td>
            <td style="width: 20%;"><strong>Date:</strong></td>
            <td style="width: 30%;">${placeholder(fields.date)}</td>
        </tr>
        <tr>
            <td><strong>Age:</strong></td>
            <td>${placeholder(fields.age)}</td>
            <td><strong>Sex:</strong></td>
            <td>${placeholder(fields.sex)}</td>
        </tr>
        <tr>
            <td><strong>Neurophysisiologist:</strong></td>
            <td>${placeholder(fields.neuroPhys)}</td>
            <td><strong>Referred by:</strong></td>
            <td>${placeholder(fields.refPhysician)}</td>
        </tr>
        <!-- <tr>
            <td><strong>Neurophysisiologist:</strong></td>
            <td>${placeholder(fields.neuroPhys)}</td>
            <td></td>
            <td></td>
        </tr> -->
        </table>
  
      <h2>DESCRIPTION</h2>
      <p>${placeholder(sections.description, "No description provided.")}</p>

        <h2>BACKGROUND</h2>
      <p>${placeholder(sections.background, "No background provided.")}</p>

      <h2>FINDINGS</h2>
      <p>${placeholder(sections.findings, "No findings provided.")}</p>
  
      <h2>DIAGNOSIS</h2>
      <p>${placeholder(sections.diagnosis, "No diagnosis provided.")}</p>
  
      <h2>CLINICAL INTERPRETATION</h2>
      <p>${placeholder(sections.interpretation, "No diagnosis provided.")}</p>
  
      <h2>REF</h2>
      <p>${placeholder(fields.ref)}</p>
    `;

    document.querySelectorAll('.preview-field').forEach(el => {
        const text = el.textContent;
        const style = (el as HTMLElement).style;
        if (text.startsWith('Enter ') || text.includes('Select ') || text === 'Sender Name' || text === 'Sender Title') {
            el.classList.add('placeholder');
        } else {
            el.classList.remove('placeholder');
            style.background = 'transparent';
            style.color = 'inherit';
            style.animation = 'none';
        }
    });

    docContent.style.opacity = '0.8';
    setTimeout(() => {
        docContent.style.opacity = '1';
    }, 50);
}

function updateDischargeVisibility() {
    console.log("UPDATING DISCHARGE VISIBILITY");
    const id = "dischargePresetsDiv";

    const parent = document.getElementById("diagnosisPresets") as HTMLSelectElement;
    const element = document.getElementById(id)!;
    isDischarge = valueIsIn(parent, relevantDiagnosisKeys);
    element.classList.toggle("hidden", !isDischarge);
    const suboptionNames = getSelectedOptionsFromElement(parent);
    if (suboptionNames.length > 0) {
        console.log(parent);
        console.log(suboptionNames);
        populateSelected("dischargePresets", data.epileptiformDischargeSuboptions);
    }
}

function updateFindingsSuboptionsVisibility() {
    console.log("UPDATING FINDINGS SUBOPTIONS VISIBILITY");

    const suboptionNames = getSelectedOptions("findingsPresets")!;

    function makeVisibleIfSelected(key: string, id: string) {
        const element = document.getElementById(id + "Div")!;
        console.log(element);
        if (suboptionNames.includes(key)) {

            element.classList.toggle("hidden", false);

            console.log(data.findingsSuboptions[key]);
            populateSelected(id, data.findingsSuboptions[key]);
        } else {
            element.classList.toggle("hidden", true);
        }
    }

    makeVisibleIfSelected(relevantFindingsKeys[0], "findingsPhoticStimulationPresets");
    makeVisibleIfSelected(relevantFindingsKeys[1], "findingsHyperventilationPresets");
    makeVisibleIfSelected(relevantFindingsKeys[2], "findingsFocalSlowingPresets");

}

function setSelectionOptions() {
    populateSelected("backgroundPresets", data.descriptionBackgroundOptions);
    populateSelected("betaPresets", data.descriptionBetaActivityOptions);
    populateSelected("sleepPresets", data.descriptionSleepOptions);
    populateSelected("findingsPresets", data.findingsOptions);
    populateSelected("diagnosisPresets", data.diagnosisOptions);
    populateSelected("interpretationPresets", data.interpretationOptions);
}

export {
    setSelectionOptions,
    updateDischargeVisibility,
    updateFindingsSuboptionsVisibility,
    updatePreview,
};
