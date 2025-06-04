import React, { useRef } from "react";

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
  {
    id: 3,
    bank: "BankDash Silver",
    number: "**** **** **** 9999",
    holder: "Nidisha",
    expiry: "10/25",
    balance: "₹12,000",
    type: "Rupay",
    bg: "#16a085",
  },
];

export function CreditCardsPage() {
  const scrollRef = useRef(null);

  const cardWidth = 280; // px, including margin
  const gap = 16; // px

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (!current) return;
    current.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2,
      behavior: "smooth",
    });
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-3">
      <div className="mb-3 d-flex align-items-center">
        <h3 className="mb-0">My Cards</h3>
        <div className="ms-auto d-none d-md-flex gap-2">
          <button className="btn btn-light btn-sm" onClick={() => scroll("left")}>&lt;</button>
          <button className="btn btn-light btn-sm" onClick={() => scroll("right")}>&gt;</button>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        {/* Mobile slider buttons */}
        <div className="d-flex d-md-none justify-content-end mb-2" style={{ gap: 8 }}>
          <button className="btn btn-light btn-sm" onClick={() => scroll("left")}>&lt;</button>
          <button className="btn btn-light btn-sm" onClick={() => scroll("right")}>&gt;</button>
        </div>
        <div
          ref={scrollRef}
          className="d-flex flex-nowrap overflow-auto pb-2"
          style={{
            gap: `${gap}px`,
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
            width: `calc(${cardWidth * 2 + gap}px)`, // Only show 2 cards at a time
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="rounded-4 p-3 flex-shrink-0"
              style={{
                background: card.bg,
                color: "#fff",
                width: `${cardWidth}px`,
                boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                position: "relative",
                transition: "background 0.3s",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: 18 }}>{card.bank}</div>
              <div style={{ letterSpacing: 2, fontSize: 22, margin: "18px 0 8px" }}>{card.number}</div>
              <div style={{ fontSize: 14 }}>Card Holder: {card.holder}</div>
              <div style={{ fontSize: 14 }}>Expiry: {card.expiry}</div>
              <div style={{ fontWeight: "bold", fontSize: 16, marginTop: 12 }}>Balance: {card.balance}</div>
              <div style={{ position: "absolute", bottom: 16, right: 24, fontSize: 16, opacity: 0.7 }}>
                {card.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}