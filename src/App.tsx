import LoginPage from "./components/login-page";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="grassland-theme">
      <div className="relative min-h-screen">
        <ThemeToggle />
        <LoginPage />
      </div>
    </ThemeProvider>
  );
}

export default App;
