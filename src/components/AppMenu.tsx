import React from 'react';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonFooter,
  useIonAlert
} from '@ionic/react';

import { useLocation, useHistory } from 'react-router-dom';
import {
  hardwareChipOutline,
  pulseOutline,
  warningOutline,
  barChartOutline,
  logOutOutline,
  analyticsOutline,
  timerOutline,
  constructOutline
} from 'ionicons/icons';
import './AppMenu.css';
import { clearSession } from '../auth/auth';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Energy Consumption',
    url: '/dashboard',
    iosIcon: hardwareChipOutline,
    mdIcon: hardwareChipOutline
  },
  {
    title: 'Power Monitoring',
    url: '/power',
    iosIcon: pulseOutline,
    mdIcon: pulseOutline
  },
  {
    title: 'Machine Comparison',
    url: '/compare',
    iosIcon: barChartOutline,
    mdIcon: barChartOutline
  },
  {
    title: 'Efficiency Analytics',
    url: '/oee',
    iosIcon: analyticsOutline,
    mdIcon: analyticsOutline
  },
  {
    title: 'Shift Summary',
    url: '/shift',
    iosIcon: timerOutline,
    mdIcon: timerOutline
  },
  {
    title: 'Maintenance Log',
    url: '/maintenance',
    iosIcon: constructOutline,
    mdIcon: constructOutline
  },
  {
    title: 'System Alerts',
    url: '/alerts',
    iosIcon: warningOutline,
    mdIcon: warningOutline
  }
];

const AppMenu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const [presentAlert] = useIonAlert();

  const handleLogout = () => {
    presentAlert({
      header: 'Log Out',
      message: 'Are you sure you want to log out of your account?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Log Out',
          role: 'confirm',
          handler: () => {
            clearSession();
            history.push('/login');
          },
        },
      ],
    });
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <div className="menu-header">
          <img src="/OEE.png" alt="OEE logo" className="menu-logo" />
          <IonLabel className="menu-title-main">OEE</IonLabel>
        </div>

        <IonList className="menu-content-list" lines="none">
          {appPages.map((appPage, index) => {
            const isActive = location.pathname.startsWith(appPage.url);
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={`menu-item ${isActive ? 'selected' : ''}`}
                  routerLink={appPage.url}
                  routerDirection="root"
                  lines="none"
                  detail={false}
                >
                  <IonIcon
                    slot="start"
                    ios={appPage.iosIcon}
                    md={appPage.mdIcon}
                    className="menu-item-icon"
                  />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>

      <IonFooter className="menu-footer">
        <IonMenuToggle autoHide={false}>
          <IonItem button onClick={handleLogout} className="logout-item" lines="none">
            <IonIcon slot="start" icon={logOutOutline} />
            <IonLabel>Logout</IonLabel>
          </IonItem>
        </IonMenuToggle>
      </IonFooter>
    </IonMenu>
  );
};

export default AppMenu;