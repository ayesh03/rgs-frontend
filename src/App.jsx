import { HashRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Splash from "./components/Splash";

import TrackProfile from "./modules/TrackProfile";
// import TSR from "./modules/TSR";
import Loco from "./modules/Loco";
import Interlocking from "./modules/Interlocking";
import Faults from "./modules/Faults";
import Parameters from "./modules/Parameters";
import Station from "./modules/Station";
import Graph from "./pages/Graph";
import Radio from "./modules/Radio";
import StationaryKavachInfo from "./modules/StationaryKavachInfo";
import Health from "./modules/StationaryHealth";
import RSSI from "./modules/RSSI";
import TSRMS from "./modules/TSRMS";
import AdjacentKavachInfo from "./modules/AdjacentKavachInfo";
import DMI from "./modules/DMI";
import TagData from "./modules/TagData";
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
    <HashRouter>
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
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                <Route path="track-profile" element={<TrackProfile />} />
                {/* <Route path="tsr" element={<TSR />} /> */}
                <Route path="loco" element={<Loco />} />
                <Route path="interlocking" element={<Interlocking />} />
                <Route path="faults" element={<Faults />} />
                <Route path="parameters" element={<Parameters />} />
                <Route path="station" element={<Station />} />
                <Route path="graphs" element={<Graph />} />
                <Route path="track-profile/graph" element={<TrackProfile defaultTab="graph" />} />
                <Route path="radio" element={<Radio />} />
                <Route path="health" element={<Health />} />
                <Route path="rssi" element={<RSSI />} />
                <Route path="tsrms" element={<TSRMS />} />
                <Route path="adjacent-kavach" element={<AdjacentKavachInfo />} />
                <Route path="dmi" element={<DMI />} />
                <Route path="tag-data" element={<TagData />} />

                <Route path="StationaryKavachInfo" element={<StationaryKavachInfo />} />


              </Route>
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </AppProvider>
      </AuthProvider>
    </HashRouter>

  );
}

export default App;
