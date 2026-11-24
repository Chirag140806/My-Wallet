// Holds the user's transactions and budgets. Every page reads from here,
// so after any add/edit/delete everything (dashboard, charts) refreshes automatically.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useToast } from "./toast";

const DataCtx = createContext();
export const useData = () => useContext(DataCtx);

export function DataProvider({ children }) {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [t, b] = await Promise.all([api("/transactions/"), api("/budget/")]);
      setTransactions(t); setBudgets(b);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const saveTransaction = async (data, id) => {
    await api(id ? `/transactions/${id}/` : "/transactions/", { method: id ? "PUT" : "POST", body: data });
    await load();
  };
  const deleteTransaction = async (id) => { await api(`/transactions/${id}/`, { method: "DELETE" }); await load(); };
  const saveBudget = async (month, amount) => { await api("/budget/", { method: "PUT", body: { month, amount } }); await load(); };
  const budgetFor = (month) => Number(budgets.find((b) => b.month === month)?.amount || 0);

  if (loading) return <div className="splash"><div className="spinner" /></div>;
  return (
    <DataCtx.Provider value={{ transactions, saveTransaction, deleteTransaction, saveBudget, budgetFor }}>
      {children}
    </DataCtx.Provider>
  );
}
