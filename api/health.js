export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    message: '웹 앱 센터가 정상 작동중입니다.',
    timestamp: new Date().toISOString()
  });
}