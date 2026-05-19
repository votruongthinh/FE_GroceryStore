import React from 'react';

const ReceiptPayment = ({ method, received, change }) => {
  return (
    <div className="mt-2 border-t border-dotted border-slate-300 pt-2 space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-600 font-medium">Hình thức:</span>
        <span className="font-bold uppercase tracking-tight">{method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản (VNPay)'}</span>
      </div>
      {method === 'cash' && (
        <>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Tiền khách đưa:</span>
            <span className="font-bold">{received.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Tiền thối lại:</span>
            <span className="font-black text-black border-b border-black">{change.toLocaleString()} đ</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ReceiptPayment;
