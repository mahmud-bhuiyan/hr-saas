import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { HiBell } from 'react-icons/hi2';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './ui/Spinner';

export const NotificationBell = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(user?.tenantId),
    refetchInterval: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: Boolean(user?.tenantId && open),
  });

  if (!user?.tenantId) {
    return null;
  }

  const unreadCount = unreadQuery.data ?? 0;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-white/90 transition hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <HiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void handleMarkAllRead()}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {listQuery.isLoading && (
                <div className="flex justify-center py-8">
                  <Spinner className="h-5 w-5 text-brand-600" />
                </div>
              )}

              {!listQuery.isLoading && (listQuery.data?.length ?? 0) === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
              )}

              {listQuery.data?.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (!notification.readAt) {
                      void handleMarkRead(notification.id);
                    }
                  }}
                  className={`block w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                    notification.readAt ? 'opacity-70' : 'bg-brand-50/40 dark:bg-brand-500/10'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{notification.title}</p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{notification.body}</p>
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
