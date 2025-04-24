import { Game } from '../game/Game';
import { Home } from '../home/Home';
import { UserProfile } from '../userMenu/UserProfile';
import { GameResults } from '../game/GameResults';
import { Login } from '../Login';
import { AddUser } from '../AddUser';
import { Navigate, createBrowserRouter } from 'react-router';
import { AuthRoute } from './AuthRoute';
import { GameConfigProvider } from '../contextProviders/GameConfigProvider';
import { PrivateRouter } from './PrivateRouter';
import {NotAuthorizedRouter} from './NotAuthorizedRouter';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/game',
    element: <GameConfigProvider><Game /></GameConfigProvider>
  },
  {
    path: '/user',
    element: <PrivateRouter><UserProfile/></PrivateRouter>
  },
  {
    path: '/game/results',
    element: <GameResults />
  },
  {
    path: '/login',
    element: <NotAuthorizedRouter><AuthRoute><Login /></AuthRoute></NotAuthorizedRouter>
  },
  {
    path: '/addUser',
    element: <NotAuthorizedRouter><AuthRoute><AddUser /></AuthRoute></NotAuthorizedRouter>
  }
]);

export default router;