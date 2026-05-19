import React from 'react';

const ReceiptHeader = ({ orderId, date, cashierName }) => {
  return (
    <div className="text-center mb-2">
      <div className="flex justify-center mb-1">
        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">
          G
        </div>
      </div>
      <h1 className="text-lg font-black uppercase tracking-tight">GroceryPOS</h1>
      <p className="text-[10px] text-slate-600 leading-tight">
        123 Nguyễn Văn A, TP.HCM<br />
        Hotline: 0909 123 456
      </p>
      
      <div className="mt-2 border-t border-b border-dashed border-slate-400 py-1.5">
        <h2 className="text-sm font-bold">Mã hóa đơn: HD{String(orderId).padStart(6, '0')}</h2>
        <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
          <span>{date}</span>
          <span className="truncate ml-2">TN: {cashierName}</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptHeader;
