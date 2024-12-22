
// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

// const PaymentsPage = () => {
//   const [payments, setPayments] = useState([]);
//   const [groupedPayments, setGroupedPayments] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [summary, setSummary] = useState({
//     totalCollected: 0,
//     totalPending: 0,
//     monthlyPendingCount: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   const fetchPayments = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const today = new Date();
//       const currentMonth = today.getMonth();
//       const currentYear = today.getFullYear();

//       const paymentsSnapshot = await getDocs(collection(db, "payments"));
//       const paymentsData = paymentsSnapshot.docs.map((doc) => {
//         const data = doc.data();
//         const dueDate = data.dueDate?.toDate();
//         const isThisMonth =
//           dueDate &&
//           dueDate.getMonth() === currentMonth &&
//           dueDate.getFullYear() === currentYear;

//         return {
//           id: doc.id,
//           orderId: data.orderId || "N/A",
//           customerId: data.customerId || "N/A",
//           customerPhone: data.customerPhone || "N/A",
//           amount: data.amount || 0,
//           dueDate: dueDate ? dueDate.toLocaleDateString() : "N/A",
//           status: data.status || "N/A",
//           isThisMonth,
//         };
//       });

//       setPayments(paymentsData);
//       groupPaymentsByOrder(paymentsData);

//       const totalCollected = paymentsData
//         .filter((payment) => payment.status === "paid" && payment.isThisMonth)
//         .reduce((sum, payment) => sum + payment.amount, 0);

//       const totalPending = paymentsData
//         .filter((payment) => payment.status === "pending" && payment.isThisMonth)
//         .reduce((sum, payment) => sum + payment.amount, 0);

//       const monthlyPendingCount = paymentsData.filter(
//         (payment) => payment.status === "pending" && payment.isThisMonth
//       ).length;

//       setSummary({ totalCollected, totalPending, monthlyPendingCount });
//     } catch (error) {
//       console.error("Error fetching payments:", error);
//       setError("Failed to fetch payments.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const groupPaymentsByOrder = (payments) => {
//     const grouped = payments.reduce((acc, payment) => {
//       if (!acc[payment.orderId]) {
//         acc[payment.orderId] = [];
//       }
//       acc[payment.orderId].push(payment);
//       return acc;
//     }, {});
//     setGroupedPayments(grouped);
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);

//     const filtered = payments.filter(
//       (payment) =>
//         payment.orderId.toLowerCase().includes(value) ||
//         payment.customerId.toLowerCase().includes(value)
//     );

//     groupPaymentsByOrder(filtered);
//   };

//   const handleMarkAsPaid = async (paymentId) => {
//     try {
//       const paymentRef = doc(db, "payments", paymentId);
//       const paymentsSnapshot = await getDocs(collection(db, "payments"));

//       const paymentData = paymentsSnapshot.docs.find((doc) => doc.id === paymentId)?.data();

//       if (paymentData) {
//         const currentDueDate = paymentData.dueDate?.toDate();
//         const nextDueDate = new Date(currentDueDate);
//         nextDueDate.setMonth(nextDueDate.getMonth() + 1);

//         // Mark the current payment as paid
//         await updateDoc(paymentRef, {
//           status: "paid",
//         });

//         // Create a new record for next month's payment
//         await addDoc(collection(db, "payments"), {
//           orderId: paymentData.orderId,
//           customerId: paymentData.customerId,
//           customerPhone: paymentData.customerPhone,
//           amount: paymentData.amount,
//           dueDate: nextDueDate,
//           status: "pending",
//         });

//         alert("Payment marked as paid! New payment record created for next month.");
//         fetchPayments();
//       } else {
//         alert("Payment record not found!");
//       }
//     } catch (error) {
//       console.error("Error marking payment as paid and creating next record:", error);
//       alert("Failed to update payment status and create next payment record.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="text-center">
//         <div className="spinner-border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="alert alert-danger">{error}</div>;
//   }

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center text-primary mb-4">Payments</h3>

//       {/* Summary Cards */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm bg-success text-white">
//             <div className="card-header">Total Collected (This Month)</div>
//             <div className="card-body">
//               <h5 className="card-title">₹{summary.totalCollected}</h5>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm bg-danger text-white">
//             <div className="card-header">Total Pending (This Month)</div>
//             <div className="card-body">
//               <h5 className="card-title">₹{summary.totalPending}</h5>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm bg-warning text-dark">
//             <div className="card-header">Pending Payments (This Month)</div>
//             <div className="card-body">
//               <h5 className="card-title">{summary.monthlyPendingCount}</h5>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="mb-4">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Search by Order ID or Customer ID"
//           value={searchTerm}
//           onChange={handleSearch}
//         />
//       </div>

//       {/* Payments Grouped by Order */}
//       <div>
//         {Object.keys(groupedPayments).map((orderId) => (
//           <div key={orderId} className="mb-4">
//             <h5 className="text-primary">Order ID: {orderId}</h5>
//             <table className="table table-hover table-striped shadow-sm">
//               <thead className="table-dark">
//                 <tr>
//                   <th>Customer ID</th>
//                   <th>Customer Phone</th>
//                   <th>Amount</th>
//                   <th>Due Date</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {groupedPayments[orderId].map((payment) => (
//                   <tr key={payment.id}>
//                     <td>{payment.customerId}</td>
//                     <td>{payment.customerPhone}</td>
//                     <td>₹{payment.amount}</td>
//                     <td>{payment.dueDate}</td>
//                     <td>
//                       <span
//                         className={`badge ${
//                           payment.status === "paid" ? "bg-success" : "bg-warning text-dark"
//                         }`}
//                       >
//                         {payment.status}
//                       </span>
//                     </td>
//                     <td>
//                       {payment.status === "pending" && (
//                         <button
//                           className="btn btn-success btn-sm"
//                           onClick={() => handleMarkAsPaid(payment.id)}
//                         >
//                           Mark as Paid
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PaymentsPage;
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [groupedPayments, setGroupedPayments] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    totalCollected: 0,
    totalPending: 0,
    monthlyPendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const paymentsSnapshot = await getDocs(collection(db, "payments"));
      const paymentsData = paymentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        const dueDate = data.dueDate?.toDate();
        const isThisMonth =
          dueDate &&
          dueDate.getMonth() === currentMonth &&
          dueDate.getFullYear() === currentYear;

        return {
          id: doc.id,
          orderId: data.orderId || "N/A",
          customerId: data.customerId || "N/A",
          customerPhone: data.customerPhone || "N/A",
          amount: data.amount || 0,
          dueDate: dueDate ? dueDate.toLocaleDateString() : "N/A",
          status: data.status || "N/A",
          isThisMonth,
        };
      });

      setPayments(paymentsData);
      groupPaymentsByOrder(paymentsData);

      const totalCollected = paymentsData
        .filter((payment) => payment.status === "paid" && payment.isThisMonth)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const totalPending = paymentsData
        .filter((payment) => payment.status === "pending" && payment.isThisMonth)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const monthlyPendingCount = paymentsData.filter(
        (payment) => payment.status === "pending" && payment.isThisMonth
      ).length;

      setSummary({ totalCollected, totalPending, monthlyPendingCount });
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to fetch payments.");
    } finally {
      setLoading(false);
    }
  };

  const groupPaymentsByOrder = (payments) => {
    const grouped = payments.reduce((acc, payment) => {
      if (!acc[payment.orderId]) {
        acc[payment.orderId] = [];
      }
      acc[payment.orderId].push(payment);
      return acc;
    }, {});
    setGroupedPayments(grouped);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = payments.filter(
      (payment) =>
        payment.orderId.toLowerCase().includes(value) ||
        payment.customerId.toLowerCase().includes(value)
    );

    groupPaymentsByOrder(filtered);
  };

  const handleMarkAsPaid = async (paymentId) => {
    try {
      const paymentRef = doc(db, "payments", paymentId);
      const paymentsSnapshot = await getDocs(collection(db, "payments"));

      const paymentData = paymentsSnapshot.docs.find((doc) => doc.id === paymentId)?.data();

      if (paymentData) {
        const currentDueDate = paymentData.dueDate?.toDate();
        const nextDueDate = new Date(currentDueDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);

        // Mark the current payment as paid
        await updateDoc(paymentRef, {
          status: "paid",
        });

        // Create a new record for next month's payment
        await addDoc(collection(db, "payments"), {
          orderId: paymentData.orderId,
          customerId: paymentData.customerId,
          customerPhone: paymentData.customerPhone,
          amount: paymentData.amount,
          dueDate: nextDueDate,
          status: "pending",
        });

        alert("Payment marked as paid! New payment record created for next month.");
        fetchPayments();
      } else {
        alert("Payment record not found!");
      }
    } catch (error) {
      console.error("Error marking payment as paid and creating next record:", error);
      alert("Failed to update payment status and create next payment record.");
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h3 className="text-center text-primary mb-4">Payments</h3>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm bg-success text-white">
            <div className="card-header">Total Collected (This Month)</div>
            <div className="card-body">
              <h5 className="card-title">₹{summary.totalCollected}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm bg-danger text-white">
            <div className="card-header">Total Pending (This Month)</div>
            <div className="card-body">
              <h5 className="card-title">₹{summary.totalPending}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm bg-warning text-dark">
            <div className="card-header">Pending Payments (This Month)</div>
            <div className="card-body">
              <h5 className="card-title">{summary.monthlyPendingCount}</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Order ID or Customer ID"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Payments Grouped by Order */}
      <div>
        {Object.keys(groupedPayments).map((orderId) => (
          <div key={orderId} className="mb-4">
            <h5 className="text-primary">Order ID: {orderId}</h5>

            {/* Responsive Table */}
            <div className="d-none d-md-block">
              <table className="table table-hover table-striped shadow-sm">
                <thead className="table-dark">
                  <tr>
                    <th>Customer ID</th>
                    <th>Customer Phone</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedPayments[orderId].map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.customerId}</td>
                      <td>{payment.customerPhone}</td>
                      <td>₹{payment.amount}</td>
                      <td>{payment.dueDate}</td>
                      <td>
                        <span
                          className={`badge ${
                            payment.status === "paid" ? "bg-success" : "bg-warning text-dark"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td>
                        {payment.status === "pending" && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleMarkAsPaid(payment.id)}
                          >
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="d-md-none">
              {groupedPayments[orderId].map((payment) => (
                <div key={payment.id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Customer ID: {payment.customerId}</h5>
                    <p>
                      <strong>Phone:</strong> {payment.customerPhone}
                      <br />
                      <strong>Amount:</strong> ₹{payment.amount}
                      <br />
                      <strong>Due Date:</strong> {payment.dueDate}
                      <br />
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge ${
                          payment.status === "paid"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </p>
                    {payment.status === "pending" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAsPaid(payment.id)}
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsPage;
