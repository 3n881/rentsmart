import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const customersSnapshot = await getDocs(collection(db, "customers"));
      const customersData = customersSnapshot.docs.map((doc) => doc.data());
      setCustomers(customersData);
      setFilteredCustomers(customersData); // Initialize filtered list
    };

    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  
    // Filter customers based on search term
    const filtered = customers.filter((customer) => {
      const customerId = customer.customerId || "";
      const name = customer.name || "";
      const phone = customer.phone || "";
  
      return (
        customerId.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term)
      );
    });
  
    setFilteredCustomers(filtered);
  };
  
  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center text-primary">Customers</h3>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Customer ID, Name, or Phone"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Desktop View */}
      <div className="d-none d-md-block">
        <table className="table table-hover table-striped align-middle shadow-sm rounded">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer, index) => (
                <tr key={index}>
                  <td>{customer.customerId}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="d-md-none">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, index) => (
            <div
              key={index}
              className="card mb-3 shadow-sm border-primary"
            >
              <div className="card-body">
                <h5 className="card-title text-primary">Customer ID: {customer.customerId}</h5>
                <p className="card-text">
                  <strong>Name:</strong> {customer.name}
                  <br />
                  <strong>Email:</strong> {customer.email}
                  <br />
                  <strong>Phone:</strong> {customer.phone}
                  <br />
                  <strong>Address:</strong> {customer.address}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No customers found</p>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
