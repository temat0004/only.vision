-- Стартовый ассортимент only.vision. Запускать после schema.sql.
-- Сгенерировано из src/data/seed.js

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('MONCLER MAYA', 'outerwear', 38900, 'Короткий пуховик с глянцевым нейлоном и капюшоном в воротнике. Главная куртка бишкекской зимы, держит до −25°.', 'Верх — лакированный нейлон, наполнитель — гусиный пух 90/10.', 'puffer', '#141414', '#3a3a3a', true, true, now() - interval '1 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 1), ('M', 2), ('L', 1), ('XL', 0)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('THE NORTH FACE NUPTSE 1996', 'outerwear', 18900, 'Легендарный объёмный пуховик из 90-х. Капюшон убирается в воротник, пуховик складывается в собственный карман.', 'Наполнитель — пух 700 fill, ткань — рипстоп с DWR-пропиткой.', 'puffer', '#1c1c1c', '#d9d6cf', false, true, now() - interval '2 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 2), ('M', 3), ('L', 2), ('XL', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('NIKE TECH FLEECE HOODIE', 'fleece', 8900, 'Худи на молнии из Tech Fleece: тёплое и лёгкое, держит форму. Карман на рукаве и капюшон по фигуре.', '66% хлопок, 34% полиэстер. Стирка при 30°.', 'hoodie', '#4a4a48', '#1d1d1d', true, true, now() - interval '3 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 2), ('M', 4), ('L', 3), ('XL', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('NIKE TECH FLEECE JOGGERS', 'pants', 7400, 'Джоггеры в комплект к худи: зауженный низ, карман на молнии сбоку, мягкий пояс.', '66% хлопок, 34% полиэстер.', 'joggers', '#4a4a48', '#c8ff00', false, true, now() - interval '4 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 1), ('M', 3), ('L', 2), ('XL', 0)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('STONE ISLAND CREWNECK', 'tops', 14900, 'Свитшот из плотного футера с фирменным съёмным патчем на рукаве. Тёмно-синий.', '100% хлопок, гаментное крашение.', 'crewneck', '#1f2a40', '#8a8780', false, true, now() - interval '5 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 0), ('M', 1), ('L', 1), ('XL', 0)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('RALPH LAUREN POLO WHITE', 'tops', 5900, 'Классическое поло Custom Slim Fit из пике с вышитым логотипом на груди.', '100% хлопок пике. Стирка при 30°.', 'polo', '#f2f0eb', '#262626', false, true, now() - interval '6 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 3), ('M', 5), ('L', 4), ('XL', 2)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('RALPH LAUREN POLO NAVY', 'tops', 5900, 'То же поло в тёмно-синем. Подходит и к джинсам, и к брюкам.', '100% хлопок пике. Стирка при 30°.', 'polo', '#1e2a44', '#d9d6cf', false, true, now() - interval '7 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 2), ('M', 3), ('L', 3), ('XL', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('BAGGY JEANS WASHED BLACK', 'pants', 4900, 'Широкие джинсы свободной посадки с потёртостями, цвет washed black. Длина в пол.', '100% хлопок, деним 13 oz.', 'jeans', '#2b2b2b', '#bdbab3', true, true, now() - interval '8 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 2), ('M', 3), ('L', 3), ('XL', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('WIDE LEG JEANS LIGHT BLUE', 'pants', 4500, 'Голубые джинсы wide leg с высокой посадкой. Разобрали за два дня, ждём новую партию.', '100% хлопок, деним 12 oz.', 'jeans', '#8fa9c7', '#2f2f2f', false, true, now() - interval '9 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 0), ('M', 0), ('L', 0), ('XL', 0)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('MONCLER BEANIE', 'accessories', 7900, 'Шерстяная шапка с отворотом и фирменной нашивкой спереди.', '100% шерсть.', 'beanie', '#151515', '#5c5a55', false, true, now() - interval '10 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('ONE SIZE', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('CARHARTT WIP WATCH HAT', 'accessories', 2900, 'Та самая шапка в рубчик с квадратным лейблом. Цвет hamilton brown.', '100% акрил.', 'beanie', '#b86a2c', '#1f1f1f', false, true, now() - interval '11 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('ONE SIZE', 6)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, is_new, active, created_at)
  values ('NIKE CLUB CAP', 'accessories', 2400, 'Шестипанельная кепка с вышивкой и регулировкой сзади.', '100% хлопок. Обхват 55–60 см.', 'cap', '#151515', '#3a3a3a', false, true, now() - interval '12 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('ONE SIZE', 5)) as v(size, stock);

