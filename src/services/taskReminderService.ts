import { Capacitor } from "@capacitor/core";
import type { Task, TaskReminder } from "@/types";
import { ensureHighPriorityNotificationChannel, HIGH_PRIORITY_NOTIFICATION_CHANNEL_ID } from "@/services/notificationChannelService";

export function getTaskReminderRoute(task: Pick<Task, "moduleKey" | "module_key">) {
  const moduleKey = task.moduleKey ?? task.module_key;
  if (moduleKey === "student") return "/estudante";
  if (moduleKey === "mindfulness") return "/mindfulness";
  return "/tarefas";
}

const reminderMinutes: Record<Exclude<TaskReminder, null>, number> = {
  na_hora: 0,
  "5min": 5,
  "15min": 15,
  "30min": 30,
};

export function getTaskNotificationId(taskId: string, kind: "scheduled" | "reminder" = "scheduled") {
  const value = `${taskId}:${kind}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) & 0x7fffffff || 1;
}

export function getTaskScheduleDate(task: Pick<Task, "date" | "time">) {
  if (!task.date || !task.time) return null;
  const scheduledAt = new Date(`${task.date}T${task.time}:00`);
  if (Number.isNaN(scheduledAt.getTime())) return null;
  return scheduledAt;
}

export function getTaskReminderDate(task: Pick<Task, "date" | "time" | "reminder">) {
  const scheduledAt = getTaskScheduleDate(task);
  if (!scheduledAt || !task.reminder) return null;
  scheduledAt.setMinutes(scheduledAt.getMinutes() - reminderMinutes[task.reminder]);
  return scheduledAt;
}

export async function cancelTaskReminder(taskId: string) {
  if (!Capacitor.isNativePlatform()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({
    notifications: [
      { id: getTaskNotificationId(taskId, "scheduled") },
      { id: getTaskNotificationId(taskId, "reminder") },
    ],
  });
}

export async function scheduleTaskReminder(task: Task, requestPermission = false) {
  if (!Capacitor.isNativePlatform()) return false;

  const scheduledDate = getTaskScheduleDate(task);
  const reminderDate = getTaskReminderDate(task);
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const hasHighPriorityChannel = await ensureHighPriorityNotificationChannel();
  await cancelTaskReminder(task.id);

  if (task.done || !scheduledDate) return false;

  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== "granted" && requestPermission) {
    permission = await LocalNotifications.requestPermissions();
  }
  if (permission.display !== "granted") return false;

  const notifications = [];
  const reminderRoute = getTaskReminderRoute(task);
  if (scheduledDate.getTime() > Date.now()) {
    notifications.push({
      id: getTaskNotificationId(task.id, "scheduled"),
      title: "Um cuidado te espera",
      body: task.title,
      schedule: { at: scheduledDate, allowWhileIdle: true },
      sound: "default",
      autoCancel: true,
      foreground: true,
      isExactNotification: true,
      ...(hasHighPriorityChannel ? { channelId: HIGH_PRIORITY_NOTIFICATION_CHANNEL_ID } : {}),
      extra: { taskId: task.id, route: reminderRoute },
    });
  }

  if (reminderDate && reminderDate.getTime() > Date.now() && reminderDate.getTime() !== scheduledDate.getTime()) {
    notifications.push({
      id: getTaskNotificationId(task.id, "reminder"),
      title: "Daqui a pouco, no seu tempo",
      body: task.title,
      schedule: { at: reminderDate, allowWhileIdle: true },
      sound: "default",
      autoCancel: true,
      foreground: true,
      isExactNotification: true,
      ...(hasHighPriorityChannel ? { channelId: HIGH_PRIORITY_NOTIFICATION_CHANNEL_ID } : {}),
      extra: { taskId: task.id, route: reminderRoute },
    });
  }

  if (!notifications.length) return false;
  await LocalNotifications.schedule({ notifications });
  return true;
}

export async function synchronizeTaskReminders(tasks: Task[]) {
  if (!Capacitor.isNativePlatform()) return;
  await Promise.allSettled(tasks.map((task) => scheduleTaskReminder(task, false)));
}

export async function initializeTaskReminderNavigation() {
  if (!Capacitor.isNativePlatform()) return () => undefined;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const listener = await LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
    const route = notification.extra?.route;
    if (typeof route !== "string" || !route.startsWith("/")) return;
    window.history.pushState({}, "", route);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  return () => void listener.remove();
}
