import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationSettings } from "./NotificationSettings";

const mocks = vi.hoisted(() => ({
  enablePushNotifications: vi.fn(),
  getPushNotificationState: vi.fn(),
  getTasks: vi.fn(async () => []),
  synchronizeTaskReminders: vi.fn(async () => undefined),
  synchronizeHydrationReminders: vi.fn(async () => true),
}));

vi.mock("@/services/oneSignalService", () => ({
  isOneSignalConfigured: () => true,
  enablePushNotifications: mocks.enablePushNotifications,
  getPushNotificationState: mocks.getPushNotificationState,
}));

vi.mock("@/services/tasksService", () => ({ getTasks: mocks.getTasks }));
vi.mock("@/services/taskReminderService", () => ({ synchronizeTaskReminders: mocks.synchronizeTaskReminders }));
vi.mock("@/services/hydrationReminderService", () => ({ synchronizeHydrationReminders: mocks.synchronizeHydrationReminders }));

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  mocks.getPushNotificationState.mockResolvedValue({
    configured: true,
    supported: true,
    permission: true,
    optedIn: true,
    enabled: true,
  });
  mocks.enablePushNotifications.mockResolvedValue({
    configured: true,
    supported: true,
    permission: true,
    optedIn: true,
    enabled: true,
  });
});

describe("NotificationSettings", () => {
  it("reúne permissão, avisos e lembretes em uma única seção", async () => {
    render(<NotificationSettings />);

    expect(screen.getByRole("heading", { name: "Notificações e lembretes" })).toBeInTheDocument();
    expect(await screen.findByText("Ativadas")).toBeInTheDocument();
    expect(screen.getByLabelText("Som das notificações")).toHaveValue("device");
    expect(screen.getByLabelText("Som dos lembretes")).toHaveValue("gentle");
  });

  it("oculta o som separado quando o usuário escolhe o mesmo toque", async () => {
    render(<NotificationSettings />);
    await screen.findByText("Ativadas");

    fireEvent.click(screen.getByRole("switch", { name: "Usar o mesmo som nos lembretes" }));

    expect(screen.queryByLabelText("Som dos lembretes")).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("alumia_notification_preferences_v1") ?? "{}")).toMatchObject({
      useSameSoundForReminders: true,
    });
  });

  it("solicita permissão quando as notificações ainda não estão ativas", async () => {
    mocks.getPushNotificationState.mockResolvedValueOnce({
      configured: true,
      supported: true,
      permission: false,
      optedIn: false,
      enabled: false,
    });
    render(<NotificationSettings />);

    const activate = await screen.findByRole("button", { name: "Ativar" });
    fireEvent.click(activate);

    await waitFor(() => expect(mocks.enablePushNotifications).toHaveBeenCalledOnce());
    expect(await screen.findByText("Ativadas")).toBeInTheDocument();
  });
});
