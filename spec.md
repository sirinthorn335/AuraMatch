# Software Requirement Specification: AuraMatch

## 1. Project Overview
**Project Name:** AuraMatch: AI-Powered Personal Color Web Application  
**Slogan:** "เปลี่ยนการเลือกสีให้เป็นเรื่องง่าย ด้วยปลายนิ้วคุณ"  
**Objective:** พัฒนาเว็บแอปพลิเคชันที่ใช้ระบบประมวลผลภาพ (Image Processing) เพื่อวิเคราะห์ Personal Color ของผู้ใช้งานและแนะนำโทนสีที่เหมาะสมสำหรับการแต่งหน้าและการแต่งกาย

---

## 2. Target Audience
* กลุ่มวัยรุ่นและวัยทำงานที่สนใจการดูแลบุคลิกภาพ
* ผู้ที่เริ่มต้นหัดแต่งหน้าหรือเลือกซื้อเสื้อผ้าแต่ไม่แน่ใจเรื่องโทนสี
* Content Creator ด้านบิวตี้และแฟชั่น

---

## 3. Core Features (Functional Requirements)

### 3.1 Skin Tone Scanner (Input Zone)
* **Camera Integration:** รองรับการเปิดกล้องผ่านเบราว์เซอร์ (Webcam) เพื่อถ่ายภาพสด
* **Upload Support:** รองรับการอัปโหลดไฟล์ภาพ (JPG, PNG)
* **Color Extraction:** ใช้เทคนิคดึงค่าสี (RGB/Hex) จากจุดที่กำหนดบนใบหน้า (เช่น แก้ม หรือหน้าผาก)

### 3.2 Personal Color Classifier (Processing)
* **Analysis Algorithm:** คำนวณค่าสีผิวเทียบกับฐานข้อมูล 4 ฤดูกาล:
    * **Spring:** Warm & Bright
    * **Summer:** Cool & Soft
    * **Autumn:** Warm & Deep
    * **Winter:** Cool & Clear
* **Accuracy Logic:** การคำนวณค่า Under Tone (Yellow/Pink) เพื่อความแม่นยำ

### 3.3 Virtual Discovery Dashboard (Result Zone)
* **Makeup Palette:** แสดงรายการสีลิปสติก, รองพื้น และบลัชออนที่แนะนำ
* **Fashion Wardrobe:** แสดง Palette สีเสื้อผ้า "Must-Have" และสีที่ควรหลีกเลี่ยง
* **Interactive Preview:** ฟีเจอร์จำลองการเปลี่ยนสีพื้นหลัง (Background Overlay) เพื่อทดสอบความสว่างของใบหน้า

### 3.4 Business Integration (Optional/Advanced)
* **E-commerce Link:** ปุ่มเชื่อมต่อไปยังแพลตฟอร์ม Shopping (Shopee/Lazada) ตามรหัสสีที่แนะนำ
* **AI Chatbot:** ระบบตอบคำถามเบื้องต้นเกี่ยวกับการแมตช์สีเสื้อผ้า

---

## 4. Technical Stack (Non-Functional Requirements)

* **Frontend:** React.js / Vue.js
* **Styling:** Tailwind CSS (Responsive Design)
* **Image Processing:** HTML5 Canvas API / TensorFlow.js (Face Mesh Detection)
* **Backend/Storage:** Firebase (Authentication & Firestore)
* **Deployment:** Vercel หรือ Netlify

---

## 5. System Architecture
1.  **User Interface:** หน้าจอรับภาพและแสดงผล
2.  **Processing Layer:** วิเคราะห์สีผิวด้วย JavaScript/TensorFlow.js
3.  **Data Layer:** เก็บข้อมูลโทนสีมาตรฐานของแต่ละฤดูกาล
4.  **Integration Layer:** เชื่อมต่อ API ภายนอก (ถ้ามี)

---

## 6. Action Plan & Roadmap
1.  **Phase 1 (Research):** รวบรวม Dataset ของค่าสีแต่ละฤดูกาล
2.  **Phase 2 (UI/UX Design):** ออกแบบ Wireframe และ User Flow
3.  **Phase 3 (Development):** พัฒนาระบบ Scanner และ Algorithm การจำแนกประเภท
4.  **Phase 4 (Testing):** ทดสอบกับกลุ่มตัวอย่างเพื่อปรับจูนความแม่นยำ
5.  **Phase 5 (Deployment):** ปล่อยเวอร์ชัน Beta สำหรับใช้งานจริง