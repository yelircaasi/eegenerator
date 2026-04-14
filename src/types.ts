interface ResponseTriple {
        number: number;
        short: string;
        text: string;
};

type Responses = Record<string, ResponseTriple>;

interface EEGData {
    descriptionBackgroundOptions: Responses;
    descriptionBetaActivityOptions: Responses;
    descriptionSleepOptions: Responses;
    diagnosisOptions: Responses;
    epileptiformDischargeSuboptions: Responses;
    interpretationOptions: Responses;
    findingsSuboptions: Record<string, Record<number, ResponseTriple>>;
    findingsOptions: Responses;
};

interface OptionConfig {
    text: string;
    number?: number;
    short?: string;
}

interface OptionsMap {
    [key: string]: OptionConfig;
}

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
    Responses,
    ResponseTriple,
}
