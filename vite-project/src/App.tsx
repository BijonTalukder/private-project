import './App.css'
import Login from './pages/login/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import MenuManagementWithRTK from './pages/menu-management/MenuManagement'
import { useGetAllMenusQuery } from './api/services/menu/menuApi'
import RequireAuth from './auth/RequireAuth'
import { generateRoutes } from './routes/DynamicRoutes'
import { Suspense, useMemo } from 'react'
import { Spin } from 'antd'


const LoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    <Spin size="large" />
  </div>
)
function App() {
  const { data } = useGetAllMenusQuery();
  const dynamicRoutes = useMemo(() => {
    return data ? generateRoutes(data) : null;
  }, [data]);
  return (
    <BrowserRouter basename='/Anisha'>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={
                  <div style={{ padding: '20px' }}>
                    <h1>Dashboard</h1>
                  </div>
                }
              />

              {/* ✅ Render memoized routes */}
              {dynamicRoutes}

            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
