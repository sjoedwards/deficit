import Home from "../../pages/index";
import { render } from "@testing-library/react";

describe("Home Page", () => {
  it("Renders hello world", () => {
    const { getByText } = render(<Home />);
    expect(getByText("Hello world!")).toBeInTheDocument();
  });
});
