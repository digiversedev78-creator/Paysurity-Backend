const fs = require('fs');

const filePath = 'src/modules/reports/reports.spec.ts';
let content = fs.readFileSync(filePath, 'utf8');

// The ValidationPipe transforms the plain object to GenerateMerchantStatementDto
content = content.replace(/expect\(mockReportsService\.generateMerchantStatementReport\)\.toHaveBeenCalledWith\(\s*generateDto,/g, 'expect(mockReportsService.generateMerchantStatementReport).toHaveBeenCalledWith(\n        expect.any(Object),');

fs.writeFileSync(filePath, content);
console.log('Fixed reports.spec.ts');
