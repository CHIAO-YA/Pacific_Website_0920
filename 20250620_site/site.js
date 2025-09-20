const express = require('express');
const app = express();
app.use(express.static(__dirname)); // 服務當前目錄的靜態檔案
app.listen(3000, () => console.log('Server running on http://localhost:3000'));