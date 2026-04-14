interface OptionConfig {
    text: string;
    number: number;
    short: string;
}

interface OptionsMap {
    [key: string]: OptionConfig;
}

interface EEGData {
    descriptionBackgroundOptions: OptionsMap;
    descriptionBetaActivityOptions: OptionsMap;
    descriptionSleepOptions: OptionsMap;
    diagnosisOptions: OptionsMap;
    epileptiformDischargeSuboptions: OptionsMap;
    interpretationOptions: OptionsMap;
    findingsSuboptions: Record<string, OptionsMap>;
    findingsOptions: OptionsMap;
};

interface FormFields {
    title: string;
    patientName: string;
    date: string;
    age: string;
    sex: string;
    neuroPhys: string;
    refPhysician: string;
    diagnosis: string;
    medications: string;
    description: string;
    background: string;
    findings: string;
    diagnosisFreeform: string;
    clinicalInterp: string;
    ref: string;
}

interface ReportSections {
    background: string;
    description: string;
    findings: string;
    diagnosis: string;
    interpretation: string;
}

interface FontSizes {
    TITLE: number;
    HEADER: number;
    TEXT: number;
    TABLE: number;
    SECTION_TITLE: number;
}

export {
    EEGData,    
    FontSizes,
    FormFields,
    OptionConfig,
    OptionsMap,
    ReportSections,
}
