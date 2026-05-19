import React from 'react';
import ReactDOM from 'react-dom';

const InvoiceA4 = ({ order, user }) => {
  if (!order) return null;

  const dateStr = new Date(order.createdAt || order.orderDate).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const invoiceContent = (
    <div id="invoice-a4-print-portal" className="print:block hidden">
      <style>
        {`
          @media screen {
            #invoice-a4-print-portal {
              display: none;
            }
          }
          @media print {
            @page {
              margin: 10mm;
              size: A4;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }
            #root {
              display: none !important;
            }
            #invoice-a4-print-portal {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              visibility: visible !important;
              font-family: 'Inter', sans-serif !important;
            }
            #invoice-a4-print-portal * {
              visibility: visible !important;
            }
          }
        `}
      </style>
      
      <div className="bg-white p-8 max-w-[210mm] mx-auto text-slate-800">
        <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-2xl">G</div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-slate-900">GroceryPOS</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hóa đơn bán hàng</p>
                </div>
            </div>
            <div className="text-right">
            <p className="text-sm font-black text-slate-900">Mã hóa đơn</p>
            <p className="text-2xl font-black text-primary">#HD{String(order.id).padStart(6, '0')}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Thông tin cửa hàng</p>
                <p className="font-bold text-slate-800">GroceryPOS Store</p>
                <p className="text-sm text-slate-500 leading-relaxed">123 Nguyễn Văn A, TP.HCM</p>
                <p className="text-sm text-slate-500 leading-relaxed">Hotline: 0909 123 456</p>
            </div>
            </div>
            <div className="text-right space-y-4">
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Chi tiết đơn hàng</p>
                <div className="space-y-1">
                    <div className="flex justify-end gap-4 text-sm">
                        <span className="text-slate-400">Ngày lập:</span>
                        <span className="font-bold text-slate-800">{dateStr}</span>
                    </div>
                    <div className="flex justify-end gap-4 text-sm">
                        <span className="text-slate-400">Thu ngân:</span>
                        <span className="font-bold text-slate-800">{order.Users?.fullName || user?.fullName}</span>
                    </div>
                    <div className="flex justify-end gap-4 text-sm">
                        <span className="text-slate-400">Thanh toán:</span>
                        <span className="font-bold text-slate-800 uppercase">{order.paymentMethod}</span>
                    </div>
                </div>
            </div>
            </div>
        </div>

        <div className="mb-12 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">Sản phẩm</th>
                    <th className="px-6 py-4 text-center">Số lượng</th>
                    <th className="px-6 py-4 text-right">Đơn giá</th>
                    <th className="px-6 py-4 text-right">Thành tiền</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {order.OrderDetails?.map((item, idx) => (
                    <tr key={idx}>
                    <td className="px-6 py-5">
                        <p className="font-bold text-slate-800">{item.Product?.productName || item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase mt-0.5">SKU: {item.Product?.productCode || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-600">{item.amount || item.quantity}</td>
                    <td className="px-6 py-5 text-right font-medium text-slate-600">{Number(item.sellingPrice || item.salePrice).toLocaleString()} đ</td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">{Number(item.subtotal || (item.salePrice * item.quantity)).toLocaleString()} đ</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

        <div className="flex justify-end mb-12">
            <div className="w-72 space-y-4">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Tạm tính:</span>
                <span className="font-bold text-slate-700">{Number(order.total).toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Chiết khấu / Giảm giá:</span>
                <span className="font-bold text-slate-700">0 đ</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tighter text-slate-900">Tổng thanh toán</span>
                <span className="text-3xl font-black text-primary tracking-tighter leading-none">{Number(order.total).toLocaleString()} đ</span>
            </div>
            </div>
        </div>

        <div className="mt-12 text-center border-t border-slate-50 pt-12">
            <p className="font-black text-slate-900 uppercase tracking-widest text-sm mb-2">Cảm ơn quý khách đã tin tưởng!</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Mọi thắc mắc về đơn hàng, vui lòng liên hệ hotline 0909 123 456 hoặc ghé trực tiếp cửa hàng để được hỗ trợ tốt nhất.
            </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white p-8 max-w-[210mm] mx-auto text-slate-800 font-sans shadow-lg border border-slate-100 mb-8 rounded-xl overflow-hidden print:hidden">
        <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-2xl">G</div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-slate-900">GroceryPOS</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hóa đơn bán hàng</p>
                </div>
            </div>
            <div className="text-right">
            <p className="text-sm font-black text-slate-900">Mã hóa đơn</p>
            <p className="text-2xl font-black text-primary">#HD{String(order.id).padStart(6, '0')}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Thông tin cửa hàng</p>
                <p className="font-bold text-slate-800">GroceryPOS Store</p>
                <p className="text-sm text-slate-500 leading-relaxed">123 Nguyễn Văn A, TP.HCM</p>
                <p className="text-sm text-slate-500 leading-relaxed">Hotline: 0909 123 456</p>
            </div>
            </div>
            <div className="text-right space-y-4">
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Chi tiết đơn hàng</p>
                <div className="space-y-1">
                    <div className="flex justify-end gap-4 text-sm">
                        <span className="text-slate-400">Ngày lập:</span>
                        <span className="font-bold text-slate-800">{dateStr}</span>
                    </div>
                    <div className="flex justify-end gap-4 text-sm">
                        <span className="text-slate-400">Thu ngân:</span>
                        <span className="font-bold text-slate-800">{order.Users?.fullName || user?.fullName}</span>
                    </div>
                    <div className="flex justify-end gap-4 text-sm">
                        <span className="text-slate-400">Thanh toán:</span>
                        <span className="font-bold text-slate-800 uppercase">{order.paymentMethod}</span>
                    </div>
                </div>
            </div>
            </div>
        </div>

        <div className="mb-12 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">Sản phẩm</th>
                    <th className="px-6 py-4 text-center">Số lượng</th>
                    <th className="px-6 py-4 text-right">Đơn giá</th>
                    <th className="px-6 py-4 text-right">Thành tiền</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {order.OrderDetails?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                        <p className="font-bold text-slate-800">{item.Product?.productName || item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase mt-0.5">SKU: {item.Product?.productCode || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-600">{item.amount || item.quantity}</td>
                    <td className="px-6 py-5 text-right font-medium text-slate-600">{Number(item.sellingPrice || item.salePrice).toLocaleString()} đ</td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">{Number(item.subtotal || (item.salePrice * item.quantity)).toLocaleString()} đ</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

        <div className="flex justify-end mb-12">
            <div className="w-72 space-y-4">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Tạm tính:</span>
                <span className="font-bold text-slate-700">{Number(order.total).toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Chiết khấu / Giảm giá:</span>
                <span className="font-bold text-slate-700">0 đ</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tighter text-slate-900">Tổng thanh toán</span>
                <span className="text-3xl font-black text-primary tracking-tighter leading-none">{Number(order.total).toLocaleString()} đ</span>
            </div>
            </div>
        </div>

        <div className="mt-12 text-center border-t border-slate-50 pt-12">
            <p className="font-black text-slate-900 uppercase tracking-widest text-sm mb-2">Cảm ơn quý khách đã tin tưởng!</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Mọi thắc mắc về đơn hàng, vui lòng liên hệ hotline 0909 123 456 hoặc ghé trực tiếp cửa hàng để được hỗ trợ tốt nhất.
            </p>
        </div>
      </div>
      {ReactDOM.createPortal(invoiceContent, document.body)}
    </>
  );
};

export default InvoiceA4;
