import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import AppRouter from "./router/AppRouter";
import "./index.css";
import { Toaster } from "react-hot-toast";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRouter />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </BrowserRouter>
  </AuthProvider>
);

export default App;





// import { BrowserRouter } from "react-router-dom";
// // import AuthProvider from "./context/AuthProvider";
// import { AuthProvider } from "./context/AuthProvider";
// import AppRouter from "./router/AppRouter";
// import "./index.css";
// import { Toaster } from "react-hot-toast";

// const App = () => (
//   <BrowserRouter>
//     <AuthProvider>
//       <AppRouter />
//       <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
//     </AuthProvider>
//   </BrowserRouter>
// );

// export default App;
