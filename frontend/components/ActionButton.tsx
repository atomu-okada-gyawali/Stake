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

export default Button;