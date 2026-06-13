const TaskHeader = () => {
  return (
    <div className="w-full bg-[#201F1F] border border-stake-muted/30 p-6 flex justify-between items-center">
      <div className="space-y-1">
        <span className="text-stake-accent text-xs font-bold uppercase tracking-tighter">
          April 22, 12:14 PM
        </span>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Afternoon Run</h1>
        <p className="text-stake-muted text-base font-regular">
          3km run from Anamnagar to Pashupatinath (Round)
        </p>
      </div>
      
      <button className="bg-stake-accent text-[#161E00] px-8 py-3 font-bold text-xs uppercase hover:opacity-90 transition-opacity">
        Submit Proof
      </button>
    </div>
  );
};