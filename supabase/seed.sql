-- Стартовый ассортимент only.vision. Запускать после schema.sql.
-- Сгенерировано из src/data/seed.js

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('MONCLER MAYA', 'outerwear', 14900, 'Короткий пуховик с глянцевым нейлоном и капюшоном в воротнике. Главная куртка бишкекской зимы, держит до −25°.', 'Глянцевый нейлон, плотный утеплитель, капюшон убирается в воротник.', 'puffer', '#141414', '#3a3a3a', null, true, true, now() - interval '1 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 1), ('M', 2), ('L', 1), ('XL', 0)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('THE NORTH FACE NUPTSE 1996', 'outerwear', 8900, 'Легендарный объёмный пуховик из 90-х. Капюшон убирается в воротник, пуховик складывается в собственный карман.', 'Рипстоп, объёмный утеплитель. Капюшон в воротнике, складывается в карман.', 'puffer', '#1c1c1c', '#d9d6cf', null, false, true, now() - interval '2 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 2), ('M', 3), ('L', 2), ('XL', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('NIKE TECH FLEECE HOODIE', 'fleece', 3900, 'Худи на молнии из Tech Fleece: тёплое и лёгкое, держит форму. Карман на рукаве и капюшон по фигуре.', 'Хлопок с полиэстером, плотный трикотаж. Стирка при 30°.', 'hoodie', '#b8b8b5', '#ffffff', '/products/nike-tech-fleece-hoodie.jpg', true, true, now() - interval '3 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 2), ('M', 4), ('L', 3), ('XL', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('NIKE TECH FLEECE JOGGERS', 'pants', 3200, 'Джоггеры в комплект к худи: зауженный низ, карман на молнии сбоку, мягкий пояс.', 'Хлопок с полиэстером. Стирка при 30°.', 'joggers', '#b8b8b5', '#c8ff00', null, false, true, now() - interval '4 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 1), ('M', 3), ('L', 2), ('XL', 0)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('STONE ISLAND CREWNECK', 'tops', 4500, 'Свитшот из плотного футера с фирменным съёмным патчем на рукаве. Тёмно-синий.', 'Хлопковый футер, съёмный патч на рукаве.', 'crewneck', '#1f2a40', '#8a8780', null, false, true, now() - interval '5 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 0), ('M', 1), ('L', 1), ('XL', 0)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('RALPH LAUREN POLO WHITE', 'tops', 1900, 'Классическое поло приталенного кроя из пике с вышитым логотипом на груди.', 'Хлопок пике. Стирка при 30°.', 'polo', '#f2f0eb', '#262626', null, false, true, now() - interval '6 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 3), ('M', 5), ('L', 4), ('XL', 2)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('RALPH LAUREN POLO NAVY', 'tops', 1900, 'То же поло в тёмно-синем. Подходит и к джинсам, и к брюкам.', 'Хлопок пике. Стирка при 30°.', 'polo', '#1e2a44', '#d9d6cf', null, false, true, now() - interval '7 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 2), ('M', 3), ('L', 3), ('XL', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('BAGGY JEANS WASHED BLACK', 'pants', 2900, 'Широкие джинсы свободной посадки с потёртостями, цвет washed black. Длина в пол.', '100% хлопок, деним 13 oz.', 'jeans', '#2b2b2b', '#bdbab3', null, true, true, now() - interval '8 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 2), ('M', 3), ('L', 3), ('XL', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('WIDE LEG JEANS LIGHT BLUE', 'pants', 2700, 'Голубые джинсы wide leg с высокой посадкой. Разобрали за два дня, ждём новую партию.', '100% хлопок, деним 12 oz.', 'jeans', '#8fa9c7', '#2f2f2f', null, false, true, now() - interval '9 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('S', 0), ('M', 0), ('L', 0), ('XL', 0)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('MONCLER BEANIE', 'accessories', 1900, 'Шерстяная шапка с отворотом и фирменной нашивкой спереди.', 'Шерсть с акрилом, отворот, нашивка спереди.', 'beanie', '#151515', '#5c5a55', null, false, true, now() - interval '10 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('ONE SIZE', 1)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('CARHARTT WIP WATCH HAT', 'accessories', 990, 'Та самая шапка в рубчик с квадратным лейблом. Цвет hamilton brown.', '100% акрил.', 'beanie', '#b86a2c', '#1f1f1f', null, false, true, now() - interval '11 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('ONE SIZE', 6)) as v(size, stock);

with p as (
  insert into products (name, category, price, description, details, art, color, bg, image_url, is_new, active, created_at)
  values ('NIKE CLUB CAP', 'accessories', 1200, 'Шестипанельная кепка с вышивкой и регулировкой сзади.', '100% хлопок. Обхват 55–60 см.', 'cap', '#151515', '#3a3a3a', null, false, true, now() - interval '12 hours')
  returning id
)
insert into product_variants (product_id, size, stock)
select p.id, v.size, v.stock from p, (values ('ONE SIZE', 5)) as v(size, stock);

