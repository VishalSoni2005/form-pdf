/* eslint-disable @typescript-eslint/no-unused-vars */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import type { FormValuesTypes } from "@/Schema/schema";

//! here i have to write the logic of invoice name

const generate = async (data: FormValuesTypes) => {
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
  } = data;

  console.log("i am data : ", data);

  // Load existing PDF from public folder
  const existingPdfBytes = await fetch("/pdf/template.pdf").then((res) =>
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const { width, height } = firstPage.getSize();

  // Embed a font
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  firstPage.drawText(data.customerName, {
    x: 132,
    y: height - 152,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(data.address, {
    x: 90,
    y: height - 190,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(data.contactInfo, {
    x: 140,
    y: height - 172,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(data.date.toLocaleDateString(), {
    x: 370,
    y: height - 152,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });


  firstPage.drawText(data.invoiceNumber, {
    x: 403,
    y: height - 171,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  })


  firstPage.drawText(data.status, {
    x: 155,
    y: height - 672,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  })

  firstPage.drawText(data.paymentMethod, {
    x: 168,
    y: height - 700,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  })

  // Draw some text
  let yPosition = 285;
  purchaseItems.forEach((item, index) => {

    firstPage.drawText(`${item.itemDescription}`, {
      x: 50,
      y: height - yPosition,
      size: 14,
      font,
    });
    firstPage.drawText(`${item.purity}`, {
      x: 175,
      y: height - yPosition,
      size: 14,
      font,
    });
    firstPage.drawText(`${item.weight} gm`, {
      x: 240,
      y: height - yPosition,
      size: 14,
      font,
    });
    firstPage.drawText(`${item.ratePerGram}/gm`, {
      x: 320,
      y: height - yPosition,
      size: 14,
      font,
    });
    firstPage.drawText(`${item.amount}`, {
      x: 425,
      y: height - yPosition,
      size: 14,
      font,
    })
    yPosition += 25;
  });

 

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

export default generate;
