import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Home from './components/home/Home'; 
import { AuthProvider } from './components/contextProviders/AuthContext';

import router from './components/routers/AppRouter';
import { RouterProvider } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  );
}

export default App;
