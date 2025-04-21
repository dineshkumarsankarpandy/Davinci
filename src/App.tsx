import CanvasApp from './canvas/canvas'
import LoginForm from './modal/login';
import './App.css'
import DisableZoom from './lib/disableZoom';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import AuthGuard from './utils/authGaurd';
import LandingPage from './landingPage/page';
import { Dashboard } from './dashboard/dashboard';
import { Toaster } from 'react-hot-toast';
import DesignReview from './review-design';
import { Sidebar } from './dashboard/sidebar'; // Adjust the import path as needed

// Layout component with Sidebar
const DashboardLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />
  },
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/canvas/:projectId',
    element: <CanvasApp />
  },
  
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />
          },
       
          {
            path: '/review-design',
            element: <DesignReview />
          }
        ]
      }
    ]
  }
])

function App() {
  return (
    <div className="w-full">
      <DisableZoom />
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App