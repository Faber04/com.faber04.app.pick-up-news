interface HeaderProps {
  currentPage: 'home' | 'feeds';
  onNavigate: (page: 'home' | 'feeds') => void;
}

export const Header = ({ currentPage, onNavigate }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Title */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={`${import.meta.env.BASE_URL}vite.svg`}
            alt="PN"
            className="w-9 h-9"
          />
          <span className="text-xl font-bold text-gray-800">PickUpNews</span>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              currentPage === 'home'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏠 Home
          </button>
          <button
            onClick={() => onNavigate('feeds')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              currentPage === 'feeds'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📡 Feeds
          </button>
        </nav>
      </div>
    </header>
  );
};
