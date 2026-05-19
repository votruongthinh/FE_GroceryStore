import { useState, useMemo, useRef, useEffect } from "react";
import { productApi } from "../../api/product.api";
import { orderApi } from "../../api/order.api";
import useAuthStore from "../../store/useAuthStore";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Loader2, 
  Barcode, 
  Package, 
  Plus,
  Minus,
  X,
  ScanLine,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  Banknote,
  QrCode,
  CreditCard,
  User,
  History,
  Save,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";
import { IMAGE_URL } from "../../api/axiosClient";
import POSReceipt from "../../components/pos/POSReceipt";
import InvoiceA4 from "../../components/pos/InvoiceA4";

const POS = () => {
  const { user } = useAuthStore();
  const inputRef = useRef(null);
  
  // Multi-tab state
  const [tabs, setTabs] = useState([
    { id: 1, name: "Khách 1", cart: [], paymentMethod: "cash", receivedAmount: 0 },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  
  // UI State
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [receiptType, setReceiptType] = useState("pos"); // 'pos' or 'a4'

  // Current active tab data
  const currentTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);

  // Update specific field in current tab
  const updateCurrentTab = (updates) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const cart = currentTab?.cart || [];
  const paymentMethod = currentTab?.paymentMethod || "cash";
  const receivedAmount = currentTab?.receivedAmount || 0;

  // Memoized calculations
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  }, [cart]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== "cash") return 0;
    return Math.max(0, receivedAmount - totalAmount);
  }, [receivedAmount, totalAmount, paymentMethod]);

  // Focus effect
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeTabId]);

  const handleAddTab = () => {
    const nextId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs(prev => [...prev, { id: nextId, name: `Khách ${nextId}`, cart: [], paymentMethod: "cash", receivedAmount: 0 }]);
    setActiveTabId(nextId);
  };

  const handleRemoveTab = (id, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    setTabs(prev => prev.filter(t => t.id !== id));
    if (activeTabId === id) {
      setActiveTabId(tabs.find(t => t.id !== id).id);
    }
  };

  const handleSearchProduct = async (e) => {
    const query = e.target.value;
    setProductSearch(query);

    const normalized = query.trim();
    if (normalized.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await productApi.findAll({
        keyword: normalized,
        page: 1,
        pageSize: 8,
        sortByStock: "asc",
      });
      const items = (res.data?.items || res.items || []).filter(
        (item) => item.status && !item.isDeleted,
      );
      setSearchResults(items);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock_quantity <= 0) {
      toast.error(`Sản phẩm ${product.productName} đã hết hàng!`);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    let newCart;
    
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock_quantity) {
        toast.error(`Chỉ còn ${product.stock_quantity} sản phẩm trong kho!`);
        return;
      }
      newCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    updateCurrentTab({ cart: newCart });
    setProductSearch("");
    setSearchResults([]);
    inputRef.current?.focus();
    toast.success(`Đã thêm ${product.productName}`);
  };

  const updateCartQuantity = (id, newQty, stock) => {
    if (newQty <= 0) return;
    if (newQty > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm`);
      return;
    }
    const newCart = cart.map(item => item.id === id ? { ...item, quantity: newQty } : item);
    updateCurrentTab({ cart: newCart });
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    updateCurrentTab({ cart: newCart });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === "cash" && receivedAmount < totalAmount) {
      toast.error("Tiền khách đưa không đủ!");
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        paymentMethod: paymentMethod,
        receivedAmount: paymentMethod === "cash" ? Number(receivedAmount) : totalAmount,
        note: "Giao dich ban tai quay",
        orderDetails: cart.map(item => ({
          productId: item.id,
          amount: item.quantity
        }))
      };

      const res = await orderApi.create(orderData);
      const newOrder = res.data || res;

      if (newOrder.vnpUrl) {
         window.location.href = newOrder.vnpUrl;
         return;
      }

      setLastOrder(newOrder);
      setShowInvoice(true);
      
      // Clear current tab cart
      updateCurrentTab({ cart: [], receivedAmount: 0 });
      toast.success("Thanh toán thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Thanh toán thất bại! " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToExcel = () => {
    if (!lastOrder) return;
    const headers = ["Tên sản phẩm", "Số lượng", "Đơn giá (VND)", "Thành tiền (VND)"];
    const rows = lastOrder.OrderDetails.map(detail => [
      `"${detail.Product.productName}"`,
      detail.amount,
      detail.sellingPrice,
      detail.subtotal
    ]);
    const summary = [
      [],
      ["TỔNG KẾT ĐƠN HÀNG"],
      ["Mã đơn", lastOrder.id],
      ["Ngày", new Date(lastOrder.createdAt).toLocaleString()],
      ["Phương thức thanh toán", lastOrder.paymentMethod.toUpperCase()],
      ["Tổng tiền", lastOrder.total],
      ["Tiền nhận", lastOrder.receivedAmount],
      ["Tiền thối", lastOrder.changeAmount],
      [],
      ["Thu ngân", lastOrder.Users?.fullName || user?.fullName]
    ];
    const csvContent = [headers, ...rows, ...summary].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DonHang_${lastOrder.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col bg-[#f5f7fb] overflow-hidden">
      <div className="flex flex-1 overflow-hidden p-4 lg:p-6 gap-6">
        
        {/* LEFT SECTION (70%) */}
        <div className="flex-[7] flex flex-col min-w-0 gap-6 overflow-hidden">
          
          {/* Search Header */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Barcode className="w-6 h-6" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={productSearch}
                  onChange={handleSearchProduct}
                  placeholder="Quét mã vạch hoặc nhập tên sản phẩm..."
                  className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400 text-lg shadow-inner"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isSearching ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Search className="w-5 h-5" strokeWidth={3} />
                    </div>
                  )}
                </div>
                
                {/* Search Results Overlay */}
                {productSearch.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-3 z-50 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[440px] overflow-y-auto custom-scrollbar ring-8 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {searchResults.length === 0 ? (
                      <div className="p-10 text-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                          <Package className="w-8 h-8 opacity-30" />
                        </div>
                        <p className="font-black">Không tìm thấy sản phẩm</p>
                        <p className="text-xs font-bold mt-1 opacity-60">Thử tìm kiếm với từ khóa khác</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleAddToCart(product)}
                            className="w-full text-left p-3 rounded-2xl hover:bg-primary/5 transition-all flex items-center gap-4 group/item"
                          >
                            <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                              {product.image ? (
                                <img src={`${IMAGE_URL}/${product.image}`} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-7 h-7 text-slate-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-slate-800 truncate group-hover/item:text-primary transition-colors">{product.productName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase">#{product.productCode}</span>
                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${product.stock_quantity > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                  Tồn: {product.stock_quantity}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-primary text-lg leading-none">{Number(product.salePrice).toLocaleString()} đ</p>
                              <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase">Click để thêm</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 3H2l8 9v6l4 4v-10L22 3z"/>
                    </svg>
                  </div>
                  <span className="text-sm">Tìm nâng cao</span>
                </button>
                <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

          {/* Customer Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar shrink-0">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 min-w-[140px] relative overflow-hidden ${
                  activeTabId === tab.id
                    ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10"
                    : "border-white bg-white text-slate-400 hover:border-slate-200"
                }`}
              >
                <User className={`w-5 h-5 ${activeTabId === tab.id ? "text-primary" : "text-slate-300"}`} />
                <span className="font-black text-sm whitespace-nowrap">{tab.name}</span>
                {tab.cart.length > 0 && (
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${
                    activeTabId === tab.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {tab.cart.length}
                  </span>
                )}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleRemoveTab(tab.id, e)}
                    className="ml-2 p-1 rounded-md hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {activeTabId === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                )}
              </div>
            ))}
            <button
              onClick={handleAddTab}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
              title="Thêm hóa đơn mới"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Table Container */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-50">
                  <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    <th className="pl-8 py-5 w-12 text-center">#</th>
                    <th className="px-4 py-5">Sản phẩm</th>
                    <th className="px-4 py-5 text-right">Đơn giá</th>
                    <th className="px-4 py-5 text-center">Số lượng</th>
                    <th className="px-4 py-5 text-right">Thành tiền</th>
                    <th className="pr-8 py-5 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-32">
                        <div className="flex flex-col items-center justify-center text-center opacity-40">
                          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                             <ScanLine className="w-12 h-12 text-slate-300" />
                          </div>
                          <p className="text-xl font-black text-slate-500">Giỏ hàng đang trống</p>
                          <p className="text-sm font-bold text-slate-400 mt-2">Quét mã vạch để bắt đầu bán hàng</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, index) => (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="pl-8 py-4 text-center">
                          <span className="text-xs font-black text-slate-300 group-hover:text-primary">{index + 1}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                              {item.image ? (
                                <img src={`${IMAGE_URL}/${item.image}`} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-7 h-7 text-slate-200" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 text-sm mb-0.5 truncate">{item.productName}</p>
                              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                                <Barcode className="w-3 h-3" /> {item.productCode}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-bold text-slate-700 text-sm">{Number(item.salePrice).toLocaleString()} đ</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.stock_quantity)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                              >
                                <Minus className="w-3 h-3" strokeWidth={3} />
                              </button>
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateCartQuantity(item.id, Number(e.target.value), item.stock_quantity)}
                                className="w-10 text-center font-black text-slate-800 bg-transparent outline-none text-sm"
                              />
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.stock_quantity)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                              >
                                <Plus className="w-3 h-3" strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-black text-primary text-sm">{(item.salePrice * item.quantity).toLocaleString()} đ</span>
                        </td>
                        <td className="pr-8 py-4 text-right">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sticky Table Footer */}
            <div className="bg-white border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.03)]">
               <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng số lượng</span>
                     <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-300" />
                        <span className="font-black text-slate-800 text-xl">{cart.reduce((a,c) => a+c.quantity, 0)} <span className="text-xs font-bold text-slate-400">sản phẩm</span></span>
                     </div>
                  </div>
                  <div className="h-10 w-[2px] bg-slate-50"></div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tạm tính</span>
                     <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-slate-300" />
                        <span className="font-black text-slate-800 text-xl">{totalAmount.toLocaleString()} đ</span>
                     </div>
                  </div>
                  <div className="h-10 w-[2px] bg-slate-50"></div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giảm giá</span>
                     <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-xl">0 đ</span>
                        <button className="p-1 hover:bg-slate-50 rounded text-slate-400"><Plus className="w-4 h-4" /></button>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Tổng cộng</span>
                    <span className="text-4xl font-black text-primary leading-none tracking-tighter">{totalAmount.toLocaleString()} <span className="text-sm font-bold opacity-50">VND</span></span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION (30%) */}
        <div className="flex-[3] flex flex-col min-w-[360px] gap-6 overflow-y-auto custom-scrollbar">
          
          {/* Tóm tắt thanh toán Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 flex flex-col overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <h3 className="font-black text-slate-800 flex items-center gap-3 text-sm uppercase tracking-wider">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                  <History className="w-4 h-4" strokeWidth={3} />
                </div>
                Tóm tắt thanh toán
              </h3>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-sm">Số lượng sản phẩm</span>
                <span className="font-black text-slate-700">{cart.reduce((a,c) => a+c.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-sm">Tạm tính</span>
                <span className="font-black text-slate-700">{totalAmount.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-sm">Thuế VAT (0%)</span>
                <span className="font-black text-slate-700">0 đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-sm">Giảm giá</span>
                <span className="font-black text-emerald-500">0 đ</span>
              </div>
              
              <div className="pt-6 mt-2 border-t-2 border-slate-100 border-dashed">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng</span>
                  <span className="text-4xl font-black text-primary leading-none tracking-tighter">
                    {totalAmount.toLocaleString()} <span className="text-xs font-bold opacity-50 uppercase">đ</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 flex flex-col gap-5 transition-all hover:shadow-md">
            <h3 className="font-black text-slate-800 flex items-center gap-3 text-sm uppercase tracking-wider">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" strokeWidth={3} />
              </div>
              Phương thức thanh toán
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cash', label: 'Tiền mặt', icon: Banknote },
                { id: 'vnpay', label: 'QR Code', icon: QrCode },
                { id: 'transfer', label: 'Chuyển khoản', icon: CreditCard }
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => updateCurrentTab({ paymentMethod: method.id })}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5 text-primary shadow-md shadow-primary/10"
                      : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    paymentMethod === method.id ? "bg-primary text-white" : "bg-white text-slate-300 shadow-sm"
                  }`}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{method.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' && (
              <div className="mt-2 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="relative group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-4 bg-white px-2 z-10">
                    Tiền khách đưa
                  </label>
                  <input 
                    type="number"
                    value={receivedAmount || ""}
                    onChange={(e) => updateCurrentTab({ receivedAmount: Number(e.target.value) })}
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-2xl text-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all placeholder:text-slate-300"
                    placeholder="0.000"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold italic text-sm">VND</span>
                </div>
                
                <div className="p-5 bg-emerald-50/50 rounded-[24px] border border-emerald-100 flex flex-col gap-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Banknote className="w-24 h-24 -mr-6 -mt-6" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest relative z-10">Tiền thừa trả lại</span>
                  <span className={`text-4xl font-black relative z-10 tracking-tighter ${changeAmount > 0 ? 'text-emerald-700' : 'text-emerald-200'}`}>
                    {changeAmount.toLocaleString()} <span className="text-sm font-bold opacity-60">đ</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons & Checkout */}
          <div className="mt-auto space-y-4">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing || (paymentMethod === "cash" && receivedAmount < totalAmount)}
              className="w-full py-6 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark text-white rounded-[24px] font-black text-xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:shadow-none flex items-center justify-center gap-4 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {isProcessing ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span>ĐANG XỬ LÝ...</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="relative z-10">HOÀN TẤT THANH TOÁN (F1)</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                </>
              )}
            </button>
            
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-100 rounded-[20px] shadow-sm hover:bg-slate-50 transition-all active:scale-95 group">
                <Save className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lưu tạm</span>
              </button>
              <button onClick={() => window.print()} className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-100 rounded-[20px] shadow-sm hover:bg-slate-50 transition-all active:scale-95 group">
                <Printer className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In hóa đơn</span>
              </button>
              <button onClick={() => updateCurrentTab({ cart: [], receivedAmount: 0 })} className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-100 rounded-[20px] shadow-sm hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 group">
                <Trash className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Xóa tất cả</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT RECEIPT MODAL */}
      {showInvoice && lastOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-auto">
            
            <div className="bg-white px-8 py-5 border-b border-slate-50 flex items-center justify-between print:hidden">
              <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl">
                <button 
                  onClick={() => setReceiptType("pos")}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${receiptType === 'pos' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Bill K80
                </button>
                <button 
                  onClick={() => setReceiptType("a4")}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${receiptType === 'a4' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Hóa đơn A4
                </button>
              </div>
              <button 
                onClick={() => setShowInvoice(false)}
                className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-slate-50/20 custom-scrollbar print:p-0 print:overflow-visible print:bg-white">
              <div className="flex justify-center">
                {receiptType === 'pos' ? (
                  <POSReceipt order={lastOrder} user={user} />
                ) : (
                  <InvoiceA4 order={lastOrder} user={user} />
                )}
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-50 flex gap-4 print:hidden">
              <button 
                onClick={() => window.print()}
                className="flex-[2] py-5 bg-slate-900 hover:bg-slate-950 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 text-xs uppercase tracking-widest active:scale-95"
              >
                <Printer className="w-5 h-5" />
                In hóa đơn ngay
              </button>
              
              <button 
                onClick={exportToExcel}
                className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 text-xs uppercase tracking-widest active:scale-95"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Excel
              </button>

              <button 
                onClick={() => {
                  setShowInvoice(false);
                  setCart([]);
                  setReceivedAmount(0);
                }}
                className="w-20 h-16 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-all active:scale-95 shadow-sm"
                title="Đơn mới"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
