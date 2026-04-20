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
  ForgotPasswordFormData,
  initializeUsers,
  resetPassword,
  validateForgotPassword,
} from '../auth/auth';
import './Auth.css';

type StatusTone = 'success' | 'error' | 'neutral';

interface StatusMessage {
  tone: StatusTone;
  text: string;
}

const ForgotPassword: React.FC = () => {
  const history = useHistory();

  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [users] = useState(() => initializeUsers());
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof ForgotPasswordFormData, boolean>>
  >({});

  const errors = useMemo(
    () => validateForgotPassword(formData, users),
    [formData, users],
  );
  const hasErrors = Object.keys(errors).length > 0;

  const statusColor =
    status?.tone === 'error'
      ? 'danger'
      : status?.tone === 'success'
        ? 'success'
        : 'medium';

  const setField = (field: keyof ForgotPasswordFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatus(null);
  };

  const markTouched = (field: keyof ForgotPasswordFormData): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true });

    if (hasErrors) {
      setStatus({ tone: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }

    const result = resetPassword(formData);
    if (!result.ok) {
      setStatus({ tone: 'error', text: result.message });
      return;
    }

    setStatus({
      tone: 'success',
      text: 'Password updated successfully. Please login with your new password.',
    });

    setTimeout(() => {
      history.replace('/login');
    }, 2000);
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
              <h1>Reset Password</h1>
              <p>Enter your email and a new password</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              <IonItem className="input-item" lines="none">
                <IonLabel position="stacked" className="input-label">Email</IonLabel>
                <IonInput
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  placeholder="name@example.com"
                  value={formData.email}
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
                <IonLabel position="stacked" className="input-label">New Password</IonLabel>
                <IonInput
                  type="password"
                  clearOnEdit={false}
                  autocomplete="new-password"
                  placeholder="Strong password"
                  value={formData.password}
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
                  placeholder="Repeat new password"
                  value={formData.confirmPassword}
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
                  Reset Password
                </IonButton>
              </div>
            </form>

            {status ? (
              <IonText color={statusColor} className="status-text text-center" style={{ display: 'block', marginTop: '15px' }}>
                {status.text}
              </IonText>
            ) : null}

            <div className="link-row">
              <span className="no-account-text">Remembered your password? </span>
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

export default ForgotPassword;