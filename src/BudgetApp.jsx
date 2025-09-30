import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Wallet, LogOut, User, Plus, Edit2, Trash2, TrendingDown, TrendingUp } from "lucide-react";

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
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "" });
  const [profileForm, setProfileForm] = useState({ name: "", pseudo: "", password: "" });

  const categories = [
    { name: "Alimentation", color: "#FF6B6B" },
    { name: "Transport", color: "#4ECDC4" },
    { name: "Loisirs", color: "#95E1D3" },
    { name: "Santé", color: "#F38181" },
    { name: "Shopping", color: "#AA96DA" },
    { name: "Logement", color: "#FCBAD3" },
    { name: "Autres", color: "#A8E6CF" }
  ];

  // Charger depuis localStorage au montage
  useEffect(() => {
    const savedUser = localStorage.getItem("budgetUser");
    const savedBudget = localStorage.getItem("budget");
    const savedExpenses = localStorage.getItem("expenses");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView("dashboard");
    }
    if (savedBudget) {
      setBudget(JSON.parse(savedBudget));
    }
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  const handleSignUp = () => {
    if (!signupForm.email || !signupForm.password) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    const newUser = { 
      email: signupForm.email, 
      password: signupForm.password, 
      profile: { name: "", pseudo: "" } 
    };
    localStorage.setItem("budgetUser", JSON.stringify(newUser));
    setUser(newUser);
    setCurrentView("profil");
    setSignupForm({ email: "", password: "" });
  };

  const handleLogin = () => {
    const savedUser = localStorage.getItem("budgetUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.email === loginForm.email && userData.password === loginForm.password) {
        setUser(userData);
        setCurrentView("dashboard");
        setLoginForm({ email: "", password: "" });
      } else {
        alert("Email ou mot de passe incorrect");
      }
    } else {
      alert("Aucun compte trouvé. Veuillez créer un compte.");
    }
  };

  const handleUpdateProfile = () => {
    const updatedUser = {
      ...user,
      profile: { 
        name: profileForm.name || user.profile.name, 
        pseudo: profileForm.pseudo || user.profile.pseudo
      },
      password: profileForm.password || user.password
    };
    localStorage.setItem("budgetUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert("Profil mis à jour !");
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setBudget(null);
    setExpenses([]);
    localStorage.clear();
    setCurrentView("login");
  };

  const handleSetBudget = () => {
    if (budgetForm.monthly && parseFloat(budgetForm.monthly) > 0) {
      const newBudget = { monthly: parseFloat(budgetForm.monthly) };
      localStorage.setItem("budget", JSON.stringify(newBudget));
      setBudget(newBudget);
      setBudgetForm({ monthly: "" });
    }
  };

  const handleAddExpense = () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      alert("Veuillez entrer un montant valide");
      return;
    }

    const expense = {
      id: editingExpense?.id || Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      timestamp: editingExpense?.timestamp || Date.now()
    };

    const updatedExpenses = editingExpense
      ? expenses.map((exp) => (exp.id === expense.id ? expense : exp))
      : [...expenses, expense];

    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
    setNewExpense({ 
      amount: "", 
      category: "Alimentation", 
      date: new Date().toISOString().split("T")[0], 
      note: "" 
    });
    setEditingExpense(null);
  };

  const handleEditExpense = (exp) => {
    setEditingExpense(exp);
    setNewExpense({ 
      amount: exp.amount.toString(),
      category: exp.category,
      date: exp.date,
      note: exp.note
    });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setNewExpense({ 
      amount: "", 
      category: "Alimentation", 
      date: new Date().toISOString().split("T")[0], 
      note: "" 
    });
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      const updatedExpenses = expenses.filter((exp) => exp.id !== id);
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
    }
  };

  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const getExpensesByCategory = () => {
    const byCat = {};
    expenses.forEach((e) => { 
      byCat[e.category] = (byCat[e.category] || 0) + e.amount; 
    });
    return Object.entries(byCat).map(([name, value]) => ({ 
      name, 
      value, 
      color: categories.find(c => c.name === name)?.color || "#999" 
    }));
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.note.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.timestamp - a.timestamp);

  const remainingBudget = budget ? budget.monthly - getTotalExpenses() : 0;
  const budgetPercentage = budget ? (getTotalExpenses() / budget.monthly) * 100 : 0;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        {currentView === "login" ? (
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Wallet className="w-12 h-12 text-green-400"/>
            </div>
            <h1 className="text-white text-3xl font-bold text-center mb-6">Connexion</h1>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition" 
              />
              <input 
                type="password" 
                placeholder="Mot de passe" 
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition" 
              />
              <button 
                onClick={handleLogin}
                className="w-full py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition shadow-lg"
              >
                Se connecter
              </button>
            </div>
            <p className="text-gray-400 text-center mt-4">
              Pas encore de compte ? 
              <span 
                onClick={() => setCurrentView('signup')} 
                className="text-green-400 cursor-pointer hover:text-green-300 ml-1 font-semibold"
              >
                S'inscrire
              </span>
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Wallet className="w-12 h-12 text-green-400"/>
            </div>
            <h1 className="text-white text-3xl font-bold text-center mb-6">Inscription</h1>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                value={signupForm.email}
                onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition" 
              />
              <input 
                type="password" 
                placeholder="Mot de passe" 
                value={signupForm.password}
                onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition" 
              />
              <button 
                onClick={handleSignUp}
                className="w-full py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition shadow-lg"
              >
                Créer un compte
              </button>
            </div>
            <p className="text-gray-400 text-center mt-4">
              Déjà inscrit ? 
              <span 
                onClick={() => setCurrentView('login')} 
                className="text-green-400 cursor-pointer hover:text-green-300 ml-1 font-semibold"
              >
                Se connecter
              </span>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (currentView === "profil") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-6">Mon profil</h1>
          <input 
            type="text" 
            placeholder="Prénom" 
            value={profileForm.name || user.profile.name}
            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
          />
          <input 
            type="text" 
            placeholder="Pseudo" 
            value={profileForm.pseudo || user.profile.pseudo}
            onChange={(e) => setProfileForm({...profileForm, pseudo: e.target.value})}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
          />
          <input 
            type="password" 
            placeholder="Changer le mot de passe (optionnel)" 
            value={profileForm.password}
            onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
          />
          <div className="flex space-x-3">
            <button 
              onClick={handleUpdateProfile}
              className="flex-1 py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition"
            >
              Enregistrer
            </button>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="flex-1 py-3 bg-gray-600 rounded-xl text-white font-bold hover:bg-gray-700 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <Wallet className="w-8 h-8 text-green-400"/>
            <h1 className="text-white font-bold text-xl">
              Bonjour {user.profile.name || user.profile.pseudo || user.email}
            </h1>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setCurrentView('profil')} 
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-xl text-white hover:bg-gray-600 transition"
            >
              <User className="w-4 h-4"/>
              <span className="hidden md:inline">Profil</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 rounded-xl text-white hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4"/>
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {!budget ? (
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-md mx-auto">
            <h2 className="text-white font-bold text-xl mb-4">Définir votre budget mensuel</h2>
            <div className="space-y-4">
              <input 
                type="number" 
                step="0.01"
                placeholder="Budget mensuel (€)" 
                value={budgetForm.monthly} 
                onChange={e => setBudgetForm({...budgetForm, monthly: e.target.value})} 
                onKeyDown={(e) => e.key === 'Enter' && handleSetBudget()}
                className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
              />
              <button 
                onClick={handleSetBudget}
                className="w-full py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition"
              >
                Valider
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-gray-400 text-sm mb-2">Budget mensuel</h3>
                <p className="text-white text-3xl font-bold">{budget.monthly.toFixed(2)} €</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-gray-400 text-sm mb-2">Total dépenses</h3>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-6 h-6 text-red-400"/>
                  <p className="text-white text-3xl font-bold">{getTotalExpenses().toFixed(2)} €</p>
                </div>
                <div className="mt-2 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${budgetPercentage > 100 ? 'bg-red-500' : budgetPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{width: `${Math.min(budgetPercentage, 100)}%`}}
                  />
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-gray-400 text-sm mb-2">Restant</h3>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-green-400"/>
                  <p className={`text-3xl font-bold ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {remainingBudget.toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-white font-bold text-xl mb-4 flex items-center space-x-2">
                <Plus className="w-6 h-6"/>
                <span>{editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Montant (€)" 
                  value={newExpense.amount} 
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                  className="p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
                />
                <select 
                  value={newExpense.category} 
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                  className="p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
                >
                  {categories.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
                <input 
                  type="date" 
                  value={newExpense.date} 
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                  className="p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
                />
                <input 
                  type="text" 
                  placeholder="Note (optionnelle)" 
                  value={newExpense.note} 
                  onChange={e => setNewExpense({...newExpense, note: e.target.value})} 
                  className="p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
                />
                <div className="flex space-x-2">
                  <button 
                    onClick={handleAddExpense}
                    className="flex-1 py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition"
                  >
                    {editingExpense ? 'Modifier' : 'Ajouter'}
                  </button>
                  {editingExpense && (
                    <button 
                      onClick={handleCancelEdit}
                      className="px-4 py-3 bg-gray-600 rounded-xl text-white hover:bg-gray-700 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {expenses.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input 
                    type="text"
                    placeholder="Rechercher une dépense..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
                  />
                  <select 
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {expenses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg overflow-hidden">
                  <h2 className="text-white font-bold text-xl mb-4">Historique des dépenses</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-3 text-gray-400 text-sm">Date</th>
                          <th className="text-left p-3 text-gray-400 text-sm">Catégorie</th>
                          <th className="text-right p-3 text-gray-400 text-sm">Montant</th>
                          <th className="text-left p-3 text-gray-400 text-sm">Note</th>
                          <th className="text-center p-3 text-gray-400 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.map(exp => (
                          <tr key={exp.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                            <td className="p-3 text-sm">{exp.date}</td>
                            <td className="p-3">
                              <span 
                                className="px-2 py-1 rounded-lg text-xs font-semibold"
                                style={{
                                  backgroundColor: categories.find(c => c.name === exp.category)?.color + '20',
                                  color: categories.find(c => c.name === exp.category)?.color
                                }}
                              >
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-3 text-right font-semibold text-sm">{exp.amount.toFixed(2)} €</td>
                            <td className="p-3 text-gray-300 text-sm">{exp.note || '-'}</td>
                            <td className="p-3">
                              <div className="flex justify-center space-x-2">
                                <button 
                                  onClick={() => handleEditExpense(exp)} 
                                  className="p-2 bg-yellow-500 rounded-lg hover:bg-yellow-600 transition"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-4 h-4"/>
                                </button>
                                <button 
                                  onClick={() => handleDeleteExpense(exp.id)} 
                                  className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4"/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h2 className="text-white font-bold text-xl mb-4">Répartition par catégorie</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={getExpensesByCategory()} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getExpensesByCategory().map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value.toFixed(2)} €`}
                        contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
                <p className="text-gray-400 text-lg">Aucune dépense enregistrée. Commencez par ajouter votre première dépense !</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetApp;