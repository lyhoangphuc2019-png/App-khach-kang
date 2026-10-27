import React from 'react';
import { Customer, PackageCatalogItem, UserPackage, PageId } from '../types';
import { formatVND } from '../data/initialData';
import { Ticket, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface MemberViewProps {
  catalog: PackageCatalogItem[];
  packages: UserPackage[];
  activeCustomer: Customer | null;
  onBuyPackage: (catalogItem: PackageCatalogItem) => void;
  onNavigate: (page: PageId) => void;
}

export const MemberView: React.FC<MemberViewProps> = ({
  catalog,
  packages,
  activeCustomer,
  onBuyPackage,
  onNavigate,
}) => {
  const userPackages = activeCustomer
    ? packages.filter((p) => p.customerId === activeCustomer.id)
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-[#15221b] tracking-tight">Gói suất ăn thành viên</h2>
        <p className="text-sm text-[#5e6f66] mt-1">
          Đăng ký gói suất ăn trước để nhận chiết khấu trực tiếp 20% mỗi phần cơm và quản lý ngân sách ăn trưa thông minh.
        </p>
      </div>

      {/* Package Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {catalog.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl border border-[#ede4d4] overflow-hidden shadow-[0_4px_25px_rgba(14,86,63,0.06)] hover:shadow-[0_16px_35px_rgba(14,86,63,0.12)] transition-all hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="h-40 overflow-hidden relative">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#0e563f] font-black text-[11px] px-3 py-1 rounded-lg shadow-sm border border-[#cbe3d4]">
                  {pkg.tag}
                </span>
                <span className="absolute bottom-3 right-3 bg-[#f59e0b] text-[#2d1e06] font-black text-xs px-2.5 py-1 rounded-full shadow-sm">
                  {pkg.count} suất ăn
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-black text-lg text-[#15221b]">{pkg.title}</h3>
                <p className="text-xs text-[#5e6f66] leading-relaxed min-h-[36px]">
                  {pkg.desc}
                </p>

                <div className="pt-2 border-t border-[#ede4d4] space-y-1.5 text-xs text-[#5e6f66]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0e563f]" />
                    <span>Giảm ngay 20% tiền món ăn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0e563f]" />
                    <span>Tự động trừ số dư, không cần tiền mặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0e563f]" />
                    <span>Thời hạn sử dụng lên đến 60 ngày</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-[#ede4d4] mt-3">
              <div>
                <span className="text-[11px] text-[#5e6f66] uppercase font-bold block">
                  Giá trọn gói
                </span>
                <span className="text-xl font-black text-[#0e563f]">
                  {formatVND(pkg.price)}
                </span>
              </div>
              <button
                onClick={() => onBuyPackage(pkg)}
                className="px-4 py-2.5 rounded-xl bg-[#0e563f] hover:bg-[#12694d] active:scale-95 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Member Packages Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede4d4] shadow-[0_8px_30px_rgba(14,86,63,0.04)] space-y-5">
        <div className="flex items-center justify-between border-b border-[#ede4d4] pb-4">
          <div>
            <h3 className="text-xl font-black text-[#15221b]">Thẻ ăn của bạn</h3>
            <p className="text-xs text-[#5e6f66] mt-0.5">
              Tra cứu số dư tiền thẻ và số suất cơm đã sử dụng.
            </p>
          </div>
          {activeCustomer && (
            <div className="text-right">
              <span className="text-[11px] text-[#5e6f66] block font-semibold">
                Mã thành viên
              </span>
              <span className="text-sm font-black text-[#0e563f] bg-[#eaf5ee] px-3 py-1 rounded-full border border-[#cbe3d4]">
                {activeCustomer.memberCode}
              </span>
            </div>
          )}
        </div>

        {!activeCustomer ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eaf5ee] text-[#0e563f] flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-[#15221b]">
              Đăng nhập để xem và quản lý gói suất ăn
            </h4>
            <p className="text-xs text-[#5e6f66] max-w-md mx-auto">
              Gói suất ăn được liên kết trực tiếp với mã thành viên của bạn để bảo mật và tự động chiết khấu 20% khi đặt cơm.
            </p>
            <button
              onClick={() => onNavigate('account')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#0e563f] text-white font-extrabold text-xs hover:bg-[#12694d] transition-all cursor-pointer shadow-sm"
            >
              Đăng nhập ngay →
            </button>
          </div>
        ) : userPackages.length === 0 ? (
          <div className="py-8 text-center text-[#5e6f66]">
            <div className="text-3xl mb-2">🎟️</div>
            <p className="font-bold text-sm text-[#15221b]">
              Bạn chưa có gói suất ăn nào đang hoạt động
            </p>
            <p className="text-xs mt-1">
              Hãy chọn một trong các gói ưu đãi bên trên để đăng ký và bắt đầu tiết kiệm bữa trưa ngay!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#eaf5ee] border border-[#0e563f]/20 text-xs text-[#0e563f]">
              💡 <b>Lưu ý khi đặt cơm:</b> Khi thanh toán tại trang Giỏ hàng, hãy chọn phương thức "Sử dụng gói suất ăn" để được hệ thống tự động trừ tiền từ số dư thẻ và giảm 20% tiền món.
            </div>

            <div className="divide-y divide-[#ede4d4]">
              {userPackages.map((pkg) => {
                const percentLeft = Math.min(100, Math.max(0, (pkg.balance / pkg.price) * 100));
                return (
                  <div key={pkg.id} className="py-4 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base text-[#15221b]">
                            {pkg.title}
                          </span>
                          <span className="text-xs text-[#5e6f66] font-mono">
                            ({pkg.id})
                          </span>
                        </div>
                        <div className="text-xs text-[#5e6f66] mt-0.5">
                          Ngày đăng ký: {pkg.datePurchased} • Giá gói: {formatVND(pkg.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-[#5e6f66] block">Số dư thẻ ăn</span>
                          <span className="text-base font-black text-[#0e563f]">
                            {formatVND(pkg.balance)}
                          </span>
                        </div>
                        <span className="bg-[#fef6e7] text-[#8c4e06] text-xs font-black px-2.5 py-1 rounded-full border border-[#fed7aa]">
                          ĐÃ DÙNG {pkg.used} SUẤT
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2.5 w-full bg-[#eaf5ee] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#12694d] to-[#0e563f] rounded-full transition-all duration-500"
                          style={{ width: `${percentLeft}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[#5e6f66]">
                        <span>Số dư còn lại: {Math.round(percentLeft)}%</span>
                        <span>Đã sử dụng: {pkg.used} / {pkg.count} suất</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

