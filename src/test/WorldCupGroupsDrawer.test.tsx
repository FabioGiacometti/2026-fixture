import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import WorldCupGroupsDrawer from "@/components/WorldCupGroupsDrawer";

describe("WorldCupGroupsDrawer", () => {
  it("renders mini tables and collapses back to the match list when a group is selected", () => {
    const onSelectGroup = vi.fn();

    function TestHarness() {
      const [isExpanded, setIsExpanded] = useState(false);

      return (
        <WorldCupGroupsDrawer
          groups={[
            {
              name: "Grupo A",
              count: 6,
              resolvedCount: 2,
              standings: [
                { team: "México", flag: "MX", played: 2, goalDiff: 2, points: 4 },
                { team: "Sudáfrica", flag: "ZA", played: 2, goalDiff: 0, points: 3 },
                { team: "Corea del Sur", flag: "KR", played: 2, goalDiff: -1, points: 1 },
                { team: "Europa D", played: 2, goalDiff: -1, points: 1 },
              ],
            },
            {
              name: "Grupo B",
              count: 6,
              resolvedCount: 1,
              standings: [
                { team: "Canadá", flag: "CA", played: 1, goalDiff: 1, points: 3 },
                { team: "Qatar", flag: "QA", played: 1, goalDiff: 0, points: 1 },
                { team: "Suiza", flag: "CH", played: 1, goalDiff: 0, points: 1 },
                { team: "Europa A", played: 1, goalDiff: -1, points: 0 },
              ],
            },
          ]}
          selectedGroup="Todos"
          onSelectGroup={onSelectGroup}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded((value) => !value)}
        />
      );
    }

    render(<TestHarness />);

    expect(screen.queryByText("México")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Expandir grupos" }));

    expect(screen.getByText("México")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Grupo A · 6/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("PTS").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Minimizar grupos" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filtrar Grupo A" }));
    expect(onSelectGroup).toHaveBeenCalledWith("Grupo A");
    expect(screen.queryByText("México")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Expandir grupos" }));
    expect(screen.getByText("México")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Colapsar grupos" }));
    expect(screen.queryByText("México")).not.toBeInTheDocument();
  });
});
