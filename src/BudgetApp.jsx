import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Wallet } from "lucide-react";

const BudgetApp = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "Alimentation",
    date: new Date().toISOString().split("T")[0],
    note: ""
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [budgetForm, setBudgetForm] = useState({ monthly: "" });

  const categories = [
    { name: "Alimentation", color: "#FF6B6B" },
    { name: "Transport", color: "#4ECDC4" },
    { name: "Loisirs", color: "#95E1D3" },
    { name: "Santé", color: "#F38181" },
    { name: "Shopping", color: "#AA96DA" },
    { name: "Logement", color: "#FCBAD3" },
    { name: "Autres", color: "#A8E6CF" }
  ];

  // INIT LOCALSTORAGE
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("budgetUser") || "null");
    const savedBudget = JSON.parse(localStorage.getItem("budget") || "null");
    const savedExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    if (savedUser) {
      setUser(savedUser);
      setBudget(savedBudget);
      setExpenses(savedExpenses);
      setCurrentView("dashboard");
    }
  }, []);

  // AUTH
  const handleSignUp = (e) => {
    e.preventDefault();
    const form = e.target;
    const newUser = { email: form.email.value, password: form.password.value, profile: { name: "", pseudo: "" } };
    localStorage.setItem("budgetUser", JSON.stringify(newUser));
    setUser(newUser);
    setCurrentView("profil");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const savedUser = JSON.parse(localStorage.getItem("budgetUser") || "null");
    if (savedUser && savedUser.email === form.email.value && savedUser.password === form.password.value) {
      setUser(savedUser);
      setCurrentView("dashboard");
    } else {
      alert("Email ou mot de passe incorrect");
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedUser = {
      ...user,
      profile: { name: form.name.value, pseudo: form.pseudo.value },
      password: form.password.value || user.password
    };
    setUser(updatedUser);
    localStorage.setItem("budgetUser", JSON.stringify(updatedUser));
    alert("Profil mis à jour !");
    setCurrentView("dashboard");
  };

  // BUDGET
  const handleSetBudget = (e) => {
    e.preventDefault();
    const newBudget = { monthly: parseFloat(budgetForm.monthly) };
    setBudget(newBudget);
    localStorage.setItem("budget", JSON.stringify(newBudget));
    setCurrentView("dashboard");
  };

  // DEPENSES
  const handleAddExpense = (e) => {
    e.preventDefault();
    const expense = {
      id: editingExpense?.id || Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      timestamp: editingExpense?.timestamp || Date.now()
    };
    const updatedExpenses = editingExpense
      ? expenses.map((exp) => (exp.id === expense.id ? expense : exp))
      : [...expenses, expense];
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    setNewExpense({ amount: "", category: "Alimentation", date: new Date().toISOString().split("T")[0], note: "" });
    setEditingExpense(null);
  };

  const handleEditExpense = (exp) => setEditingExpense(exp) && setNewExpense({ ...exp, amount: exp.amount.toString() });
  const handleDeleteExpense = (id) => {
    const updatedExpenses = expenses.filter((exp) => exp.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
  };

  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + e.amount, 0);
  const getExpensesByCategory = () => {
    const byCat = {};
    expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
    return Object.entries(byCat).map(([name, value]) => ({ name, value, color: categories.find(c => c.name === name)?.color || "#999" }));
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.note.toLowerCase().includes(searchTerm.toLowerCase()) || exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a,b)=>b.timestamp - a.timestamp);

  // VIEWS
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {currentView === "login" ? (
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl w-full max-w-md space-y-4">
          <h1 className="text-white text-2xl font-bold text-center">Connexion</h1>
          <input type="email" name="email" placeholder="Email" className="w-full p-3 rounded-xl bg-gray-700 text-white" required />
          <input type="password" name="password" placeholder="Mot de passe" className="w-full p-3 rounded-xl bg-gray-700 text-white" required />
          <button type="submit" className="w-full py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition">Se connecter</button>
          <p className="text-gray-400 text-center">Pas encore de compte ? <span onClick={()=>setCurrentView('signup')} className="text-green-400 cursor-pointer">S'inscrire</span></p>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="bg-gray-800 p-8 rounded-xl w-full max-w-md space-y-4">
          <h1 className="text-white text-2xl font-bold text-center">Inscription</h1>
          <input type="email" name="email" placeholder="Email" className="w-full p-3 rounded-xl bg-gray-700 text-white" required />
          <input type="password" name="password" placeholder="Mot de passe" className="w-full p-3 rounded-xl bg-gray-700 text-white" required />
          <button type="submit" className="w-full py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition">Créer un compte</button>
          <p className="text-gray-400 text-center">Déjà inscrit ? <span onClick={()=>setCurrentView('login')} className="text-green-400 cursor-pointer">Se connecter</span></p>
        </form>
      )}
    </div>
  );

  if (currentView === "profil") return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <form onSubmit={handleUpdateProfile} className="bg-gray-800 p-8 rounded-xl w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-white text-center">Mon profil</h1>
        <input type="text" name="name" placeholder="Prénom" defaultValue={user.profile.name} className="w-full p-3 rounded-xl bg-gray-700 text-white"/>
        <input type="text" name="pseudo" placeholder="Pseudo" defaultValue={user.profile.pseudo} className="w-full p-3 rounded-xl bg-gray-700 text-white"/>
        <input type="password" name="password" placeholder="Changer le mot de passe" className="w-full p-3 rounded-xl bg-gray-700 text-white"/>
        <button type="submit" className="w-full py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition">Enregistrer</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <Wallet className="w-8 h-8 text-green-400"/>
          <h1 className="text-white font-bold text-xl">Bonjour {user.profile.name || user.email}</h1>
        </div>
        <div className="flex space-x-4">
          <button onClick={()=>setCurrentView('profil')} className="text-gray-400 hover:text-white">Profil</button>
          <button onClick={() => {setUser(null); localStorage.clear(); setCurrentView('login')}} className="text-gray-400 hover:text-white">Déconnexion</button>
        </div>
      </div>

      {!budget ? (
        <form onSubmit={handleSetBudget} className="bg-gray-800 p-4 rounded-xl max-w-md space-y-2">
          <input type="number" placeholder="Budget mensuel (€)" value={budgetForm.monthly} onChange={e=>setBudgetForm({...budgetForm, monthly:e.target.value})} className="w-full p-2 rounded-xl bg-gray-700 text-white"/>
          <button type="submit" className="w-full py-2 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition">Valider</button>
        </form>
      ) : (
        <>
          <h2 className="text-white font-bold">Budget mensuel : {budget.monthly} €</h2>
          <h3 className="text-white font-bold">Total dépenses : {getTotalExpenses()} €</h3>

          <form onSubmit={handleAddExpense} className="bg-gray-800 p-4 rounded-xl max-w-md space-y-2">
            <input type="number" placeholder="Montant" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount:e.target.value})} className="w-full p-2 rounded-xl bg-gray-700 text-white"/>
            <select value={newExpense.category} onChange={e=>setNewExpense({...newExpense, category:e.target.value})} className="w-full p-2 rounded-xl bg-gray-700 text-white">
              {categories.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <input type="date" value={newExpense.date} onChange={e=>setNewExpense({...newExpense, date:e.target.value})} className="w-full p-2 rounded-xl bg-gray-700 text-white"/>
            <input type="text" placeholder="Note" value={newExpense.note} onChange={e=>setNewExpense({...newExpense, note:e.target.value})} className="w-full p-2 rounded-xl bg-gray-700 text-white"/>
            <button type="submit" className="w-full py-2 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition">{editingExpense ? 'Modifier' : 'Ajouter'}</button>
          </form>

          <div className="overflow-x-auto">
            <table className="table-auto w-full text-white">
              <thead>
                <tr>
                  <th>Date</th><th>Catégorie</th><th>Montant</th><th>Note</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>{exp.category}</td>
                    <td>{exp.amount} €</td>
                    <td>{exp.note}</td>
                    <td className="space-x-2">
                      <button onClick={()=>handleEditExpense(exp)} className="text-yellow-400">Edit</button>
                      <button onClick={()=>handleDeleteExpense(exp.id)} className="text-red-500">Suppr</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ width: '100%', height: 250 }} className="bg-gray-800 p-4 rounded-xl">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={getExpensesByCategory()} dataKey="value" nameKey="name" label>
                  {getExpensesByCategory().map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetApp;
