import React from 'react';

const ReceiptSummary = ({ subtotal, discount = 0, total }) => {
  return (
    <div className="border-t border-dashed border-slate-400 pt-2 space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-600 font-medium">Tạm tính:</span>
        <span className="font-bold">{subtotal.toLocaleString()} đ</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-600 font-medium">Giảm giá:</span>
          <span className="font-bold">-{discount.toLocaleString()} đ</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-1 mt-1 border-t border-dotted border-slate-200">
        <span className="text-sm font-black uppercase tracking-tight">Tổng cộng:</span>
        <span className="text-xl font-black">{total.toLocaleString()} đ</span>
      </div>
    </div>
  );
};

export default ReceiptSummary;
