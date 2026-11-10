import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";
import { CampaignsProvider } from "./data/campaigns";

describe("App (teste de fumaça)", () => {
    it("renderiza o título 'CAPO - Eliane Martins'", () => {
        render(
            <CampaignsProvider>
                <App />
            </CampaignsProvider>
        );
        expect(screen.getByText("CAPO - Eliane Martins")).toBeInTheDocument();
    });
});
