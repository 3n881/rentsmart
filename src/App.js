// import React, { useState } from "react";
// import UnifiedForm from "./components/UnifiedForm";
// import Dashboard from "./components/Dashboard";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";



// const App = () => {
//   const [view, setView] = useState("form");

//   return (
//     <div>
//       <nav className="navbar navbar-expand-lg navbar-light bg-light">
//         <div className="container-fluid">
//           <a className="navbar-brand" href="/">Rental Management</a>
//           <div>
//             <button
//               className="btn btn-primary me-2"
//               onClick={() => setView("form")}
//             >
//               Add Customer & Order
//             </button>
//             <button
//               className="btn btn-secondary"
//               onClick={() => setView("dashboard")}
//             >
//               View Dashboard
//             </button>
//           </div>
//         </div>
//       </nav>
//       {view === "form" ? <UnifiedForm /> : <Dashboard />}
//     </div>
//   );
// };

// export default App;
import React, { useState } from "react";
import UnifiedForm from "./components/UnifiedForm";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./context/AuthProvider";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const App = () => {
  const [view, setView] = useState("form");
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Rental Management</a>
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={() => setView("form")}
            >
              Add Customer & Order
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setView("dashboard")}
            >
              View Dashboard
            </button>
          </div>
        </div>
      </nav>
      {view === "form" ? <UnifiedForm /> : <Dashboard />}
    </div>
  );
};

export default App;
