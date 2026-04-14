export { };

import { setDate } from "./utils";
import { downloadDocument } from "./doc";
import {
    setSelectionOptions,
    updatePreview,
} from "./update";

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

document.addEventListener("DOMContentLoaded", setSelectionOptions);

setSelectionOptions();
setDate();
updatePreview();
