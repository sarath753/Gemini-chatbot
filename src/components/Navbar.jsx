// src/components/Navbar.jsx
import { Link } from "react-router-dom";

function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
  return (
    <nav className="fixed top-0 left-0 w-full z-10 border-b border-gray-800 bg-gray-900 px-4 py-3 
                    flex items-center justify-between h-[60px]">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-md text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" 
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-purple-300">Playlist AI</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link to='/account' className="p-2 text-gray-300 hover:bg-gray-800 rounded-lg transition group">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 group-hover:text-purple-400 transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5.121 17.804A13.937 13.937 0 0112 16
                 c2.5 0 4.847.655 6.879 1.804
                 M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2
                 a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
