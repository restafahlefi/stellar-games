import React from 'react';
import { useRealTimeStats } from './RealTimeStats';

/**
 * Komponen untuk menampilkan countdown timer yang disinkronkan
 * Dapat digunakan di berbagai tempat dengan tampilan yang konsisten
 * 
 * SISTEM INDIKATOR WARNA (3-Color System):
 * 
 * 🟢 HIJAU (Emerald) - Status Normal
 *    - Countdown: > 10 detik
 *    - Arti: Sistem berjalan normal, masih banyak waktu sebelum update berikutnya
 *    - Animasi: animate-pulse (berkedip lembut)
 * 
 * 🟡 KUNING (Amber) - Peringatan
 *    - Countdown: 6-10 detik
 *    - Arti: Update akan segera dilakukan, bersiap untuk refresh data
 *    - Animasi: animate-pulse (berkedip lembut)
 * 
 * 🔴 MERAH (Red) - Segera Update
 *    - Countdown: ≤ 5 detik
 *    - Arti: Update akan dilakukan dalam hitungan detik
 *    - Animasi: animate-pulse (berkedip cepat)
 * 
 * 🔵 BIRU (Blue) - Sedang Updating
 *    - Status: isUpdating = true
 *    - Arti: Sedang mengambil data terbaru dari server
 *    - Animasi: animate-ping (efek gelombang)
 * 
 * @param {boolean} showText - Tampilkan text countdown (default: true)
 * @param {boolean} showIndicator - Tampilkan dot indicator (default: true)
 * @param {string} size - Ukuran text: 'xs', 'sm', 'md', 'lg' (default: 'sm')
 * @param {string} className - Custom CSS classes
 */
export default function RealTimeCountdown({ 
  showText = true, 
  showIndicator = true, 
  size = 'sm',
  className = '' 
}) {
  const { countdown, isUpdating } = useRealTimeStats();

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm', 
    md: 'text-base',
    lg: 'text-lg'
  };

  // Determine indicator color based on countdown
  const getIndicatorColor = () => {
    if (isUpdating) return 'bg-blue-500 animate-ping'; // 🔵 BIRU: Sedang updating
    if (countdown <= 5) return 'bg-red-500 animate-pulse'; // 🔴 MERAH: Segera update (≤5s)
    if (countdown <= 10) return 'bg-amber-500 animate-pulse'; // 🟡 KUNING: Peringatan (6-10s)
    return 'bg-emerald-500 animate-pulse'; // 🟢 HIJAU: Normal (>10s)
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIndicator && (
        <span className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${getIndicatorColor()}`}></span>
      )}
      
      {showText && (
        <span className={`text-slate-500 ${sizeClasses[size]}`}>
          {isUpdating ? (
            <span className="flex items-center gap-1">
              <span className="animate-spin">⟳</span>
              Updating stats...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Auto-refresh in
              <span className={`px-1.5 py-0.5 rounded text-xs font-black transition-all ${
                countdown <= 5 ? 'bg-red-500/20 text-red-400 animate-pulse' : 
                countdown <= 10 ? 'bg-amber-500/20 text-amber-400' : 
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {countdown}s
              </span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}