import PdfPrinter from "pdfmake"

export const getPDFReadableStream = data => {
    const fonts = {
        Roboto: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            // italics: "fonts/Roboto-Italic.ttf",
            // bolditalics: "fonts/Roboto-MediumItalic.ttf",
        },
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content: [
            {
                text: data.title,
                style: 'header'
            },
            {
                text: data.content,

            }],
        styles: {
            header: {
                fontSize: 18,
                bold: true
            }
        }

    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
    pdfReadableStream.end()

    return pdfReadableStream
}