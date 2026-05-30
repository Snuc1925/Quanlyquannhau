import type { MenuItem } from "../types";

const now = "2026-05-30T08:00:00";

export const mockMenuItems: MenuItem[] = [
  // ── Bia ────────────────────────────────────────
  {
    id: "m-01", category: "bia", emoji: "🍺",
    name: "Bia hơi Hà Nội", price: 15000,
    description: "Bia hơi truyền thống, mát lạnh, thơm ngon. Bán theo cốc 500ml.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-02", category: "bia", emoji: "🍻",
    name: "Bia lon Sài Gòn Đỏ", price: 18000,
    description: "Bia lon 330ml đậm đà. Phù hợp nhóm nhỏ.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-03", category: "bia", emoji: "🍶",
    name: "Bia chai Heineken", price: 28000,
    description: "Bia nhập khẩu cao cấp 330ml. Vị đắng nhẹ, hương thơm đặc trưng.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-04", category: "bia", emoji: "🍻",
    name: "Bia Tiger Bạc", price: 22000,
    description: "Bia lon Tiger 330ml. Vị thanh mát, không đắng.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-05", category: "bia", emoji: "🍺",
    name: "Bia 333 Export", price: 17000,
    description: "Bia lon 333 330ml. Thương hiệu lâu đời, vị dịu nhẹ.",
    available: false, createdAt: now, updatedAt: now,
  },

  // ── Đồ nhắm ─────────────────────────────────────
  {
    id: "m-06", category: "do-nham", emoji: "🥜",
    name: "Đậu phộng rang muối", price: 25000,
    description: "Đậu phộng rang giòn, rắc muối. Phục vụ theo đĩa ~150g.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-07", category: "do-nham", emoji: "🥩",
    name: "Khô bò xé sợi", price: 55000,
    description: "Khô bò sợi tẩm gia vị đặc trưng. Kèm tương ớt.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-08", category: "do-nham", emoji: "🦑",
    name: "Mực khô nướng than", price: 65000,
    description: "Mực một nắng nướng trên bếp than hoa. Kèm tương me.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-09", category: "do-nham", emoji: "🧆",
    name: "Chả ram tôm đất", price: 60000,
    description: "Chả ram giòn vàng nhân tôm đất. 5 cái/đĩa.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-10", category: "do-nham", emoji: "🌮",
    name: "Nem chua rán", price: 35000,
    description: "Nem chua chiên giòn bên ngoài, chua ngọt bên trong. 6 cái/đĩa.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-11", category: "do-nham", emoji: "🥚",
    name: "Trứng vịt lộn chiên bơ", price: 20000,
    description: "Trứng vịt lộn chiên bơ tỏi thơm. 2 trứng/đĩa.",
    available: false, createdAt: now, updatedAt: now,
  },

  // ── Hải sản ──────────────────────────────────────
  {
    id: "m-12", category: "hai-san", emoji: "🐚",
    name: "Ốc len xào dừa", price: 85000,
    description: "Ốc len xào nước cốt dừa béo ngậy, thơm sả. Khẩu phần ~300g.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-13", category: "hai-san", emoji: "🦪",
    name: "Nghêu hấp sả", price: 70000,
    description: "Nghêu tươi hấp sả gừng. Nước lèo ngọt tự nhiên.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-14", category: "hai-san", emoji: "🦐",
    name: "Tôm nướng muối ớt", price: 120000,
    description: "Tôm sú nướng muối ớt xanh. ~6 con/đĩa. Kèm muối chanh.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-15", category: "hai-san", emoji: "🦀",
    name: "Ghẹ hấp bia", price: 180000,
    description: "Ghẹ tươi hấp bia thơm. Giá theo kg, tối thiểu 0.5kg.",
    available: false, createdAt: now, updatedAt: now,
  },

  // ── Đồ nóng ──────────────────────────────────────
  {
    id: "m-16", category: "do-nong", emoji: "🍲",
    name: "Lẩu thái hải sản", price: 280000,
    description: "Lẩu nước thái chua cay, combo hải sản phong phú. 2–3 người.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-17", category: "do-nong", emoji: "🍗",
    name: "Gà nướng muối ớt", price: 150000,
    description: "Gà ta nướng nguyên con. Thơm giòn da, mềm thịt. ~1kg.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-18", category: "do-nong", emoji: "🐖",
    name: "Sườn nướng than hoa", price: 130000,
    description: "Sườn heo non ướp mật ong, nướng than hoa. ~400g/phần.",
    available: true, createdAt: now, updatedAt: now,
  },

  // ── Nước & Ngọt ──────────────────────────────────
  {
    id: "m-19", category: "nuoc-ngot", emoji: "💧",
    name: "Nước suối La Vie", price: 10000,
    description: "Nước khoáng thiên nhiên 500ml.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-20", category: "nuoc-ngot", emoji: "🥤",
    name: "Coca-Cola lon", price: 15000,
    description: "Nước ngọt có ga 330ml. Uống lạnh.",
    available: true, createdAt: now, updatedAt: now,
  },
  {
    id: "m-21", category: "nuoc-ngot", emoji: "🍊",
    name: "Nước cam ép tươi", price: 30000,
    description: "Cam ép nguyên chất, không đường. 300ml.",
    available: true, createdAt: now, updatedAt: now,
  },
];
