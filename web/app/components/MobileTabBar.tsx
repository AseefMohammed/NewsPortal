"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "AskAI", href: "/askai", icon: "askai" },
  { name: "Saves", href: "/dashboard/saves", icon: "bookmark" },
  { name: "Profile", href: "/dashboard/profile", icon: "user" },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950 border-t border-gray-800 flex justify-around items-center h-16 shadow-lg">
      {tabs.map(tab => (
        <Link
          key={tab.name}
          href={tab.href}
          className={`flex flex-col items-center justify-center text-xs font-medium px-2 py-1 transition-colors duration-150 ${pathname === tab.href ? "text-blue-500" : "text-gray-400"}`}
        >
          <span className="mb-1">
            {tab.icon === "askai" && (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M8 13h8M8 9h8"/></svg>
            )}
            {tab.icon === "dashboard" && (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            )}
            {tab.icon === "bookmark" && (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 3h12a2 2 0 012 2v16l-8-5-8 5V5a2 2 0 012-2z"/></svg>
            )}
            {tab.icon === "user" && (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>
            )}
          </span>
          {tab.name}
        </Link>
      ))}
    </nav>
  );
}
