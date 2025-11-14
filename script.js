import {
    // BorderStyle,
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    AlignmentType,
    HeadingLevel,
    WidthType,
    UnderlineType,
    // VerticalAlignTable,
    // TextDirection,
    TableLayoutType,
} from "https://cdn.jsdelivr.net/npm/docx@9.5.1/+esm";

console.log(HeadingLevel);

const FontSize = {
    TITLE: 22,
    HEADER: 18,
    TEXT: 16,
    TABLE: 15,
    SECTION_TITLE: 17,
};

const EDITME = "<EDIT ME!!!>"

// HELPER FUNCTIONS ===============================================================================

const f = id => document.getElementById(id)?.value || "";

function getFields() {
    return {
        title: f("reportTitle") || "EEG Report",
        patientName: f("patientName"),
        date: f("date"),
        age: f("age"),
        sex: f("sex"),
        neuroPhys: f("neuroPhys"),
        refPhysician: f("refPhysician"),
        diagnosis: f("diagnosis"),
        medications: f("medications"),
        description: f("description"),
        diagnosisText: f("diagnosisText"),
        clinicalInterp: f("clinicalInterp"),
        ref: f("ref"),
        // unit: f("unit"),
        // caseNum: f("caseNum"),
        // eegNum: f("eegNum"),
    };
}

const placeholder = (text, fallback = "—") =>
    text && text.trim() ? text : `<span class="placeholder">${fallback}</span>`;

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

const descriptionBackgroundOptions = {
    "awakeWellModulated": {
        "number": 1,
        "short": "Well-developed, well-modulated background activity",
        "text": `When awake, the background consisted of well developed, well-modulated ${EDITME} Hz activity with posterior predominance that reacted to eye opening and eye closure.`,
    },
    "awakeModulated": {
        "number": 2,
        "short": "Modulated background activity",
        "text": `When awake, the background consisted of ${EDITME} Hz activity with posterior predominance that reacted to eye opening and eye closure.`,
    },
    "noNormalBackground": {
        "number": 3,
        "short": "No normal background activity",
        "text": "There is no normal background activity.",
    },
    "posteriorBackgroundNotAssessed": {
        "number": 4,
        "short": "Posterior background cannot be assessed",
        "text": "The posterior background during full wakefulness can not be assessed.",
    },
    "maximumAlertBackground": {
        "number": 5,
        "short": "Background when maximally alert",
        "text": `When maximally alert, the background consisted of ${EDITME}`,
    },
    "severelySuppressed": {
        "number": 6,
        "short": "Severely suppressed background",
        "text": "The background was severely suppressed, with no identification of any cerebralactivity at sensitivity of 70 microV/cm.",
    },
    "suppressedBackground": {
        "number": 7,
        "short": "Suppressed background",
        "text": `The background was ${EDITME} suppressed ${EDITME}.`,
    },
    "brainDeathProtocolResult": {
        "number": 8,
        "short": "Brain death protocol assessment",
        "text": `Using the brain death protocol with double distance derivations, high sensitivity at 20 microV/cm and high cut filter set at 35 Hz and after testing the integrity of the system by taping each electrode separately and stimulating the patient, ${EDITME}.`,
    },
    "brainDeathProtocolNegative": {
        "number": 9,
        "short": "Brain death protocol - no activity detected",
        "text": "Using the brain death protocol with double distance derivations, high sensitivity at 20 microV/cm and high cut filter set at 35 Hz and after testing the integrity of the system by taping each electrode separately and stimulating the patient, no electrocerebral activity above noise level was detected.",
    },
    "variabilityAndReactivity": {
        "number": 10,
        "short": "Spontaneous variability and reactivity present",
        "text": "The background activity showed evidence of spontaneous variability and reactivity to external stimuli.",
    },
    "variabilityNoReactivity": {
        "number": 11,
        "short": "Spontaneous variability, reactivity not tested",
        "text": "The background activity showed evidence of spontaneous variability. Reactivity to external stimuli was not tested.",
    },
    "noVariabilityNoReactivity": {
        "number": 12,
        "short": "No variability or reactivity",
        "text": "The background activity did not show evidence of spontaneous varibility or reactivity to external stimuli.",
    },
    "noVariabilityReactivityNotTested": {
        "number": 13,
        "short": "No variability, reactivity not tested",
        "text": "The background activity did not show evidence of spontaneous varibility. Reactivity to external stimuli was not tested.",
    },
    "backgroundFreeform": {
        "number": 14,
        "short": "Additional background description",
        "text": `${EDITME}`,
    },
};
const descriptionBetaActivityOptions = {
    "anteriorLowAmplitudeBeta": {
        "number": 1,
        "short": "Low amplitude anterior beta activity",
        "text": "Anteriorly, low amplitude beta activity was seen.",
    },
    "excessiveBetaDiffuse": {
        "number": 2,
        "short": "Excessive diffuse beta activity",
        "text": "Excessive beta activity was seen diffusely over both hemispheres.",
    },
    "betaPaucity": {
        "number": 3,
        "short": "Paucity of beta activity",
        "text": "There is a paucity of beta activity over ${EDITME}.",
    },
    "betaFreeform": {
        "number": 4,
        "short": "Additional beta description",
        "text": `${EDITME}`,
    },
};
const descriptionSleepOptions = {
    "suboptions": {
        "drowsiness": {
            "frontocentral": {
                "number": 1,
                "short": "spindles & waves over frontocentral derivations",
                "text": `During stage II sleep, sleep spindles and vertex waves were seen over the frontocentral derivations.`,
            },
            "parasagittal": {
                "number": 2,
                "short": "paucity of spindles & waves - parasagittal",
                "text": `During stage II sleep, paucity of sleep spindles and vertex waves were seen over the (bilateral/right/left) parasagittal region.`,
            },
            "asynchronous": {
                "number": 3,
                "short": "spindles & waves async but symmetrical",
                "text": `During stage II sleep, sleep spindles and vertex waves were asynchronous but overall symmetrical.`,
            },
            "notRecorded": {
                "number": 4,
                "short": "not recorded",
                "text": `Stage II sleep was not recorded.`,
            },
        }
    },
    "drowsinesSlowing": {
        "number": 1,
        "short": "Generalized slowing during drowsiness",
        "text": "During drowsiness, generalized slowing of the background was seen.",
    },
    "sleepSlowing": {
        "number": 2,
        "short": "Generalized slowing during sleep",
        "text": "During behavioral sleep, further generalized slowing of the background activity was seen.",
    },
    "sleepSlowingWithSuppression": {
        "number": 3,
        "short": "Generalized slowing with intermittent suppression",
        "text": "During behavioral sleep, further generalized slowing of the background activity was seen with a superimposed intermittent suppression.",
    },
    "sleepSlowingWithAttenuation": {
        "number": 4,
        "short": "Generalized slowing with attenuation",
        "text": "During behavioral sleep, further generalized slowing and attenuation of the background activity was seen.",
    },
    "abnormalSleepArchitecture": {
        "number": 5,
        "short": "Absence of normal sleep architecture",
        "text": "There was an absence of normal sleep architecture features.",
    },
    "sleepFreeform": {
        "number": 6,
        "short": "Additional sleep findings",
        "text": `${EDITME}`,
    },
};
const findingsOptions = {
    "_suboptions": {
        "photicStimulation": {
            "": {
                "number": 1,
                "short": null,
                "text": "was physiologic",
            },
            "": {
                "number": 2,
                "short": null,
                "text": `was not performed`,
            },
            "": {
                "number": 3,
                "short": "sustained photoparoxysmal response",
                "text": `resulted in a sustained photoparoxysmal response following stimulation with multiple flash frequencies`,
            },
            "": {
                "number": 4,
                "short": "non-sustained photoparoxysmal response",
                "text": `resulted in a sustained photoparoxysmal response following stimulation with multiple flash frequencies`,
            },
            "": {
                "number": 5,
                "short": "spiky occipital driving response",
                "text": `resulted in a spiky occipital driving response following stimulation with multiple flash frequencies`,
            },
            "": {
                "number": 6,
                "short": "free-form",
                "text": `${EDITME + '<mention seizures if present>'}`,
            },
        },
        "hyperventilation": {
            "": {
                "number": 1,
                "short": "",
                "text": `was physiologic.`,
            },
            "": {
                "number": 2,
                "short": "",
                "text": `was not performed.`,
            },
            "": {
                "number": 3,
                "short": "",
                "text": `Hyperventilation resulted in activation of the abovementioned epileptiform discharges.`,
            },
            "": {
                "number": 4,
                "short": "",
                "text": `Hyperventilation accentuated the generalized epileptiform discharges.`,
            },
            "": {
                "number": 5,
                "short": "",
                "text": `${EDITME + '<Mention seizures if present>.'}.`,
            },
        },
        "focalSlowingDetailedOptions": {
            "": {
                "number": 1,
                "short": null,
                "text": "low-amplitude",
            },
            "": {
                "number": 2,
                "short": null,
                "text": "mid-amplitude",
            },
            "": {
                "number": 3,
                "short": null,
                "text": "high-amplitude – polymorphic",
            },
            "": {
                "number": 4,
                "short": null,
                "text": "monomorphic - theta activity",
            },
            "": {
                "number": 5,
                "short": null,
                "text": "delta activity",
            },
            "": {
                "number": 5,
                "short": null,
                "text": "theta-delta activity",
            },
        }
    },
    "_subfields": {
        "abundance": {}
    },
    "photicStimulation": {
        "number": 1,
        "short": "Photic stimulation response",
        "text": "Photic stimulation {0}.",
    },
    "hyperventilation": {
        "number": 2,
        "short": "Hyperventilation response",
        "text": "Hyperventilation {0}.",
    },
    "noEpiDischarges": {
        "number": 3,
        "short": "No epileptiform discharges",
        "text": "No epileptiform discharges were seen.",
    },
    "noFocalSlowing": {
        "number": 4,
        "short": "No focal slowing",
        "text": "No focal slowing was seen.",
    },
    "noSeizures": {
        "number": 5,
        "short": "No seizures recorded",
        "text": "No clinical or electrographic seizures were recorded.",
    },
    "focalSharpWaves": {
        "number": 6,
        "short": "Focal sharp waves",
        "text": `{${EDITME}: Frequent/occasional/rare} focal sharp waves originating from the ${EDITME}.`,
    },
    "focalSharpWavesDetailed": {
        "number": 7,
        "short": "Focal sharp waves (detailed description)",
        "text": `${EDITME}, focal spikes / sharp waves / spike and slow wave / sharp waves with an aftergoing slow wave / polyspikes / rounded contour sharp waves/ ${EDITME} were seen with a maximum potential over the ${EDITME} electrode site and a field involving the ${EDITME}.`,
    },
    "focalSlowing": {
        "number": 8,
        "short": "Focal slowing",
        "text": `{${EDITME}: Frequent/Intermittent/rare} focal slowing over the ${EDITME}.`,
    },
    "focalSlowingDetailed": {
        "number": 9,
        "short": "Focal slowing (detailed description)",
        "text": `${EDITME}, focal {0} slowing was seen with a maximum potential over the ${EDITME} electrode site and a field involving the ${EDITME}.`,
    },
    "focalSlowingMax": {
        "number": 10,
        "short": "Focal slowing with similar distribution",
        "text": `${EDITME}, focal slowing was seen with a similar topographic distribution.`,
    },
    "focalSlowingExcessive": {
        "number": 11,
        "short": "Excessive focal slowing for age",
        "text": "The focal slowing is considered excessive for age.",
    },
    "roundedContourSharpWaves": {
        "number": 12,
        "short": "Rounded contour sharp waves",
        "text": `Rounded contour sharp waves were seen originating independently from ${EDITME} areas. These discharges were {0} in wakefulness and increased in abundance in drowsiness and sleep to become {0}.`,
    },
    "generalizedDischargesWithSpikes": {
        "number": 13,
        "short": "Generalized discharges with spike bursts",
        "text": `During those states, fragments of the generalized discharges were seen over one of the ${EDITME} areas with a shifting hemispheric emphasis, as well as a brief bursts of generalized spike and polyspike and wave discharges lasting up to ${EDITME} seconds and not associated with any detectable clinical change. Those discharges typically overrode a K-complex or a sleep spindle (dyshormia pattern). The frequency of the epileptiform discharges during wakefulness and during stage II sleep was rated as ${EDITME}.`,
    },
    "generalizedDischargesFragmented": {
        "number": 14,
        "short": "Fragmented generalized discharges",
        "text": `During those states, fragments of the generalized discharges were seen over one of the ${EDITME} areas with a shifting hemispheric emphasis. The frequency of the epileptiform discharges during wakefulness and during stage II sleep was rated as ${EDITME}.`,
    },
    "spiky Alpha": {
        "number": 15,
        "short": "Spiky alpha activity on eye closure",
        "text": `The salient feature of this recording was the frequent occurrence after eye closure of spiky alpha activity seen over both posterior head regions, ${EDITME} with either eye flutter or eyelid myoclonia.`,
    },
    "breachRhythm": {
        "number": 16,
        "short": "Breach rhythm",
        "text": `Breach rhythm was seen over the ${EDITME}.`,
    },
    "breachRhythmDetailed": {
        "number": 17,
        "short": "Breach rhythm (detailed description)",
        "text": `Breach rhythm manifesting as ${EDITME} was ${EDITME} seen localized to the ${EDITME}.`,
    },
    "artifactContamination": {
        "number": 18,
        "short": "Abundant artifact contamination",
        "text": "To note, this recording was abundantly contaminated with artifacts.",
    },
    "recordedSeizure": {
        "number": 19,
        "short": "Video-recorded spell",
        "text": `The patient habitual spell of ${EDITME} was video-recorded at ${EDITME}. On scalp-EEG, no definite detectable change was noted.`,
    },
    "seizureDescription": {
        "number": 20,
        "short": "Seizure details",
        "text": `${EDITME + ' (Mention seizures if present)'}`,
    },
    "extras": {
        "number": 21,
        "short": "Additional findings",
        "text": `${EDITME + ' (Extras: normal variants, artifacts, etc.)'}`,
    },
    "additionalNotes": {
        "number": 22,
        "short": "Additional notes",
        "text": `${EDITME}`,
    },
};
const diagnosisOptions = {
    "normal": {
        "number": 1,
        "short": "Normal",
        "text": "Normal",
    },
    "generalizedSlowing": {
        "number": 2,
        "short": "Generalized slowing",
        "text": `${EDITME} generalized slowing of the background activity.`,
    },
    "intermittentSuppression": {
        "number": 3,
        "short": "Intermittent suppression",
        "text": "Intermittent suppression of the background activity.",
    },
    "profoundSuppression": {
        "number": 4,
        "short": "Profound suppression",
        "text": "Profound suppression of the background activity.",
    },
    "electrocerebralSilence": {
        "number": 5,
        "short": "Electrocerebral silence",
        "text": "Electrocerebral silence.",
    },
    "spindlePaucity": {
        "number": 6,
        "short": "Paucity of sleep spindles",
        "text": `Paucity of sleep spindles over ${EDITME}.`,
    },
    "normalFeatureAbsence": {
        "number": 7,
        "short": "Absence of normal sleep architecture",
        "text": "Absence of normal sleep architecture features.",
    },
    "atypicalSpikeWaveBursts": {
        "number": 8,
        "short": "Bursts of atypical spike and wave discharges",
        "text": `${EDITME} bursts of generalized atypical spike and polyspike and wave discharges seen during ${EDITME}.`,
    },
    "generalizedSpikeWaveFragments": {
        "number": 9,
        "short": "Fragments of generalized spike and wave",
        "text": `${EDITME} fragments of generalized spike and wave discharges seen during ${EDITME}.`,
    },
    "dyshormiaPattern": {
        "number": 10,
        "short": "Dyshormia pattern during sleep",
        "text": "Dyshormia pattern during sleep.",
    },
    "photoparoxysmalResponse": {
        "number": 11,
        "short": "Photoparoxysmal responses",
        "text": `${EDITME} photoparoxysmal responses following stimulation with multiple flash frequencies.`,
    },
    "spiky AlphaNoMyoclonia": {
        "number": 12,
        "short": "Spiky alpha without eyelid myoclonia",
        "text": "Spiky alpha following eye closure not associated with eyelid flutter or eyelid myoclonia.",
    },
    "spiky AlphaWithMyoclonia": {
        "number": 13,
        "short": "Spiky alpha with eyelid myoclonia",
        "text": "Spiky alpha following eye closure associated with eyelid flutter or eyelid myoclonia.",
    },
    "modifiedHypsarrhythmia": {
        "number": 14,
        "short": "Modified hypsarrhythmia",
        "text": "Modified hypsarrhythmia.",
    },
    "hypsarrhythmia": {
        "number": 15,
        "short": "Hypsarrhythmia",
        "text": "Hypsarrhythmia.",
    },
    "epilepticSpasms": {
        "number": 16,
        "short": "Epileptic spasms",
        "text": `${EDITME} epileptic spasms ${EDITME}.`,
    },
    "multifocalSpikes": {
        "number": 17,
        "short": "Multifocal independent spikes",
        "text": "Multifocal independent spikes.",
    },
    "generalizedSlowSpikeWave": {
        "number": 18,
        "short": "Generalized slow spike and wave",
        "text": "Generalized slow spike and wave discharges.",
    },
    "electricalStatusEpilepticus": {
        "number": 19,
        "short": "Electrical status epilepticus during sleep",
        "text": "Electrical status epilepticus during sleep.",
    },
    "focalDischarges": {
        "number": 20,
        "short": "Focal epileptiform discharges",
        "text": `${EDITME} focal epileptiform discharges originating from the ${EDITME}.`,
    },
    "focalSlowing": {
        "number": 21,
        "short": "Focal slowing",
        "text": `${EDITME} focal slowing involving the ${EDITME}.`,
    },
    "triphasicWaves": {
        "number": 22,
        "short": "Triphasic waves",
        "text": `${EDITME} triphasic waves.`,
    },
    "excessiveBetaActivity": {
        "number": 23,
        "short": "Excessive beta activity",
        "text": "Excessive beta activity seen diffusely over both hemispheres.",
    },
    "grda": {
        "number": 24,
        "short": "GRDA with frontal predominance",
        "text": "GRDA with frontal predominance",
    },
    "lrda": {
        "number": 25,
        "short": "LRDA (temporal)",
        "text": "LRDA seen over the (left/right) temporal head region.",
    },
    "oirda": {
        "number": 26,
        "short": "OIRDA (occipital intermittent rhythmic delta)",
        "text": "Occipital intermittent rythmic delta activity (OIRDA).",
    },
    "seizuresRecorded": {
        "number": 27,
        "short": "Recorded seizures",
        "text": `Recorded ${EDITME} seizures ${EDITME}.`,
    },
    "diagnosisFreeform": {
        "number": 28,
        "short": "Additional diagnosis",
        "text": `${EDITME}`,
    },
};
const interpretationOptions = {
    "suboptions": {
        "epileptiformDischarges": {
            "": {
                "number": 1,
                "short": "localization-related, focal",
                "text": `a localization-related epilepsy, with focal irritative zone involving the ${EDITME} head regions.`,
            },
            "": {
                "number": 2,
                "short": "localization-related, multifocal",
                "text": `a localization-related epilepsy, with multifocal irritative zone involving the ${EDITME}* head regions.`,
            },
            "": {
                "number": 3,
                "short": "localization-related, wide",
                "text": `a localization-related epilepsy, with wide irritative zone involving the ${EDITME} head regions.`,
            },
            "": {
                "number": 4,
                "short": "",
                "text": `{an idiopathic / a genetic} generalized epilepsy.`,
            },
            "": {
                "number": 5,
                "short": "",
                "text": `an idiopathic/genetic generalized epilepsy and are compatible with the patient previous diagnosis of ${EDITME}`,
            },
            "": {
                "number": 6,
                "short": "",
                "text": `multifocal epilepsy.`,
            },
            "": {
                "number": 7,
                "short": "",
                "text": `Developmental and epileptic encephalopathy.`,
            },
        }
    },
    "normalRecordFull": {
        "number": 1,
        "short": "Normal record (wakefulness, drowsiness, sleep)",
        "text": "This is a normal record in wakefulness, drowsiness and sleep. No focal slowing or epileptiform discharges were seen. No clinical or electrographic seizures were recorded.",
    },
    "normalRecordPartial": {
        "number": 2,
        "short": "Normal record (wakefulness, drowsiness)",
        "text": "This is a normal record in wakefulness and drowsiness states. No focal slowing or epileptiform discharges were seen. No clinical or electrographic seizures were recorded.",
    },
    "diffuseDisturbance": {
        "number": 3,
        "short": "Diffuse disturbance in cerebral function",
        "text": `This record is indicative of ${EDITME} diffuse disturbance in cerebral function of non-specific etiology.`,
    },
    "diffuseWithFocalDysfunction": {
        "number": 4,
        "short": "Diffuse disturbance with superimposed focal dysfunction",
        "text": `This record is indicative of ${EDITME} diffuse disturbance in cerebral function of non-specific etiology with a superimposed ${EDITME} neuronal dysfunction over the ${EDITME}.`,
    },
    "focalNeuronalDysfunction": {
        "number": 5,
        "short": "Focal neuronal dysfunction",
        "text": `This record is indicative of ${EDITME} neuronal dysfunction involving the ${EDITME}.`,
    },
    "structuralLesionRuleOut": {
        "number": 6,
        "short": "Structural lesion to be ruled out",
        "text": "A structural lesion involving that region needs to be ruled out.",
    },
    "epileptiformDischargeType": {
        "number": 7,
        "short": "Epileptiform discharge characterization",
        "text": "The epileptiform discharges seen in this record are of the type seen in patients with {0}.",
    },
    "generalizedDischargeType": {
        "number": 8,
        "short": "Generalized discharge characterization",
        "text": `In addition, the generalized discharges are of the type seen in patients with {0}.`,
    },
    "benignMaturationalEpilepsy": {
        "number": 9,
        "short": "Benign maturational epilepsy pattern",
        "text": "The morphology of the discharges, their topographic distribution and pattern of activation are typical of those seen in patients with a benign maturational epilepsy.",
    },
    "eegTraitInheritance": {
        "number": 10,
        "short": "EEG trait inheritance without seizures",
        "text": "This pattern can, however, be inherited as an EEG trait without association with seizures.",
    },
    "noFocalSlowingOrDischarges": {
        "number": 11,
        "short": "No focal slowing or discharges",
        "text": "No focal slowing or epileptiform discharges were seen.",
    },
    "noFocalSlowingOrSeizures": {
        "number": 12,
        "short": "No focal slowing or seizures",
        "text": "No focal slowing or seizures were recorded.",
    },
    "noEpileptiforms": {
        "number": 13,
        "short": "No epileptiform discharges",
        "text": "No epileptiform discharges were seen.",
    },
    "noSeizures": {
        "number": 14,
        "short": "No seizures recorded",
        "text": "No clinical or electrographic seizures were recorded.",
    },
    "nonEpilepticSpell": {
        "number": 15,
        "short": "Non-epileptic spell diagnosis",
        "text": `The recorded spell is diagnostic of non-epileptic ${EDITME} spell.`,
    },
    "nonEpilepticSpells": {
        "number": 16,
        "short": "Non-epileptic spells",
        "text": "The recorded spells were non-epileptic in nature.",
    },
    "electrocerebralSilenceCannotBeAscertained": {
        "number": 17,
        "short": "Electrocerebral silence cannot be ascertained",
        "text": "In addition, electrocerebral silence cannot be ascertained.",
    },
    "electrocerebralSilence": {
        "number": 18,
        "short": "Electrocerebral silence",
        "text": "This record is diagnostic of electrocerebral silence.",
    },
    "grdaTriphasic": {
        "number": 19,
        "short": "GRDA with triphasic morphology",
        "text": "GRDA with triphasic morphology are usually seen in the setting of a metabolic, toxic or infectious process.",
    },
    "grdaNonspecific": {
        "number": 20,
        "short": "GRDA non-specific pattern",
        "text": "Although, GRDA with frontal predominace has been described in metabolic encephalopathy, this pattern is non-specific in nature.",
    },
    "lrda": {
        "number": 21,
        "short": "LRDA epileptiform",
        "text": "LRDA of temporal origin is considered epileptiform in nature.",
    },
    "seizureDiagnostic": {
        "number": 22,
        "short": "Seizure diagnosis",
        "text": `The recorded seizure is diagnostic of ${EDITME}.`,
    },
    "breachRhythmExplanation": {
        "number": 23,
        "short": "Breach rhythm from previous craniotomy",
        "text": "The breach rhythm is a reflection of the patient's previous craniotomy.",
    },
    "excessiveBetaExplanation": {
        "number": 24,
        "short": "Excessive beta from benzodiazepine use",
        "text": "The excessive beta activity is a reflection of the benzodiazepine intake.",
    },
    "normalVariant": {
        "number": 25,
        "short": "Normal variant of unknown significance",
        "text": `${EDITME} are considered normal variant of unknown significance and not epileptiform in nature.`,
    },
    "impressionFreeform": {
        "number": 26,
        "short": "Additional impression",
        "text": `${EDITME}`,
    },
};


function makeDescriptionIntro(fields) {
    if (fields.medications) {
        const medications = `The patient is currently maintained on ${medications}.`;
    } else {
        const medications = 'The patient is not currently maintained on antiepileptic medications.'
    }
    return (
        `This is a (duration) 21 channel digital video EEG `
        + `recording performed on ${fields.age} y.o. ${fields.sex} `
        + `{with a history of (diagnosis > see above): example 1 `
        + `decreased level of consciousness to rule out subclinical seizures `
        + `example 2 to rule out brain death}. ${medications}`
    )
}

function makeDescriptionBackground(fields) {
    return ``
}

function makedescriptionBetaActivity(fields) {
    return ``
}

function makeDescriptionSleep(fields) {
    return ``
}

function makeFindings(fields) {
    return ``
}

function makeDiagnosis(fields) {
    return ``
}

function makeInterpretation(fields) {
    return ``
}

function writeProse(fields,) {
    const sections = {
        descriptionIntro: makeDescriptionIntro(fields),
        descriptionBackground: makeDescriptionBackground(fields),
        descriptionBetaActivity: makedescriptionBetaActivity(fields),
        descriptionSleep: makeDescriptionSleep(fields),
        findings: makeFindings(fields),
        diagnosis: makeDiagnosis(fields),
        interpretation: makeInterpretation(fields),
    };
    console.log(sections);
    return sections
}

// CORE FUNCTIONS ============================================================================

function updatePreview() {
    console.log('updating preview');
    const f = id => document.getElementById(id)?.value || "";

    const fields = getFields();
    const sections = writeProse(fields);

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
            <td><strong>Medications:</strong></td>
            <td>${placeholder(fields.medications)}</td>
            <td><strong>Referred by:</strong></td>
            <td>${placeholder(fields.refPhysician)}</td>
        </tr>
        <!-- <tr>
            <td><strong>Medications:</strong></td>
            <td>${placeholder(fields.medications)}</td>
            <td></td>
            <td></td>
        </tr> -->
        </table>
  
      <h2>DESCRIPTION</h2>
      <p>${placeholder(fields.description, "No description provided.")}</p>
  
      <h2>DIAGNOSIS</h2>
      ${fields.diagnosisText.split("\n").map(line =>
        `<p>${placeholder(line)}</p>`
    ).join("")}
  
      <h2>CLINICAL INTERPRETATION</h2>
      <p>${placeholder(fields.clinicalInterp)}</p>
  
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
                                makeCell(fields.medications),
                                makeCell("Referred by:", true),
                                makeCell(fields.refPhysician),
                            ],
                        }),
                        new TableRow({
                            children: [
                                makeCell("Diagnosis:", true),
                                makeCell(fields.diagnosis),
                                makeCell("Medications", true),
                                makeCell(fields.medications),
                            ],
                        }),
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
                makeParagraph(fields.description),

                makeSectionTitle("DIAGNOSIS"),
                ...fields.diagnosisText.split("\n").map(line => makeParagraph(line)),

                makeSectionTitle("CLINICAL INTERPRETATION"),
                makeParagraph(fields.clinicalInterp),

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

// PAGE SETUP =====================================================================================

document.getElementById("diagnosisPreset").addEventListener("change", () => {
    const preset = document.getElementById("diagnosisPreset").value;
    if (preset) document.getElementById("diagnosisText").value = preset;
});

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

updatePreview();
