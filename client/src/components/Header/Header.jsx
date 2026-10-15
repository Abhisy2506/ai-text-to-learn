import { PanelLeft, PanelLeftClose, Sun, Moon } from 'lucide-react';
import UserMenu from './UserMenu';
import useTheme from '../../hooks/useTheme';
import { useCourse } from '../../context/CourseContext';
import './header.css';

export default function Header({ isSidebarOpen, onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { activeCourse } = useCourse();

  return (
    <header className="top-header">
      <div className="header-left">
        <button 
          className="icon-btn toggle-btn" 
          onClick={onToggleSidebar} 
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>
        {activeCourse?.title && (
          <h1 className="active-course-label">{activeCourse.title}</h1>
        )}
      </div>

      <div className="header-right">
        <button 
          onClick={toggleTheme} 
          className="icon-btn" 
          style={{ marginRight: '12px' }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <UserMenu />
      </div>
    </header>
  );
}