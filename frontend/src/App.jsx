import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RecommendationProvider } from './context/RecommendationContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import WaterBodyPage from './pages/WaterBodyPage';
import FishPage from './pages/FishPage';
import GroundbaitPage from './pages/GroundbaitPage';
import LurePage from './pages/LurePage';
import GuideMapPage from './pages/GuideMapPage';
import WinterPage from './pages/WinterPage';
import InventoryPage from "./pages/InventoryPage.jsx";
import EquipmentPage from "./pages/EquipmentPage.jsx";
import EquipmentDetailPage from "./pages/EquipmentDetailPage.jsx";
import LakeDetailPage from "./pages/LakeDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LakeInfoPage from "./pages/ExperimentPage.jsx";
import ForecastPage from "./pages/ForecastPage.jsx";
import ForumPage from "./pages/ForumPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import SavedPlanPage from "./pages/SavedPlanPage.jsx";

import TitlePage from "./pages/TitlePage.jsx";

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
    return (
        <AuthProvider>
            <RecommendationProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/Angel_Guide/" element={<HomePage />} />
                    <Route path="/Angel_Guide/title" element={<TitlePage />} />
                    <Route path="/Angel_Guide/login" element={<LoginPage />} />
                    <Route path="/Angel_Guide/register" element={<RegisterPage />} />
                    <Route path="/Angel_Guide/map" element={<WaterBodyPage />} />
                    <Route path="/Angel_Guide/fish" element={<FishPage />} />
                    <Route path="/Angel_Guide/groundbaits" element={<GroundbaitPage />} />
                    <Route path="/Angel_Guide/lures" element={<LurePage />} />
                    <Route path="/Angel_Guide/winter" element={<WinterPage />} />
                    <Route path="/Angel_Guide/water" element={<LakeDetailPage />} />
                    <Route path="/Angel_Guide/lakes/:id" element={<LakeInfoPage />} />
                    <Route path="/Angel_Guide/forecast" element={<ForecastPage />} />
                    <Route path="/Angel_Guide/forum" element={<ForumPage />} />

                    {/* Protected Routes */}
                    <Route path="/Angel_Guide/guide" element={<ProtectedRoute><GuideMapPage /></ProtectedRoute>} />
                    <Route path="/Angel_Guide/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
                    <Route path="/Angel_Guide/equipment/:id" element={<ProtectedRoute><EquipmentDetailPage /></ProtectedRoute>} />
                    <Route path="/Angel_Guide/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                    <Route path="/Angel_Guide/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/Angel_Guide/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
                    <Route path="/Angel_Guide/saved-plan/:id" element={<ProtectedRoute><SavedPlanPage /></ProtectedRoute>} />
                </Routes>
            </RecommendationProvider>
        </AuthProvider>
    );
}

export default App;