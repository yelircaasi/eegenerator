import { loadBundle, getFields } from "./utils";
import { writeProse } from "./domain";

const {
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
} = await loadBundle("https://cdn.jsdelivr.net/npm/docx@9.5.1/+esm");

const { saveAs } = await loadBundle("https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js");

const FontSize = {
    TITLE: 22,
    HEADER: 18,
    TEXT: 16,
    TABLE: 15,
    SECTION_TITLE: 17,
};

const makeParagraph = (text: string, opts = {}) =>
    new Paragraph({ children: [new TextRun({ text, ...opts })] });

const fullWidth = 9600; // usable width: (12240 - 2*1440)
const quarterWidth = fullWidth / 4;
const makeSectionTitle = (text: string) =>
    new Paragraph({
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

const makeCell = (text: string, isBold = false) =>
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

async function downloadDocument() {

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

    const btn = document.querySelector(".download-btn") as HTMLButtonElement;
    const orig = btn.textContent;
    btn.textContent = "✅ Downloaded!";
    btn.style.background = "linear-gradient(135deg, #27ae60, #2ecc71)";
    setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
    }, 2000);
};

export {
    makeParagraph,
    makeCell,
    downloadDocument,
};
