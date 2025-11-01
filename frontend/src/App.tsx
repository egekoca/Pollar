import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import VotePoolPage from "./pages/VotePoolPage";
import VotingPage from "./pages/VotingPage";
import MyProfilePage from "./pages/MyProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-profile" element={<CreateProfilePage />} />
        <Route path="/vote-pools" element={<VotePoolPage />} />
        <Route path="/voting/:id" element={<VotingPage />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
