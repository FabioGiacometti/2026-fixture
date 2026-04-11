import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const analyticsSpy = vi.fn();

vi.mock("@vercel/analytics/react", () => ({
  Analytics: (props: { route?: string; path?: string }) => {
    analyticsSpy(props);

    return (
      <div
        data-testid="vercel-analytics"
        data-route={props.route ?? ""}
        data-path={props.path ?? ""}
      />
    );
  },
}));

vi.mock("@/lib/env", () => ({
  env: {
    analyticsEnabled: true,
    appEnv: "test",
  },
}));

vi.mock("../pages/Index.tsx", () => ({
  default: () => <div>Index page</div>,
}));

vi.mock("../pages/NotFound.tsx", () => ({
  default: () => <div>Not found</div>,
}));

describe("App analytics routing", () => {
  beforeEach(() => {
    analyticsSpy.mockClear();
    window.history.pushState({}, "", "/worldcup/final?group=b");
  });

  afterEach(() => {
    cleanup();
    window.history.pushState({}, "", "/");
  });

  it("passes the current route and path to Vercel analytics", () => {
    render(<App />);

    const analytics = screen.getByTestId("vercel-analytics");
    expect(analytics).toHaveAttribute("data-route", "/worldcup/final");
    expect(analytics).toHaveAttribute("data-path", "/worldcup/final?group=b");
    expect(analyticsSpy).toHaveBeenCalled();
  });
});
