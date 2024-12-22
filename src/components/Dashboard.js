// import React, { useState } from "react";
// import { db } from "../firebase";
// import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import CustomersTable from "./CustomersTable";
// import OrdersTable from "./OrdersTable";
// import PaymentsTable from "./PaymentsTable";
// import PendingPaymentsTable from "./PendingPaymentsTable";

// const Dashboard = () => {
//   const [customers, setCustomers] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [pendingPayments, setPendingPayments] = useState([]);
//   const [weeklyPayments, setWeeklyPayments] = useState([]);
//   const [summary, setSummary] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const getCurrentMonth = () => {
//     const today = new Date();
//     return { month: today.getMonth(), year: today.getFullYear() };
//   };

//   const fetchData = async (type) => {
//     setLoading(true);
//     setError(null);

//     try {
//       if (type === "customers") {
//         const customersSnapshot = await getDocs(collection(db, "customers"));
//         const customersData = customersSnapshot.docs.map((doc) => {
//           const data = doc.data();
//           return {
//             id: data.customerId || "N/A",
//             name: data.name || "N/A",
//             email: data.email || "N/A",
//             phone: data.phone || "N/A",
//             address: data.address || "N/A",
//           };
//         });
//         setCustomers(customersData);
//       } else if (type === "orders") {
//         const ordersSnapshot = await getDocs(collection(db, "orders"));
//         const ordersData = ordersSnapshot.docs.map((doc) => {
//           const data = doc.data();
//           return {
//             id: data.orderId || doc.id,
//             customerId: data.customerId || "N/A",
//             productName: data.productName || "N/A",
//             productQuantity: data.productQuantity || 0,
//             productRent: data.productRent || 0,
//             productDeposit: data.productDeposit || 0,
//             productStatus: data.productStatus || "N/A",
//             createdAt: data.createdAt ? data.createdAt.toDate().toLocaleString() : "N/A",
//           };
//         });
//         setOrders(ordersData);
//       } else if (type === "payments") {
//         const paymentsSnapshot = await getDocs(collection(db, "payments"));
//         const paymentsData = paymentsSnapshot.docs.map((doc) => {
//           const data = doc.data();
//           return {
//             id: doc.id,
//             orderId: data.orderId || "N/A",
//             amount: data.amount || 0,
//             dueDate: data.dueDate?.toDate()?.toLocaleDateString() || "N/A",
//             status: data.status || "N/A",
//           };
//         });
//         setPayments(paymentsData);

//         // Update summary
//         const totalAmount = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
//         const pendingCount = paymentsData.filter((payment) => payment.status === "pending").length;
//         setSummary({ totalAmount, pendingCount });
//       } else if (type === "pendingPayments") {
//         const currentMonth = getCurrentMonth();
//         const paymentsSnapshot = await getDocs(collection(db, "payments"));
//         const pendingPaymentsData = paymentsSnapshot.docs
//           .map((doc) => {
//             const data = doc.data();
//             const dueDate = data.dueDate?.toDate();
//             const isCurrentMonth =
//               dueDate &&
//               dueDate.getMonth() === currentMonth.month &&
//               dueDate.getFullYear() === currentMonth.year;

//             return {
//               id: doc.id,
//               orderId: data.orderId || "N/A",
//               amount: data.amount || 0,
//               dueDate: dueDate ? dueDate.toLocaleDateString() : "N/A",
//               status: data.status || "N/A",
//               isPending: isCurrentMonth && data.status === "pending",
//             };
//           })
//           .filter((payment) => payment.isPending);
//         setPendingPayments(pendingPaymentsData);
//       }else if (type === "weeklyPayments") {
//         const today = new Date();
//         const oneWeekFromNow = new Date();
//         oneWeekFromNow.setDate(today.getDate() + 7);

//         const paymentsSnapshot = await getDocs(collection(db, "payments"));
//         const weeklyPaymentsData = paymentsSnapshot.docs
//           .map((doc) => {
//             const data = doc.data();
//             const dueDate = data.dueDate?.toDate();
//             const isDueThisWeek = dueDate && dueDate > today && dueDate <= oneWeekFromNow;

//             return {
//               id: doc.id,
//               orderId: data.orderId || "N/A",
//               amount: data.amount || 0,
//               dueDate: dueDate ? dueDate.toLocaleDateString() : "N/A",
//               status: data.status || "N/A",
//               isDueThisWeek,
//             };
//           })
//           .filter((payment) => payment.isDueThisWeek);
//         setWeeklyPayments(weeklyPaymentsData);
//       }
//     } catch (error) {
//       console.error(`Error fetching ${type}:`, error);
//       setError(`Failed to fetch ${type}. Please try again later.`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const renderWeeklyPaymentsTable = () => {
//   //   if (weeklyPayments.length === 0) {
//   //     return <p className="text-center">No payments due within the next 7 days.</p>;
//   //   }

//   //   return (
//   //     <table className="table table-striped table-hover">
//   //       <thead className="thead-dark">
//   //         <tr>
//   //           <th>Payment ID</th>
//   //           <th>Order ID</th>
//   //           <th>Amount</th>
//   //           <th>Due Date</th>
//   //           <th>Status</th>
//   //         </tr>
//   //       </thead>
//   //       <tbody>
//   //         {weeklyPayments.map((payment) => (
//   //           <tr key={payment.id}>
//   //             <td>{payment.id}</td>
//   //             <td>{payment.orderId}</td>
//   //             <td>₹{payment.amount}</td>
//   //             <td>{payment.dueDate}</td>
//   //             <td>{payment.status}</td>
//   //           </tr>
//   //         ))}
//   //       </tbody>
//   //     </table>
//   //   );
//   // };
//   const handleMarkAsPaid = async (paymentId) => {
//     try {
//       const paymentRef = doc(db, "payments", paymentId);
//       await updateDoc(paymentRef, { status: "paid" });
//       alert("Payment marked as paid!");
//       fetchData("pendingPayments"); // Refresh pending payments
//       fetchData("weeklyPayments"); // Refresh weekly payments
//     } catch (error) {
//       console.error("Error marking payment as paid:", error);
//       alert("Failed to update payment status.");
//     }
//   };

//   const renderPendingPaymentsTable = () => {
//     if (pendingPayments.length === 0) {
//       return <p className="text-center">No overdue pending payments.</p>;
//     }

//     return (
//       <table className="table table-striped table-hover">
//         <thead className="thead-dark">
//           <tr>
//             <th>Payment ID</th>
//             <th>Order ID</th>
//             <th>Amount</th>
//             <th>Due Date</th>
//             <th>Status</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {pendingPayments.map((payment) => (
//             <tr key={payment.id}>
//               <td>{payment.id}</td>
//               <td>{payment.orderId}</td>
//               <td>₹{payment.amount}</td>
//               <td>{payment.dueDate}</td>
//               <td>{payment.status}</td>
//               <td>
//                 <button
//                   className="btn btn-success btn-sm"
//                   onClick={() => handleMarkAsPaid(payment.id)}
//                 >
//                   Mark as Paid
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     );
//   };

//   const renderWeeklyPaymentsTable = () => {
//     if (weeklyPayments.length === 0) {
//       return <p className="text-center">No payments due within the next 7 days.</p>;
//     }

//     return (
//       <table className="table table-striped table-hover">
//         <thead className="thead-dark">
//           <tr>
//             <th>Payment ID</th>
//             <th>Order ID</th>
//             <th>Amount</th>
//             <th>Due Date</th>
//             <th>Status</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {weeklyPayments.map((payment) => (
//             <tr key={payment.id}>
//               <td>{payment.id}</td>
//               <td>{payment.orderId}</td>
//               <td>₹{payment.amount}</td>
//               <td>{payment.dueDate}</td>
//               <td>{payment.status}</td>
//               <td>
//                 <button
//                   className="btn btn-success btn-sm"
//                   onClick={() => handleMarkAsPaid(payment.id)}
//                 >
//                   Mark as Paid
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     );
//   };

//   const renderCards = () => (
//     <div className="row">
//       <div className="col-md-4">
//         <div className="card shadow-sm bg-primary text-white">
//           <div className="card-header">Total Customers</div>
//           <div className="card-body">
//             <h4 className="card-title">{customers.length}</h4>
//           </div>
//         </div>
//       </div>
//       <div className="col-md-4">
//         <div className="card shadow-sm bg-success text-white">
//           <div className="card-header">Total Payments</div>
//           <div className="card-body">
//             <h4 className="card-title">₹{summary.totalAmount || 0}</h4>
//           </div>
//         </div>
//       </div>
//       <div className="col-md-4">
//         <div className="card shadow-sm bg-warning text-dark">
//           <div className="card-header">Pending Payments</div>
//           <div className="card-body">
//             <h4 className="card-title">{summary.pendingCount || 0}</h4>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderButtons = () => (
//     <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
//       <button className="btn btn-primary btn-lg" onClick={() => fetchData("customers")}>
//         Fetch Customers
//       </button>
//       <button className="btn btn-secondary btn-lg" onClick={() => fetchData("orders")}>
//         Fetch Orders
//       </button>
//       <button className="btn btn-success btn-lg" onClick={() => fetchData("payments")}>
//         Fetch Payments
//       </button>
//       <button className="btn btn-warning btn-lg" onClick={() => fetchData("pendingPayments")}>
//         Fetch Pending Payments
//       </button>
//       <button className="btn btn-info btn-lg" onClick={generateExcelReport}>
//         Download Excel Report
//       </button>
//       <button className="btn btn-danger btn-lg" onClick={generatePDFReport}>
//         Download PDF Report
//       </button>
//       <button className="btn btn-primary btn-lg" onClick={() => fetchData("weeklyPayments")}>
//         Fetch Weekly Pending Payments
//       </button>
//     </div>
//   );
  


//   const generateExcelReport = () => {
//     const workbook = XLSX.utils.book_new();

//     // Add Customers Sheet
//     const customersSheet = XLSX.utils.json_to_sheet(customers);
//     XLSX.utils.book_append_sheet(workbook, customersSheet, "Customers");

//     // Add Payments Sheet
//     const paymentsSheet = XLSX.utils.json_to_sheet(payments);
//     XLSX.utils.book_append_sheet(workbook, paymentsSheet, "Payments");

//     // Export the workbook
//     XLSX.writeFile(workbook, "Monthly_Report.xlsx");
//   };

//   const generatePDFReport = () => {
//     const doc = new jsPDF();

//     // Add title
//     doc.text("Monthly Report", 20, 10);

//     // Add Customers Table
//     doc.text("Customers", 14, 20);
//     doc.autoTable({
//       head: [["Customer ID", "Name", "Email", "Phone", "Address"]],
//       body: customers.map((c) => [c.id, c.name, c.email, c.phone, c.address]),
//       startY: 25,
//     });

//     // Add Payments Table
//     doc.text("Payments", 14, doc.lastAutoTable.finalY + 10);
//     doc.autoTable({
//       head: [["Payment ID", "Order ID", "Amount", "Due Date", "Status"]],
//       body: payments.map((p) => [p.id, p.orderId, p.amount, p.dueDate, p.status]),
//       startY: doc.lastAutoTable.finalY + 15,
//     });

//     // Save the PDF
//     doc.save("Monthly_Report.pdf");
//   };

//   if (loading) {
//     return (
//       <div className="container text-center mt-5">
//         <div className="spinner-border" role="status">
//           <span className="sr-only">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mt-5">
//         <div className="alert alert-danger" role="alert">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4">Dashboard</h2>

//       {/* <div className="mb-4">
//         <button className="btn btn-primary btn-lg me-3" onClick={() => fetchData("customers")}>
//           Fetch Customers
//         </button>
//         <button className="btn btn-secondary btn-lg me-3" onClick={() => fetchData("orders")}>
//           Fetch Orders
//         </button>
//         <button className="btn btn-success btn-lg me-3" onClick={() => fetchData("payments")}>
//           Fetch Payments
//         </button>
//         <button className="btn btn-warning btn-lg me-3" onClick={() => fetchData("pendingPayments")}>
//           Fetch Pending Payments
//         </button>
//         <button className="btn btn-info btn-lg me-3" onClick={generateExcelReport}>
//           Download Excel Report
//         </button>
//         <button className="btn btn-danger btn-lg" onClick={generatePDFReport}>
//           Download PDF Report
//         </button>
//         <button className="btn btn-info btn-lg" onClick={() => fetchData("weeklyPayments")}>
//         Fetch Weekly Payments
//       </button>
//       {renderWeeklyPaymentsTable()}
//       </div>

//       <div className="row mt-4">
//         <div className="col-md-4">
//           <div className="card bg-light mb-3">
//             <div className="card-header">Total Customers</div>
//             <div className="card-body">
//               <h5 className="card-title">{customers.length}</h5>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card bg-light mb-3">
//             <div className="card-header">Total Payments</div>
//             <div className="card-body">
//               <h5 className="card-title">₹{summary.totalAmount || 0}</h5>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card bg-light mb-3">
//             <div className="card-header">Pending Payments</div>
//             <div className="card-body">
//               <h5 className="card-title">{summary.pendingCount || 0}</h5>
//             </div>
//           </div>
//         </div>
//       </div> */}
//       {renderCards()}
//       {renderButtons()}

//       <div className="row">
//         <div className="col-md-12">
//           <CustomersTable customers={customers} />
//         </div>
//       </div>

//       <div className="row mt-5">
//         <div className="col-md-12">
//           <OrdersTable orders={orders} />
//         </div>
//       </div>

//       <div className="row mt-5">
//         <div className="col-md-12">
//           <PaymentsTable payments={payments} />
//         </div>
//       </div>

//       <div className="row mt-5">
//         <div className="col-md-12">
//           <PendingPaymentsTable
//             pendingPayments={pendingPayments}
//             fetchData={() => fetchData("pendingPayments")}
//           />
//         </div>
//       </div>
//       <div className="row mt-5">
//         <div className="col-md-12">
//           <h3>Overdue Pending Payments</h3>
//           {renderPendingPaymentsTable()}
//         </div>
//       </div>

//       <div className="row mt-5">
//         <div className="col-md-12">
//           <h3>Weekly Pending Payments</h3>
//           {renderWeeklyPaymentsTable()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import CustomersPage from "./CustomersPage";
// import OrdersPage from "./OrdersPage";
// import PaymentsPage from "./PaymentsPage";
// import PendingPaymentsPage from "./PendingPaymentsPage";
// import WeeklyPaymentsPage from "./WeeklyPaymentsPage";

// const Dashboard = () => {
//   return (
//     <Router>
//       <div className="container mt-5">
//         <h2 className="mb-4">Dashboard</h2>
//         {/* Navigation Menu */}
//         <nav className="nav nav-pills mb-4">
//           <Link className="nav-link" to="/customers">Customers</Link>
//           <Link className="nav-link" to="/orders">Orders</Link>
//           <Link className="nav-link" to="/payments">Payments</Link>
//           <Link className="nav-link" to="/pending-payments">Pending Payments</Link>
//           <Link className="nav-link" to="/weekly-payments">Weekly Payments</Link>
//         </nav>

//         {/* Routes */}
//         <Routes>
//           <Route path="/customers" element={<CustomersPage />} />
//           <Route path="/orders" element={<OrdersPage />} />
//           <Route path="/payments" element={<PaymentsPage />} />
//           <Route path="/pending-payments" element={<PendingPaymentsPage />} />
//           <Route path="/weekly-payments" element={<WeeklyPaymentsPage />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default Dashboard;
// import React from "react";
// import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
// import CustomersPage from "./CustomersPage";
// import OrdersPage from "./OrdersPage";
// import PaymentsPage from "./PaymentsPage";
// import PendingPaymentsPage from "./PendingPaymentsPage";
// import WeeklyPaymentsPage from "./WeeklyPaymentsPage";

// const Dashboard = () => {
//   return (
//     <Router>
//       <div className="container mt-5">
//         {/* Dashboard Header */}
//         <div className="text-center mb-4">
//           <h1 className="display-4 text-primary">Dashboard</h1>
//           <p className="lead text-secondary">Manage your rental business effortlessly</p>
//         </div>

//         {/* Navigation Menu */}
//         <nav className="navbar navbar-expand-lg navbar-light bg-light shadow rounded mb-4">
//           <div className="container-fluid">
//             <button
//               className="navbar-toggler"
//               type="button"
//               data-bs-toggle="collapse"
//               data-bs-target="#navbarNav"
//               aria-controls="navbarNav"
//               aria-expanded="false"
//               aria-label="Toggle navigation"
//             >
//               <span className="navbar-toggler-icon"></span>
//             </button>
//             <div className="collapse navbar-collapse" id="navbarNav">
//               <ul className="navbar-nav mx-auto">
//                 <li className="nav-item">
//                   <NavLink
//                     className={({ isActive }) =>
//                       `nav-link ${isActive ? "active fw-bold text-primary" : ""}`
//                     }
//                     to="/customers"
//                   >
//                     Customers
//                   </NavLink>
//                 </li>
//                 <li className="nav-item">
//                   <NavLink
//                     className={({ isActive }) =>
//                       `nav-link ${isActive ? "active fw-bold text-primary" : ""}`
//                     }
//                     to="/orders"
//                   >
//                     Orders
//                   </NavLink>
//                 </li>
//                 <li className="nav-item">
//                   <NavLink
//                     className={({ isActive }) =>
//                       `nav-link ${isActive ? "active fw-bold text-primary" : ""}`
//                     }
//                     to="/payments"
//                   >
//                     Payments
//                   </NavLink>
//                 </li>
//                 <li className="nav-item">
//                   <NavLink
//                     className={({ isActive }) =>
//                       `nav-link ${isActive ? "active fw-bold text-primary" : ""}`
//                     }
//                     to="/pending-payments"
//                   >
//                     Pending Payments
//                   </NavLink>
//                 </li>
//                 <li className="nav-item">
//                   <NavLink
//                     className={({ isActive }) =>
//                       `nav-link ${isActive ? "active fw-bold text-primary" : ""}`
//                     }
//                     to="/weekly-payments"
//                   >
//                     Weekly Payments
//                   </NavLink>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </nav>

//         {/* Routes */}
//         <div className="card shadow-sm p-4 bg-light rounded">
//           <Routes>
//             <Route path="/customers" element={<CustomersPage />} />
//             <Route path="/orders" element={<OrdersPage />} />
//             <Route path="/payments" element={<PaymentsPage />} />
//             <Route path="/pending-payments" element={<PendingPaymentsPage />} />
//             <Route path="/weekly-payments" element={<WeeklyPaymentsPage />} />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// };

// export default Dashboard;
import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import CustomersPage from "./CustomersPage";
import OrdersPage from "./OrdersPage";
import PaymentsPage from "./PaymentsPage";
import PendingPaymentsPage from "./PendingPaymentsPage";
import WeeklyPaymentsPage from "./WeeklyPaymentsPage";

const Dashboard = () => {
  return (
    <Router>
      <div className="container mt-4">
        {/* Dashboard Header */}
        <div className="text-center mb-4">
          <h1 className="display-5 text-primary">Dashboard</h1>
          <p className="lead text-muted">Manage your rental business efficiently</p>
        </div>

        {/* Navigation Menu */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm rounded mb-4">
          <div className="container-fluid">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto">
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link px-3 py-2 ${isActive ? "active fw-bold text-primary border-bottom border-primary" : "text-dark"}`
                    }
                    to="/customers"
                  >
                    Customers
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link px-3 py-2 ${isActive ? "active fw-bold text-primary border-bottom border-primary" : "text-dark"}`
                    }
                    to="/orders"
                  >
                    Orders
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link px-3 py-2 ${isActive ? "active fw-bold text-primary border-bottom border-primary" : "text-dark"}`
                    }
                    to="/payments"
                  >
                    Payments
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link px-3 py-2 ${isActive ? "active fw-bold text-primary border-bottom border-primary" : "text-dark"}`
                    }
                    to="/pending-payments"
                  >
                    Pending Payments
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link px-3 py-2 ${isActive ? "active fw-bold text-primary border-bottom border-primary" : "text-dark"}`
                    }
                    to="/weekly-payments"
                  >
                    Weekly Payments
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <div className="card shadow-sm p-3 bg-light rounded">
          <Routes>
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/pending-payments" element={<PendingPaymentsPage />} />
            <Route path="/weekly-payments" element={<WeeklyPaymentsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Dashboard;
