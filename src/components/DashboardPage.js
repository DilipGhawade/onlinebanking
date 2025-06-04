import React, { useState } from "react";

const cards = [
  {
    id: 1,
    bank: "BankDash Platinum",
    number: "**** **** **** 1234",
    holder: "Nidisha",
    expiry: "12/27",
    balance: "₹75,000",
    type: "Visa",
    bg: "#3b5998",
  },
  {
    id: 2,
    bank: "BankDash Gold",
    number: "**** **** **** 5678",
    holder: "Nidisha",
    expiry: "11/26",
    balance: "₹32,500",
    type: "Mastercard",
    bg: "#f39c12",
  },
];

const transactions = [
  { id: 1, date: "2025-06-01", desc: "Amazon Purchase", amount: "-₹2,500" },
  { id: 2, date: "2025-05-30", desc: "Salary Credit", amount: "+₹50,000" },
  { id: 3, date: "2025-05-29", desc: "Coffee Shop", amount: "-₹250" },
  { id: 4, date: "2025-05-28", desc: "Electricity Bill", amount: "-₹1,800" },
];

export function DashboardPage() {
  const [current, setCurrent] = useState(0);

  const prevCard = () => setCurrent((c) => (c === 0 ? cards.length - 1 : c - 1));
  const nextCard = () => setCurrent((c) => (c === cards.length - 1 ? 0 : c + 1));

  return (
    <div className="container-fluid px-2 px-md-4 py-3">
      <div className="row g-3">
        {/* Left: My Card */}
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center mb-3">
            <h3 className="mb-0">My Card</h3>
            {cards.length > 1 && (
              <div className="ms-auto d-flex gap-2">
                <button className="btn btn-light btn-sm" onClick={prevCard}>&lt;</button>
                <button className="btn btn-light btn-sm" onClick={nextCard}>&gt;</button>
              </div>
            )}
          </div>
          <div
            className="rounded-4 p-4 mb-3"
            style={{
              background: cards[current].bg,
              color: "#fff",
              minHeight: 180,
              boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
              position: "relative",
              transition: "background 0.3s",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 18 }}>{cards[current].bank}</div>
            <div style={{ letterSpacing: 2, fontSize: 22, margin: "18px 0 8px" }}>{cards[current].number}</div>
            <div style={{ fontSize: 14 }}>Card Holder: {cards[current].holder}</div>
            <div style={{ fontSize: 14 }}>Expiry: {cards[current].expiry}</div>
            <div style={{ fontWeight: "bold", fontSize: 16, marginTop: 12 }}>Balance: {cards[current].balance}</div>
            <div style={{ position: "absolute", bottom: 16, right: 24, fontSize: 16, opacity: 0.7 }}>
              {cards[current].type}
            </div>
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center mb-3">
            <h3 className="mb-0">Recent Transactions</h3>
          </div>
          <div className="bg-white rounded-4 shadow-sm p-3">
            {transactions.map((tx, idx) => (
              <div key={tx.id}
                className={`d-flex justify-content-between align-items-center py-2 ${idx !== transactions.length - 1 ? "border-bottom" : ""}`}
                style={{ fontSize: 15 }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{tx.desc}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{tx.date}</div>
                </div>
                <div style={{ color: tx.amount.startsWith("+") ? "#27ae60" : "#c0392b", fontWeight: 600 }}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}