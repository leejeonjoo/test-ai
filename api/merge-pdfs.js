import { PDFDocument } from 'pdf-lib';
import formidable from 'formidable';
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
        return mimetype && mimetype.includes('application/pdf');
      },
    });

    const [fields, files] = await form.parse(req);

    if (!files.pdfs || files.pdfs.length === 0) {
      return res.status(400).json({ error: '합칠 PDF 파일을 선택해주세요.' });
    }

    const mergedPdf = await PDFDocument.create();
    const pdfFiles = Array.isArray(files.pdfs) ? files.pdfs : [files.pdfs];

    for (const file of pdfFiles) {
      try {
        // 파일 읽기
        const pdfBytes = await fs.readFile(file.filepath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        copiedPages.forEach((page) => mergedPdf.addPage(page));

        // 임시 파일 정리
        await fs.unlink(file.filepath).catch(() => {}); // 에러 무시
      } catch (pdfError) {
        console.error('PDF 처리 오류:', pdfError);
        continue; // 다음 PDF 계속 처리
      }
    }

    // 병합된 PDF 생성
    const mergedPdfBytes = await mergedPdf.save();
    const filename = `merged-${Date.now()}.pdf`;
    const base64Pdf = Buffer.from(mergedPdfBytes).toString('base64');

    res.status(200).json({
      success: true,
      message: 'PDF 병합이 완료되었습니다.',
      filename: filename,
      downloadUrl: `data:application/pdf;base64,${base64Pdf}`
    });

  } catch (error) {
    console.error('PDF 병합 오류:', error);
    res.status(500).json({
      error: 'PDF 병합 중 오류가 발생했습니다.',
      details: error.message
    });
  }
}