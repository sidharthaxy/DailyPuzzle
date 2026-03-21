import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePuzzleStore } from '../store/puzzleStore';
import { useModalStore } from '../store/modalStore';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { puzzleType, isRunning, isComplete } = usePuzzleStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleNavigation = (action: () => void) => {
    if (location.pathname === '/puzzle' && puzzleType === 'sudoku' && isRunning && !isComplete) {
        useModalStore.getState().openModal({
            type: 'confirm',
            title: 'Leave Puzzle?',
            message: 'For anti-cheat reasons, Sudoku progress is not saved. If you leave now, your puzzle will be reset. Are you sure you want to leave?',
            confirmText: 'Leave',
            cancelText: 'Cancel',
            onConfirm: action
        });
    } else {
        action();
    }
  };

  return (
    <header className="px-6 py-4 border-b border-brand-blue-200 bg-brand-50 flex justify-between items-center shadow-sm relative z-50">
      <div 
        className="cursor-pointer"
        onClick={() => handleNavigation(() => navigate('/'))}
      >
        <h1 className="text-2xl font-extrabold bg-gradient-to-b from-brand-blue-600 via-brand-blue-400 to-brand-blue-600 bg-clip-text text-transparent">
          DailyPuzzle
        </h1>
      </div>
      
      {isAuthenticated && (
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-blue-100 hover:bg-brand-blue-200 text-brand-blue-800 font-bold transition-colors"
          >
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 top-full overflow-hidden">
              <div 
                onClick={() => handleNavigation(() => {
                  setIsDropdownOpen(false);
                  navigate('/profile');
                })}
                className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                role="button"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xl font-bold text-gray-900 truncate">
                    {user?.isGuest ? 'Guest' : user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-sm text-brand-orange-500 font-medium truncate" style={{ color: '#f39c12' /* Or orange as per ref if we don't have tailwind class configured */ }}>
                    {user?.isGuest ? 'Not signed in' : user?.email || 'No email'}
                  </span>
                </div>
              </div>
              
              <div className="py-1">
                <button 
                  onClick={() => {
                    // Theme toggling to be implemented later
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                  </svg>
                  Theme
                </button>
              </div>
              
              <div className="py-1 border-t border-gray-100">
                <button 
                  onClick={() => handleNavigation(() => {
                    setIsDropdownOpen(false);
                    logout();
                  })}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
