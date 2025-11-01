import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import VotePoolPage from "./pages/VotePoolPage";
import VotingPage from "./pages/VotingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vote-pools" element={<VotePoolPage />} />
        <Route path="/voting/:id" element={<VotingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
