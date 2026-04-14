import type { OptionsMap } from "./types";

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

function getSelectedTexts(id: string, optionsByKey: OptionsMap) {
    const selectEl = document.getElementById(id) as HTMLSelectElement;
    if (!selectEl) return [];

    return Array.from(selectEl.selectedOptions)
        .map(o => optionsByKey[o.value]?.text)
        .filter(Boolean);
}

function populateSelected(selectId: string, options: OptionsMap) {
    const select = document.getElementById(selectId) as HTMLSelectElement;
    
    console.log(`Populating ${selectId}:`, {
        exists: !!select,
        optionsLength: select?.options.length,
        willPopulate: select?.options.length === 0
    });
    
    if (select.options.length === 0) {
        console.log(`✓ Populating ${selectId} with ${Object.keys(options).length} options`);
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
            select.size = select.options.length;
            console.log(`✓ Set size to ${select.size}`);
        } catch (error) {
            console.error(`Failed to set size:`, error);
        }
    } else {
        console.log(`✗ Skipping ${selectId} - already has ${select.options.length} options`);
    }
}

function getText(id: string) {
    return `${(document.getElementById(id) as HTMLTextAreaElement).value || ""}`;
}

function joinParts(stringArray: string[]) {
    return stringArray.filter(s => s !== "").join(" ");
}

function getFields() {
    const fields = {
        title: getElementValue("reportTitle", "EEG Report"),
        patientName: getElementValue("patientName", "Peter Peterson"),
        date: getElementValue("date"),
        age: getElementValue("age", "101"),
        sex: getElementValue("sex"),
        neuroPhys: getElementValue("neuroPhys", "Aleksandra Aleksandrovna"),
        refPhysician: getElementValue("refPhysician", "Hakim Hakimi"),
        diagnosis: getElementValue("diagnosis", "DEATH"),
        medications: getElementValue("medications", "FENTANYL AND VODKA"),
        description: getElementValue("description", "DESCRIPTION"),
        background: getElementValue("background", "NO BACKGROUND"),
        findings: getElementValue("findings", "NOTHING FOUND"),
        diagnosisFreeform: getElementValue("diagnosisFreeform", "DEATH AND MORE DEATH"),
        clinicalInterp: getElementValue("clinicalInterp", "NO IDEA"),
        ref: getElementValue("ref", "WTF IS REF")
    };
    console.log(fields);
    return fields
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
    setDate,
    valueIsIn,
}
