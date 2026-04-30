import React from 'react';
import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';

const RouteLoading: React.FC = () => {
  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={{
          '--background': '#f8fafc',
        }}
      >
        <div
          style={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
          }}
        >
          <IonSpinner name="crescent" color="primary" />
          <IonText color="medium">Loading page...</IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RouteLoading;
