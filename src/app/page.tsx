"use client";

import { useEffect, useState } from "react";
import { supabase, type Expense } from "@/lib/supabase";

function parseExpense(text: string): { description: string; amount: number } | null {
  const amountMatch = text.match(/\d+(\.\d+)?/);
  if (!amountMatch) return null;
  const amount = parseFloat(amountMatch[0]);
  const description = text
    .replace(/\d+(\.\d+)?/g, "")
    .replace(/元|NTD|\$|塊|dollar/gi, "")
    .trim();
  return { description: description || "消費", amount };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function HomePage() {
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser({ email: data.user.email, id: data.user.id });
        fetchExpenses(data.user.id);
      }
      setChecking(false);
    });
  }, []);

  async function fetchExpenses(userId: string) {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setExpenses(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const parsed = parseExpense(input);
    if (!parsed) {
      alert("找不到金額，請輸入包含數字的文字，例如：「午餐 120」");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      description: parsed.description,
      amount: parsed.amount,
    });

    if (!error) {
      setInput("");
      await fetchExpenses(user.id);
    }
    setLoading(false);
  }

  async function deleteExpense(id: string) {
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const today = expenses.filter((e) => {
    const d = new Date(e.created_at);
    return d.toDateString() === now.toDateString();
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const dayTotal = today.reduce((sum, e) => sum + e.amount, 0);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">💰 智慧記帳</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            登出
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='試試輸入「晚餐吃火鍋 800」'
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? "..." : "記帳"}
          </button>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">今日花費</p>
            <p className="text-2xl font-bold text-gray-800">${dayTotal.toLocaleString()}</p>
          </div>
          <div className="bg-blue-500 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-blue-100 mb-1">本月花費</p>
            <p className="text-2xl font-bold text-white">${monthTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">歷史明細</h2>
          </div>
          {expenses.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">還沒有記帳紀錄，快來記第一筆！</p>
          ) : (
            <ul>
              {expenses.map((expense, i) => (
                <li
                  key={expense.id}
                  className={`flex items-center justify-between px-4 py-3 ${i !== expenses.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{expense.description}</span>
                    <span className="text-xs text-gray-400">{formatDate(expense.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800">${expense.amount.toLocaleString()}</span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-base"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
