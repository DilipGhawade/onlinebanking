import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import store from "./app/store";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
}

export default App;
