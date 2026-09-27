import { describe, expect, it } from "vitest";
import { formatFocusTime, getReviewDate, getUpcomingCommitments, sortStudentCommitments } from "./student";
import type { StudentCommitment } from "@/types";

function commitment(id: string, date: string, done = false): StudentCommitment {
  return {
    id,
    title: id,
    date,
    done,
    module_key: "student",
    studentDetails: { academicType: "reading", estimatedMinutes: 25, subjectId: null, subject: null },
  };
}

describe("student domain", () => {
  it("mantém compromissos pendentes em ordem e concluídos por último", () => {
    const result = sortStudentCommitments([
      commitment("concluída", "2026-09-20", true),
      commitment("depois", "2026-09-28"),
      commitment("antes", "2026-09-27"),
    ]);
    expect(result.map((item) => item.id)).toEqual(["antes", "depois", "concluída"]);
  });

  it("formata o contador sem permitir valor negativo", () => {
    expect(formatFocusTime(1122)).toBe("18:42");
    expect(formatFocusTime(-2)).toBe("00:00");
  });

  it("calcula revisão usando a data local", () => {
    expect(getReviewDate(3, new Date(2026, 8, 26, 18))).toBe("2026-09-29");
  });

  it("mantém um compromisso passado disponível para reagendamento", () => {
    const result = getUpcomingCommitments([
      commitment("passado", "2026-09-20"),
      commitment("futuro", "2026-09-28"),
    ]);
    expect(result.map((item) => item.id)).toEqual(["passado", "futuro"]);
  });
});
