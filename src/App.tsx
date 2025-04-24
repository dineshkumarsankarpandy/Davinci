import CanvasApp from './canvas/canvas'
import LoginForm from './regsitration/login';
import './App.css'
import DisableZoom from './lib/disableZoom';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import AuthGuard from './utils/authGaurd';
import GuestGuard from './utils/guestGuard';
import LandingPage from './landingPage/page';
import { Dashboard } from './dashboard/dashboard';
import { Toaster } from 'react-hot-toast';
import DesignReview from './review-design';
import { Sidebar } from './dashboard/sidebar'; 
import RegistrationForm from './regsitration/signIn';

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
    element:( 
      <GuestGuard>
    <LoginForm />
    </GuestGuard>
  )
  },
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path:'/sign-in',
    element:(
      <GuestGuard>
    <RegistrationForm/>
      </GuestGuard>
    )
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