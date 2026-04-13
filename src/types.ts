export interface ResponseTriple {
        number: number;
        short: string;
        text: string;
};

export type Responses = Record<string, ResponseTriple>;

export interface EEGData {
    descriptionBackgroundOptions: Responses;
    descriptionBetaActivityOptions: Responses;
    descriptionSleepOptions: Responses;
    findingsSuboptions: Record<string, Record<number, ResponseTriple>>;
    findingsOptions: Record<string, Record<number, ResponseTriple>>;
};



// const descriptionBackgroundOptions: Responses = data.descriptionBackgroundOptions;
// const descriptionBetaActivityOptions: Responses = data.descriptionBackgroundOptions;
// const descriptionSleepOptions: Responses = data.descriptionSleepOptions;
// const findingsSuboptions: Responses = data.findingsSuboptions;
// const findingsOptions: Responses = data.findingsOptions;
// const diagnosisOptions: Responses = data.diagnosisOptions;
// const epileptiformDischargeSuboptions: Responses = data.epileptiformDischargeSuboptions;
// const interpretationOptions: Responses = data.interpretationOptions;
