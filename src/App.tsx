import React, { Suspense, lazy } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import PrivateRoute from './auth/PrivateRoute';
import PublicRoute from './auth/PublicRoute';
import { useAppSelector } from './redux/hooks';
import RouteLoading from './components/RouteLoading';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const EnergyDashboard = lazy(() => import('./pages/EnergyDashboard'));
const PowerMonitoring = lazy(() => import('./pages/PowerMonitoring'));
const MachineComparison = lazy(() => import('./pages/MachineComparison'));
const SystemAlerts = lazy(() => import('./pages/SystemAlerts'));
const OEEDashboard = lazy(() => import('./pages/OEEDashboard'));
const MaintenanceLog = lazy(() => import('./pages/MaintenanceLog'));
const ShiftProduction = lazy(() => import('./pages/ShiftProduction'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const AppMenu = lazy(() => import('./components/AppMenu'));

const App: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          {isAuthenticated ? (
            <Suspense fallback={null}>
              <AppMenu />
            </Suspense>
          ) : null}
          <Suspense fallback={<RouteLoading />}>
            <IonRouterOutlet id="main">
              <PublicRoute exact path="/login">
                <Login />
              </PublicRoute>
              <PublicRoute exact path="/signup">
                <Signup />
              </PublicRoute>
              <PublicRoute exact path="/forgot-password">
                <ForgotPassword />
              </PublicRoute>

              <PrivateRoute exact path="/dashboard">
                <EnergyDashboard />
              </PrivateRoute>

              <PrivateRoute exact path="/power">
                <PowerMonitoring />
              </PrivateRoute>

              <PrivateRoute exact path="/compare">
                <MachineComparison />
              </PrivateRoute>

              <PrivateRoute exact path="/oee">
                <OEEDashboard />
              </PrivateRoute>

              <PrivateRoute exact path="/shift">
                <ShiftProduction />
              </PrivateRoute>

              <PrivateRoute exact path="/maintenance" allowedRoles={['admin']}>
                <MaintenanceLog />
              </PrivateRoute>

              <PrivateRoute exact path="/alerts" allowedRoles={['admin']}>
                <SystemAlerts />
              </PrivateRoute>

              <PrivateRoute exact path="/unauthorized">
                <Unauthorized />
              </PrivateRoute>

              <Route exact path="/">
                <Redirect to={isAuthenticated ? '/dashboard' : '/login'} />
              </Route>
            </IonRouterOutlet>
          </Suspense>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
