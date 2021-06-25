import Home from "../../pages/index";
import { render } from "@testing-library/react";

describe("Home Page", () => {
  it("Renders Deficit info", () => {
    const { getByText } = render(<Home />);
    expect(getByText("Deficit info:")).toBeInTheDocument();
  });
});
