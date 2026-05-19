import React from 'react';

const ReceiptFooter = () => {
  return (
    <div className="mt-4 text-center space-y-1 pb-2">
      <div className="text-[11px] font-bold italic text-black">
        Cảm ơn quý khách. Hẹn gặp lại!
      </div>
      <div className="text-[9px] text-slate-500 uppercase tracking-tighter">
        (Vui lòng giữ lại hóa đơn để đối soát)
      </div>
      <div className="flex justify-center items-center gap-2 pt-2 opacity-50">
        <div className="h-[1px] w-12 bg-slate-400"></div>
      </div>
    </div>
  );
};

export default ReceiptFooter;
