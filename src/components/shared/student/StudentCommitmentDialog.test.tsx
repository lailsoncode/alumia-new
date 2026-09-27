import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudentCommitmentDialog } from "./StudentCommitmentDialog";

describe("StudentCommitmentDialog", () => {
  it("não aparece quando está fechado", () => {
    render(<StudentCommitmentDialog open={false} subjects={[]} onClose={() => undefined} onSave={async () => undefined} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("cria um compromisso usando uma matéria existente", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <StudentCommitmentDialog
        open
        subjects={[{ id: "subject-1", name: "Neurociência" }]}
        onClose={() => undefined}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText("O que você precisa fazer?"), { target: { value: "Revisar capítulo 4" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar compromisso" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      title: "Revisar capítulo 4",
      subjectId: "subject-1",
      academicType: "assignment",
      estimatedMinutes: 25,
      reminder: null,
    })));
  });

  it("explica quando uma matéria nova não foi informada", () => {
    const onSave = vi.fn();
    render(<StudentCommitmentDialog open subjects={[]} onClose={() => undefined} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("O que você precisa fazer?"), { target: { value: "Ler artigo" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar compromisso" }));
    expect(screen.getByText("Escolha ou crie uma matéria.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
