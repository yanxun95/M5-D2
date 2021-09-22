import PdfPrinter from "pdfmake"
import imageDataURI from "image-data-uri"

export const getPDFReadableStream = async data => {
    const fonts = {
        Roboto: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            // italics: "fonts/Roboto-Italic.ttf",
            // bolditalics: "fonts/Roboto-MediumItalic.ttf",
        },
    }

    const printer = new PdfPrinter(fonts)
    const imgDataUri = await imageDataURI.encodeFromURL(data.coverImg)
    // imageDataURI.encodeFromURL(data.coverImg)
    //     // RETURNS image data URI :: 'data:image/png;base64,PNGDATAURI/'
    //     .then(res => console.log(res))

    const docDefinition = {
        content: [
            {
                image: imgDataUri,

            },
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