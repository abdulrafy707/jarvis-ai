import Link from "next/link";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      <aside
        className={`bg-black text-light shadow-lg min-h-screen border-r-4 border-neonPink 
          fixed inset-y-0 left-0 w-4/5 z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:static md:translate-x-0 md:w-1/6`}
      >
        <nav className="px-6 py-8">
          <ul className="space-y-6">
            {/* Email */}
            <li>
              <Link
                href="/email"
                className="flex items-center space-x-3 text-neonPink font-bold hover:text-neonBlue transition-transform transform hover:scale-110 hover:shadow-neon"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89-3.947a2 2 0 011.789 0L21 8m-18 4v8a2 2 0 002 2h14a2 2 0 002-2v-8m-9 4h.01"
                  />
                </svg>
                <span>Email</span>
              </Link>
            </li>

            {/* Tasks */}
            <li>
              <Link
                href="/tasks"
                className="flex items-center space-x-3 text-neonPink font-bold hover:text-neonBlue transition-transform transform hover:scale-110 hover:shadow-neon"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Tasks</span>
              </Link>
            </li>

            {/* Voice Assistant */}
            <li>
              <Link
                href="/voice-assistant"
                className="flex items-center space-x-3 text-neonPink font-bold hover:text-neonBlue transition-transform transform hover:scale-110 hover:shadow-neon"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.105 0-2 .895-2 2m4 0c0-1.105-.895-2-2-2m0 0c1.105 0 2 .895 2 2m-4 0c0 1.105.895 2 2 2m0 0c-1.105 0-2-.895-2-2m4 0c0-1.105-.895-2-2-2m0 0V5.414A2 2 0 0113.414 3H16m-4 0V5.414M8 21h8m-8-2h8m-8 0h8"
                  />
                </svg>
                <span>Assistance</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Overlay to close sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}
