const priorities = new Set(["alta", "media", "baixa"]);
const reminders = new Set(["na_hora", "5min", "15min", "30min"]);

function optionalText(value, maxLength) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maxLength ? text : null;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function normalizeTaskProposal(functionCall) {
  if (functionCall?.name !== "propose_create_task" || !functionCall.args || typeof functionCall.args !== "object") {
    return null;
  }

  const title = optionalText(functionCall.args.title, 120);
  const description = optionalText(functionCall.args.description, 500);
  const date = optionalText(functionCall.args.date, 10);
  const time = optionalText(functionCall.args.time, 5);
  const priority = optionalText(functionCall.args.priority, 5);
  const reminder = optionalText(functionCall.args.reminder, 7);

  if (!title || description === null || date === null || time === null || priority === null || reminder === null) return null;
  if (date && !isValidDate(date)) return null;
  if (time && !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) return null;
  if (time && !date) return null;
  if (priority && !priorities.has(priority)) return null;
  if (reminder && (!reminders.has(reminder) || !date || !time)) return null;

  return {
    type: "create_task",
    title,
    description,
    date,
    time,
    priority: priority || null,
    reminder: reminder || null,
  };
}
