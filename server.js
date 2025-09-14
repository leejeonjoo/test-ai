const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const app = express();
const port = 5173;

// 업로드 폴더 생성
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다. JPG, PNG, PDF만 업로드 가능합니다.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB 제한
});

// JSON 파싱 미들웨어
app.use(express.json());

// 정적 파일 서빙을 위한 미들웨어 설정
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// JPG를 PDF로 변환하는 엔드포인트
app.post('/convert-to-pdf', upload.array('images'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '업로드할 이미지를 선택해주세요.' });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      // 이미지 최적화
      const optimizedBuffer = await sharp(file.path)
        .jpeg({ quality: 80 })
        .toBuffer();

      const image = await pdfDoc.embedJpg(optimizedBuffer);
      const page = pdfDoc.addPage();

      // 이미지 크기에 맞춰 페이지 조정
      const { width, height } = image.scale(1);
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      // 비율 유지하면서 페이지에 맞춤
      const scale = Math.min(pageWidth / width, pageHeight / height) * 0.9;

      page.drawImage(image, {
        x: (pageWidth - width * scale) / 2,
        y: (pageHeight - height * scale) / 2,
        width: width * scale,
        height: height * scale,
      });

      // 임시 파일 삭제
      fs.unlinkSync(file.path);
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `converted-${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, pdfBytes);

    res.json({
      success: true,
      message: 'PDF 변환이 완료되었습니다.',
      filename: filename,
      downloadUrl: `/uploads/${filename}`
    });

  } catch (error) {
    console.error('PDF 변환 오류:', error);
    res.status(500).json({ error: 'PDF 변환 중 오류가 발생했습니다.' });
  }
});

// PDF 파일들을 합치는 엔드포인트
app.post('/merge-pdfs', upload.array('pdfs'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '합칠 PDF 파일을 선택해주세요.' });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      copiedPages.forEach((page) => mergedPdf.addPage(page));

      // 임시 파일 삭제
      fs.unlinkSync(file.path);
    }

    const mergedPdfBytes = await mergedPdf.save();
    const filename = `merged-${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, mergedPdfBytes);

    res.json({
      success: true,
      message: 'PDF 병합이 완료되었습니다.',
      filename: filename,
      downloadUrl: `/uploads/${filename}`
    });

  } catch (error) {
    console.error('PDF 병합 오류:', error);
    res.status(500).json({ error: 'PDF 병합 중 오류가 발생했습니다.' });
  }
});

// 파일 삭제 엔드포인트
app.delete('/delete-file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true, message: '파일이 삭제되었습니다.' });
    } else {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    res.status(500).json({ error: '파일 삭제 중 오류가 발생했습니다.' });
  }
});

// 모든 라우트를 index.html로 리디렉션 (SPA 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다`);
});