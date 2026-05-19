"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ==================== ICONS ====================
function IconDashboard() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
    </svg>
  );
}
function IconKeno() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </svg>
  );
}
function IconPower() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 3v9M6.5 5.5A8 8 0 1 0 17.5 5.5"
      />
    </svg>
  );
}
function IconMega() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Icon3DC() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinejoin="round"
        d="M12 3L21 8.5v7L12 21 3 15.5v-7L12 3z"
      />
    </svg>
  );
}
function Icon3DP() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeWidth="2" d="M12 3L21 8.5v7L12 21 3 15.5v-7L12 3z" />
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2" />
      <line x1="3" y1="8.5" x2="21" y2="8.5" strokeWidth="2" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="4" strokeWidth="2" />
      <path
        strokeWidth="2"
        strokeLinecap="round"
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      />
    </svg>
  );
}
function IconSetting() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
      <path
        strokeWidth="2"
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
  );
}
function IconSync() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinecap="round"
        d="M4 12a8 8 0 0 1 14.93-4M4 8v4h4"
      />
      <path
        strokeWidth="2"
        strokeLinecap="round"
        d="M20 12a8 8 0 0 1-14.93 4M20 16v-4h-4"
      />
    </svg>
  );
}
function IconChevron({ down }: { down?: boolean }) {
  return (
    <svg
      className={`w-3 h-3 transition-transform ${down ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9l6 6 6-6"
      />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function IconCollapse() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

// ==================== NAV ITEM ====================
function NavItem({
  href,
  icon,
  label,
  collapsed,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group relative
        ${
          active
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate font-medium">{label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 border border-gray-700">
          {label}
        </span>
      )}
    </Link>
  );
}

// ==================== NAV GROUP ====================
function NavGroup({
  icon,
  label,
  collapsed,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? label : undefined}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-150 group relative"
      >
        <span className="flex-shrink-0">{icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left font-medium truncate">
              {label}
            </span>
            <ChevronIcon open={open} />
          </>
        )}
        {collapsed && (
          <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 border border-gray-700">
            {label}
          </span>
        )}
      </button>
      {!collapsed && open && (
        <div className="ml-4 mt-1 pl-3 border-l border-gray-700 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9l6 6 6-6"
      />
    </svg>
  );
}

function NavSubItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150
        ${active ? "text-blue-400 font-semibold" : "text-gray-500 hover:text-gray-200"}`}
    >
      <span
        className={`w-1 h-1 rounded-full flex-shrink-0 ${active ? "bg-blue-400" : "bg-gray-600"}`}
      />
      {label}
    </Link>
  );
}

function SectionLabel({
  label,
  collapsed,
}: {
  label: string;
  collapsed: boolean;
}) {
  if (collapsed) return <div className="my-2 border-t border-gray-800" />;
  return (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[10px] font-bold tracking-widest text-gray-600 uppercase">
        {label}
      </span>
    </div>
  );
}

// ==================== SIDEBAR ====================
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const is = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <aside
      className={`flex flex-col bg-gray-950 border-r border-gray-800 transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? "w-14" : "w-56"}`}
      style={{ height: "100vh", position: "sticky", top: 0 }}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-3 py-4 border-b border-gray-800 ${collapsed ? "justify-center" : ""}`}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-white font-black text-sm">K</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm tracking-tight">
              Katalott
            </div>
            <div className="text-gray-500 text-[10px]">Analytics</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1">
        {/* Products */}
        <SectionLabel label="Sản phẩm" collapsed={collapsed} />

        <NavItem
          href="/dashboard"
          icon={<IconDashboard />}
          label="Dashboard"
          collapsed={collapsed}
          active={is("/dashboard")}
        />

        <NavItem
          href="/p655"
          icon={<IconPower />}
          label="Power 6/55"
          collapsed={collapsed}
          active={is("/p655")}
        />
        <NavItem
          href="/mega"
          icon={<IconMega />}
          label="Mega 6/45"
          collapsed={collapsed}
          active={is("/mega")}
        />
        <NavItem
          href="/l535"
          icon={<Icon3DC />}
          label="Lottt 5/35"
          collapsed={collapsed}
          active={is("/l535")}
        />
        <NavItem
          href="/m3dc"
          icon={<Icon3DC />}
          label="3D+  "
          collapsed={collapsed}
          active={is("/m3dc")}
        />
        <NavItem
          href="/m3dp"
          icon={<Icon3DP />}
          label="3D Pro"
          collapsed={collapsed}
          active={is("/m3dp")}
        />

        <NavGroup
          icon={<IconKeno />}
          label="Keno"
          collapsed={collapsed}
          defaultOpen={is("/keno")}
        >
          <NavSubItem
            href="/keno"
            label="Kết quả"
            active={pathname === "/keno"}
          />
          <NavSubItem
            href="/keno/giai"
            label="Giải thưởng"
            active={is("/keno/giai")}
          />
          <NavSubItem href="/keno/snt" label="SNT" active={is("/keno/snt")} />
          <NavSubItem
            href="/keno/jackpot"
            label="Jackpot"
            active={is("/keno/jackpot")}
          />
          <NavSubItem
            href="/keno/trx"
            label="Nhập vé"
            active={is("/keno/trx")}
          />
        </NavGroup>

        {/* Functions */}
        <SectionLabel label="Chức năng" collapsed={collapsed} />

        <NavItem
          href="/user"
          icon={<IconUser />}
          label="User"
          collapsed={collapsed}
          active={is("/user")}
        />
        <NavItem
          href="/settings"
          icon={<IconSetting />}
          label="Settings"
          collapsed={collapsed}
          active={is("/settings")}
        />
        <NavItem
          href="/keno/sync"
          icon={<IconSync />}
          label="Sync"
          collapsed={collapsed}
          active={is("/keno/sync")}
        />
        <NavItem
          href="/vuaxs/"
          icon={<IconSync />}
          label="Vua Xo So"
          collapsed={collapsed}
          active={is("/vuaxs/")}
        />
      </nav>

      {/* Collapse button */}
      <div className="px-2 py-3 border-t border-gray-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white transition-all duration-150 text-sm ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Mở rộng" : "Thu nhỏ"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {!collapsed && <span className="text-xs">Thu nhỏ</span>}
        </button>
      </div>
    </aside>
  );
}

// ==================== LAYOUT ====================
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
