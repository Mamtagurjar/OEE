import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonRouterLink,
  IonText,
} from '@ionic/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  LoginFormData,
  getActiveUser,
  initializeUsers,
  loginUser,
  validateLogin,
} from '../auth/auth';
import './Auth.css';

type StatusTone = 'success' | 'error' | 'neutral';

interface StatusMessage {
  tone: StatusTone;
  text: string;
}

const Login: React.FC = () => {
  const history = useHistory();

  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginFormData, boolean>>
  >({});

  useEffect(() => {
    initializeUsers();

    if (getActiveUser()) {
      history.replace('/dashboard');
    }
  }, [history]);

  const errors = useMemo(() => validateLogin(loginData), [loginData]);
  const hasErrors = Object.keys(errors).length > 0;

  const statusColor =
    status?.tone === 'error'
      ? 'danger'
      : status?.tone === 'success'
        ? 'success'
        : 'medium';

  const setField = (field: keyof LoginFormData, value: string): void => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    setStatus(null);
  };

  const markTouched = (field: keyof LoginFormData): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (hasErrors) {
      setStatus({ tone: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }

    const result = loginUser(loginData);
    if (!result.ok) {
      setStatus({ tone: 'error', text: result.message });
      return;
    }

    setStatus({
      tone: 'success',
      text: `Welcome, ${result.user.name}!`,
    });
    history.push('/dashboard');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <div className="auth-shell">
          <div className="auth-form-container">
            <div className="app-logo-placeholder">
              <img src="/OEE.png" alt="OEE logo" className="app-logo-image" />
            </div>
            
            <div className="auth-heading">
              <h1>Welcome Back!</h1>
              <p>Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              <IonItem className="input-item" lines="none">
                <IonLabel position="stacked" className="input-label">Email</IonLabel>
                <IonInput
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  placeholder="demo@gmail.com"
                  value={loginData.email}
                  onIonInput={(event) =>
                    setField('email', event.detail.value ?? '')
                  }
                  onIonBlur={() => markTouched('email')}
                  clearInput
                />
              </IonItem>
              {touched.email && errors.email ? (
                <IonNote color="danger" className="inline-error">
                  {errors.email}
                </IonNote>
              ) : null}

              <IonItem className="input-item" lines="none">
                <IonLabel position="stacked" className="input-label">Password</IonLabel>
                <IonInput
                  type="password"
                  clearOnEdit={false}
                  autocomplete="current-password"
                  placeholder="Enter password"
                  value={loginData.password}
                  onIonInput={(event) =>
                    setField('password', event.detail.value ?? '')
                  }
                  onIonBlur={() => markTouched('password')}
                />
              </IonItem>
              {touched.password && errors.password ? (
                <IonNote color="danger" className="inline-error">
                  {errors.password}
                </IonNote>
              ) : null}

              <div className="forgot-password-link">
                <IonRouterLink routerLink="/forgot-password">Forgot Password?</IonRouterLink>
              </div>

              <div className="actions">
                <IonButton expand="block" type="submit" className="login-button">
                  Sign In
                </IonButton>
              </div>
            </form>

            {status ? (
              <IonText color={statusColor} className="status-text text-center">
                {status.text}
              </IonText>
            ) : null}

            {/* <div className="link-row">
              <span className="no-account-text">Don't have an account? </span>
              <IonButton
                routerLink="/signup"
                fill="clear"
                size="small"
                className="signup-button"
              >
                Sign Up
              </IonButton>
            </div> */}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

