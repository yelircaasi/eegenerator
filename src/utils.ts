import type { Responses } from "./types";

async function loadBundle(bundle: string) {
    const mod = await import(bundle);
    return mod;
}

function getElementValue(id: string, defaultValue: string = ""): string {
    const element = document.getElementById(id);
    if (element && "value" in element) {
        const value = (element as any).value;
        return typeof value === "string" ? value : defaultValue;
    }
    return defaultValue;
}

function getSelectedOptionsFromElement(selectEl: HTMLSelectElement) {
    return Boolean(selectEl) ? Array.from(selectEl.selectedOptions).map(o => o.value) : [];

}

function getSelectedOptions(id: string) {
    const selectEl = document.getElementById(id) as HTMLSelectElement;
    return getSelectedOptionsFromElement(selectEl)
}

function getSelectedTexts(id: string, optionsByKey: Responses) {
    const selectEl = document.getElementById(id) as HTMLSelectElement;
    if (!selectEl) return [];

    return Array.from(selectEl.selectedOptions)
        .map(o => optionsByKey[o.value]?.text)
        .filter(Boolean);
}

function populateSelected(selectId: string, options: Responses) {

    const select = document.getElementById(selectId) as HTMLSelectElement;
    if (select?.options.length === 0) {
        select.innerHTML = "";

        Object.entries(options)
            .sort((a, b) => a[1].number - b[1].number)
            .forEach(([key, opt]) => {
                const o = document.createElement("option");
                o.value = key;
                o.textContent = opt.short ?? key;
                select.appendChild(o);
            });
        try {
            console.log(selectId);
            select.size = select.options.length;
        } catch { };
    }
}

function getText(id: string) {
    return `${(document.getElementById(id) as HTMLTextAreaElement).value || ""}`;
}

function joinParts(stringArray: string[]) {
    return stringArray.filter(s => s !== "").join(" ");
}

function getFields() {
    return {
        title: getElementValue("reportTitle") || "EEG Report",
        patientName: getElementValue("patientName", "Peter Peterson"),
        date: getElementValue("date"),
        age: getElementValue("age", "101"),
        sex: getElementValue("sex"),
        neuroPhys: getElementValue("neuroPhys", "Aleksandra Aleksandrovna"),
        refPhysician: getElementValue("refPhysician", "Hakim Hakimi"),
        diagnosis: getElementValue("diagnosis"),
        medications: getElementValue("medications"),
        description: getElementValue("description"),
        background: getElementValue("background"),
        findings: getElementValue("findings"),
        diagnosisFreeform: getElementValue("diagnosisFreeform"),
        clinicalInterp: getElementValue("clinicalInterp"),
        ref: getElementValue("ref"),
    };
}

const placeholder = (text: string, fallback: string = "—") =>
    text && text.trim() ? `<span style="white-space: pre-wrap;">${text}<\span>` : `<span class="placeholder">${fallback}</span>`;

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
}

function valueIsIn(element: HTMLSelectElement, relevant: string[]) {
    const actual = getSelectedOptionsFromElement(element);
    console.log("ACTUAL", actual);
    const isContained = relevant.some(e => actual.includes(e))
    // TODO - examine: el.classList.toggle("hidden", !isContained);
    return isContained;
}

function setDate() {
    (document.getElementById("date") as HTMLInputElement).value =
        new Date().toISOString().split("T")[0];
}

export {
    loadBundle,
    fetchJson,
    getElementValue,
    getFields,
    getSelectedOptions,
    getSelectedOptionsFromElement,
    getSelectedTexts,
    getText,
    joinParts,
    placeholder,
    populateSelected,
    valueIsIn,
    setDate,
}
