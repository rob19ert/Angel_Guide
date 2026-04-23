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
                    <Route path="/" element={<HomePage />} />
                    <Route path="/title" element={<TitlePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/map" element={<WaterBodyPage />} />
                    <Route path="/fish" element={<FishPage />} />
                    <Route path="/groundbaits" element={<GroundbaitPage />} />
                    <Route path="/lures" element={<LurePage />} />
                    <Route path="/winter" element={<WinterPage />} />
                    <Route path="/water" element={<LakeDetailPage />} />
                    <Route path="/lakes/:id" element={<LakeInfoPage />} />
                    <Route path="/forecast" element={<ForecastPage />} />
                    <Route path="/forum" element={<ForumPage />} />

                    {/* Protected Routes */}
                    <Route path="/guide" element={<ProtectedRoute><GuideMapPage /></ProtectedRoute>} />
                    <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
                    <Route path="/equipment/:id" element={<ProtectedRoute><EquipmentDetailPage /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
                    <Route path="/saved-plan/:id" element={<ProtectedRoute><SavedPlanPage /></ProtectedRoute>} />
                </Routes>
            </RecommendationProvider>
        </AuthProvider>
    );
}

export default App;