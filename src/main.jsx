import React from "react";
import { createRoot } from "react-dom/client";
import BudgetApp from "./BudgetApp";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(<BudgetApp />);
