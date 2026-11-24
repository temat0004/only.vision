// Стартовый ассортимент only.vision (мультибренд). Тот же набор лежит в supabase/schema.sql.
// art — силуэт для графической карточки, color — цвет вещи, bg — фон карточки.
// Цены примерные: правятся в админке.
const v = (pid, sizes) =>
  Object.entries(sizes).map(([size, stock]) => ({ id: `${pid}-${size.replace(' ', '')}`, size, stock }))

const now = Date.now()
const at = (i) => new Date(now - i * 3600_000).toISOString()

export const SEED_PRODUCTS = [
  {
    id: 'p01', name: 'MONCLER MAYA', category: 'outerwear', price: 38900, art: 'puffer', color: '#141414', bg: '#3a3a3a',
    description: 'Короткий пуховик с глянцевым нейлоном и капюшоном в воротнике. Главная куртка бишкекской зимы, держит до −25°.',
    details: 'Верх — лакированный нейлон, наполнитель — гусиный пух 90/10.',
    is_new: true, active: true, created_at: at(1), variants: v('p01', { S: 1, M: 2, L: 1, XL: 0 }),
  },
  {
    id: 'p02', name: 'THE NORTH FACE NUPTSE 1996', category: 'outerwear', price: 18900, art: 'puffer', color: '#1c1c1c', bg: '#d9d6cf',
    description: 'Легендарный объёмный пуховик из 90-х. Капюшон убирается в воротник, пуховик складывается в собственный карман.',
    details: 'Наполнитель — пух 700 fill, ткань — рипстоп с DWR-пропиткой.',
    is_new: false, active: true, created_at: at(2), variants: v('p02', { S: 2, M: 3, L: 2, XL: 1 }),
  },
  {
    id: 'p03', name: 'NIKE TECH FLEECE HOODIE', category: 'fleece', price: 8900, art: 'hoodie', color: '#4a4a48', bg: '#1d1d1d',
    description: 'Худи на молнии из Tech Fleece: тёплое и лёгкое, держит форму. Карман на рукаве и капюшон по фигуре.',
    details: '66% хлопок, 34% полиэстер. Стирка при 30°.',
    is_new: true, active: true, created_at: at(3), variants: v('p03', { S: 2, M: 4, L: 3, XL: 1 }),
  },
  {
    id: 'p04', name: 'NIKE TECH FLEECE JOGGERS', category: 'pants', price: 7400, art: 'joggers', color: '#4a4a48', bg: '#c8ff00',
    description: 'Джоггеры в комплект к худи: зауженный низ, карман на молнии сбоку, мягкий пояс.',
    details: '66% хлопок, 34% полиэстер.',
    is_new: false, active: true, created_at: at(4), variants: v('p04', { S: 1, M: 3, L: 2, XL: 0 }),
  },
  {
    id: 'p05', name: 'STONE ISLAND CREWNECK', category: 'tops', price: 14900, art: 'crewneck', color: '#1f2a40', bg: '#8a8780',
    description: 'Свитшот из плотного футера с фирменным съёмным патчем на рукаве. Тёмно-синий.',
    details: '100% хлопок, гаментное крашение.',
    is_new: false, active: true, created_at: at(5), variants: v('p05', { S: 0, M: 1, L: 1, XL: 0 }),
  },
  {
    id: 'p06', name: 'RALPH LAUREN POLO WHITE', category: 'tops', price: 5900, art: 'polo', color: '#f2f0eb', bg: '#262626',
    description: 'Классическое поло Custom Slim Fit из пике с вышитым логотипом на груди.',
    details: '100% хлопок пике. Стирка при 30°.',
    is_new: false, active: true, created_at: at(6), variants: v('p06', { S: 3, M: 5, L: 4, XL: 2 }),
  },
  {
    id: 'p07', name: 'RALPH LAUREN POLO NAVY', category: 'tops', price: 5900, art: 'polo', color: '#1e2a44', bg: '#d9d6cf',
    description: 'То же поло в тёмно-синем. Подходит и к джинсам, и к брюкам.',
    details: '100% хлопок пике. Стирка при 30°.',
    is_new: false, active: true, created_at: at(7), variants: v('p07', { S: 2, M: 3, L: 3, XL: 1 }),
  },
  {
    id: 'p08', name: 'BAGGY JEANS WASHED BLACK', category: 'pants', price: 4900, art: 'jeans', color: '#2b2b2b', bg: '#bdbab3',
    description: 'Широкие джинсы свободной посадки с потёртостями, цвет washed black. Длина в пол.',
    details: '100% хлопок, деним 13 oz.',
    is_new: true, active: true, created_at: at(8), variants: v('p08', { S: 2, M: 3, L: 3, XL: 1 }),
  },
  {
    id: 'p09', name: 'WIDE LEG JEANS LIGHT BLUE', category: 'pants', price: 4500, art: 'jeans', color: '#8fa9c7', bg: '#2f2f2f',
    description: 'Голубые джинсы wide leg с высокой посадкой. Разобрали за два дня, ждём новую партию.',
    details: '100% хлопок, деним 12 oz.',
    is_new: false, active: true, created_at: at(9), variants: v('p09', { S: 0, M: 0, L: 0, XL: 0 }),
  },
  {
    id: 'p10', name: 'MONCLER BEANIE', category: 'accessories', price: 7900, art: 'beanie', color: '#151515', bg: '#5c5a55',
    description: 'Шерстяная шапка с отворотом и фирменной нашивкой спереди.',
    details: '100% шерсть.',
    is_new: false, active: true, created_at: at(10), variants: v('p10', { 'ONE SIZE': 1 }),
  },
  {
    id: 'p11', name: 'CARHARTT WIP WATCH HAT', category: 'accessories', price: 2900, art: 'beanie', color: '#b86a2c', bg: '#1f1f1f',
    description: 'Та самая шапка в рубчик с квадратным лейблом. Цвет hamilton brown.',
    details: '100% акрил.',
    is_new: false, active: true, created_at: at(11), variants: v('p11', { 'ONE SIZE': 6 }),
  },
  {
    id: 'p12', name: 'NIKE CLUB CAP', category: 'accessories', price: 2400, art: 'cap', color: '#151515', bg: '#3a3a3a',
    description: 'Шестипанельная кепка с вышивкой и регулировкой сзади.',
    details: '100% хлопок. Обхват 55–60 см.',
    is_new: false, active: true, created_at: at(12), variants: v('p12', { 'ONE SIZE': 5 }),
  },
]
