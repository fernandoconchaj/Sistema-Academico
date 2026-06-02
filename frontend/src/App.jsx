import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import TeacherDashboard from './pages/TeacherDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import AdminCourses from './pages/AdminCourses.jsx'
import AdminReports from './pages/AdminReports.jsx'
import AdminConfig from './pages/AdminConfig.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import StudentCalendar from './pages/StudentCalendar.jsx'
import TeacherSchedule from './pages/TeacherSchedule.jsx'
import TeacherEvaluations from './pages/TeacherEvaluations.jsx'
import TeacherZoom from './pages/TeacherZoom.jsx'
import TeacherConfig from './pages/TeacherConfig.jsx'
import StudentChat from './pages/StudentChat.jsx'
import HelpPage from './pages/HelpPage.jsx'
import UserReports from './pages/UserReports.jsx'
import NotFound from './pages/NotFound.jsx'

function getUser() {
  return JSON.parse(localStorage.getItem('sau_user') || 'null')
}

function PrivateRoute({ roles, children }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/login" replace />
  return children
}

function HomeRedirect() {
  const user = getUser()
  if (!user) return <Landing />
  if (user.rol === 'ADMIN') return <Navigate to="/admin" replace />
  if (user.rol === 'DOCENTE') return <Navigate to="/docente" replace />
  return <Navigate to="/estudiante" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/estudiante" element={<PrivateRoute roles={["ESTUDIANTE"]}><StudentDashboard /></PrivateRoute>} />
      <Route path="/estudiante/curso/:id" element={<PrivateRoute roles={["ESTUDIANTE"]}><CourseDetail mode="student" /></PrivateRoute>} />
      <Route path="/estudiante/calendario" element={<PrivateRoute roles={["ESTUDIANTE"]}><StudentCalendar /></PrivateRoute>} />
      <Route path="/estudiante/chat" element={<PrivateRoute roles={["ESTUDIANTE"]}><StudentChat /></PrivateRoute>} />
      <Route path="/estudiante/reportes" element={<PrivateRoute roles={["ESTUDIANTE"]}><UserReports role="ESTUDIANTE" /></PrivateRoute>} />
      <Route path="/estudiante/ayuda" element={<PrivateRoute roles={["ESTUDIANTE"]}><HelpPage /></PrivateRoute>} />
      <Route path="/docente" element={<PrivateRoute roles={["DOCENTE"]}><TeacherDashboard /></PrivateRoute>} />
      <Route path="/docente/curso/:id" element={<PrivateRoute roles={["DOCENTE"]}><CourseDetail mode="teacher" /></PrivateRoute>} />
      <Route path="/docente/horario" element={<PrivateRoute roles={["DOCENTE"]}><TeacherSchedule /></PrivateRoute>} />
      <Route path="/docente/chat" element={<PrivateRoute roles={["DOCENTE"]}><StudentChat role="DOCENTE" /></PrivateRoute>} />
      <Route path="/docente/reportes" element={<PrivateRoute roles={["DOCENTE"]}><UserReports role="DOCENTE" /></PrivateRoute>} />
      <Route path="/docente/evaluaciones" element={<PrivateRoute roles={["DOCENTE"]}><TeacherEvaluations /></PrivateRoute>} />
      <Route path="/docente/zoom" element={<PrivateRoute roles={["DOCENTE"]}><TeacherZoom /></PrivateRoute>} />
      <Route path="/docente/configuracion" element={<PrivateRoute roles={["DOCENTE"]}><TeacherConfig /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute roles={["ADMIN"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/usuarios" element={<PrivateRoute roles={["ADMIN"]}><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/cursos" element={<PrivateRoute roles={["ADMIN"]}><AdminCourses /></PrivateRoute>} />
      <Route path="/admin/reportes" element={<PrivateRoute roles={["ADMIN"]}><AdminReports /></PrivateRoute>} />
      <Route path="/admin/configuracion" element={<PrivateRoute roles={["ADMIN"]}><AdminConfig /></PrivateRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
