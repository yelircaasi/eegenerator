import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    AlignmentType,
    WidthType,
    UnderlineType,
    TableLayoutType,
} from "https://cdn.jsdelivr.net/npm/docx@9.5.1/+esm";

const relevantDiagnosisKeys = ["focalDischarges"];
const relevantFindingsKeys = ["photicStimulation", "hyperventilation", "focalSlowing"];

const FontSize = {
    TITLE: 22,
    HEADER: 18,
    TEXT: 16,
    TABLE: 15,
    SECTION_TITLE: 17,
};

const EDITME = "______"

var isDischarge = false;
// HELPER FUNCTIONS ===============================================================================

function fallback(id, defaultValue) {
    return document.getElementById(id)?.value || defaultValue
}

function getFields() {
    return {
        title: fallback("reportTitle") || "EEG Report",
        patientName: fallback("patientName", "Peter Peterson"),
        date: fallback("date"),
        age: fallback("age", "101"),
        sex: fallback("sex"),
        neuroPhys: fallback("neuroPhys", "Aleksandra Aleksandrovna"),
        refPhysician: fallback("refPhysician", "Hakim Hakimi"),
        diagnosis: fallback("diagnosis"),
        medications: fallback("medications"),
        description: fallback("description"),
        background: fallback("background"),
        findings: fallback("findings"),
        diagnosisFreeform: fallback("diagnosisFreeform"),
        clinicalInterp: fallback("clinicalInterp"),
        ref: fallback("ref"),
        // unit: f("unit"),
        // caseNum: f("caseNum"),
        // eegNum: f("eegNum"),
    };
}

const placeholder = (text, fallback = "—") =>
    text && text.trim() ? `<span style="white-space: pre-wrap;">${text}<\span>` : `<span class="placeholder">${fallback}</span>`;

const makeParagraph = (text, opts = {}) =>
    new Paragraph({ children: [new TextRun({ text, ...opts })] });

const fullWidth = 9600; // Usable width (12240 - 2*1440)
const quarterWidth = fullWidth / 4;
const makeSectionTitle = (text) =>
    new Paragraph({
        // heading: HeadingLevel.HEADING_2,
        size: FontSize.SECTION_TITLE,
        spacing: { before: 400, after: 400 },
        children: [
            new TextRun({
                text,
                bold: true,
                color: "000000",
                size: FontSize.TEXT,
                underline: { type: UnderlineType.SINGLE },
            }),
        ],
    });

const makeCell = (text, isBold = false) =>
    new TableCell({
        children: [
            new Paragraph({
                children: [
                    new TextRun({ text, bold: isBold, size: FontSize.TABLE }),
                ],
            }),
        ],
        width: {
            size: quarterWidth, // this is 100% (NOT multiplied!)
            type: WidthType.DXA,
        },
    });

// PARAGRAPH CREATION ============================================================================

const descriptionBackgroundOptions = fetch("descriptionBackgroundOptions.json");
const descriptionBetaActivityOptions = fetch("descriptionBetaActivityOptions.json");
const descriptionSleepOptions = fetch("descriptionSleepOptions.json");
const findingsSuboptions = fetch("findingsSuboptions.json");
const findingsOptions = fetch("findingsOptions.json");
const diagnosisOptions = fetch("diagnosisOptions.json");
const epileptiformDischargeSuboptions = fetch("epileptiformDischargeSuboptions.json");
const interpretationOptions = fetch("interpretationOptions.json");

// NEW MINI-FRAMEWORK =========================================================
const EDITME_PLACEHOLDER = "____";

function renderText(template, replacements = []) {
    let out = template;
    // console.log("TEMPLATE:", template);
    for (const value of replacements) {
        out = out.replace("${EDITME}", value ?? EDITME_PLACEHOLDER);
    }
    return out.replace(/\$\{EDITME\}/g, EDITME_PLACEHOLDER);
}

function selectedOptions(selectEl) {
    return Boolean(selectEl) ? Array.from(selectEl.selectedOptions).map(o => o.value) : [];
}

function selectedTexts(selectEl, optionsByKey) {
    if (!selectEl) return [];

    return Array.from(selectEl.selectedOptions)
        .map(o => optionsByKey[o.value]?.text)
        .filter(Boolean);
}

function populateSelected(selectId, options) {

    const select = document.getElementById(selectId);
    if (select.options.length === 0) {
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

function getText(id) {
    return `${document.getElementById(id).value || ""}`;
}
function joinParts(stringArray) {
    return stringArray.filter(s => s !== "").join(" ");
}

function makeDescription(fields) {
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
    const presets = selectedOptions(
        document.getElementById("backgroundPresets")
    );

    const parts = presets.map(k =>
        renderText(descriptionBackgroundOptions[k].text)
    );

    // const backgroundFreeform = document.getElementById("backgroundFreeform");
    // if (backgroundFreeform) {
    //     parts.push(backgroundFreeform);
    // }


    function makedescriptionBetaActivity() {
        const presets = selectedOptions(
            document.getElementById("betaPresets")
        );

        return presets
            .map(k => renderText(descriptionBetaActivityOptions[k].text))
            .join(" ");
    }

    function makeDescriptionSleep() {
        const presets = selectedOptions(
            document.getElementById("sleepPresets")
        );

        return presets
            .map(k => renderText(descriptionSleepOptions[k].text))
            .join(" ");
    }

    parts.push(getText("backgroundFreeform"));
    parts.push(`\n\n${makedescriptionBetaActivity()}`);
    parts.push(`\n\n${makeDescriptionSleep()}`);

    return joinParts(parts).trim();
}

function makeFindings(fields) {
    const presets = selectedOptions(
        document.getElementById("findingsPresets")
    );

    function renderFindingsText(key) {
        const text = findingsOptions[key].text;
        if (key === relevantFindingsKeys[0]) {
            const newText = selectedTexts(
                document.getElementById("findingsPhoticStimulationPresets"),
                findingsSuboptions[relevantFindingsKeys[0]],
            )[0];
            console.log(newText);
            return text.replace("{0}", newText);
        } else if (key === relevantFindingsKeys[1]) {
            const newText = selectedTexts(
                document.getElementById("findingsHyperventilationPresets"),
                findingsSuboptions[relevantFindingsKeys[1]],
            )[0];
            console.log(newText);
            return text.replace("{0}", newText);
        } else if (key === relevantFindingsKeys[2]) {
            const newText = selectedTexts(
                document.getElementById("findingsFocalSlowingPresets"),
                findingsSuboptions[relevantFindingsKeys[2]],
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

function makeDiagnosis(fields) {
    const presets = selectedOptions(
        document.getElementById("diagnosisPresets")
    );

    function renderDiagnosisText(key) {
        const text = diagnosisOptions[key].text;
        if (relevantDiagnosisKeys.includes(key)) {
            const newText = selectedTexts(document.getElementById("dischargePresets"), epileptiformDischargeSuboptions)[0];
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

function makeInterpretation(fields) {
    const presets = selectedOptions(
        document.getElementById("interpretationPresets")
    );

    const parts = presets.map(k =>
        renderText(interpretationOptions[k].text)
    );

    parts.push(getText("interpretationFreeform"));

    return joinParts(parts);
}


// ============================================================================


function writeProse(fields,) {
    // console.log("EXECUTING writeProse");
    const sections = {
        // descriptionIntro: makeDescriptionIntro(fields),
        // descriptionBackground: makeDescriptionBackground(fields),
        // descriptionBetaActivity: makedescriptionBetaActivity(fields),
        // descriptionSleep: makeDescriptionSleep(fields),
        background: makeBackground(),
        description: makeDescription(fields),
        findings: makeFindings(fields),
        diagnosis: makeDiagnosis(fields),
        interpretation: makeInterpretation(fields),
    };
    // console.log(sections);
    return sections
}

// CORE FUNCTIONS ============================================================================

function updatePreview() {
    console.log('UPDATING PREVIEW');
    const f = id => document.getElementById(id)?.value || "";

    const fields = getFields();
    const sections = writeProse(fields);

    updateFindingsSuboptionsVisibility();
    updateDischargeVisibility();

    const docContent = document.getElementById("documentContent");
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
        if (text.startsWith('Enter ') || text.includes('Select ') || text === 'Sender Name' || text === 'Sender Title') {
            el.classList.add('placeholder');
        } else {
            el.classList.remove('placeholder');
            el.style.background = 'transparent';
            el.style.color = 'inherit';
            el.style.animation = 'none';
        }
    });

    docContent.style.opacity = '0.8';
    setTimeout(() => {
        docContent.style.opacity = '1';
    }, 50);
}

window.downloadDocument = async function () {

    const fields = getFields();
    const sections = writeProse(fields);

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    children: [new TextRun({ text: fields.title, bold: true, size: FontSize.TITLE })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                new Table({
                    rows: [
                        new TableRow({
                            children: [
                                makeCell("Patient Name:", true),
                                makeCell(fields.patientName),
                                makeCell("Date:", true),
                                makeCell(fields.date),
                            ],
                        }),
                        new TableRow({
                            children: [
                                makeCell("Age:", true),
                                makeCell(fields.age),
                                makeCell("Sex:", true),
                                makeCell(fields.sex),
                            ],
                        }),
                        new TableRow({
                            children: [
                                makeCell("Medications:", true),
                                makeCell(fields.neuroPhys),
                                makeCell("Referred by:", true),
                                makeCell(fields.refPhysician),
                            ],
                        }),
                        // new TableRow({
                        //     children: [
                        //         makeCell("Diagnosis:", true),
                        //         makeCell(fields.diagnosis),
                        //         makeCell("Medications", true),
                        //         makeCell(fields.medications),
                        //     ],
                        // }),
                    ],
                    width: {
                        size: fullWidth,
                        type: WidthType.DXA,
                    },
                    layout: TableLayoutType.FIXED,
                    borders: {
                        top: { style: "none", size: 0, color: "FFFFFF" },
                        bottom: { style: "none", size: 0, color: "FFFFFF" },
                        left: { style: "none", size: 0, color: "FFFFFF" },
                        right: { style: "none", size: 0, color: "FFFFFF" },
                        insideHorizontal: { style: "none", size: 0, color: "FFFFFF" },
                        insideVertical: { style: "none", size: 0, color: "FFFFFF" },
                    },

                }),

                makeSectionTitle("DESCRIPTION"),
                makeParagraph(sections.description),

                makeSectionTitle("BACKGROUND"),
                makeParagraph(sections.background),

                makeSectionTitle("FINDINGS"),
                makeParagraph(sections.findings),

                makeSectionTitle("DIAGNOSIS"),
                makeParagraph(sections.diagnosis), ,

                makeSectionTitle("CLINICAL INTERPRETATION"),
                makeParagraph(sections.interpretation),

                makeSectionTitle("REF"),
                makeParagraph(fields.ref),
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    const filename = `EEG_Report_${Date.now()}.docx`;
    saveAs(blob, filename);

    const btn = document.querySelector(".download-btn");
    const orig = btn.textContent;
    btn.textContent = "✅ Downloaded!";
    btn.style.background = "linear-gradient(135deg, #27ae60, #2ecc71)";
    setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
    }, 2000);
};

function replaceSuboption(str, old, newId) {
    const newText = selectedOptions(document.getElementById(id))[0];
    return str.replace(old, newText);
}

// SUBOPTIONS WITH CONDITIONAL VISIBILITY =======

// function getNumbers(obj, id) {
//     console.log(selectedOptions(
//         document.getElementById(id)
//     ));
//     return selectedOptions(
//         document.getElementById(id)
//     ).map(k =>
//         obj[k].number
//     );
// }

function valueIsIn(element, relevant) {
    const actual = selectedOptions(element);
    console.log("ACTUAL", actual);
    return relevant.some(e => actual.includes(e));
    el.classList.toggle("hidden", !isContained);
}

function updateDischargeVisibility() {
    console.log("UPDATING DISCHARGE VISIBILITY");
    const id = "dischargePresetsDiv";

    const parent = document.getElementById("diagnosisPresets");
    const element = document.getElementById(id);
    isDischarge = valueIsIn(parent, relevantDiagnosisKeys);
    element.classList.toggle("hidden", !isDischarge);
    const suboptionNames = selectedOptions(parent);
    if (suboptionNames.length > 0) {
        console.log(parent);
        console.log(suboptionNames);
        populateSelected("dischargePresets", epileptiformDischargeSuboptions);
    }
    // populateSelected("dischargePresets", epileptiformDischargeSuboptions);
}

function updateFindingsSuboptionsVisibility() {
    console.log("UPDATING FINDINGS SUBOPTIONS VISIBILITY");

    const parent = document.getElementById("findingsPresets");

    const suboptionNames = selectedOptions(parent);

    function makeVisibleIfSelected(key, id) {
        const element = document.getElementById(id + "Div");
        console.log(element);
        if (suboptionNames.includes(key)) {

            element.classList.toggle("hidden", false);

            console.log(findingsSuboptions[key]);
            populateSelected(id, findingsSuboptions[key]);
        } else {
            element.classList.toggle("hidden", true);
        }
    }

    makeVisibleIfSelected(relevantFindingsKeys[0], "findingsPhoticStimulationPresets");
    makeVisibleIfSelected(relevantFindingsKeys[1], "findingsHyperventilationPresets");
    makeVisibleIfSelected(relevantFindingsKeys[2], "findingsFocalSlowingPresets");

}


// PAGE SETUP =====================================================================================

// document.getElementById("diagnosisPresets").addEventListener("change", () => {
//     const preset = document.getElementById("diagnosisPresets").value;
//     if (preset) document.getElementById("diagnosisFreeform").value = preset;
// });

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
    populateSelected("backgroundPresets", descriptionBackgroundOptions);
    populateSelected("betaPresets", descriptionBetaActivityOptions);
    populateSelected("sleepPresets", descriptionSleepOptions);
    populateSelected("findingsPresets", findingsOptions);
    populateSelected("diagnosisPresets", diagnosisOptions);
    populateSelected("interpretationPresets", interpretationOptions);
});

document.getElementById("date").value =
    new Date().toISOString().split("T")[0];

updatePreview();
