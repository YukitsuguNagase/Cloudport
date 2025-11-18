import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import JobList from './pages/Jobs/JobList'
import JobDetail from './pages/Jobs/JobDetail'
import JobForm from './pages/Jobs/JobForm'
import JobEdit from './pages/Jobs/JobEdit'
import ApplicationList from './pages/Applications/ApplicationList'
import ApplicantList from './pages/Applications/ApplicantList'
import ConversationList from './pages/Messages/ConversationList'
import ChatRoom from './pages/Messages/ChatRoom'
import ContractList from './pages/Contracts/ContractList'
import ContractDetail from './pages/Contracts/ContractDetail'
import MyPage from './pages/Profile/MyPage'
import ProfileEdit from './pages/Profile/ProfileEdit'
import PaymentList from './pages/Payments/PaymentList'
import EngineerProfileView from './pages/Users/EngineerProfileView'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected routes - with layout */}
          <Route path="/jobs" element={<Layout><JobList /></Layout>} />
          <Route path="/jobs/:jobId" element={<Layout><JobDetail /></Layout>} />
          <Route path="/jobs/new" element={<Layout><JobForm /></Layout>} />
          <Route path="/jobs/:jobId/edit" element={<Layout><JobEdit /></Layout>} />

          <Route path="/applications" element={<Layout><ApplicationList /></Layout>} />
          <Route path="/jobs/:jobId/applicants" element={<Layout><ApplicantList /></Layout>} />

          <Route path="/messages" element={<Layout><ConversationList /></Layout>} />
          <Route path="/messages/:conversationId" element={<Layout><ChatRoom /></Layout>} />

          <Route path="/contracts" element={<Layout><ContractList /></Layout>} />
          <Route path="/contracts/:contractId" element={<Layout><ContractDetail /></Layout>} />

          <Route path="/profile" element={<Layout><MyPage /></Layout>} />
          <Route path="/profile/edit" element={<Layout><ProfileEdit /></Layout>} />

          <Route path="/users/:userId" element={<Layout><EngineerProfileView /></Layout>} />

          <Route path="/payments" element={<Layout><PaymentList /></Layout>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
