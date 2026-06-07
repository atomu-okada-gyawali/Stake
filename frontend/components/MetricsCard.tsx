const MetricsCard = () => {
  return (
    <div className="w-[384px] h-[170px] bg-stake-card border border-white/10 p-[21px] relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-stake-accent/10 blur-3xl" />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">Aggregated Metrics</span>
          <h3 className="text-2xl font-bold text-white">Performance</h3>
        </div>
        <div className="text-stake-accent">
            {/* Success Icon */}
            <div className="w-5 h-3 border-b-4 border-r-4 border-current rotate-45" />
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold text-stake-accent">85%</span>
        <span className="text-xs font-bold text-stake-muted pb-1 uppercase">Success Rate</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#353534]">
        <div className="w-[85%] h-full bg-stake-accent shadow-[0_0_8px_rgba(187,244,0,0.5)]" />
      </div>
    </div>
  );
};