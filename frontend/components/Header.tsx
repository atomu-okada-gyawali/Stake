import React from 'react';

const Header = () => {
  return (
    <nav className="fixed top-0 w-full h-[97px] bg-stake-bg/80 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between z-50">
      {/* Logo */}
      <div className="text-2xl font-black text-white tracking-tight">STAKE</div>
      
      {/* Navigation Links */}
      <div className="flex items-center gap-8">
        <button className="text-[20px] font-bold text-stake-muted hover:text-stake-accent transition-colors">
          Circle Feed
        </button>
        <button className="text-[20px] font-bold text-stake-muted hover:text-stake-accent flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-current rounded-full" />
          Profile
        </button>
        <button className="text-[20px] font-bold text-stake-logout hover:opacity-80">
          Log Out
        </button>
        
        <div className="h-6 w-[1px] bg-white/10" />
        
        <div className="flex gap-4">
          {/* Simple Icon Placeholders */}
          <div className="w-5 h-5 bg-stake-muted opacity-90 rounded-sm cursor-pointer" />
          <div className="w-5 h-5 bg-stake-muted opacity-90 rounded-sm cursor-pointer" />
        </div>
      </div>
    </nav>
  );
};

export default Header;