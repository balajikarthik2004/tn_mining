import { useRoutes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { routes } from "./routes";

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
