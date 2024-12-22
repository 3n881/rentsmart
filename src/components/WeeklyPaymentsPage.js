
// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

// const WeeklyPaymentsPage = () => {
//   const [weeklyPayments, setWeeklyPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchWeeklyPayments();
//   }, []);

//   const fetchWeeklyPayments = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const today = new Date();
//       const oneWeekFromNow = new Date();
//       oneWeekFromNow.setDate(today.getDate() + 7);

//       const customersSnapshot = await getDocs(collection(db, "customers"));
//       const customersData = customersSnapshot.docs.reduce((acc, doc) => {
//         const data = doc.data();
//         acc[data.customerId] = data.phone || "N/A";
//         return acc;
//       }, {});

//       const paymentsSnapshot = await getDocs(collection(db, "payments"));
//       const weeklyPaymentsData = paymentsSnapshot.docs
//         .map((doc) => {
//           const data = doc.data();
//           const dueDate = data.dueDate?.toDate();
//           const isDueThisWeek = dueDate && dueDate > today && dueDate <= oneWeekFromNow;

//           return {
//             id: doc.id,
//             orderId: data.orderId || "N/A",
//             customerId: data.customerId || "N/A",
//             customerPhone: customersData[data.customerId] || "N/A",
//             amount: data.amount || 0,
//             dueDate: dueDate ? dueDate.toLocaleDateString() : "N/A",
//             status: data.status || "N/A",
//             isDueThisWeek,
//           };
//         })
//         .filter((payment) => payment.isDueThisWeek);

//       setWeeklyPayments(weeklyPaymentsData);
//     } catch (error) {
//       console.error("Error fetching weekly payments:", error);
//       setError("Failed to fetch weekly payments.");
//     } finally {
//       setLoading(false);
//     }
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
//         await updateDoc(paymentRef, { status: "paid" });

//         // Create a new payment record for the next month
//         await addDoc(collection(db, "payments"), {
//           orderId: paymentData.orderId,
//           customerId: paymentData.customerId,
//           customerPhone: paymentData.customerPhone,
//           amount: paymentData.amount,
//           dueDate: nextDueDate,
//           status: "pending",
//         });

//         alert("Payment marked as paid! New payment record created for the next month.");
//         fetchWeeklyPayments();
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
//       <div className="text-center mt-5">
//         <div className="spinner-border text-primary" role="status">
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
//       <h3 className="text-center text-primary mb-4">Weekly Payments</h3>

//       {weeklyPayments.length === 0 ? (
//         <div className="alert alert-info text-center">
//           No payments due within the next 7 days.
//         </div>
//       ) : (
//         <div>
//           <div className="d-none d-md-block">
//             <table className="table table-hover table-striped shadow-sm">
//               <thead className="table-dark">
//                 <tr>
//                   <th>Payment ID</th>
//                   <th>Order ID</th>
//                   <th>Customer ID</th>
//                   <th>Customer Phone</th>
//                   <th>Amount</th>
//                   <th>Due Date</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {weeklyPayments.map((payment) => (
//                   <tr key={payment.id}>
//                     <td>{payment.id}</td>
//                     <td>{payment.orderId}</td>
//                     <td>{payment.customerId}</td>
//                     <td>{payment.customerPhone}</td>
//                     <td>₹{payment.amount}</td>
//                     <td>{payment.dueDate}</td>
//                     <td>
//                       <span
//                         className={`badge ${
//                           payment.status === "pending"
//                             ? "bg-warning text-dark"
//                             : "bg-success"
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
//         </div>
//       )}
//     </div>
//   );
// };

// export default WeeklyPaymentsPage;
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

const WeeklyPaymentsPage = () => {
  const [weeklyPayments, setWeeklyPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeeklyPayments();
  }, []);

  const fetchWeeklyPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(today.getDate() + 7);

      const customersSnapshot = await getDocs(collection(db, "customers"));
      const customersData = customersSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        acc[data.customerId] = data.phone || "N/A";
        return acc;
      }, {});

      const paymentsSnapshot = await getDocs(collection(db, "payments"));
      const weeklyPaymentsData = paymentsSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const dueDate = data.dueDate?.toDate();
          const isDueThisWeek = dueDate && dueDate > today && dueDate <= oneWeekFromNow;

          return {
            id: doc.id,
            orderId: data.orderId || "N/A",
            customerId: data.customerId || "N/A",
            customerPhone: customersData[data.customerId] || "N/A",
            amount: data.amount || 0,
            dueDate: dueDate ? dueDate.toLocaleDateString() : "N/A",
            status: data.status || "N/A",
            isDueThisWeek,
          };
        })
        .filter((payment) => payment.isDueThisWeek);

      setWeeklyPayments(weeklyPaymentsData);
    } catch (error) {
      console.error("Error fetching weekly payments:", error);
      setError("Failed to fetch weekly payments.");
    } finally {
      setLoading(false);
    }
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
        await updateDoc(paymentRef, { status: "paid" });

        // Create a new payment record for the next month
        await addDoc(collection(db, "payments"), {
          orderId: paymentData.orderId,
          customerId: paymentData.customerId,
          customerPhone: paymentData.customerPhone,
          amount: paymentData.amount,
          dueDate: nextDueDate,
          status: "pending",
        });

        alert("Payment marked as paid! New payment record created for the next month.");
        fetchWeeklyPayments();
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
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
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
      <h3 className="text-center text-primary mb-4">Weekly Payments</h3>

      {weeklyPayments.length === 0 ? (
        <div className="alert alert-info text-center">
          No payments due within the next 7 days.
        </div>
      ) : (
        <div>
          {/* Desktop Table */}
          <div className="d-none d-md-block">
            <table className="table table-hover table-striped shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Customer Phone</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {weeklyPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.orderId}</td>
                    <td>{payment.customerId}</td>
                    <td>{payment.customerPhone}</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.dueDate}</td>
                    <td>
                      <span
                        className={`badge ${
                          payment.status === "pending"
                            ? "bg-warning text-dark"
                            : "bg-success"
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

          {/* Mobile Cards */}
          <div className="d-block d-md-none">
            {weeklyPayments.map((payment) => (
              <div key={payment.id} className="card mb-3 shadow-sm border-primary">
                <div className="card-body">
                  <h5 className="card-title">
                    <strong>Order ID:</strong> {payment.orderId}
                  </h5>
                  <p>
                    <strong>Customer ID:</strong> {payment.customerId}
                  </p>
                  <p>
                    <strong>Customer Phone:</strong> {payment.customerPhone}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{payment.amount}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {payment.dueDate}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        payment.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-success"
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
      )}
    </div>
  );
};

export default WeeklyPaymentsPage;
