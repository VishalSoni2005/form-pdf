/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { FormValuesTypes } from "@/Schema/schema";

// Utility function to draw text on the PDF page
const drawText = (
  page: any,
  text: string,
  x: number,
  y: number,
  font: any,
  size: number = 14,
  color: any = rgb(0, 0, 0)
) => {
  page.drawText(text, { x, y, size, font, color });
};

const generate = async (data: FormValuesTypes): Promise<Uint8Array> => {
  const {
    customerName,
    contactInfo,
    address,
    date,
    invoiceNumber,
    status,
    paymentMethod,
    purchaseItems,
    total_amount,
    gst,
    totalmaking_charge,
  } = data;

  console.log("Data: ", data);

  // Load existing PDF from public folder
  const existingPdfBytes = await fetch("/pdf/template.pdf").then((res) =>
    res.arrayBuffer()
  );
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();

  // Helper to draw text with fallback
  const drawWithFallback = (
    value: number | string | undefined,
    x: number,
    y: number
  ) => {
    drawText(firstPage, value?.toString() || "0", x, y, font);
  };

  // Amount details
  drawWithFallback(totalmaking_charge, 440, height - 515);
  drawWithFallback(Math.round(gst || 0), 440, height - 552);
  drawText(firstPage, total_amount.toString(), 440, height - 590, font);

  // Payment and customer details
  drawText(firstPage, paymentMethod, 168, height - 700, font);
  drawText(firstPage, customerName, 132, height - 152, font, 12);
  drawText(firstPage, address, 90, height - 190, font, 12);
  drawText(firstPage, contactInfo, 140, height - 172, font, 12);
  drawText(firstPage, date.toLocaleDateString(), 370, height - 152, font, 12);
  drawText(firstPage, invoiceNumber, 403, height - 171, font, 12);
  drawText(firstPage, status, 155, height - 672, font);

  // Purchase items
  let yPosition = 285;
  purchaseItems.forEach((item) => {
    drawText(firstPage, item.itemDescription, 50, height - yPosition, font);
    drawText(firstPage, `${item.purity}`, 175, height - yPosition, font);
    drawText(firstPage, `${item.weight} gm`, 240, height - yPosition, font);
    drawText(
      firstPage,
      `${item.ratePerGram}/gm`,
      320,
      height - yPosition,
      font
    );
    drawText(firstPage, `${item.amount}`, 425, height - yPosition, font);
    yPosition += 25;
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

export default generate;

// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
// import type { FormValuesTypes } from "@/Schema/schema";

// const generate = async (data: FormValuesTypes) => {
//   const {
//     customerName,
//     contactInfo,
//     address,

//     date,
//     invoiceNumber,

//     status,
//     paymentMethod,

//     purchaseItems,

//     total_amount,
//     gst,
//     totalmaking_charge,
//   } = data;

//   console.log("i am data : ", data);

//   // Load existing PDF from public folder
//   const existingPdfBytes = await fetch("/pdf/template.pdf").then((res) =>
//     res.arrayBuffer()
//   );

//   const pdfDoc = await PDFDocument.load(existingPdfBytes);

//   const pages = pdfDoc.getPages();
//   const firstPage = pages[0];

//   const { width, height } = firstPage.getSize();

//   // Embed a font
//   const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   if (totalmaking_charge) {
//     firstPage.drawText(totalmaking_charge.toString(), {
//       x: 440,
//       y: height - 515,
//       size: 14,
//       font,
//       color: rgb(0, 0, 0),
//     });
//   } else {
//     firstPage.drawText("0", {
//       x: 440,
//       y: height - 515,
//       size: 14,
//       font,
//       color: rgb(0, 0, 0),
//     });
//   }

//   const roundedGst = gst ? Math.round(gst) : 0;

//   if(gst) {
//     firstPage.drawText(roundedGst.toString(), {
//       x: 440,
//       y: height - 552,
//       size: 14,
//       font,
//       color: rgb(0, 0, 0),
//     });
//   } else {
//     firstPage.drawText("0", {
//       x: 440,
//       y: height - 552,
//       size: 14,
//       font,
//       color: rgb(0, 0, 0),
//     });
//   }

//   firstPage.drawText(total_amount.toString(), {
//     x: 440,
//     y: height - 590,
//     size: 14,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   firstPage.drawText(data.paymentMethod, {
//     x: 168,
//     y: height - 700,
//     size: 14,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   firstPage.drawText(data.customerName, {
//     x: 132,
//     y: height - 152,
//     size: 12,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   firstPage.drawText(data.address, {
//     x: 90,
//     y: height - 190,
//     size: 12,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   firstPage.drawText(data.contactInfo, {
//     x: 140,
//     y: height - 172,
//     size: 12,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   firstPage.drawText(data.date.toLocaleDateString(), {
//     x: 370,
//     y: height - 152,
//     size: 12,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   firstPage.drawText(data.invoiceNumber, {
//     x: 403,
//     y: height - 171,
//     size: 12,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   firstPage.drawText(data.status, {
//     x: 155,
//     y: height - 672,
//     size: 14,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   // Draw some text
//   let yPosition = 285;
//   purchaseItems.forEach((item, index) => {
//     firstPage.drawText(`${item.itemDescription}`, {
//       x: 50,
//       y: height - yPosition,
//       size: 14,
//       font,
//     });
//     firstPage.drawText(`${item.purity}`, {
//       x: 175,
//       y: height - yPosition,
//       size: 14,
//       font,
//     });
//     firstPage.drawText(`${item.weight} gm`, {
//       x: 240,
//       y: height - yPosition,
//       size: 14,
//       font,
//     });
//     firstPage.drawText(`${item.ratePerGram}/gm`, {
//       x: 320,
//       y: height - yPosition,
//       size: 14,
//       font,
//     });
//     firstPage.drawText(`${item.amount}`, {
//       x: 425,
//       y: height - yPosition,
//       size: 14,
//       font,
//     });
//     yPosition += 25;
//   });

//   const pdfBytes = await pdfDoc.save();
//   return pdfBytes;
// };

// export default generate;
