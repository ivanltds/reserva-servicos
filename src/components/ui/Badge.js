import React from "react";

export default function Badge({ children, variant = "brand", className = "", style = {} }) {
  const getBadgeClass = () => {
    switch (variant) {
      case "success":
        return "badge-success";
      case "error":
      case "danger":
        return "badge-error";
      case "accent":
        return "badge-accent";
      case "brand":
      default:
        return "badge-brand";
    }
  };

  return (
    <span className={`badge ${getBadgeClass()} ${className}`} style={style}>
      {children}
    </span>
  );
}
