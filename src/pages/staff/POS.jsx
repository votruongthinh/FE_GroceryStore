import { useState, useMemo, useRef, useEffect } from "react";
import { productApi } from "../../api/product.api";
import { orderApi } from "../../api/order.api";
import useAuthStore from "../../store/useAuthStore";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Receipt, 
  Loader2, 
  Barcode, 
  Package, 
  Hash, 
  DollarSign, 
  Plus,
  Minus,
  Check,
  CheckCircle2,
  X,
  ScanLine,
  ChevronRight,
  Printer,
  FileDown,
  FileSpreadsheet,
  Banknote,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { IMAGE_URL } from "../../api/axiosClient";

const POS = () => {
  const { user } = useAuthStore();
  const inputRef = useRef(null);
  
  // Form State
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receivedAmount, setReceivedAmount] = useState(0);

  // Focus effect
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Use memoized total for convenience
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  }, [cart]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== "cash") return 0;
    return Math.max(0, receivedAmount - totalAmount);
  }, [receivedAmount, totalAmount, paymentMethod]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSearchResults([]);
  };

  const handleSearchProduct = async (e) => {
    const query = e.target.value;
    setProductSearch(query);

    const normalized = query.trim();
    if (normalized.length < 2) {
      setSelectedProduct(null);
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

      const exactByCode = items.find(
        (item) =>
          String(item.productCode).toLowerCase() === normalized.toLowerCase(),
      );
      const exactByName = items.find(
        (item) =>
          String(item.productName).toLowerCase() === normalized.toLowerCase(),
      );
      setSelectedProduct(exactByCode || exactByName || items[0] || null);
    } catch (err) {
      console.error(err);
      setSelectedProduct(null);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error("Vui lòng chọn sản phẩm trước");
      return;
    }

    if (quantity <= 0) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    if (selectedProduct.stock_quantity < quantity) {
      toast.error(`Chỉ còn ${selectedProduct.stock_quantity} sản phẩm trong kho!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === selectedProduct.id);
      if (existing) {
        const newQuantity = existing.quantity + Number(quantity);
        if (newQuantity > selectedProduct.stock_quantity) {
          toast.error(`Không thể thêm nữa. Giới hạn tồn kho: ${selectedProduct.stock_quantity}`);
          return prev;
        }
        return prev.map((item) =>
          item.id === selectedProduct.id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [
        ...prev, 
        { 
          ...selectedProduct, 
          quantity: Number(quantity),
          categoryName: selectedProduct.Category?.categoryName || "Chưa phân loại"
        }
      ];
    });

    // Reset form
    setSelectedProduct(null);
    setSearchResults([]);
    setProductSearch("");
    setQuantity(1);
    inputRef.current?.focus();
    toast.success("Đã thêm vào giỏ hàng");
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id, newQty, stock) => {
    if (newQty <= 0) return;
    if (newQty > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm`);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
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
      setCart([]);
      setReceivedAmount(0);
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
    
    // Header for CSV
    const headers = ["Tên sản phẩm", "Số lượng", "Đơn giá (VND)", "Thành tiền (VND)"];
    
    // Data rows from the order details
    const rows = lastOrder.OrderDetails.map(detail => [
      `"${detail.Product.productName}"`, // Use quotes to handle commas in names
      detail.amount,
      detail.sellingPrice,
      detail.subtotal
    ]);
    
    // Summary info
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
    
    const csvContent = [headers, ...rows, ...summary]
      .map(row => row.join(","))
      .join("\n");
      
    // Create blob and trigger download
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DonHang_${lastOrder.id}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="-m-4 flex min-h-full flex-col overflow-y-auto bg-slate-50/50 p-4 md:-m-6 md:p-6 lg:h-full lg:overflow-hidden">
      {/* 12-Column Grid Layout */}
      <div className="grid min-h-0 grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12 lg:h-full">
        
        {/* TOP SECTION: Sản phẩm Input (Fixed Height) */}
        <div className="col-span-1 lg:col-span-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col gap-6">
              {/* Sản phẩm Scanner/Search - Full Width at Top */}
              <div className="w-full group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
                  Quét / tìm sản phẩm
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={productSearch}
                    onChange={handleSearchProduct}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchResults.length > 0) {
                        e.preventDefault();
                        handleSelectProduct(searchResults[0]);
                      }
                    }}
                    placeholder="Nhập tên hoặc mã sản phẩm..."
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                  />
                  {isSearching ? (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                      <Search className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {productSearch.trim().length >= 2 && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {isSearching ? (
                      <div className="px-4 py-3 text-xs font-semibold text-slate-400">
                        Đang tìm sản phẩm...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-4 py-3 text-xs font-semibold text-slate-400">
                        Không tìm thấy sản phẩm phù hợp
                      </div>
                    ) : (
                      searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className={`w-full text-left px-4 py-3 border-t border-slate-100 first:border-t-0 hover:bg-slate-50 transition ${
                            selectedProduct?.id === product.id
                              ? "bg-primary/5"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {product.productName}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {product.productCode}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-primary">
                                {Number(product.salePrice).toLocaleString()} VND
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Tồn: {product.stock_quantity}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Sản phẩm Preview Info - Detailed Row Below */}
              <div className="min-h-[100px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed overflow-hidden p-4">
                {selectedProduct ? (
                  <div className="flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-300 w-full">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {selectedProduct.image ? (
                          <img 
                            src={`${IMAGE_URL}/${selectedProduct.image}`} 
                            alt={selectedProduct.productName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                            {selectedProduct.Category?.categoryName || "Chua phan loai"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Mã SP: {selectedProduct.productCode}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 truncate text-xl leading-tight">
                          {selectedProduct.productName}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xl font-black text-primary">
                            {Number(selectedProduct.salePrice).toLocaleString()} <span className="text-[10px] font-bold">VND</span>
                          </span>
                          <span className="text-sm text-slate-300 line-through decoration-slate-300">
                            {(Number(selectedProduct.salePrice) * 1.15).toLocaleString()}
                          </span>
                          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                            Tồn kho:
                            <span className={`px-1.5 py-0.5 rounded-md font-bold ${selectedProduct.stock_quantity > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              {selectedProduct.stock_quantity}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Thành tiền dòng</span>
                        <span className="text-2xl font-black text-slate-800">
                          {(selectedProduct.salePrice * quantity).toLocaleString()} <span className="text-xs font-bold opacity-40">đ</span>
                        </span>
                      </div>
                      
                      {/* Số lượng Selector */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm h-12">
                        <button 
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-r border-slate-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input 
                          type="number" 
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-14 text-center font-bold text-slate-800 bg-transparent outline-none text-lg"
                        />
                        <button 
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-l border-slate-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={handleAddToCart}
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 font-black text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-0 sm:w-auto sm:px-8"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        THÊM VÀO GIỎ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-slate-300 gap-2">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-1">
                      <ScanLine className="w-6 h-6 opacity-30" />
                    </div>
                    <p className="font-bold text-xs uppercase tracking-widest opacity-60">Đang chờ quét sản phẩm...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LEFT SECTION: Cart Table (70% - Col 8) */}
        <div className="col-span-1 flex min-h-0 flex-col lg:col-span-8">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Giỏ hàng hiện tại</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cart.length} mặt hàng trong danh sách</p>
                </div>
              </div>
              <button 
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase"
              >
                <X className="w-3 h-3" strokeWidth={3} />
                Xóa danh sách
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50/30">
              <table className="min-w-[720px] w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="pl-6 py-4">Sản phẩm</th>
                    <th className="px-4 py-4 text-center">Số lượng</th>
                    <th className="px-4 py-4 text-right">Đơn giá bán</th>
                    <th className="px-4 py-4 text-right">Thành tiền</th>
                    <th className="pr-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-32">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 border-dashed">
                             <ShoppingCart className="w-10 h-10 text-slate-200" />
                          </div>
                          <p className="font-bold text-slate-400">Giỏ hàng đang trống</p>
                          <p className="text-xs text-slate-300 mt-1 max-w-[200px]">Quét sản phẩm để bắt đầu bán hàng cho khách</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => (
                      <tr key={item.id} className="group hover:bg-white transition-colors">
                        <td className="pl-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                              {item.image ? (
                                <img 
                                  src={`${IMAGE_URL}/${item.image}`} 
                                  alt={item.productName} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-slate-200" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate text-sm capitalize">{item.productName}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.categoryName}</span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] text-slate-400 font-medium tracking-tight">#{item.productCode}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center bg-slate-100/50 rounded-lg p-0.5 border border-slate-200 transition-colors focus-within:bg-white focus-within:border-primary/30">
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.stock_quantity)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateCartQuantity(item.id, Number(e.target.value), item.stock_quantity)}
                                className="w-10 text-center font-black text-slate-700 bg-transparent outline-none text-sm"
                              />
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.stock_quantity)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-bold text-slate-800 text-sm">{Number(item.salePrice).toLocaleString()} đ</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-black text-primary italic">{(item.salePrice * item.quantity).toLocaleString()} đ</p>
                        </td>
                        <td className="pr-6 py-4 text-right">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
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

            {/* Cart Footer */}
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
               <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng số lượng</span>
                     <span className="font-bold text-slate-800 text-lg">{cart.reduce((a,c) => a+c.quantity, 0)}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200"></div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tạm tính</span>
                     <span className="font-bold text-slate-800 text-lg">{totalAmount.toLocaleString()} đ</span>
                  </div>
               </div>
               <div className="text-left sm:text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Tổng cộng</span>
                  <span className="text-3xl font-black text-primary leading-none">{totalAmount.toLocaleString()} <span className="text-sm font-bold opacity-70">đ</span></span>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Payment & Summary (30% - Col 4) */}
        <div className="col-span-1 flex min-h-0 flex-col gap-4 md:gap-6 lg:col-span-4">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/30 px-4 py-4 md:px-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" strokeWidth={3} />
                Tóm tắt thanh toán
              </h3>
            </div>
            
            <div className="flex-1 space-y-6 overflow-auto p-4 md:p-6">
              {/* Info Rows */}
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Số lượng sản phẩm</span>
                    <span className="font-black text-slate-700">{cart.reduce((a,c) => a+c.quantity, 0)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Tạm tính</span>
                    <span className="font-black text-slate-700">{totalAmount.toLocaleString()} đ</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Thuế (0%)</span>
                    <span className="font-black text-slate-700">0 đ</span>
                 </div>
                 <div className="pt-3 mt-3 border-t border-slate-100 border-dashed flex justify-between items-end">
                    <span className="text-lg font-bold text-slate-800">Cần thanh toán</span>
                    <span className="text-3xl font-black text-primary leading-none tracking-tight">
                       {totalAmount.toLocaleString()} <span className="text-xs font-bold opacity-60 italic">VND</span>
                    </span>
                 </div>
              </div>

              {/* Phuong thuc thanh toans */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                    Chọn phương thức thanh toán
                 </label>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                       onClick={() => setPaymentMethod("cash")}
                       className={`flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all duration-300 ${
                          paymentMethod === "cash" 
                          ? "border-primary bg-primary/5 text-primary shadow-md shadow-primary/10" 
                          : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                       }`}
                    >
                       <div className={`p-2 rounded-lg ${paymentMethod === "cash" ? "bg-primary text-white" : "bg-white text-slate-300"}`}>
                          <DollarSign className="w-5 h-5" />
                       </div>
                       <span className="text-xs font-black uppercase tracking-wider">Tiền mặt</span>
                    </button>
                    <button 
                       onClick={() => setPaymentMethod("vnpay")}
                       className={`flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all duration-300 ${
                          paymentMethod === "vnpay" 
                          ? "border-[#005BAA] bg-[#005BAA]/5 text-[#005BAA] shadow-md shadow-blue-500/10" 
                          : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                       }`}
                    >
                       <div className={`p-2 rounded-lg ${paymentMethod === "vnpay" ? "bg-[#005BAA] text-white" : "bg-white text-slate-300"}`}>
                          <div className="relative w-5 h-5 flex items-center justify-center font-black italic text-[10px]">VNP</div>
                       </div>
                       <span className="text-xs font-black uppercase tracking-wider">VNPay</span>
                    </button>
                 </div>
              </div>

              {/* Cash Input */}
              {paymentMethod === "cash" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                   <div className="relative group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-3 bg-white px-2 z-10 transition-colors group-focus-within:text-primary">
                       Tiền khách đưa
                      </label>
                      <input 
                         type="number" 
                         value={receivedAmount || ""}
                         onChange={(e) => setReceivedAmount(Number(e.target.value))}
                         className="w-full pl-6 pr-12 py-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl text-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                         placeholder="0"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold italic">VND</span>
                   </div>
                   
                   <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100 flex flex-col gap-1 shadow-sm overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-1 opacity-10">
                         <div className="w-16 h-16 bg-emerald-500 rounded-full -mr-8 -mt-8"></div>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest relative z-10">Tiền thối lại</span>
                      <span className={`text-3xl font-black relative z-10 ${changeAmount > 0 ? 'text-emerald-700' : 'text-emerald-300'}`}>
                         {changeAmount.toLocaleString()} <span className="text-sm font-bold opacity-60">đ</span>
                      </span>
                   </div>
                </div>
              )}

              {/* VNPay Info Placeholder */}
              {paymentMethod === "vnpay" && (
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                      <RefreshCw className="w-6 h-6 animate-spin-slow" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-blue-800">Sẵn sàng thanh toán VNPay</p>
                      <p className="text-[11px] text-blue-500 font-medium">Khách hàng sẽ quét mã QR ở bước tiếp theo</p>
                   </div>
                </div>
              )}
            </div>

            {/* Pay Now Button */}
            <div className="border-t border-slate-100 bg-white p-4 pt-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.03)] md:p-6 md:pt-0">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing || (paymentMethod === "cash" && receivedAmount < totalAmount)}
                className="w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:shadow-none relative overflow-hidden group"
              >
                <div className="flex items-center justify-center gap-3 relative z-10">
                   {isProcessing ? (
                     <>
                       <Loader2 className="w-6 h-6 animate-spin" />
                       <span>ĐANG XỬ LÝ...</span>
                     </>
                   ) : (
                     <>
                       <span>HOÀN TẤT THANH TOÁN</span>
                       <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                </div>
                {/* Visual flash effect on hover */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT RECEIPT MODAL */}
      {showInvoice && lastOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-emerald-500 p-6 text-center text-white relative">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">ĐÃ NHẬN THANH TOÁN</h2>
              <p className="text-emerald-50 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Đơn #{lastOrder.id.toString().padStart(6, '0')}</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-6 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <div>
                  <p className="mb-0.5">Ngày giờ</p>
                  <p className="text-slate-800">{new Date(lastOrder.createdAt || lastOrder.orderDate).toLocaleString('vi-VN', { 
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
                  })}</p>
                </div>
                <div className="text-right">
                  <p className="mb-0.5">Thu ngân</p>
                  <p className="text-slate-800 truncate">{lastOrder.Users?.fullName || user?.fullName}</p>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-200 py-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mặt hàng</h3>
                  <span className="bg-slate-50 px-2 py-0.5 rounded text-[9px] font-bold text-slate-400 uppercase">SL: {lastOrder.OrderDetails?.length}</span>
                </div>
                
                <div className="space-y-3">
                  {lastOrder.OrderDetails?.map((detail, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate leading-tight">{detail.Product?.productName}</p>
                        <p className="text-[10px] text-slate-400 font-medium font-mono">
                          {detail.amount} {detail.Product?.unit || 'cai'} x {Number(detail.sellingPrice).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs font-black text-slate-700 whitespace-nowrap font-mono">
                        {Number(detail.subtotal).toLocaleString()} đ
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-4 space-y-2 border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>Tạm tính</span>
                  <span className="font-mono">{Number(lastOrder.total).toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span className="uppercase">{lastOrder.paymentMethod}</span>
                  <span className="font-mono">{Number(lastOrder.receivedAmount).toLocaleString()} đ</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Tiền thối</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {Number(lastOrder.changeAmount || 0).toLocaleString()} <span className="text-[10px]">đ</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex flex-col gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex-[2] py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  In hóa đơn
                </button>
                <button 
                  onClick={exportToExcel}
                  className="flex-1 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-black rounded-2xl transition-all border border-emerald-100 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <button 
                onClick={() => setShowInvoice(false)}
                className="w-full py-2 text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                Đóng hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;




