"use client";

export function ClientLogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
      className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] text-sm rounded-md"
    >
      Sair
    </button>
  );
}
