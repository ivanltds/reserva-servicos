import React from "react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "500px" }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="card-glass"
        style={{
          width: "100%",
          maxWidth: maxWidth,
          padding: "32px",
          position: "relative",
          animation: "fadeIn 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
          backgroundColor: "rgba(7, 9, 14, 0.98)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "1.5rem",
            cursor: "pointer",
            transition: "var(--transition-smooth)",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
        >
          &times;
        </button>

        {title && (
          <h3
            style={{
              fontSize: "1.4rem",
              fontFamily: "Outfit",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h3>
        )}

        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
