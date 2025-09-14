const express = require('express');
const path = require('path');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const app = express();

// 로컬 개발용 서버 (Vercel에서는 사용되지 않음)
const port = process.env.PORT || 5173;

// 로컬 개발에서는 메모리 스토리지 사용
const storage = multer.memoryStorage();

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

// 로컬 개발용 API 엔드포인트들
app.post('/api/convert-to-pdf', upload.array('images'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '업로드할 이미지를 선택해주세요.' });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      const optimizedBuffer = await sharp(file.buffer)
        .jpeg({ quality: 80 })
        .toBuffer();

      const image = await pdfDoc.embedJpg(optimizedBuffer);
      const page = pdfDoc.addPage();

      const { width, height } = image.scale(1);
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      const scale = Math.min(pageWidth / width, pageHeight / height) * 0.9;

      page.drawImage(image, {
        x: (pageWidth - width * scale) / 2,
        y: (pageHeight - height * scale) / 2,
        width: width * scale,
        height: height * scale,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `converted-${Date.now()}.pdf`;
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    res.json({
      success: true,
      message: 'PDF 변환이 완료되었습니다.',
      filename: filename,
      downloadUrl: `data:application/pdf;base64,${base64Pdf}`
    });

  } catch (error) {
    console.error('PDF 변환 오류:', error);
    res.status(500).json({ error: 'PDF 변환 중 오류가 발생했습니다.' });
  }
});

app.post('/api/merge-pdfs', upload.array('pdfs'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '합칠 PDF 파일을 선택해주세요.' });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdf = await PDFDocument.load(file.buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const filename = `merged-${Date.now()}.pdf`;
    const base64Pdf = Buffer.from(mergedPdfBytes).toString('base64');

    res.json({
      success: true,
      message: 'PDF 병합이 완료되었습니다.',
      filename: filename,
      downloadUrl: `data:application/pdf;base64,${base64Pdf}`
    });

  } catch (error) {
    console.error('PDF 병합 오류:', error);
    res.status(500).json({ error: 'PDF 병합 중 오류가 발생했습니다.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '웹 앱 센터가 정상 작동중입니다.',
    environment: 'local'
  });
});

// 모든 라우트를 index.html로 리디렉션 (SPA 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 로컬 개발 서버 실행
if (require.main === module) {
  app.listen(port, () => {
    console.log(`로컬 개발 서버가 http://localhost:${port}에서 실행 중입니다`);
  });
}

module.exports = app;