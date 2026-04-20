import React, { useEffect, useMemo, useState, useId } from 'react';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
} from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import {
  formatRelativeTime,
  getLatestUnreadNotification,
  getUnreadNotifications,
  markManyRead,
  type NotificationItem,
} from '../utils/notifications';

type NotificationBellProps = {
  // If you want to mark items read only on click (instead of open), set this false.
  markReadOnOpen?: boolean;
};

const NotificationBell: React.FC<NotificationBellProps> = ({ markReadOnOpen = true }) => {
  const reactId = useId();
  const triggerId = useMemo(() => `oee-notif-bell-${reactId.replace(/:/g, '')}`,
    // reactId is stable for the lifetime of the component
    [reactId],
  );

  const [isOpen, setOpen] = useState(false);
  const [, setTick] = useState(0);
  const [displayed, setDisplayed] = useState<NotificationItem | null>(null);

  // Recomputed on every render; state updates are only used to trigger re-renders for the timer.
  const unreadCount = getUnreadNotifications().length;
  const latest = getLatestUnreadNotification();
  const toShow = displayed ?? latest;

  // Update timers (relative time) while popover is open.
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  const handleOpen = () => {
    const currentLatest = getLatestUnreadNotification();
    setDisplayed(currentLatest);
    setOpen(true);

    if (!markReadOnOpen || !currentLatest) return;

    // Requirement: once user views/opens notification, don’t show again.
    markManyRead([currentLatest.id]);
    setTick((t) => t + 1);
  };

  const renderNotification = (item: NotificationItem) => {
    return (
      <IonList inset={false} lines="none">
        <IonItem detail={false} lines="none">
          <IonLabel>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.title}</div>
            <div style={{ color: 'var(--ion-color-step-600)', marginTop: 4 }}>{item.message}</div>
            <div
              style={{
                marginTop: 8,
                fontSize: '0.78rem',
                color: 'var(--ion-color-step-500)',
                fontWeight: 700,
                letterSpacing: '0.2px',
              }}
            >
              {formatRelativeTime(item.createdAt)}
            </div>
          </IonLabel>
        </IonItem>
      </IonList>
    );
  };

  return (
    <>
      <IonButtons slot="end">
        <IonButton
          id={triggerId}
          onClick={handleOpen}
          aria-label="Notifications"
        >
          <IonIcon icon={notificationsOutline} slot="icon-only" />
          {unreadCount > 0 ? (
            <IonBadge
              color="danger"
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                minWidth: 16,
                height: 16,
                padding: 0,
                borderRadius: 999,
                display: 'grid',
                placeItems: 'center',
                fontSize: 10,
                lineHeight: '16px',
                pointerEvents: 'none',
              }}
            >
              {Math.min(9, unreadCount)}
            </IonBadge>
          ) : null}
        </IonButton>
      </IonButtons>

      <IonPopover
        isOpen={isOpen}
        onDidDismiss={() => {
          setOpen(false);
          setDisplayed(null);
          setTick((t) => t + 1);
        }}
        trigger={triggerId}
        side="bottom"
        alignment="end"
        backdropDismiss={true}
      >
        <div style={{ width: 320, maxWidth: '90vw', padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: '1rem' }}>Notifications</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ion-color-step-500)', fontWeight: 700 }}>
              {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            {toShow ? (
              renderNotification(toShow)
            ) : (
              <div
                style={{
                  padding: '18px 12px',
                  borderRadius: 12,
                  background: 'var(--ion-color-step-50)',
                  border: '1px solid var(--ion-color-step-100)',
                  color: 'var(--ion-color-step-600)',
                  fontWeight: 700,
                }}
              >
                No new notifications.
              </div>
            )}
          </div>
        </div>
      </IonPopover>
    </>
  );
};

export default NotificationBell;
