
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

const PendingPaymentsPage = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // End of the current week

      const customersSnapshot = await getDocs(collection(db, "customers"));
      const customersData = customersSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        acc[data.customerId] = data.phone || "N/A";
        return acc;
      }, {});

      const paymentsSnapshot = await getDocs(collection(db, "payments"));
      const pendingPaymentsData = paymentsSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : null;
          return {
            id: doc.id,
            orderId: data.orderId || "N/A",
            customerId: data.customerId || "N/A",
            customerPhone: customersData[data.customerId] || "N/A",
            amount: data.amount || 0,
            dueDate: dueDate,
            status: data.status || "N/A",
          };
        })
        .filter(
          (payment) =>
            payment.status === "pending" &&
            (payment.dueDate <= endOfWeek || payment.dueDate < today)
        );

      setPendingPayments(pendingPaymentsData);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      setError("Failed to fetch pending payments.");
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
        fetchPendingPayments();
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
      <h3 className="text-center text-primary mb-4">Pending Payments</h3>

      {pendingPayments.length === 0 ? (
        <div className="alert alert-info text-center">
          No pending payments found for this week or overdue payments.
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="d-none d-md-block table-responsive">
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
                {pendingPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.orderId}</td>
                    <td>{payment.customerId}</td>
                    <td>{payment.customerPhone}</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.dueDate ? payment.dueDate.toLocaleDateString() : "N/A"}</td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAsPaid(payment.id)}
                      >
                        Mark as Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="d-md-none">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="card mb-3 shadow-sm">
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
                    <strong>Due Date:</strong>{" "}
                    {payment.dueDate ? payment.dueDate.toLocaleDateString() : "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="badge bg-warning text-dark">{payment.status}</span>
                  </p>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleMarkAsPaid(payment.id)}
                  >
                    Mark as Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PendingPaymentsPage;
