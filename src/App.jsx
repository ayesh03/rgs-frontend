import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Splash from "./components/Splash";

import TrackProfile from "./modules/TrackProfile";
import TSR from "./modules/TSR";
import Loco from "./modules/Loco";
import Interlocking from "./modules/Interlocking";
import Faults from "./modules/Faults";
import Parameters from "./modules/Parameters";
import Station from "./modules/Station";
import Graph from "./pages/Graph";
import Radio from "./modules/Radio";
import StationaryKavachInfo from "./modules/StationaryKavachInfo";


import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

//  THIS WAS MISSING
import { AppProvider } from "./context/AppContext";
import { Navigate } from "react-router-dom";


function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1800);
  }, []);

  if (loading) return <Splash />;

  return (
    <BrowserRouter>
  <AuthProvider>
    <AppProvider>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        

        {/* ================= PROTECTED ================= */}
        <Route element={<PrivateRoute />}>
          <Route path="/app" element={<MainLayout />}>
          

            {/* Default page AFTER login */}
            <Route index element={<Navigate to="loco" replace />} />

            <Route path="track-profile" element={<TrackProfile />} />
            <Route path="tsr" element={<TSR />} />
            <Route path="loco" element={<Loco />} />
            <Route path="interlocking" element={<Interlocking />} />
            <Route path="faults" element={<Faults />} />
            <Route path="parameters" element={<Parameters />} />
            <Route path="station" element={<Station />} />
            <Route path="graphs" element={<Graph />} />
            <Route path="track-profile/graph" element={<TrackProfile defaultTab="graph" />} />
            <Route path="radio" element={<Radio />} />
            <Route path="StationaryKavachInfo" element={<StationaryKavachInfo />} />


          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </AppProvider>
  </AuthProvider>
</BrowserRouter>

  );
}

export default App;
