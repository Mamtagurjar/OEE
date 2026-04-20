import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonText,
} from '@ionic/react';
import { FormEvent, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  SignupFormData,
  initializeUsers,
  signupUser,
  validateSignup,
} from '../auth/auth';
import './Auth.css';

type StatusTone = 'success' | 'error' | 'neutral';

interface StatusMessage {
  tone: StatusTone;
  text: string;
}

const Signup: React.FC = () => {
  const history = useHistory();

  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [users] = useState(() => initializeUsers());
  const [signupData, setSignupData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof SignupFormData, boolean>>
  >({});

  const errors = useMemo(() => validateSignup(signupData, users), [signupData, users]);
  const hasErrors = Object.keys(errors).length > 0;

  const statusColor =
    status?.tone === 'error'
      ? 'danger'
      : status?.tone === 'success'
        ? 'success'
        : 'medium';

  const setField = (field: keyof SignupFormData, value: string): void => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    setStatus(null);
  };

  const markTouched = (field: keyof SignupFormData): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (hasErrors) {
      setStatus({ tone: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }

    const result = signupUser(signupData);
    if (!result.ok) {
      setStatus({ tone: 'error', text: result.message });
      return;
    }

    setStatus({
      tone: 'success',
      text: 'Account created (saved in local storage). Please login.',
    });

    history.replace('/login');
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
              <h1>Create account</h1>
              <p>Join us and get started</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              <IonItem className="input-item" lines="none">
                <IonLabel position="stacked" className="input-label">Full Name</IonLabel>
                <IonInput
                  type="text"
                  autocomplete="name"
                  placeholder="Your name"
                  value={signupData.fullName}
                  onIonInput={(event) =>
                    setField('fullName', event.detail.value ?? '')
                  }
                  onIonBlur={() => markTouched('fullName')}
                />
              </IonItem>
              {touched.fullName && errors.fullName ? (
                <IonNote color="danger" className="inline-error">
                  {errors.fullName}
                </IonNote>
              ) : null}

              <IonItem className="input-item" lines="none">
                <IonLabel position="stacked" className="input-label">Email</IonLabel>
                <IonInput
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  placeholder="name@example.com"
                  value={signupData.email}
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
                  autocomplete="new-password"
                  placeholder="Strong password"
                  value={signupData.password}
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

              <IonItem className="input-item" lines="none">
                <IonLabel position="stacked" className="input-label">Confirm Password</IonLabel>
                <IonInput
                  type="password"
                  clearOnEdit={false}
                  autocomplete="new-password"
                  placeholder="Repeat password"
                  value={signupData.confirmPassword}
                  onIonInput={(event) =>
                    setField('confirmPassword', event.detail.value ?? '')
                  }
                  onIonBlur={() => markTouched('confirmPassword')}
                />
              </IonItem>
              {touched.confirmPassword && errors.confirmPassword ? (
                <IonNote color="danger" className="inline-error">
                  {errors.confirmPassword}
                </IonNote>
              ) : null}

              <div className="actions">
                <IonButton expand="block" type="submit" className="login-button">
                  Create Account
                </IonButton>
              </div>
            </form>

            {status ? (
              <IonText color={statusColor} className="status-text text-center">
                {status.text}
              </IonText>
            ) : null}

            <div className="link-row">
              <span className="no-account-text">Already have an account? </span>
              <IonButton routerLink="/login" fill="clear" size="small" className="signup-button">
                Sign In
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
