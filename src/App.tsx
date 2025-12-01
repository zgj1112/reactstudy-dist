import { Outlet, useLocation } from "react-router-dom";
import BackgroundSwitcher from "@components/common/BackgroundSwitcher";
import BackToHome from "@components/common/BackToHome";

const HIDE_BACK_BUTTON_PATHS = ["/"];
const EDGE_TO_EDGE_PATHS = ["/mars3dTest", "/leafletMap"];

function App() {
  const location = useLocation();
  const { pathname } = location;
  const showBackButton = !HIDE_BACK_BUTTON_PATHS.includes(pathname);
  const edgeToEdge = EDGE_TO_EDGE_PATHS.includes(pathname);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#020617",
      }}
    >
      <BackgroundSwitcher />
      {showBackButton && <BackToHome />}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: edgeToEdge ? 0 : 24,
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default App;
