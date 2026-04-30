import { IonButton, IonContent, IonPage, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import './Auth.css';

const Unauthorized: React.FC = () => {
  const history = useHistory();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <div className="auth-shell">
          <div className="auth-form-container">
            <div className="auth-heading">
              <h1>Access denied</h1>
              <p>
                {user?.role === 'operator'
                  ? 'Your account does not have permission to open this page.'
                  : 'You are signed in, but this route is not available.'}
              </p>
            </div>

            <IonText color="medium" className="status-text text-center">
              Contact an administrator if you need additional access.
            </IonText>

            <div className="actions">
              <IonButton
                expand="block"
                className="login-button"
                onClick={() => history.replace('/dashboard')}
              >
                Back To Dashboard
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Unauthorized;
