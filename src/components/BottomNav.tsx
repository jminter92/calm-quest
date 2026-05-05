import type { TabKey } from '../types';

const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'today', label: 'Today', icon: 'O' },
  { key: 'log', label: 'Log', icon: '+' },
  { key: 'progress', label: 'Progress', icon: '=' },
  { key: 'settings', label: 'Settings', icon: '*' }
];

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          className={active === tab.key ? 'nav-item active' : 'nav-item'}
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
        >
          <span aria-hidden="true">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
