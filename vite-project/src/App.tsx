import './App.css'
import Login from './pages/login/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import MenuManagementWithRTK from './pages/menu-management/MenuManagement'
import { useGetAllMenusQuery } from './api/services/menu/menuApi'
import RequireAuth from './auth/RequireAuth'
import { generateRoutes } from './routes/DynamicRoutes'

function App() {
  const { data } = useGetAllMenusQuery();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<h1>Dashboard</h1>} />

            {data && generateRoutes(data)}

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
