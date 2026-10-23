"use client";

import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  confirmMessage?: string;
}

export function ConfirmSubmitButton({ confirmMessage, onClick, children, ...props }: Props) {
  return (
    <button
      {...props}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
