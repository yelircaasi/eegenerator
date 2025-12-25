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

// console.log(HeadingLevel);

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
var hasFindngsSuboptions = false;
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
    // "betaFreeform": {
    //     "number": 4,
    //     "short": "Additional beta description",
    //     "text": `${EDITME}`,
    // },
};
const descriptionSleepOptions = {
    "frontocentralDrowsiness": {
        "number": 1,
        "short": "drowsiness - frontocentral",
        "text": `During stage II sleep, sleep spindles and vertex waves were seen over the frontocentral derivations.`,
    },
    "parasagittalDrowsiness": {
        "number": 2,
        "short": "drowsiness - parasagittal",
        "text": `During stage II sleep, paucity of sleep spindles and vertex waves were seen over the (bilateral/right/left) parasagittal region.`,
    },
    "asynchronousDrowsiness": {
        "number": 3,
        "short": "drowsiness - asynchronous",
        "text": `During stage II sleep, sleep spindles and vertex waves were asynchronous but overall symmetrical.`,
    },
    "drowsinessNotRecorded": {
        "number": 4,
        "short": "drowsiness not recorded",
        "text": `Stage II sleep was not recorded.`,
    },
    "drowsinesSlowing": {
        "number": 5,
        "short": "Generalized slowing during drowsiness",
        "text": "During drowsiness, generalized slowing of the background was seen.",
    },
    "sleepSlowing": {
        "number": 6,
        "short": "Generalized slowing during sleep",
        "text": "During behavioral sleep, further generalized slowing of the background activity was seen.",
    },
    "sleepSlowingWithSuppression": {
        "number": 7,
        "short": "Generalized slowing with intermittent suppression",
        "text": "During behavioral sleep, further generalized slowing of the background activity was seen with a superimposed intermittent suppression.",
    },
    "sleepSlowingWithAttenuation": {
        "number": 8,
        "short": "Generalized slowing with attenuation",
        "text": "During behavioral sleep, further generalized slowing and attenuation of the background activity was seen.",
    },
    "abnormalSleepArchitecture": {
        "number": 9,
        "short": "Absence of normal sleep architecture",
        "text": "There was an absence of normal sleep architecture features.",
    },
    "sleepFreeform": {
        "number": 10,
        "short": "Additional sleep findings",
        "text": `${EDITME + '(describe additional sleep characteristics)'}`,
    },
};
const findingsSuboptions = {
    "photicStimulation": {
        "1": {
            "number": 1,
            "short": "physiologic",
            "text": "was physiologic.",
        },
        "2": {
            "number": 2,
            "short": "not performed",
            "text": `was not performed.`,
        },
        "3": {
            "number": 3,
            "short": "sustained photoparoxysmal response",
            "text": `resulted in a sustained photoparoxysmal response following stimulation with multiple flash frequencies.`,
        },
        "4": {
            "number": 4,
            "short": "non-sustained photoparoxysmal response",
            "text": `resulted in a sustained photoparoxysmal response following stimulation with multiple flash frequencies.`,
        },
        "5": {
            "number": 5,
            "short": "spiky occipital driving response",
            "text": `resulted in a spiky occipital driving response following stimulation with multiple flash frequencies.`,
        },
        "6": {
            "number": 6,
            "short": "free-form",
            "text": `${EDITME + '(mention seizures if present).'}`,
        },
    },
    "hyperventilation": {
        "physiologic": {
            "number": 1,
            "short": "physiologic",
            "text": `was physiologic.`,
        },
        "notPerformed": {
            "number": 2,
            "short": "not performed",
            "text": `was not performed.`,
        },
        "activation": {
            "number": 3,
            "short": "activated discharges",
            "text": `resulted in activation of the abovementioned epileptiform discharges.`,
        },
        "accentuated": {
            "number": 4,
            "short": "accentuated discharges",
            "text": `accentuated the generalized epileptiform discharges.`,
        },
        "other": {
            "number": 5,
            "short": "other (seizures?)",
            "text": `${EDITME + ' (Mention seizures if present).'}.`,
        },
    },
    "focalSlowing": {
        "lowAmplitude": {
            "number": 1,
            "short": "low-amplitude",
            "text": "low-amplitude.",
        },
        "minAmplitude": {
            "number": 2,
            "short": "mid-amplitude",
            "text": "mid-amplitude.",
        },
        "highAmplitude": {
            "number": 3,
            "short": "high-amplitude – polymorphic",
            "text": "high-amplitude – polymorphic.",
        },
        "monomorphic": {
            "number": 4,
            "short": "monomorphic - theta activity",
            "text": "monomorphic - theta activity.",
        },
        "delta": {
            "number": 5,
            "short": "delta activity",
            "text": "delta activity.",
        },
        "thetaDelta": {
            "number": 5,
            "short": "theta-delta activity",
            "text": "theta-delta activity.",
        },
    }
};
const findingsOptions = {
    // "_suboptions": {

    // },
    // "_subfields": {
    //     "abundance": {}
    // },
    "photicStimulation": {
        "number": 1,
        "short": "Photic stimulation response",
        "text": "Photic stimulation {0}",
    },
    "hyperventilation": {
        "number": 2,
        "short": "Hyperventilation response",
        "text": "Hyperventilation {0}",
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
        "text": `${EDITME}{Frequent/Intermittent/Rare} focal slowing over the {0}`,
    },
    "focalSlowingDetailed": {
        "number": 9,
        "short": "Focal slowing (detailed description)",
        "text": `${EDITME}, focal ${EDITME} slowing was seen with a maximum potential over the ${EDITME} electrode site and a field involving the ${EDITME}.`,
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
        "short": "Custom (use entry form below)",
        "text": "",
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
        "short": "Modified hypoarrhythmia",
        "text": "Modified hypoarrhythmia.",
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
        "text": `Focal epileptiform discharges originating from {0}`,
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
        "short": "Custom (use entry form below)",
        "text": "",
    },
};
const epileptiformDischargeSuboptions = {
    "1": {
        "number": 1,
        "short": "localization-related, focal",
        "text": `a localization-related epilepsy, with focal irritative zone involving the ${EDITME} head regions.`,
    },
    "2": {
        "number": 2,
        "short": "localization-related, multifocal",
        "text": `a localization-related epilepsy, with multifocal irritative zone involving the ${EDITME}* head regions.`,
    },
    "3": {
        "number": 3,
        "short": "localization-related, wide",
        "text": `a localization-related epilepsy, with wide irritative zone involving the ${EDITME} head regions.`,
    },
    "4": {
        "number": 4,
        "short": "idiopathic",
        "text": `an idiopathic generalized epilepsy.`,
    },
    "5": {
        "number": 4,
        "short": "genetic",
        "text": `a genetic generalized epilepsy.`,
    },
    "6": {
        "number": 5,
        "short": "generalized epilepsy",
        "text": `an idiopathic/genetic generalized epilepsy and are compatible with the patient previous diagnosis of ${EDITME}.`,
    },
    "7": {
        "number": 6,
        "short": "multifocal",
        "text": `multifocal epilepsy.`,
    },
    "8": {
        "number": 7,
        "short": "encephalopathy",
        "text": `Developmental and epileptic encephalopathy.`,
    },
};
const interpretationOptions = {

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
