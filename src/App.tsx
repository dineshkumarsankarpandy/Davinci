import CanvasApp from './canvas/canvas'
import LoginForm from './modal/login';
import './App.css'
import DisableZoom from './lib/disableZoom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />
  },
  {
    path: '/',
    element: <CanvasApp />
  },
  {
    path: '/canvas',
    element: <CanvasApp />
  },
])

function App() {

  return (

    <div className="w-full">
      <DisableZoom />
      <RouterProvider router={router} />
    </div>
  );
}

export default App
