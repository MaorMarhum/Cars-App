"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface NavButtonProps {
  label: string;                          // Button text
  to?: string;                            // Optional navigation path
  onClick?: () => void;                   // Optional click handler
  onBeforeNavigate?: () => void;          // Optional pre-navigation hook
  variant?: "primary" | "secondary";      // Styling variant
  disabled?: boolean;  
  className?: string;                   // Disable button state
}

export default function NavButton({
  label,
  to,
  onClick,
  onBeforeNavigate,
  variant = "primary",
  disabled = false,
}: NavButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) return;                 // prevent any action if disabled
    if (onBeforeNavigate) onBeforeNavigate();
    if (onClick) onClick();
    if (to) router.push(to);
  };

  const baseStyle =
    "inline-block px-6 py-2 rounded-lg font-medium transition duration-200";
  const styles = {
    primary: `${baseStyle} bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed`,
    secondary: `${baseStyle} bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`,
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={styles[variant]}
    >
      {label}
    </button>
  );
}
