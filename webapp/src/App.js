import React from 'react';
import { AuthProvider } from './components/contextProviders/AuthContext';

import router from './components/routers/AppRouter';
import { RouterProvider } from 'react-router';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  );
}

export default App;
