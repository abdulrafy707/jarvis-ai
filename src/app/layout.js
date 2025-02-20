
'use client'
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../globals.css";

export default function RootLayout({ children }) {
  // State to control sidebar visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en" className="bg-gray-900 text-light">
      <body className="flex flex-col min-h-screen">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col md:flex-row">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
