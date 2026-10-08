import { PanelLeft, PanelLeftClose } from 'lucide-react';
import UserMenu from './UserMenu';
import './header.css';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function Header({ isSidebarOpen, onToggleSidebar, activeCourseTitle }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="icon-btn toggle-btn" onClick={onToggleSidebar} title="Toggle Sidebar">
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>
        {activeCourseTitle && (
          <h1 className="active-course-label">{activeCourseTitle}</h1>
        )}
      </div>

      <div className="header-right">
        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className="icon-btn" style={{ marginRight: '12px' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {/* User Profile View */}
        <UserMenu />
      </div>
    </header>
  );
}