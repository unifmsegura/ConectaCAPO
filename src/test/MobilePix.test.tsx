import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobilePix } from "../components/mobile/MobilePix";
import type { ChargeResult } from "../data/api";

vi.mock("../data/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../data/api")>();
    return {
        ...actual,
        getDonationStatus: vi.fn().mockResolvedValue("pending"),
        confirmDemoDonation: vi.fn().mockResolvedValue(undefined),
    };
});

const baseCharge: ChargeResult = {
    donationId: "d1",
    image: "aGk=",
    payload: "PIX-FAKE",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
};

function renderPix(demo?: boolean) {
    return render(
        <MobilePix
            charge={{ ...baseCharge, demo }}
            amount={20}
            onConfirm={vi.fn()}
            onRegenerate={vi.fn()}
            onCancel={vi.fn()}
        />
    );
}

describe("MobilePix (modo demonstração)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("mostra a faixa e o botão 'Simular pagamento' quando demo = true", () => {
        renderPix(true);
        expect(screen.getByText(/Modo demonstração/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Simular pagamento" })).toBeInTheDocument();
    });

    it("não mostra o botão quando demo é falso ou ausente", () => {
        renderPix(false);
        expect(screen.queryByRole("button", { name: "Simular pagamento" })).not.toBeInTheDocument();

        renderPix(undefined);
        expect(screen.queryByRole("button", { name: "Simular pagamento" })).not.toBeInTheDocument();
    });
});
