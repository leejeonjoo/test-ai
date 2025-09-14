import { PDFDocument } from 'pdf-lib';
import formidable from 'formidable';
import sharp from 'sharp';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '지원하지 않는 메서드입니다.' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: function ({ name, originalFilename, mimetype }) {
        return mimetype && (mimetype.includes('image/jpeg') ||
                          mimetype.includes('image/jpg') ||
                          mimetype.includes('image/png'));
      },
    });

    const [fields, files] = await form.parse(req);

    if (!files.images || files.images.length === 0) {
      return res.status(400).json({ error: '업로드할 이미지를 선택해주세요.' });
    }

    const pdfDoc = await PDFDocument.create();
    const imageFiles = Array.isArray(files.images) ? files.images : [files.images];

    for (const file of imageFiles) {
      try {
        // 파일 읽기
        const fileBuffer = await fs.readFile(file.filepath);

        // Sharp로 이미지 최적화
        const optimizedBuffer = await sharp(fileBuffer)
          .jpeg({ quality: 80 })
          .toBuffer();

        // PDF에 이미지 추가
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

        // 임시 파일 정리
        await fs.unlink(file.filepath).catch(() => {}); // 에러 무시
      } catch (imageError) {
        console.error('이미지 처리 오류:', imageError);
        continue; // 다음 이미지 계속 처리
      }
    }

    // PDF 생성
    const pdfBytes = await pdfDoc.save();
    const filename = `converted-${Date.now()}.pdf`;
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    res.status(200).json({
      success: true,
      message: 'PDF 변환이 완료되었습니다.',
      filename: filename,
      downloadUrl: `data:application/pdf;base64,${base64Pdf}`
    });

  } catch (error) {
    console.error('PDF 변환 오류:', error);
    res.status(500).json({
      error: 'PDF 변환 중 오류가 발생했습니다.',
      details: error.message
    });
  }
}