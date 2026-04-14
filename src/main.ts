export { };

import {
    populateSelected,
    setDate,
} from "./utils";
import { downloadDocument } from "./doc";
import { data } from "./domain";
import { updatePreview } from "./update";

declare global {
    interface Window {
        downloadDocument: typeof downloadDocument;
    }
}

window.downloadDocument = downloadDocument;

document.querySelectorAll('input, select, textarea').forEach(element => {
    element.addEventListener('input', () => {
        updatePreview();
    });
    element.addEventListener('change', () => {
        updatePreview();
    });
    element.addEventListener('keyup', () => {
        updatePreview();
    });
    element.addEventListener('blur', () => {
        updatePreview();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    populateSelected("backgroundPresets", data.descriptionBackgroundOptions);
    populateSelected("betaPresets", data.descriptionBetaActivityOptions);
    populateSelected("sleepPresets", data.descriptionSleepOptions);
    populateSelected("findingsPresets", data.findingsOptions);
    populateSelected("diagnosisPresets", data.diagnosisOptions);
    populateSelected("interpretationPresets", data.interpretationOptions);
});

setDate();
updatePreview();
