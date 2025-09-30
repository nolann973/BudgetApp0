import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Trash2, LogOut } from "lucide-react";

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
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [profile, setProfile] = useState({ prenom: '', pseudo: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if(savedUser){
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setProfile(userData);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = e => {
    e.preventDefault();
    const prenom = e.target.prenom.value;
    const pseudo = e.target.pseudo.value;
    const userData = { prenom, pseudo };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setProfile(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setCurrentView('login');
  };

  const handleProfileUpdate = e => {
    e.preventDefault();
    const prenom = e.target.prenom.value;
    const pseudo = e.target.pseudo.value;
    const updated = { prenom, pseudo };
    localStorage.setItem("user", JSON.stringify(updated));
    setProfile(updated);
    setCurrentView('dashboard');
  };

  const handleAddExpense = (category, amount) => {
    setExpenses(prev => [...prev, { category, amount }]);
  };

  const pieData = categories.map(cat => {
    const total = expenses.filter(e => e.category === cat.name).reduce((a,b)=>a+Number(b.amount),0);
    return { name: cat.name, value: total, color: cat.color };
  });

  if(currentView === 'login') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-3xl w-full max-w-md space-y-6 border border-gray-700">
        <h1 className="text-2xl font-bold text-white text-center">SmallExpenses</h1>
        <input name="prenom" placeholder="Prénom" required className="w-full p-3 rounded-xl bg-gray-700 text-white"/>
        <input name="pseudo" placeholder="Pseudo" required className="w-full p-3 rounded-xl bg-gray-700 text-white"/>
        <button type="submit" className="w-full py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition">Se connecter</button>
      </form>
    </div>
  );

  if(currentView === 'profile') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <form onSubmit={handleProfileUpdate} className="bg-gray-800 p-8 rounded-3xl w-full max-w-md space-y-6 border border-gray-700">
        <h1 className="text-2xl font-bold text-white text-center">Profil</h1>
        <input name="prenom" defaultValue={profile.prenom} required className="w-full p-3 rounded-xl bg-gray-700 text-white"/>
        <input name="pseudo" defaultValue={profile.pseudo} required className="w-full p-3 rounded-xl bg-gray-700 text-white"/>
        <button type="submit" className="w-full py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition">Mettre à jour</button>
        <button type="button" onClick={() => setCurrentView('dashboard')} className="w-full py-3 bg-red-500 rounded-xl text-white font-bold hover:bg-red-600 transition">Annuler</button>
      </form>
    </div>
  );

  if(currentView === 'dashboard') return (
    <div className="min-h-screen p-4 bg-gray-900">
      <header className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold text-white">Bienvenue, {profile.prenom}</h1>
        <div className="flex gap-2">
          <button onClick={()=>setCurrentView('profile')} className="py-2 px-4 bg-blue-500 rounded-xl font-bold hover:bg-blue-600 transition">Profil</button>
          <button onClick={handleLogout} className="py-2 px-4 bg-red-500 rounded-xl font-bold hover:bg-red-600 transition flex items-center gap-2">
            <LogOut size={16}/> Déconnexion
          </button>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Graphiques des dépenses</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
              {pieData.map((entry,index)=> <Cell key={index} fill={entry.color}/>)}
            </Pie>
            <Tooltip/>
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Ajouter une dépense</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {categories.map(cat => (
            <button key={cat.name} onClick={()=> {
              const amount = prompt(`Montant pour ${cat.name} ?`);
              if(amount) handleAddExpense(cat.name, amount);
            }} className="py-2 px-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition">{cat.name}</button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-2">Liste des dépenses</h2>
        <ul className="space-y-2">
          {expenses.map((e,i)=>(
            <li key={i} className="flex justify-between bg-gray-700 p-2 rounded-xl">
              <span>{e.category}: {e.amount} €</span>
              <button onClick={()=>setExpenses(prev=>prev.filter((_,idx)=>idx!==i))} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default SmallExpensesApp;
