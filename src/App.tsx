import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import RecommendationPage from "./pages/RecommendationPage";
import DiagnosisPage from "./pages/DiagnosisPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/recommend" element={<RecommendationPage />} />
        <Route path="/diagnose" element={<DiagnosisPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
