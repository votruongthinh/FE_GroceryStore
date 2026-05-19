import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReceiptHeader from './ReceiptHeader';
import ReceiptItems from './ReceiptItems';
import ReceiptSummary from './ReceiptSummary';
import ReceiptPayment from './ReceiptPayment';
import ReceiptFooter from './ReceiptFooter';

const POSReceipt = ({ order, user }) => {
  if (!order) return null;

  const dateStr = new Date(order.createdAt || order.orderDate).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const receiptContent = (
    <div id="pos-receipt-print-portal" className="print:block hidden">
      <style>
        {`
          @media screen {
            #pos-receipt-print-portal {
              display: none;
            }
          }
          @media print {
            @page {
              margin: 0;
              size: 80mm auto;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              width: 80mm !important;
              height: auto !important;
            }
            #root {
              display: none !important;
            }
            #pos-receipt-print-portal {
              display: block !important;
              width: 80mm !important;
              margin: 0 !important;
              padding: 4mm !important;
              position: relative !important;
              visibility: visible !important;
              font-family: 'Inter', sans-serif !important;
              background: white !important;
              color: black !important;
            }
            #pos-receipt-print-portal * {
              visibility: visible !important;
              box-sizing: border-box !important;
            }
            .no-print {
              display: none !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
      
      <div className="w-[80mm] bg-white text-slate-900">
        <ReceiptHeader 
          orderId={order.id} 
          date={dateStr} 
          cashierName={order.Users?.fullName || user?.fullName} 
        />
        
        <ReceiptItems items={order.OrderDetails || []} />
        
        <ReceiptSummary 
          subtotal={Number(order.total)} 
          total={Number(order.total)} 
        />
        
        <ReceiptPayment 
          method={order.paymentMethod} 
          received={Number(order.receivedAmount)} 
          change={Number(order.changeAmount || 0)} 
        />
        
        <ReceiptFooter />
      </div>
    </div>
  );

  return (
    <>
      {/* On-screen preview (non-portal, stays in modal) */}
      <div className="w-[80mm] mx-auto bg-white p-6 shadow-sm font-sans text-slate-900 border border-slate-100 print:hidden">
        <ReceiptHeader 
          orderId={order.id} 
          date={dateStr} 
          cashierName={order.Users?.fullName || user?.fullName} 
        />
        <ReceiptItems items={order.OrderDetails || []} />
        <ReceiptSummary subtotal={Number(order.total)} total={Number(order.total)} />
        <ReceiptPayment 
          method={order.paymentMethod} 
          received={Number(order.receivedAmount)} 
          change={Number(order.changeAmount || 0)} 
        />
        <ReceiptFooter />
      </div>

      {/* Actual print element (Portal to document.body) */}
      {ReactDOM.createPortal(receiptContent, document.body)}
    </>
  );
};

export default POSReceipt;
