import Notebook from "./components/Notebook/Notebook.jsx";
import { pages } from "./data/pages.js";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#notebook">
        Skip to notebook
      </a>
      <main className="desk">
        <Notebook pages={pages} />
      </main>
    </>
  );
}
