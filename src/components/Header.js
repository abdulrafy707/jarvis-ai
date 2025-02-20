import Link from "next/link";
import { FaBars } from "react-icons/fa";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="sticky top-0 w-full bg-black border-b-4 border-neonPink py-2 px-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-neon">
      <div className="flex items-center mb-2 md:mb-0">
        {/* Hamburger icon shown only on mobile */}
        <button className="md:hidden mr-4" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FaBars className="text-neonPink text-2xl" />
        </button>
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <img
              src="/logo (2).jpg"
              alt="JARVIS Logo"
              className="h-10 w-10 mr-2 rounded-full border-2 border-neonBlue shadow-neon"
            />
            <h1 className="text-neonPink text-2xl sm:text-3xl font-extrabold glowing-text">
              JARVIS AI
            </h1>
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-between md:justify-end space-x-4">
        <div className="text-light text-xs sm:text-sm">
          Wake word:{" "}
          <span className="text-neonBlue font-semibold hover:text-neonPurple transition-all">
            "Hello Jarvis"
          </span>
        </div>
        {/* <Link href="/profile">
          <div className="cursor-pointer">
            <img
              src="/profile-icon.png"
              alt="Profile"
              className="h-8 w-8 rounded-full border-2 border-neonPink hover:shadow-neonPink transition-all"
            />
          </div>
        </Link> */}
      </div>
    </header>
  );
}
