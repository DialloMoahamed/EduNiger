import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Eleves from "./pages/Eleves";
import Classes from "./pages/Classes";
import Presences from "./pages/Presences";
import Notes from "./pages/Notes";
import Enseignants from "./pages/Enseignants";
import Rapports from "./pages/Rapports";
import Parametres from "./pages/Parametres";
import Profil from "./pages/Profil";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Messagerie from "./pages/Messagerie";
import EmploiDuTemps from "./pages/EmploiDuTemps";
import TeacherEmploiDuTemps from "./pages/TeacherEmploiDuTemps";
import TeacherEnseignants from "./pages/TeacherEnseignants";

// ── Pages espace parent ──────────────────────────────────────────────────────
import LoginParent from "./pages/parent/LoginParent";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentNotes from "./pages/parent/ParentNotes";
import ParentProfil from "./pages/parent/ParentProfil";
import { ParentAbsences, ParentBulletins } from "./pages/parent/ParentAbsencesBulletins";
import ParentEmploiDuTemps from "./pages/parent/ParentEmploiDuTemps";

// ✅ NOUVEAU : page messagerie dédiée à l'espace parent
import ParentMessages from "./pages/parent/ParentMessages";
import Notifications from "./pages/Notifications";

// ── Espace Super Admin ──────────────────────────────────────────────────────
import SuperAdmin from "./pages/superadmin/superadmin";

// ── Layout administration ────────────────────────────────────────────────────
function AppLayout({ children }) {
  const location = useLocation();
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar pathname={location.pathname} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

// ── Route protégée pour l'administration ─────────────────────────────────────
// ⚠️  Ce composant lit useAuth() qui vérifie le token ADMIN.
//     Les routes parent ne doivent PAS passer par ici.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-state" style={{ minHeight: "100vh" }}>
        <div className="spinner"></div>
        <span>Chargement...</span>
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  return <AppLayout>{children}</AppLayout>;
}

// ── Application ──────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Authentification générale ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Espace Parent ──────────────────────────────────────────────
              Ces routes sont protégées par ParentLayout (qui vérifie
              parent_token dans localStorage). Elles NE passent PAS
              par <ProtectedRoute> car celui-ci lit le token admin.
          ─────────────────────────────────────────────────────────────── */}
          <Route path="/parent/login" element={<LoginParent />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/notes" element={<ParentNotes />} />
          <Route path="/parent/absences" element={<ParentAbsences />} />
          <Route path="/parent/bulletins" element={<ParentBulletins />} />
          <Route
            path="/parent/emploi-du-temps"
            element={<ParentEmploiDuTemps />}
          />
          <Route path="/parent/profil" element={<ParentProfil />} />

          {/* ✅ CORRECTION : route /parent/messages ajoutée ici,
              avec ParentMessages (utilise ParentLayout + parent_token).
              Ne passe surtout PAS par <ProtectedRoute> ! */}
          <Route path="/parent/messages" element={<ParentMessages />} />

          {/* ── Espace Administration ───────────────────────────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eleves"
            element={
              <ProtectedRoute>
                <Eleves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/presences"
            element={
              <ProtectedRoute>
                <Presences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enseignants"
            element={
              <ProtectedRoute>
                <Enseignants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rapports"
            element={
              <ProtectedRoute>
                <Rapports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parametres"
            element={
              <ProtectedRoute>
                <Parametres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emploi-du-temps"
            element={
              <ProtectedRoute>
                <EmploiDuTemps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messagerie"
            element={
              <ProtectedRoute>
                <Messagerie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* ── Espace Enseignant (lecture seule) ─────────────────────── */}
          <Route
            path="/teacher/emploi-du-temps"
            element={
              <ProtectedRoute>
                <TeacherEmploiDuTemps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/enseignants"
            element={
              <ProtectedRoute>
                <TeacherEnseignants />
              </ProtectedRoute>
            }
          />

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/" />} />

          {/* ── Espace Super Admin (indépendant, sans layout école) ── */}
          <Route path="/superadmin" element={<SuperAdmin />} />
          <Route path="/superAdmin" element={<SuperAdmin />} />
          <Route path="/superadmin/*" element={<SuperAdmin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;