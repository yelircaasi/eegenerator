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

document.getElementById("diagnosisPreset").addEventListener("change", () => {
    const preset = document.getElementById("diagnosisPreset").value;
    if (preset) document.getElementById("diagnosisText").value = preset;
});

function updatePreview() {
    console.log('updating preview');
    const f = id => document.getElementById(id)?.value || "";

    const fields = {
        title: f("reportTitle") || "EEG Report",
        patientName: f("patientName"),
        date: f("date"),
        age: f("age"),
        sex: f("sex"),
        unit: f("unit"),
        neuroPhys: f("neuroPhys"),
        caseNum: f("caseNum"),
        refPhysician: f("refPhysician"),
        eegNum: f("eegNum"),
        diagnosis: f("diagnosis"),
        medications: f("medications"),
        description: f("description"),
        diagnosisText: f("diagnosisText"),
        clinicalInterp: f("clinicalInterp"),
        ref: f("ref"),
    };

    const placeholder = (text, fallback = "—") =>
        text && text.trim() ? text : `<span class="placeholder">${fallback}</span>`;

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
            <td><strong>Unit:</strong></td>
            <td>${placeholder(fields.unit)}</td>
            <td><strong>Neurophysiologist:</strong></td>
            <td>${placeholder(fields.neuroPhys)}</td>
        </tr>
        <tr>
            <td><strong>Case #:</strong></td>
            <td>${placeholder(fields.caseNum)}</td>
            <td><strong>Referring Physician:</strong></td>
            <td>${placeholder(fields.refPhysician)}</td>
        </tr>
        <tr>
            <td><strong>EEG #:</strong></td>
            <td>${placeholder(fields.eegNum)}</td>
            <td><strong>Diagnosis:</strong></td>
            <td>${placeholder(fields.diagnosis)}</td>
        </tr>
        <tr>
            <td><strong>Medications:</strong></td>
            <td>${placeholder(fields.medications)}</td>
            <td></td>
            <td></td>
        </tr>
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

window.downloadDocument = async function () {
    const f = id => document.getElementById(id)?.value || "";

    const fields = {
        title: f("reportTitle") || "EEG Report",
        patientName: f("patientName"),
        date: f("date"),
        age: f("age"),
        sex: f("sex"),
        unit: f("unit"),
        neuroPhys: f("neuroPhys"),
        caseNum: f("caseNum"),
        refPhysician: f("refPhysician"),
        eegNum: f("eegNum"),
        diagnosis: f("diagnosis"),
        medications: f("medications"),
        description: f("description"),
        diagnosisText: f("diagnosisText"),
        clinicalInterp: f("clinicalInterp"),
        ref: f("ref"),
    };

    const makePara = (text, opts = {}) =>
        new Paragraph({ children: [new TextRun({ text, ...opts })] });

    const fullWidth = 9600; // Usable width (12240 - 2*1440)
    const quarterWidth = fullWidth / 4;
    const makeSectionTitle = (text) =>
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 400 },
            children: [
                new TextRun({
                    text,
                    bold: true,
                    color: "000000",
                    underline: { type: UnderlineType.SINGLE },
                }),
            ],
        });

    const makeCell = (text, isBold = false) =>
        new TableCell({
            children: [
                new Paragraph({
                    children: [
                        new TextRun({ text, bold: isBold }),
                    ],
                }),
            ],
            width: {
                size: quarterWidth, // 👈 This is 100% (NOT multiplied!)
                type: WidthType.DXA,
            },
        });

        

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    children: [new TextRun({ text: fields.title, bold: true, size: 36 })],
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
                                makeCell("Unit:", true),
                                makeCell(fields.unit),
                                makeCell("Neurophysiologist:", true),
                                makeCell(fields.neuroPhys),
                            ],
                        }),
                        new TableRow({
                            children: [
                                makeCell("Case #:", true),
                                makeCell(fields.caseNum),
                                makeCell("Referring Physician:", true),
                                makeCell(fields.refPhysician),
                            ],
                        }),
                        new TableRow({
                            children: [
                                makeCell("EEG #:", true),
                                makeCell(fields.eegNum),
                                makeCell("Diagnosis:", true),
                                makeCell(fields.diagnosis),
                            ],
                        }),
                        new TableRow({
                            children: [
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

                // new Table({
                //     width: {
                //         size: fullWidth,
                //         type: WidthType.DXA,
                //     },
                //     rows: [
                //         new TableRow({
                //             children: [
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //             ],
                //         }),
                //         new TableRow({
                //             children: [
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [new Paragraph("Hello")],
                //                     borders: {
                //                         top: {
                //                             style: BorderStyle.DASH_DOT_STROKED,
                //                             size: 3,
                //                             color: "FF0000",
                //                         },
                //                         bottom: {
                //                             style: BorderStyle.DOUBLE,
                //                             size: 3,
                //                             color: "0000FF",
                //                         },
                //                         left: {
                //                             style: BorderStyle.DASH_DOT_STROKED,
                //                             size: 3,
                //                             color: "00FF00",
                //                         },
                //                         right: {
                //                             style: BorderStyle.DASH_DOT_STROKED,
                //                             size: 3,
                //                             color: "#ff8000",
                //                         },
                //                     },
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //             ],
                //         }),
                //         new TableRow({
                //             children: [
                //                 new TableCell({
                //                     children: [new Paragraph("other")],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [new Paragraph("yay")],
                //                 }),
                //             ],
                //         }),
                //         new TableRow({
                //             children: [
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //                 new TableCell({
                //                     children: [],
                //                 }),
                //             ],
                //         }),
                //     ],
                // }),

                makeSectionTitle("DESCRIPTION"),
                makePara(fields.description),

                makeSectionTitle("DIAGNOSIS"),
                ...fields.diagnosisText.split("\n").map(line => makePara(line)),

                makeSectionTitle("CLINICAL INTERPRETATION"),
                makePara(fields.clinicalInterp),

                makeSectionTitle("REF"),
                makePara(fields.ref),
            ]
        }]
    });

    // const doc = new Document({
    //     sections: [
    //         {
    //             children: [
    //                 new Table({
    //                     rows: [
    //                         new TableRow({
    //                             children: [
    //                                 new TableCell({
    //                                     children: [new Paragraph({}), new Paragraph({})],
    //                                     verticalAlign: VerticalAlignTable.CENTER,
    //                                 }),
    //                                 new TableCell({
    //                                     children: [new Paragraph({}), new Paragraph({})],
    //                                     verticalAlign: VerticalAlignTable.CENTER,
    //                                 }),
    //                                 new TableCell({
    //                                     children: [new Paragraph({ text: "bottom to top" }), new Paragraph({})],
    //                                     textDirection: TextDirection.BOTTOM_TO_TOP_LEFT_TO_RIGHT,
    //                                 }),
    //                                 new TableCell({
    //                                     children: [new Paragraph({ text: "top to bottom" }), new Paragraph({})],
    //                                     textDirection: TextDirection.TOP_TO_BOTTOM_RIGHT_TO_LEFT,
    //                                 }),
    //                             ],
    //                         }),
    //                         new TableRow({
    //                             children: [
    //                                 new TableCell({
    //                                     children: [
    //                                         new Paragraph({
    //                                             text: "Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah",
    //                                             heading: HeadingLevel.HEADING_1,
    //                                         }),
    //                                     ],
    //                                 }),
    //                                 new TableCell({
    //                                     children: [
    //                                         new Paragraph({
    //                                             text: "This text should be in the middle of the cell",
    //                                         }),
    //                                     ],
    //                                     verticalAlign: VerticalAlignTable.CENTER,
    //                                 }),
    //                                 new TableCell({
    //                                     children: [
    //                                         new Paragraph({
    //                                             text: "Text above should be vertical from bottom to top",
    //                                         }),
    //                                     ],
    //                                     verticalAlign: VerticalAlignTable.CENTER,
    //                                 }),
    //                                 new TableCell({
    //                                     children: [
    //                                         new Paragraph({
    //                                             text: "Text above should be vertical from top to bottom",
    //                                         }),
    //                                     ],
    //                                     verticalAlign: VerticalAlignTable.CENTER,
    //                                 }),
    //                             ],
    //                         }),
    //                     ],
    //                 }),
    //             ],
    //         },
    //     ],
    // });

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
