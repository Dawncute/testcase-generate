import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ProjectDetail from './pages/ProjectDetail';

// Các component nội dung con (Tạo nhanh để test)
const Dashboard = () => (
    <div className="bg-white p-6 rounded shadow h-[1000px]"> {/* h-1000px để test cuộn */}
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p>Nội dung trang Dashboard dài để test thanh cuộn...</p>
    </div>
);
const Projects = () => <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold">Danh sách Projects</h2></div>;
const Settings = () => <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold">Cài đặt hệ thống</h2></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* --- ROUTE LỒNG NHAU (NESTED ROUTES) --- */}
        <Route path="/home" element={<Home />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Route động cho Project: :id là tham số thay đổi */}
            <Route path="project/:id" element={<ProjectDetail />} /> 
            
            <Route path="profile" element={<Profile />} />
            <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;