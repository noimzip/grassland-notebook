import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/login-page";
import DashboardPage from "./components/dashboard-page";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { Toaster } from "sonner";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="grassland-theme">
      <div className="relative min-h-screen font-sans antialiased">
        <Toaster position="bottom-right" richColors closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
