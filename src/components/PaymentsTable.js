// import React from "react";

// const PaymentsTable = ({ payments }) => {
//   if (payments.length === 0) {
//     return <p className="text-center">No payments found</p>;
//   }

//   return (
//     <table className="table table-striped table-hover">
//       <thead className="thead-dark">
//         <tr>
//           <th>Payment ID</th>
//           <th>Order ID</th>
//           <th>Amount</th>
//           <th>Due Date</th>
//           <th>Status</th>
//         </tr>
//       </thead>
//       <tbody>
//         {payments.map((payment) => (
//           <tr key={payment.id}>
//             <td>{payment.id}</td>
//             <td>{payment.orderId}</td>
//             <td>₹{payment.amount}</td>
//             <td>{payment.dueDate}</td>
//             <td>{payment.status}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };

// export default PaymentsTable;
