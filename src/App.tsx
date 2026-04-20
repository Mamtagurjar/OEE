import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { getActiveUser } from './auth/auth';
import PrivateRoute from './auth/PrivateRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import EnergyDashboard from './pages/EnergyDashboard';
import PowerMonitoring from './pages/PowerMonitoring';
import MachineComparison from './pages/MachineComparison';
import SystemAlerts from './pages/SystemAlerts';
import OEEDashboard from './pages/OEEDashboard';
import MaintenanceLog from './pages/MaintenanceLog';
import ShiftProduction from './pages/ShiftProduction';
import AppMenu from './components/AppMenu';

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

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonSplitPane contentId="main">
        <AppMenu />
        <IonRouterOutlet id="main">
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/signup">
            <Signup />
          </Route>
          <Route exact path="/forgot-password">
            <ForgotPassword />
          </Route>



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

          <PrivateRoute exact path="/maintenance">
            <MaintenanceLog />
          </PrivateRoute>

          <PrivateRoute exact path="/alerts">
            <SystemAlerts />
          </PrivateRoute>

          <Route exact path="/">
            <Redirect to={getActiveUser() ? '/dashboard' : '/login'} />
          </Route>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;
