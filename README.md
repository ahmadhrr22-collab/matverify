# MatVerify | AI Material Verification Intelligence

<img width="1919" height="953" alt="image" src="https://github.com/user-attachments/assets/dea6407a-866f-4727-816f-5c06aeec136d" />

<img width="1919" height="950" alt="image" src="https://github.com/user-attachments/assets/43470a5f-a5b5-448a-9be8-02a22e907992" />

**MatVerify** adalah sistem otomasi berbasis kecerdasan buatan yang dirancang untuk memverifikasi dokumen *Certificate of Analysis* (CoA) bahan baku farmasi secara instan. Dengan mengintegrasikan Azure AI, sistem ini membantu memastikan setiap material yang masuk ke jalur produksi memenuhi standar kualitas yang ketat, meminimalisir *human error*, dan mempercepat proses Quality Control (QC).

## Fitur Utama

- **AI-Driven Data Extraction**: Mengekstraksi parameter teknis dari dokumen CoA secara otomatis menggunakan Azure AI Document Intelligence.
- **Automated Validation**: Membandingkan hasil uji batch dengan master data spesifikasi kualitas secara *real-time*.
- **Three-Tier Decision Logic**:
  - ✅ **Approved**: Otomatis menyetujui dokumen yang memenuhi syarat.
  - ❌ **Rejected**: Memblokir material yang tidak sesuai standar atau kadaluwarsa.
  - ⚠️ **Manual Review**: Menandai data ambigu untuk diverifikasi ulang oleh personel QC.
- **Efficient Performance**: Dilengkapi dengan sistem *caching* untuk transisi data yang cepat di dashboard.
- **Industry Standard Focus**: Dirancang untuk mendukung kepatuhan regulasi farmasi dan integritas data.

##  Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, Vite.
- **Backend**: Node.js, Express.js.
- **AI Service**: Azure AI Services (Document Intelligence).
- **Hosting**: Vercel.
- **State & Cache**: Custom lightweight caching layer.

##  Instalasi

### Prasyarat
- Node.js (versi 18 ke atas)
- Akun Azure (untuk API Key AI Services)

2. Installasi Dependensi
### Langkah-langkah
1. Clone repository:
   ```bash
   git clone [https://github.com/ahmadhrr22-collab/matverify.git](https://github.com/ahmadhrr22-collab/matverify.git)
   cd matverify

   # Di folder root (untuk backend)
cd backend
npm install

# Di folder frontend
cd ../frontend
npm install

3. Menjalankan Website
# Jalankan backend
npm run dev

# Jalankan frontend
npm run dev

Skenario Demo
-**Approval: Menunjukkan bagaimana AI memproses dokumen yang valid dalam hitungan detik.**
-**Rejected: Menunjukkan deteksi otomatis terhadap parameter yang tidak sesuai standar.**
-**Manual Review: Menunjukkan penanganan sistem terhadap data dokumen yang kurang jelas demi menjaga akurasi tinggi.**

Author
-**Ahmad Hariri - Physics Undergraduate at IPB University.**
-**Specialized in Computational Physics & Machine Learning.**

Proyek ini dikembangkan sebagai solusi inovatif untuk otomasi industri farmasi masa depan.
