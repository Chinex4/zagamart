-- DEVELOPMENT / DEMONSTRATION ONLY.
-- Run explicitly with `psql "$DATABASE_URL" -f supabase/demo-seed.sql`.
-- Uses an existing verified student (preserving auth/profile foreign keys) and is idempotent by title + seller.
do $$
declare demo_seller uuid;
begin
  select id into demo_seller from public.profiles
  where role = 'student' and account_status = 'active' and verification_status = 'verified'
  order by created_at limit 1;
  if demo_seller is null then raise notice 'Demo seed skipped: create/verify a student account first.'; return; end if;

  insert into public.listings(seller_id,title,description,category,condition,price_kobo,status,location_label)
  select demo_seller, v.title, v.description, v.category, v.condition, v.price_naira * 100, 'active', v.location
  from (values
    ('iPhone 13 128GB','Clean student-owned iPhone with strong battery health and charging cable.','Phones & Accessories','Like new',420000,'Main gate'),
    ('Samsung Galaxy A54','Reliable dual-SIM Android phone in excellent working condition.','Phones & Accessories','Good',210000,'Library'),
    ('HP EliteBook 840 G6','Core i5 laptop with 16GB RAM and 512GB SSD for coursework.','Electronics','Good',285000,'Faculty of Science'),
    ('MacBook Air M1','Fast and lightweight laptop with charger, ideal for design and coding.','Electronics','Like new',720000,'Site II'),
    ('JBL Bluetooth Speaker','Portable speaker with clear audio and dependable battery life.','Electronics','Good',45000,'Student centre'),
    ('Noise-cancelling Headphones','Comfortable over-ear wireless headphones for focused study.','Electronics','New',38500,'Main campus'),
    ('Engineering Mathematics Textbook','Well-kept advanced engineering mathematics reference book.','Books & Academics','Good',8500,'Engineering block'),
    ('Medical Physiology Textbook','Current physiology reference with clean pages and no missing sections.','Books & Academics','Fair',12000,'College of Health'),
    ('Casio Scientific Calculator','Original calculator suitable for exams and technical courses.','Books & Academics','Like new',18500,'Library'),
    ('Ergonomic Office Chair','Supportive adjustable chair for long hostel study sessions.','Home & Hostel','Good',65000,'Abraka campus'),
    ('Compact Study Desk','Strong wooden desk sized for a laptop, books, and study lamp.','Home & Hostel','Good',48000,'Site III'),
    ('Waterproof Laptop Backpack','Padded everyday backpack with dedicated 15-inch laptop sleeve.','Fashion','New',22000,'Main gate'),
    ('Nike Running Sneakers','Comfortable authentic sneakers, UK size 43, lightly worn.','Fashion','Like new',42000,'Sports complex'),
    ('20000mAh Power Bank','Fast-charging power bank for lectures and long campus days.','Phones & Accessories','New',28500,'Student centre'),
    ('24-inch Dell Monitor','Full HD display with HDMI cable and sturdy adjustable stand.','Electronics','Good',92000,'ICT centre'),
    ('Mechanical Keyboard','Compact backlit keyboard with tactile switches and USB cable.','Electronics','Like new',32000,'Site II'),
    ('Mini Hostel Refrigerator','Energy-efficient compact refrigerator in sound working order.','Home & Hostel','Fair',110000,'Female hostel'),
    ('Rechargeable Study Lamp','Three brightness levels with long-lasting rechargeable battery.','Home & Hostel','New',12500,'Main campus'),
    ('Graphing Drawing Set','Complete technical drawing instruments in a protective case.','Books & Academics','New',9500,'Engineering block'),
    ('Unisex Denim Jacket','Classic blue denim jacket in medium size, barely used.','Fashion','Like new',26000,'Student centre'),
    ('USB-C Multiport Hub','HDMI, USB 3 and card reader hub for modern laptops.','Electronics','New',19500,'ICT centre'),
    ('Standing Fan','Quiet three-speed fan suitable for a hostel room.','Home & Hostel','Good',35000,'Site III'),
    ('Football Training Kit','Quality football with pump, cones, and training bibs.','Sports & Fitness','Good',24000,'Sports complex'),
    ('Academic Gown Set','Complete graduation gown, hood, and cap in excellent condition.','Fashion','Like new',30000,'Main gate')
  ) as v(title,description,category,condition,price_naira,location)
  where not exists (select 1 from public.listings l where l.seller_id=demo_seller and l.title=v.title);
end $$;
