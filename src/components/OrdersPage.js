
// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, getDocs } from "firebase/firestore";

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [groupedOrders, setGroupedOrders] = useState({});

//   useEffect(() => {
//     const fetchOrders = async () => {
//       const ordersSnapshot = await getDocs(collection(db, "orders"));
//       const ordersData = ordersSnapshot.docs.map((doc) => doc.data());

//       setOrders(ordersData);
//       groupOrders(ordersData); // Group orders on fetch
//     };

//     fetchOrders();
//   }, []);

//   const groupOrders = (orders) => {
//     const grouped = orders.reduce((acc, order) => {
//       if (!acc[order.customerId]) {
//         acc[order.customerId] = [];
//       }
//       acc[order.customerId].push(order);
//       return acc;
//     }, {});
//     setGroupedOrders(grouped);
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);

//     const filtered = orders.filter(
//       (order) =>
//         order.orderId?.toLowerCase().includes(value) ||
//         order.customerId?.toLowerCase().includes(value)
//     );
//     groupOrders(filtered); // Regroup orders based on the search term
//   };

//   const formatProducts = (products) => {
//     if (Array.isArray(products)) {
//       return products.join(", ");
//     }
//     return products; // For cases where it's not an array
//   };

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center text-primary mb-4">Orders</h3>

//       {/* Search Input */}
//       <div className="mb-4">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Search by Order ID or Customer ID"
//           value={searchTerm}
//           onChange={handleSearch}
//         />
//       </div>

//       {/* Desktop View */}
//       <div className="d-none d-md-block">
//         {Object.keys(groupedOrders).length > 0 ? (
//           Object.entries(groupedOrders).map(([customerId, customerOrders]) => (
//             <div key={customerId} className="mb-4">
//               <h5 className="text-primary">Customer ID: {customerId}</h5>
//               <table className="table table-hover table-striped shadow-sm rounded">
//                 <thead className="table-dark">
//                   <tr>
//                     <th>Order ID</th>
//                     <th>Products</th>
//                     <th>Rent</th>
//                     <th>Deposit</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {customerOrders.map((order, index) => (
//                     <tr key={index}>
//                       <td>{order.orderId}</td>
//                       <td>{formatProducts(order.productName)}</td>
//                       <td>₹{order.productRent}</td>
//                       <td>₹{order.productDeposit}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-muted">No orders found</p>
//         )}
//       </div>

//       {/* Mobile View */}
//       <div className="d-md-none">
//         {Object.keys(groupedOrders).length > 0 ? (
//           Object.entries(groupedOrders).map(([customerId, customerOrders]) => (
//             <div key={customerId} className="mb-3">
//               <h5 className="text-primary">Customer ID: {customerId}</h5>
//               {customerOrders.map((order, index) => (
//                 <div key={index} className="card mb-3 shadow-sm border-primary">
//                   <div className="card-body">
//                     <h5 className="card-title text-primary">Order ID: {order.orderId}</h5>
//                     <p className="card-text">
//                       <strong>Products:</strong> {formatProducts(order.productName)}
//                       <br />
//                       <strong>Rent:</strong> ₹{order.productRent}
//                       <br />
//                       <strong>Deposit:</strong> ₹{order.productDeposit}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-muted">No orders found</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrdersPage;
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupedOrders, setGroupedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ordersData = ordersSnapshot.docs.map((doc) => doc.data());

      setOrders(ordersData);
      groupOrders(ordersData); // Group orders on fetch
    };

    fetchOrders();
  }, []);

  const groupOrders = (orders) => {
    const grouped = orders.reduce((acc, order) => {
      if (!acc[order.customerId]) {
        acc[order.customerId] = [];
      }
      acc[order.customerId].push(order);
      return acc;
    }, {});
    setGroupedOrders(grouped);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = orders.filter(
      (order) =>
        order.orderId?.toLowerCase().includes(value) ||
        order.customerId?.toLowerCase().includes(value)
    );
    groupOrders(filtered); // Regroup orders based on the search term
  };

  const formatProducts = (products) => {
    if (Array.isArray(products)) {
      return products.join(", ");
    }
    return products; // For cases where it's not an array
  };

  const handleDownload = (rentAgreementURL) => {
    if (!rentAgreementURL) {
      alert("No rent agreement available for this order.");
      return;
    }

    // Trigger download
    const link = document.createElement("a");
    link.href = rentAgreementURL;
    link.target = "_blank";
    link.download = "Rent_Agreement.pdf";
    link.click();
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center text-primary mb-4">Orders</h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Order ID or Customer ID"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Desktop View */}
      <div className="d-none d-md-block">
        {Object.keys(groupedOrders).length > 0 ? (
          Object.entries(groupedOrders).map(([customerId, customerOrders]) => (
            <div key={customerId} className="mb-4">
              <h5 className="text-primary">Customer ID: {customerId}</h5>
              <table className="table table-hover table-striped shadow-sm rounded">
                <thead className="table-dark">
                  <tr>
                    <th>Order ID</th>
                    <th>Products</th>
                    <th>Rent</th>
                    <th>Deposit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.orderId}</td>
                      <td>{formatProducts(order.productName)}</td>
                      <td>₹{order.productRent}</td>
                      <td>₹{order.productDeposit}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDownload(order.rentAgreementURL)}
                        >
                          Download Rent Agreement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No orders found</p>
        )}
      </div>

      {/* Mobile View */}
      <div className="d-md-none">
        {Object.keys(groupedOrders).length > 0 ? (
          Object.entries(groupedOrders).map(([customerId, customerOrders]) => (
            <div key={customerId} className="mb-3">
              <h5 className="text-primary">Customer ID: {customerId}</h5>
              {customerOrders.map((order, index) => (
                <div key={index} className="card mb-3 shadow-sm border-primary">
                  <div className="card-body">
                    <h5 className="card-title text-primary">Order ID: {order.orderId}</h5>
                    <p className="card-text">
                      <strong>Products:</strong> {formatProducts(order.productName)}
                      <br />
                      <strong>Rent:</strong> ₹{order.productRent}
                      <br />
                      <strong>Deposit:</strong> ₹{order.productDeposit}
                    </p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(order.rentAgreementURL)}
                    >
                      Download Rent Agreement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No orders found</p>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
