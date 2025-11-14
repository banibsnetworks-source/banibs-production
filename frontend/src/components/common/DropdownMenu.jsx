import React, { useState, useRef, useEffect } from 'react';

/**
 * Reusable Dropdown Menu Component
 * Phase 3.3 - Unified delete controls
 */
const DropdownMenu = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {React.Children.map(children, (child) =>
            React.cloneElement(child, {
              onClick: (e) => {
                child.props.onClick?.(e);
                setIsOpen(false);
              },
            })
          )}
        </div>
      )}
    </div>
  );
};

export const DropdownMenuItem = ({ onClick, icon: Icon, label, destructive = false }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors ${
        destructive ? 'text-red-500 hover:text-red-600' : 'text-foreground'
      }`}
    >
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </button>
  );
};

export default DropdownMenu;
