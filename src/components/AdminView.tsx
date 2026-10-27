import React, { useState } from 'react';
import { FoodItem, Order, OrderStatus, UserPackage } from '../types';
import { formatVND, getDayOptions } from '../data/initialData';
import {
  BarChart3,
  CookingPot,
  ListOrdered,
  PlusCircle,
  Download,
  Trash2,
  CheckCircle,
  DollarSign,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';

interface AdminViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  foods: FoodItem[];
  onAddFood: (newFood: Omit<FoodItem, 'id'>) => void;
  onRemoveFood: (foodId: number) => void;
  packages: UserPackage[];
  onToast: (msg: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  orders,
  onUpdateOrderStatus,
  foods,
  onAddFood,
  onRemoveFood,
  packages,
  onToast,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'orders' | 'kitchen' | 'menu' | 'reports'>('overview');

  const dayOptions = getDayOptions();
  const [kitchenDay, setKitchenDay] = useState<string>(dayOptions[0].value);

  // Form states for adding food
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('55000');
  const [foodCat, setFoodCat] = useState('Cơm');
  const [foodEmoji, setFoodEmoji] = useState('🍱');
  const [foodDesc, setFoodDesc] = useState('Chế biến nóng hổi, thơm ngon mỗi ngày.');

  // Metrics
  const completedOrders = orders.filter((o) => o.status === 'Đã giao');
  const totalRevenue = completedOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const activeOrders = orders.filter((o) => !['Đã hủy', 'Đã giao'].includes(o.status));
  const cancelledOrders = orders.filter((o) => o.status === 'Đã hủy');

  // Kitchen Aggregation
  const kitchenOrders = orders.filter(
    (o) => o.day === kitchenDay && o.status !== 'Đã hủy'
  );

  const kitchenPortionsMap: Record<string, number> = {};
  kitchenOrders.forEach((o) => {
    o.items.forEach((item) => {
      kitchenPortionsMap[item.name] = (kitchenPortionsMap[item.name] || 0) + item.qty;
    });
  });

  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(foodPrice);
    if (!foodName.trim() || isNaN(priceNum) || priceNum < 1000) {
      onToast('Vui lòng nhập tên món và giá hợp lệ (tối thiểu 1.000 ₫)');
      return;
    }

    onAddFood({
      name: foodName.trim(),
      price: priceNum,
      cat: foodCat,
      emoji: foodEmoji.trim() || '🍱',
      desc: foodDesc.trim(),
      bg: 'from-amber-100 to-amber-200',
      tag: 'MỚI',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85',
    });

    setFoodName('');
    onToast(`Đã thêm món "${foodName}" vào thực đơn!`);
  };

  const exportCSV = () => {
    const rows = [
      ['Ma don', 'Khach hang', 'So dien thoai', 'Ngay su dung', 'Khung gio', 'Dia chi', 'Tong tien', 'Trang thai', 'Thanh toan'],
      ...orders.map((o) => [
        o.id,
        o.name,
        o.phone,
        o.day,
        o.time,
        o.address,
        o.total,
        o.status,
        o.payStatus,
      ]),
    ];

    const csvContent =
      '\ufeff' +
      rows
        .map((row) =>
          row
            .map((field) => `"${String(field).replaceAll('"', '""')}"`)
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-toi-trua-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onToast('Đã xuất báo cáo CSV thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Head */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#202923] tracking-tight">
            Quản trị & Điều hành Bếp
          </h2>
          <p className="text-sm text-[#78847d] mt-1">
            Tổng hợp suất ăn cần nấu, theo dõi đơn giao và quản lý danh mục thực đơn.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 p-1 bg-[#edf2ee] rounded-xl self-start sm:self-auto overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'orders', label: 'Đơn hàng' },
            { id: 'kitchen', label: 'Bếp chuẩn bị' },
            { id: 'menu', label: 'Quản lý menu' },
            { id: 'reports', label: 'Doanh thu & Báo cáo' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAdminTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === t.id
                  ? 'bg-white text-[#0e563f] shadow-xs'
                  : 'text-[#6c786f] hover:text-[#202923]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e8eee9] shadow-xs">
              <span className="text-xs text-[#78847d] font-bold block mb-1">Tổng đơn hàng</span>
              <strong className="text-2xl font-black text-[#202923]">{orders.length}</strong>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8eee9] shadow-xs">
              <span className="text-xs text-[#78847d] font-bold block mb-1">Đơn đang xử lý</span>
              <strong className="text-2xl font-black text-[#f4a340]">{activeOrders.length}</strong>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8eee9] shadow-xs">
              <span className="text-xs text-[#78847d] font-bold block mb-1">Doanh thu ghi nhận</span>
              <strong className="text-xl font-black text-[#0e563f]">{formatVND(totalRevenue)}</strong>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8eee9] shadow-xs">
              <span className="text-xs text-[#78847d] font-bold block mb-1">Gói suất ăn kích hoạt</span>
              <strong className="text-2xl font-black text-[#202923]">{packages.length}</strong>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8eee9] shadow-xs space-y-4">
            <h3 className="font-black text-lg text-[#202923]">Đơn hàng gần đây</h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#78847d]">
                Chưa có đơn hàng nào được ghi nhận.
              </div>
            ) : (
              <div className="divide-y divide-[#f0f4f1]">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-black text-sm text-[#202923]">
                        #{o.id} • {o.name}
                      </div>
                      <div className="text-[#78847d] mt-0.5">
                        Ngày {o.day} ({o.time}) • {o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-[#0e563f]">
                        {formatVND(o.total)}
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#eaf5ef] text-[#0e563f]">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Orders Management */}
      {adminTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e8eee9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-[#202923]">Quản lý tiến độ đơn hàng</h3>
            <span className="text-xs text-[#78847d]">{orders.length} đơn hàng</span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#78847d]">
              Chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e8eee9] text-[#78847d] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Mã đơn / Khách</th>
                    <th className="py-3 px-3">Ngày & Giờ</th>
                    <th className="py-3 px-3">Địa chỉ giao</th>
                    <th className="py-3 px-3">Tổng tiền</th>
                    <th className="py-3 px-3">Trạng thái hiện tại</th>
                    <th className="py-3 px-3">Cập nhật nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4f1]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#fafbfa]">
                      <td className="py-3 px-3 font-bold text-[#202923]">
                        #{o.id}
                        <div className="font-normal text-[#78847d]">{o.name}</div>
                        <div className="font-normal text-[#78847d]">{o.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#202923]">{o.day}</div>
                        <div className="text-[#78847d]">{o.time}</div>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate text-[#647169]">
                        {o.address}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-[#0e563f]">
                        {formatVND(o.total)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-[#eaf5ef] text-[#0e563f]">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={o.status}
                          onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#dfe7e1] text-xs font-semibold bg-white outline-none focus:border-[#216b50]"
                        >
                          <option value="Chờ xác nhận">Chờ xác nhận</option>
                          <option value="Đã xác nhận">Đã xác nhận</option>
                          <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                          <option value="Đang giao">Đang giao</option>
                          <option value="Đã giao">Đã giao</option>
                          <option value="Giao thất bại">Giao thất bại</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Kitchen Prep Aggregation */}
      {adminTab === 'kitchen' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eee9] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f4f1] pb-4">
            <div>
              <h3 className="font-black text-xl text-[#202923] flex items-center gap-2">
                <CookingPot className="w-5 h-5 text-[#0e563f]" />
                <span>Danh sách suất ăn cần nấu (Chuẩn bị vừa đủ)</span>
              </h3>
              <p className="text-xs text-[#78847d] mt-1">
                Tự động tổng hợp chính xác số lượng từng món từ các đơn đặt trước (loại bỏ đơn hủy).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#647169] whitespace-nowrap">
                Chọn ngày nấu:
              </label>
              <select
                value={kitchenDay}
                onChange={(e) => setKitchenDay(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#dfe7e1] text-xs font-bold bg-white outline-none focus:border-[#216b50]"
              >
                {dayOptions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label} ({d.value})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {Object.keys(kitchenPortionsMap).length === 0 ? (
            <div className="py-12 text-center text-[#78847d]">
              <div className="text-4xl mb-2">🍳</div>
              <p className="font-bold text-sm text-[#202923]">
                Chưa có phần ăn nào được đặt cho ngày {kitchenDay}
              </p>
              <p className="text-xs mt-1">
                Khi khách hàng đặt cơm trước cho ngày này, số lượng nguyên liệu và món ăn sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(kitchenPortionsMap).map(([name, count]) => (
                <div
                  key={name}
                  className="p-4 rounded-2xl bg-[#f7f9f7] border border-[#e8eee9] flex items-center justify-between"
                >
                  <span className="font-bold text-sm text-[#202923]">{name}</span>
                  <span className="px-3 py-1 rounded-full bg-[#216b50] text-white font-black text-sm shadow-xs">
                    {count} suất
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Menu Management */}
      {adminTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
          {/* Add form */}
          <form
            onSubmit={handleCreateFood}
            className="bg-white rounded-3xl p-6 border border-[#e8eee9] shadow-xs space-y-4"
          >
            <h3 className="font-black text-lg text-[#202923]">Thêm món mới vào thực đơn</h3>
            <p className="text-xs text-[#78847d]">
              Menu được khuyến khích công bố trước 3 ngày để khách đặt lịch sớm.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#647169] mb-1">Tên món ăn</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Cơm cá hồi sốt teriyaki"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dfe7e1] text-xs outline-none focus:border-[#216b50]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#647169] mb-1">Giá bán (VNĐ)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={foodPrice}
                  onChange={(e) => setFoodPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dfe7e1] text-xs outline-none focus:border-[#216b50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#647169] mb-1">Nhóm món</label>
                <select
                  value={foodCat}
                  onChange={(e) => setFoodCat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dfe7e1] text-xs outline-none focus:border-[#216b50] bg-white"
                >
                  <option value="Cơm">Cơm</option>
                  <option value="Món nước">Món nước</option>
                  <option value="Món khô">Món khô</option>
                  <option value="Món chay">Món chay</option>
                  <option value="Món thêm">Món thêm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#647169] mb-1">Emoji minh họa</label>
              <input
                type="text"
                maxLength={4}
                value={foodEmoji}
                onChange={(e) => setFoodEmoji(e.target.value)}
                className="w-20 px-3.5 py-2 rounded-xl border border-[#dfe7e1] text-xs outline-none focus:border-[#216b50] text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#647169] mb-1">Mô tả món ăn</label>
              <textarea
                rows={2}
                value={foodDesc}
                onChange={(e) => setFoodDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dfe7e1] text-xs outline-none focus:border-[#216b50]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0e563f] text-white font-extrabold text-xs hover:bg-[#12694d] transition-all cursor-pointer"
            >
              + Thêm món vào thực đơn
            </button>
          </form>

          {/* Existing items */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eee9] shadow-xs space-y-3">
            <h3 className="font-black text-lg text-[#202923]">Danh sách món ăn ({foods.length})</h3>
            <div className="divide-y divide-[#f0f4f1] max-h-[460px] overflow-y-auto pr-1">
              {foods.map((f) => (
                <div key={f.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{f.emoji}</span>
                    <div>
                      <div className="font-bold text-[#202923]">{f.name}</div>
                      <div className="text-[#78847d] text-[11px]">{f.cat}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#0e563f]">{formatVND(f.price)}</span>
                    <button
                      onClick={() => onRemoveFood(f.id)}
                      className="p-1.5 rounded-lg text-[#c84b42] hover:bg-[#fff5f5] transition-colors cursor-pointer"
                      title="Xóa món"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reports & CSV */}
      {adminTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eee9] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f4f1] pb-4">
            <div>
              <h3 className="font-black text-xl text-[#202923]">Báo cáo doanh thu và đơn hàng</h3>
              <p className="text-xs text-[#78847d] mt-1">
                Thống kê số liệu đơn hàng và doanh thu từ dữ liệu trình duyệt thực tế.
              </p>
            </div>
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 rounded-xl bg-[#0e563f] hover:bg-[#12694d] text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Xuất báo cáo CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#fafbfa] border border-[#e8eee9]">
              <span className="text-xs text-[#78847d] block">Tổng đơn</span>
              <strong className="text-xl font-black text-[#202923]">{orders.length}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#fafbfa] border border-[#e8eee9]">
              <span className="text-xs text-[#78847d] block">Đã giao thành công</span>
              <strong className="text-xl font-black text-[#0e563f]">{completedOrders.length}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#fafbfa] border border-[#e8eee9]">
              <span className="text-xs text-[#78847d] block">Đã hủy</span>
              <strong className="text-xl font-black text-[#c84b42]">{cancelledOrders.length}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#fafbfa] border border-[#e8eee9]">
              <span className="text-xs text-[#78847d] block">Doanh thu giao thành công</span>
              <strong className="text-lg font-black text-[#0e563f]">{formatVND(totalRevenue)}</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f7f9f7] border border-[#e8eee9] space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#e8eee9]">
              <span className="text-[#647169]">Tổng tiền phí ship phát sinh:</span>
              <span className="font-bold text-[#202923]">
                {formatVND(orders.reduce((sum, o) => sum + o.shipping, 0))}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#e8eee9]">
              <span className="text-[#647169]">Tổng số suất cơm trong các đơn chưa hủy:</span>
              <span className="font-bold text-[#202923]">
                {orders
                  .filter((o) => o.status !== 'Đã hủy')
                  .reduce((sum, o) => sum + o.items.reduce((a, b) => a + b.qty, 0), 0)}{' '}
                suất
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#647169]">Gói suất ăn thành viên đã kích hoạt:</span>
              <span className="font-bold text-[#202923]">{packages.length} gói</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
