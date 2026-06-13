import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * - 'outline-lime': Maps to the standard "BROWSE FILES" brand button configuration
   * - 'link': Navigation links such as "Profile" or "Support"
   * - 'danger-link': Specifically styled high-contrast "Log Out" variant
   * - 'icon': Smooth circular action icon wrapper (e.g., standard trailing utilities)
   */
  variant?: 'outline-lime' | 'link' | 'danger-link' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'outline-lime',
  children,
  className = '',
  ...props
}) => {
  // Base styles integrating your 'font-poppins' extension token directly
  const baseStyles = 'font-poppins font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stake-accent/40 focus:ring-offset-2 focus:ring-offset-stake-bg';

  const variantStyles = {
    // Matches the exact Figma padding, border stroke, and capital typography for "BROWSE FILES"
    'outline-lime': 'px-[25px] py-[9px] border border-stake-accent text-stake-accent text-[12px] uppercase tracking-wider rounded-sm hover:bg-stake-accent/10 active:scale-[0.98]',
    
    // Matches primary bold layout actions like "Profile" (20px font style scale down to 12px for small displays)
    'link': 'text-stake-muted text-[12px] lg:text-[20px] bg-transparent p-0 hover:text-stake-textLight active:opacity-70',
    
    // Matches your dedicated 'stake-logout' semantic token configuration setup
    'danger-link': 'text-stake-dangerText text-[20px] bg-transparent p-0 hover:text-opacity-80 active:opacity-60',
    
    // Icon wrapper using standard frame vectors matching file indicators
    'icon': 'p-2 text-stake-textLight hover:bg-white/10 rounded-full flex items-center justify-center transition-colors',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Example arrangement blueprint tracking standard layout placements
export const SampleButtonContainer: React.FC = () => {
  return (
    <div className="p-8 bg-stake-bg border border-white/10 rounded-lg flex flex-col md:flex-row items-center gap-6">
      {/* 1. Main interaction type */}
      <Button variant="outline-lime" onClick={() => alert('Browsing actions...')}>
        Browse Files
      </Button>

      {/* 2. Secondary route link type */}
      <Button variant="link" onClick={() => alert('Navigating to profile...')}>
        Profile
      </Button>

      {/* 3. Safe system exit boundary link type */}
      <Button variant="danger-link" onClick={() => alert('Terminating session...')}>
        Log Out
      </Button>

      {/* 4. Modular generic trailing system vector option */}
      <Button variant="icon" aria-label="Settings Utility Button">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </Button>
    </div>
  );
};

export default Button;