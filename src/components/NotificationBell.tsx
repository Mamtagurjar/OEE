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
  getAllNotifications,
  getUnreadNotifications,
  getReadIds,
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
  const [sessionUnreadIds, setSessionUnreadIds] = useState<Set<string>>(new Set());

  // Recomputed on every render; state updates are only used to trigger re-renders for the timer.
  const unreadCount = getUnreadNotifications().length;
  const allNotifications = getAllNotifications();
  const readSet = getReadIds();

  // Update timers (relative time) while popover is open.
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  const handleOpen = () => {
    const unread = getUnreadNotifications();
    setSessionUnreadIds(new Set(unread.map(n => n.id)));
    setOpen(true);

    if (!markReadOnOpen) return;

    if (unread.length > 0) {
      markManyRead(unread.map(n => n.id));
      setTick((t) => t + 1);
    }
  };

  const renderNotification = (item: NotificationItem) => {
    const isUnread = sessionUnreadIds.has(item.id) || !readSet.has(item.id);

    return (
      <IonItem key={item.id} detail={false} lines="inset" style={{ '--padding-start': '0', '--inner-padding-end': '0', width: '100%', overflowX: 'hidden' }}>
        <IonLabel className="ion-text-wrap" style={{ padding: '8px 4px', margin: 0, width: '100%', overflowX: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ fontWeight: isUnread ? 800 : 600, fontSize: '0.95rem', color: isUnread ? 'var(--ion-color-primary)' : 'inherit', whiteSpace: 'normal', wordBreak: 'break-word', paddingRight: '8px' }}>
              {item.title}
            </div>
            {isUnread && (
              <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'var(--ion-color-primary)', marginTop: 6, flexShrink: 0 }} />
            )}
          </div>
          <div style={{ color: 'var(--ion-color-step-600)', marginTop: 4, fontSize: '0.9rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>{item.message}</div>
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
          setSessionUnreadIds(new Set());
          setTick((t) => t + 1);
        }}
        trigger={triggerId}
        side="bottom"
        alignment="end"
        backdropDismiss={true}
        style={{ '--width': '250px' }}
      >
        <div style={{ width: '100%', padding: '16px 12px', overflowX: 'hidden', boxSizing: 'border-box', minWidth: '250px !important', maxWidth: '250px !important' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--ion-text-color)' }}>Notifications</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ion-color-step-600)', fontWeight: 700 }}>
              {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
            </div>
          </div>

          <style>
            {`
              .notification-scroll-container::-webkit-scrollbar {
                display: block !important;
                width: 6px !important;
              }
              .notification-scroll-container::-webkit-scrollbar-track {
                background: #f1f1f1 !important;
                border-radius: 10px !important;
              }
              .notification-scroll-container::-webkit-scrollbar-thumb {
                background: #cbd5e1 !important;
                border-radius: 10px !important;
              }
              .notification-scroll-container::-webkit-scrollbar-thumb:hover {
                background: #94a3b8 !important;
              }
            `}
          </style>

          <div
            className="notification-scroll-container"
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              overflowX: 'hidden',
              marginTop: 10,
              paddingRight: 4 // Space for the scrollbar
            }}
          >
            {allNotifications.length > 0 ? (
              <IonList inset={false} lines="none" style={{ paddingTop: 0, paddingBottom: 0, background: 'transparent' }}>
                {allNotifications.map(renderNotification)}
              </IonList>
            ) : (
              <div
                style={{
                  padding: '24px 16px',
                  borderRadius: 12,
                  background: 'var(--ion-color-step-50)',
                  border: '1px solid var(--ion-color-step-100)',
                  color: 'var(--ion-color-step-500)',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem'
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
