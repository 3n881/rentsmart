// src/components/GenerateRentAgreement.js
import React from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import jsPDF from "jspdf";

export const generatePDF = async (orderDetails, customerDetails) => {
    const doc = new jsPDF();
  
    // Add content to the PDF
    doc.setFontSize(20);
    doc.text("Rent Agreement", 105, 10, { align: "center" });
    doc.setFontSize(12);
  
    doc.text(`Order ID: ${orderDetails.orderId}`, 10, 30);
    doc.text(`Customer ID: ${customerDetails.customerId}`, 10, 40);
    doc.text(`Customer Name: ${customerDetails.name}`, 10, 50);
    doc.text(`Address: ${customerDetails.address}`, 10, 60);
  
    doc.text("Product Details:", 10, 80);
    orderDetails.products.forEach((product, index) => {
      doc.text(
        `${index + 1}. ${product.productName} - Quantity: ${product.quantity}`,
        10,
        90 + index * 10
      );
    });
  
    doc.text(`Total Rent: ₹${orderDetails.totalRent}`, 10, 130);
    doc.text(`Deposit: ₹${orderDetails.deposit}`, 10, 140);
  
    doc.text("Terms and Conditions:", 10, 160);
    doc.text(
      "1. The rented product(s) must be returned in the same condition.",
      10,
      170
    );
    doc.text(
      "2. The security deposit will be refunded after product inspection.",
      10,
      180
    );
  
    const pdfBlob = doc.output("blob");
  
    // Upload the PDF to Firebase
    const storage = getStorage();
    const pdfRef = ref(
      storage,
      `rent_agreements/${customerDetails.customerId}_${orderDetails.orderId}.pdf`
    );
    await uploadBytes(pdfRef, pdfBlob);
  
    const downloadURL = await getDownloadURL(pdfRef);
  
    return downloadURL; // Return the URL of the uploaded PDF
  };
  

