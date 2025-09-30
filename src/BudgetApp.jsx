import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Plus, Edit2, Trash2, Moon, Sun } from "lucide-react";

const categories = [
  { name: "Alimentation", color: "#FF6B6B" },
  { name: "Transport", color: "#4ECDC4" },
  { name: "Loisirs", color: "#95E1D3" },
  { name: "Santé", color: "#F38181" },
  { name: "Shopping", color: "#AA96DA" },
  { name: "Logement", color: "#FCBAD3" },
  { name: "Autres", color: "#A8E6CF" }
];

const SmallExpensesApp = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: "", amount: "" });
  const [darkMode, setDarkMode] = useState(true);

  const handleAdd = () => {
    if (newExpense.category && newExpense.amount) {
      setExpenses([
        ...expenses,
        { ...newExpense, id: Date.now(), amount: Number(newExpense.amount) }
      ]);
      setNewExpense({ category: "", amount: "" });
    }
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleEdit = (id) => {
    const exp = expenses.find(e => e.id === id);
    if (exp) setNewExpense({ category: exp.category, amount: exp.amount });
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen p-4 flex flex-col items-center`}>
      {/* Header */}
      <div className="flex w-full max-w-xl justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-center">BudgetApp</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-700/30 transition">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Formulaire */}
      <div className="w-full max-w-xl flex flex-col gap-3 mb-6 sm:flex-row sm:gap-2">
        <select
          className="p-3 rounded-xl bg-gray-700 text-white flex-1"
          value={newExpense.category}
          onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
        >
          <option value="">Choisir catégorie</option>
          {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
        </select>
        <input
          type="number"
          placeholder="Montant"
          className="p-3 rounded-xl bg-gray-700 text-white flex-1"
          value={newExpense.amount}
          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="p-3 bg-green-500 rounded-xl font-bold hover:bg-green-600 transition flex items-center justify-center"
        >
          <Plus size={20} className="mr-2"/> Ajouter
        </button>
      </div>

      {/* Graphiques */}
      <div className="w-full max-w-xl flex flex-col gap-6 mb-6 sm:flex-row sm:flex-wrap">
        {/* PieChart */}
        <div className="bg-gray-800 p-4 rounded-xl flex-1 min-w-[250px]">
          <h2 className="text-lg font-semibold mb-2">Répartition</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expenses}
                dataKey="amount"
                nameKey="category"
                outerRadius={80}
                fill="#8884d8"
              >
                {expenses.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categories.find(c => c.name === entry.category)?.color || "#ccc"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BarChart */}
        <div className="bg-gray-800 p-4 rounded-xl flex-1 min-w-[250px]">
          <h2 className="text-lg font-semibold mb-2">Historique</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expenses}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#00FF88" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liste des dépenses */}
      <div className="w-full max-w-xl bg-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Dépenses</h2>
        <ul className="flex flex-col gap-2">
          {expenses.map(exp => (
            <li key={exp.id} className="flex justify-between items-center p-2 bg-gray-700 rounded-xl">
              <span>{exp.category} - {exp.amount}€</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(exp.id)} className="hover:text-yellow-400">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(exp.id)} className="hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmallExpensesApp;
