"use client";

import type { ReactNode } from "react";
import { ToastContainer, Slide } from "react-toastify";
import { X } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

function CloseButton({ closeToast }: { closeToast: () => void }) {
  return (
    <button
      type="button"
      onClick={closeToast}
      className="shrink-0 size-8 flex items-center justify-center text-font-white/70 hover:text-font-white transition-colors cursor-pointer"
      aria-label="Fechar"
    >
      <X size={16} />
    </button>
  );
}

export function ToastClientWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        limit={3}
        newestOnTop
        closeOnClick={false}
        pauseOnHover
        draggable={false}
        theme="colored"
        transition={Slide}
        closeButton={CloseButton}
      />
    </>
  );
}
