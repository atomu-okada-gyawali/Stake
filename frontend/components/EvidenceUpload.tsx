const EvidenceUpload = () => {
  return (
    <div className="w-full h-[272px] bg-[#201F1F] border-2 border-dashed border-stake-muted/40 flex flex-col items-center justify-center space-y-4">
      {/* Upload Icon */}
      <svg className="w-8 h-8 text-stake-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      
      <div className="text-center">
        <p className="text-white text-base font-regular">Drag and drop visual evidence</p>
        <button className="mt-4 border border-stake-accent text-stake-accent px-6 py-2 text-xs font-bold uppercase hover:bg-stake-accent hover:text-black transition-all">
          Browse Files
        </button>
        <p className="mt-3 text-[11px] text-stake-muted uppercase tracking-widest">
          JPG, PNG OR MP4 (Max 50MB)
        </p>
      </div>
    </div>
  );
};