import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { TransactionsTable } from "../components/admin/TransactionsTable";
import { PALETTE } from "../constants/theme";
import type { AdminTransaction } from "../data/admin";

const transactions: AdminTransaction[] = [
    { id: "1", email: "ana@example.com", value: 150, campaign: "Van", date: "01/10/2025", status: "Aprovado" },
    { id: "2", email: "bruno@example.com", value: 50.5, campaign: "Eventos", date: "02/10/2025", status: "Pendente" },
];

function rowFor(email: string) {
    const row = screen.getByText(email).closest("tr")!;
    return within(row);
}

describe("TransactionsTable", () => {
    it("renders all transactions", () => {
        render(<TransactionsTable transactions={transactions} />);
        expect(screen.getByText("ana@example.com")).toBeInTheDocument();
        expect(screen.getByText("bruno@example.com")).toBeInTheDocument();
    });

    it("formats values as BRL currency", () => {
        render(<TransactionsTable transactions={transactions} />);
        const approvedRow = rowFor("ana@example.com");
        expect(approvedRow.getByText(/150,00/)).toBeInTheDocument();
        const pendingRow = rowFor("bruno@example.com");
        expect(pendingRow.getByText(/50,50/)).toBeInTheDocument();
    });

    it("styles approved rows with green text on light green background", () => {
        render(<TransactionsTable transactions={transactions} />);
        const badge = rowFor("ana@example.com").getByText(/Aprovado/);
        expect(badge).toHaveStyle({ background: PALETTE.greenLight, color: PALETTE.green });
    });

    it("styles pending rows with amber text", () => {
        render(<TransactionsTable transactions={transactions} />);
        const badge = rowFor("bruno@example.com").getByText(/Pendente/);
        expect(badge).toHaveStyle({ color: PALETTE.amber });
    });
});
