import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Channels from "./pages/Channels";
import Messages from "./pages/Messages";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/channels" element={<Channels />} />
		 <Route path="/chat/:name" element={<Messages />} /> 
      </Routes>
    </Router>
  );
}
