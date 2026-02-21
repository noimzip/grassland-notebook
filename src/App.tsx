import LoginPage from "./components/login-page";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  console.log("App rendering");
  return (
    <ThemeProvider defaultTheme="dark" storageKey="grassland-theme">
      <div className="relative min-h-screen">
        <ThemeToggle />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard Placeholder</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
