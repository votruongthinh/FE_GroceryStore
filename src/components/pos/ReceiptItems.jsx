import React from 'react';

const ReceiptItems = ({ items }) => {
  return (
    <div className="my-2">
      <div className="grid grid-cols-12 gap-1 text-[10px] font-black border-b border-slate-400 pb-1 mb-1.5 uppercase tracking-wider">
        <div className="col-span-6">Sản phẩm</div>
        <div className="col-span-2 text-center">SL</div>
        <div className="col-span-4 text-right">Tổng</div>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="text-[12px] leading-tight">
            <div className="font-bold text-black truncate">
              {item.Product?.productName || item.productName}
            </div>
            <div className="grid grid-cols-12 gap-1 text-slate-600 mt-0.5">
              <div className="col-span-8">
                {item.amount || item.quantity} x {Number(item.sellingPrice || item.salePrice).toLocaleString()}
              </div>
              <div className="col-span-4 text-right font-bold text-black">
                {Number(item.subtotal || (item.salePrice * item.quantity)).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceiptItems;
