import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Select from "react-select";
import { generatePDF } from "./GenerateRentAgreement";
// import { getFunctions, httpsCallable } from "firebase/functions";
import imageCompression from "browser-image-compression";





const UnifiedForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    customerId: "",
    products: [{ productName: "" }],
    productQuantity: "",
    productRent: "",
    productDeposit: "",
    productStatus: "",
    paymentAmount: "",
    paymentDueDate: "",
    paymentStatus: "",
    identityProof: null, // New field for identity proof
    productImages: [], // New field for product images
  });
  const [rentAgreementURL, setRentAgreementURL] = useState(null);

  const [loading, setLoading] = useState(false);
  const [productOptions] = useState([
    "Fridge (LG 215)",
    "Industrial Machine (for road)",
    "Single Bed (Cotton)",
    "Double Bed (Storage + Mattress)",
    "Double Bed Without Storage + Mattress",
    "Cupboard Metal with mirror",
    "Wooden Cupboard Double Mirror",
    "Sofa (3+1+1) + Centre Table",
    'TV (Smart 32")',
    "Complete Table (4x3)",
    "Office Chair",
    "Table (1x3)",
    "Table (1x2)",
    "Dining Table + 6 Seater",
    "Milo",
    "Chair Plastic",
  ]);

  const [existingCustomers, setExistingCustomers] = useState([]);
  const [isNewCustomer, setIsNewCustomer] = useState(true);

  useEffect(() => {
    fetchExistingCustomers();
    if (isNewCustomer) generateCustomerId();
  }, [isNewCustomer]);

  // Fetch existing customer IDs
  const fetchExistingCustomers = async () => {
    try {
      const customersSnapshot = await getDocs(collection(db, "customers"));
      const customersData = customersSnapshot.docs.map((doc) => ({
        id: doc.data().customerId,
        name: doc.data().name,
        email: doc.data().email,
        phone: doc.data().phone,
        address: doc.data().address,
      }));
      setExistingCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Generate Customer ID
  const generateCustomerId = async () => {
    try {
      const customersRef = collection(db, "customers");
      const q = query(customersRef, orderBy("customerId", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      const lastCustomer = querySnapshot.docs[0]?.data();
      const lastId = lastCustomer?.customerId || "RS00";
      const newIdNumber = parseInt(lastId.replace("RS", "")) + 1;
      const newCustomerId = `RS${newIdNumber.toString().padStart(2, "0")}`;
      setFormData((prev) => ({ ...prev, customerId: newCustomerId }));
    } catch (error) {
      console.error("Error generating Customer ID:", error);
    }
  };
  //Generate Order ID
  const generateOrderId = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, orderBy("orderId", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      const lastOrder = querySnapshot.docs[0]?.data();
      const lastId = lastOrder?.orderId || "ORD00";
      const newIdNumber = parseInt(lastId.replace("ORD", "")) + 1;
      return `ORD${newIdNumber.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("Error generating Order ID:", error);
      return "ORD01"; // Default to ORD01 if an error occurs
    }
  };

  const uploadFile = async (file, folderName, customerId, orderId) => {
    const storage = getStorage();
    const fileExtension = file.name.split(".").pop(); // Get the file extension
    const fileName = `${customerId}_${orderId}_${Date.now()}.${fileExtension}`; // Construct the new file name
    const fileRef = ref(storage, `${folderName}/${fileName}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef); // Return the file's URL
  };

  // const sendRentAgreementEmail = async (email, pdfUrl) => {
  //   const functions = getFunctions();
  //   const sendEmail = httpsCallable(functions, "sendRentAgreementEmail");
  //   try {
  //     await sendEmail({
  //       email,
  //       subject: "Your Rent Agreement",
  //       body: `<p>Dear ${formData.name},</p><p>Attached is your rent agreement.</p>`,
  //       attachment: pdfUrl,
  //     });
  //     alert("Rent agreement sent to the customer's email.");
  //   } catch (error) {
  //     console.error("Error sending email:", error);
  //     alert("Failed to send rent agreement email.");
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    // if (name === "identityProof") {
    //   setFormData((prev) => ({ ...prev, identityProof: files[0] }));
    // } else if (name === "productImages") {
    //   setFormData((prev) => ({ ...prev, productImages: Array.from(files) }));
    // }
    if (name === "identityProof" && files[0]) {
      try {
        const compressedFile = await imageCompression(files[0], {
          maxSizeMB: 1, // Maximum file size in MB
          maxWidthOrHeight: 1024, // Max width or height in pixels
          useWebWorker: true, // Use web workers for faster compression
        });
        setFormData((prev) => ({ ...prev, identityProof: compressedFile }));
      } catch (error) {
        console.error("Error compressing identity proof:", error);
      }
    } else if (name === "productImages" && files.length > 0) {
      const compressedImages = [];
      for (const file of files) {
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          });
          compressedImages.push(compressedFile);
        } catch (error) {
          console.error("Error compressing product image:", error);
        }
      }
      setFormData((prev) => ({ ...prev, productImages: compressedImages }));
    }
  };

  const handleProductChange = (index, e) => {
    const { value } = e.target;
    const newProducts = [...formData.products];
    newProducts[index].productName = value;
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const addProductField = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { productName: "" }],
    }));
  };

  const removeProductField = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newOrderId = await generateOrderId();
      const customerId = formData.customerId;

      // Upload identity images

      let identityProofUrl = null;
      if (formData.identityProof) {
        identityProofUrl = await uploadFile(
          formData.identityProof,
          "identity_proofs",
          customerId,
          newOrderId
        );
      }

      // Upload product images

      const productImageUrls = [];
      for (const file of formData.productImages) {
        const imageUrl = await uploadFile(
          file,
          "product_images",
          customerId,
          newOrderId
        );
        productImageUrls.push(imageUrl);
      }

      const orderDetails = {
        orderId: newOrderId,
        products: formData.products,
        totalRent: formData.productRent,
        deposit: formData.productDeposit,
      };

      const customerDetails = {
        customerId: formData.customerId,
        name: formData.name,
        address: formData.address,
      };

      // Generate Rent Agreement
      const pdfURL = await generatePDF(orderDetails, customerDetails);
      setRentAgreementURL(pdfURL);


      // Save Order Details
      await addDoc(collection(db, "orders"), {
        orderId: newOrderId,
        customerId: formData.customerId,
        phone: formData.phone,
        productName: formData.products.map((p) => p.productName),
        productQuantity: parseInt(formData.productQuantity, 10),
        productRent: parseFloat(formData.productRent),
        productDeposit: parseFloat(formData.productDeposit),
        productStatus: formData.productStatus,
        productImages: productImageUrls, // Save product image URLs
        rentAgreementURL: pdfURL,
        createdAt: new Date(),
      });

      // Save Payment Details
      await addDoc(collection(db, "payments"), {
        orderId: newOrderId,
        customerId: formData.customerId,
        customerPhone: formData.phone,
        amount: parseFloat(formData.paymentAmount),
        dueDate: new Date(formData.paymentDueDate),
        status: formData.paymentStatus,
      });

      if (isNewCustomer) {
        // Save Customer Details for new customer
        await addDoc(collection(db, "customers"), {
          customerId: formData.customerId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          identityProof: identityProofUrl, // Save identity proof URL
        });
      }

      
      // await sendRentAgreementEmail(formData.email, pdfURL);
      
      

      

      alert("Customer, Order, and Payment added successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        customerId: "",
        products: [{ productName: "" }],
        productQuantity: "",
        productRent: "",
        productDeposit: "",
        productStatus: "",
        paymentAmount: "",
        paymentDueDate: "",
        paymentStatus: "",
        identityProof: "", // New field for identity proof
        productImages: [],
      });
      if (isNewCustomer) generateCustomerId();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="card-title mb-0 text-center">
                Add Customer, Order & Payment
              </h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Customer Type</label>
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="customerType"
                      id="newCustomer"
                      checked={isNewCustomer}
                      onChange={() => setIsNewCustomer(true)}
                    />
                    <label
                      className={`btn ${
                        isNewCustomer ? "btn-primary" : "btn-outline-primary"
                      }`}
                      htmlFor="newCustomer"
                    >
                      New Customer
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="customerType"
                      id="existingCustomer"
                      checked={!isNewCustomer}
                      onChange={() => setIsNewCustomer(false)}
                    />
                    <label
                      className={`btn ${
                        !isNewCustomer ? "btn-primary" : "btn-outline-primary"
                      }`}
                      htmlFor="existingCustomer"
                    >
                      Existing Customer
                    </label>
                  </div>
                </div>

                {isNewCustomer && (
                  <div className="mb-3">
                    <label className="form-label">Generated Customer ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.customerId}
                      readOnly
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #ced4da",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                )}

                {/* {!isNewCustomer && (
                  <div className="mb-3">
                    <label className="form-label">
                      Select Existing Customer
                    </label>
                    <select
                      className="form-select"
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a Customer</option>
                      {existingCustomers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.id} - {customer.name} ({customer.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )} */}

                {!isNewCustomer && (
                  <div className="mb-3">
                    <label className="form-label">
                      Select Existing Customer
                    </label>
                    <Select
                      options={existingCustomers.map((customer) => ({
                        value: customer.id,
                        label: `${customer.id} - ${customer.name} (${customer.phone})`,
                      }))}
                      onChange={(selectedOption) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerId: selectedOption.value,
                        }))
                      }
                      value={
                        formData.customerId
                          ? {
                              value: formData.customerId,
                              label: existingCustomers.find(
                                (c) => c.id === formData.customerId
                              )?.name,
                            }
                          : null
                      }
                      placeholder="Search or Select a Customer"
                      isSearchable
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: "#ced4da",
                          borderRadius: "4px",
                          boxShadow: "none",
                          "&:hover": { borderColor: "#80bdff" },
                        }),
                      }}
                    />
                  </div>
                )}

                {/* Customer Details */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={!isNewCustomer}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      pattern="[0-9]{10}"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={!isNewCustomer}
                      placeholder="10 digit mobile number"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={!isNewCustomer}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      disabled={!isNewCustomer}
                    />
                  </div>
                  {/* <div className="mb-3">
                    <label className="form-label">
                      Upload Identity Proof (Image or PDF)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      name="identityProof"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </div> */}
                  <div className="mb-3">
                    <label className="form-label">
                      Upload Identity Proof (Image or PDF)
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        id="identityProof"
                        name="identityProof"
                        accept="image/*,.pdf"
                        className="file-input"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="identityProof" className="file-label">
                        {formData.identityProof
                          ? formData.identityProof.name
                          : "Choose File"}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Products Section */}
                <div className="mb-3">
                  <label className="form-label">Products</label>
                  {formData.products.map((product, index) => (
                    <div key={index} className="row mb-2 align-items-center">
                      <div className="col-md-10">
                        <select
                          className="form-select"
                          value={product.productName}
                          onChange={(e) => handleProductChange(index, e)}
                          required
                        >
                          <option value="">Select a product</option>
                          {productOptions.map((option, optIndex) => (
                            <option key={optIndex} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      {index > 0 && (
                        <div className="col-md-2">
                          <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={() => removeProductField(index)}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary mt-2"
                    onClick={addProductField}
                  >
                    Add Another Product
                  </button>
                </div>
                {/* <div className="mb-3">
                  <label className="form-label">Upload Product Images</label>
                  <input
                    type="file"
                    className="form-control"
                    name="productImages"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </div> */}
                <div className="mb-3">
                  <label className="form-label">Upload Product Images</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="productImages"
                      name="productImages"
                      accept="image/*"
                      multiple
                      className="file-input"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="productImages" className="file-label">
                      {formData.productImages.length > 0
                        ? `${formData.productImages.length} File(s) Selected`
                        : "Choose Files"}
                    </label>
                  </div>
                </div>

                {/* Product Details */}
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Product Quantity</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="form-control"
                      name="productQuantity"
                      value={formData.productQuantity}
                      onChange={handleChange}
                      required
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Product Rent</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="form-control"
                        name="productRent"
                        value={formData.productRent}
                        onChange={handleChange}
                        required
                        placeholder="Enter rent"
                      />
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Product Deposit</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="form-control"
                        name="productDeposit"
                        value={formData.productDeposit}
                        onChange={handleChange}
                        required
                        placeholder="Enter deposit"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Status */}
                <div className="mb-3">
                  <label className="form-label">Product Status</label>
                  <select
                    className="form-select"
                    name="productStatus"
                    value={formData.productStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Payment Details */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Payment Amount</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="form-control"
                        name="paymentAmount"
                        value={formData.paymentAmount}
                        onChange={handleChange}
                        required
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Payment Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="paymentDueDate"
                      value={formData.paymentDueDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Payment Status */}
                <div className="mb-3">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
                {rentAgreementURL && (
                  <div className="alert alert-success mt-3">
                    Rent Agreement URL:{" "}
                    <a
                      href={rentAgreementURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {rentAgreementURL}
                    </a>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedForm;
