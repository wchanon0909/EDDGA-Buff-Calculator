# EDDGA Buff Calculator — Version 1

เว็บคำนวณโบนัสตัวละคร EDDGA Hi-Class แบบ Static Website ใช้ได้ทั้งเดสก์ท็อปและมือถือ ไม่มี backend, database, package manager หรือ API key และสามารถอัปโหลดขึ้น GitHub Pages ได้ทันที

## ฟังก์ชัน

- Guild Buff Lv.1–5 (จากภาพตารางที่ผู้ใช้ให้มา)
- Donate Rank Lv.1–7 พร้อมยอดบริจาคสะสม (จากภาพตารางที่ผู้ใช้ให้มา)
- Rank Boss Lv.1–5 พร้อมจำนวน Boss และจำนวน Zeny (จากภาพตารางที่ผู้ใช้ให้มา)
- Weapon Refine อาวุธ 16 ประเภท เลือก +5 ถึง +10 และ **1 ออฟชั่นจริงต่ออาวุธ 1 ชิ้น**
- Armor Refine 5 ช่อง: Helm / Armor / Shield / Garment / Boots เลือก +5 ถึง +10 และ **1 ออฟชั่นจริงต่ออุปกรณ์แต่ละชิ้น**
- Refine Pass Set +5 ถึง +10 โดยผู้ใช้เลือกระดับที่ผ่านเงื่อนไขจริง
- คำนวณอัตโนมัติเมื่อเปลี่ยนตัวเลือก แยกโบนัสแบบเปอร์เซ็นต์กับค่าคงที่
- แสดงที่มาของโบนัสแต่ละรายการ กดขยายดูรายละเอียดได้
- เปิด/ปิดบัฟทีละหมวดได้ โดยยังเก็บตัวเลือกเดิมไว้
- บันทึกบิลด์ล่าสุดไว้ใน `localStorage` ของเบราว์เซอร์
- ปุ่มแชร์ Build ด้วยลิงก์ที่บรรจุตัวเลือก (`?b=...`)
- ปุ่มโหลดตัวอย่างและล้างค่าทั้งหมด

## นำเว็บขึ้น GitHub Pages (ฟรี)

1. สร้าง Repository ใหม่ที่ https://github.com/new เช่น `eddga-buff-calculator` แล้วเลือก `Public` (ใช้ GitHub Pages ฟรีสำหรับ public repo)
2. อัปโหลด **ไฟล์และโฟลเดอร์ด้านในโปรเจกต์นี้** ทั้งหมดไปที่ root ของ repository โดย `index.html` ต้องอยู่ระดับบนสุด
3. ไปที่ **Settings → Pages**
4. ส่วน **Build and deployment** เลือก `Deploy from a branch`
5. Branch: `main` และ Folder: `/ (root)` แล้วกด **Save**
6. เว็บจะอยู่ที่ `https://USERNAME.github.io/eddga-buff-calculator/` เมื่อการเผยแพร่สำเร็จ (ชื่อ URL ขึ้นอยู่กับชื่อ repo)

ไม่ต้องติดตั้ง Node.js ไม่ต้องรัน build และไม่ต้องซื้อ hosting

หากเปิดไฟล์ `index.html` บนคอมโดยตรงก็ใช้งานได้ เพราะไฟล์ข้อมูลถูกรวมไว้ใน `js/data.js` ไม่ใช้ `fetch()` ข้ามไฟล์

## โครงสร้างไฟล์

```
eddga-buff-calculator/
├── index.html             # หน้าเว็บ
├── css/style.css          # Responsive UI
├── js/data.js             # ตารางโบนัสทั้ง 6 หมวด
├── js/calculator.js       # ตัวคำนวณ / ตรวจสอบข้อมูลที่โหลดจาก URL
├── js/app.js              # UI, บันทึกบิลด์, แชร์ลิงก์
├── tests/run-tests.js     # Unit tests (ถ้ามี Node.js)
├── .nojekyll
└── README.md
```

## ทดสอบ

ถ้ามี Node.js ให้รันที่โฟลเดอร์โปรเจกต์:

```sh
node tests/run-tests.js
```

## หมายเหตุสำคัญสำหรับการตีความ

- โปรแกรม **รวมโบนัสในลักษณะบวกตรง** ในกลุ่มสถานะเดียวกัน (additive sum of bonus values) เท่านั้น ไม่คำนวณสูตรการโจมตีจริงของเซิร์ฟเวอร์ รวมถึงการคูณตัวปรับอื่น ๆ
- `ATK +20` แยกจาก `ATK +5%`; `Max HP +200` แยกจาก `Max HP +10%` เพื่อไม่ให้รวมคนละหน่วย
- ข้อมูล `EXP` ในผลรวมแสดงเป็นกลุ่มเดียวกัน โดย EXP ของ Guild ระบุว่าเป็น EXP จากมอนสเตอร์
- โบนัส `โจมตีผู้เล่นแรงขึ้น`, `ดาเมจกายภาพต่อผู้เล่นมนุษย์`, และ `โจมตีมอนเตอร์ Class Boss` แยกกัน เพราะเงื่อนไขไม่เหมือนกัน
- โบนัส `ป้องกันทุกขนาด`, `ป้องกันทุกประเภท`, `ป้องกันมนุษย์`, `ลดความเสียหายจากผู้เล่นมนุษย์`, และ `ป้องกัน Boss` แยกกัน
- ข้อมูลส่วนตาราง Weapon Refine (Bow) ในแหล่งอ้างอิงพิมพ์ค่าระดับ +8 เป็น `+13` และ +10 เป็น `20%` สำหรับ Boss damage: ในโปรแกรมอ่านตามบริบทของแถวเป็น **+13% / +20%**
- ในข้อมูล Weapon Refine (Two Hand Axe) Boss damage ระดับ +9 เป็น **+15%** (ต่างจากอาวุธอื่นที่มักเป็น +17%) โปรแกรมคงค่าตามตาราง
- Item: Cotton Shirt [1], Adventurer's Suit [1], Jacket [1], Hood [1], Sandals [1] **ไม่ได้รับ Armor Refine Options** ตามเอกสาร ผู้ใช้ต้องไม่เลือกโบนัสในเว็บสำหรับไอเทมเหล่านี้
- เว็บไม่มีระบบตรวจความเข้ากันได้ของอุปกรณ์ (เช่น ใช้อาวุธสองมือกับ Shield) และไม่มีระบบตรวจการผ่านเงื่อนไข Refine Pass โดยอัตโนมัติ ผู้ใช้เลือกเฉพาะโบนัสที่ได้รับจริง
- ชุดข้อมูลเป็น Snapshot อ้างอิงวันที่ 13 พฤศจิกายน 2026 หากเอกสารเปลี่ยน ต้องแก้ไฟล์ `js/data.js` แล้ว push code ใหม่

## อ้างอิง

- Weapon Refine Options: https://eddga-hiclass.gitbook.io/eddga-hiclass-docs/refine-option-system/weapon-refine-options
- Armor Refine Options: https://eddga-hiclass.gitbook.io/eddga-hiclass-docs/refine-option-system/armor-refine-options
- Refine Pass System: https://eddga-hiclass.gitbook.io/eddga-hiclass-docs/refine-pass-system
- Guild Buff System / Donate Rank System / Rank Boss System: ภาพตารางจากผู้ใช้
