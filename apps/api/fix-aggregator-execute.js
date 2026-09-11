const fs = require('fs');

const filePath = 'src/modules/aggregator/aggregator.e2e-spec.ts';
let content = fs.readFileSync(filePath, 'utf8');

const executeMock = `
  execute: jest.fn().mockImplementation(async (sqlObj) => {
    let q = '';
    if (typeof sqlObj === 'string') {
      q = sqlObj;
    } else if (sqlObj && sqlObj.queryChunks) {
      q = sqlObj.queryChunks.map(c => {
        if (c && c.value && Array.isArray(c.value)) return c.value.join('');
        if (typeof c === 'string') return c;
        return '?';
      }).join('');
    }

    if (q.includes('SELECT')) {
      const found = mockOrders.filter((o) => {
        let match = true;
        for (const chunk of (sqlObj.queryChunks || [])) {
          const val = (chunk && chunk.value !== undefined && !Array.isArray(chunk.value)) ? chunk.value : chunk;
          if (typeof val === 'string' && (val.includes('doordash') || val.includes('ubereats') || val.includes('grubhub'))) {
             if (o.source_platform !== val) match = false;
          }
          if (typeof val === 'string' && (val.startsWith('dd_') || val.startsWith('ue_') || val.startsWith('gh_'))) {
             if (o.external_order_id !== val) match = false;
          }
        }
        return match;
      });
      return found.map(o => ({
        id: o.id,
        status: o.status,
        totalAmountCents: parseInt(o.amount) || 0,
        merchantId: 'test-merchant-id',
        externalOrderId: o.external_order_id,
        aggregator: o.source_platform
      }));
    }

    if (q.includes('INSERT INTO orders')) {
      const record = {
        id: require('crypto').randomUUID(),
        tenant_id: MOCK_TENANT_ID,
        external_order_id: '',
        source_platform: '',
        amount: '0',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };
      for (const chunk of (sqlObj.queryChunks || [])) {
        const val = (chunk && chunk.value !== undefined && !Array.isArray(chunk.value)) ? chunk.value : chunk;
        if (typeof val === 'string') {
          if (['doordash', 'ubereats', 'grubhub'].includes(val.toLowerCase())) record.source_platform = val.toLowerCase();
          else if (val.startsWith('dd_') || val.startsWith('ue_') || val.startsWith('gh_')) record.external_order_id = val;
          else if (['pending', 'accepted', 'cancelled', 'delivered', 'unknown'].includes(val.toLowerCase())) record.status = val.toLowerCase();
          else if (val.includes('{') && val.includes('}')) {
             try {
                const parsed = JSON.parse(val);
                if (parsed.total_amount) record.amount = parsed.total_amount.toString();
                else if (parsed.data?.order?.payments?.[0]?.amount?.total_charge?.amount) record.amount = parsed.data.order.payments[0].amount.total_charge.amount.toString();
             } catch (e) {}
          }
        }
      }
      mockOrders.push(record);
      return [{ id: record.id }];
    }
    
    if (q.includes('UPDATE orders')) {
       let targetId = '';
       for (const chunk of (sqlObj.queryChunks || [])) {
          const val = (chunk && chunk.value !== undefined && !Array.isArray(chunk.value)) ? chunk.value : chunk;
          if (typeof val === 'string' && val.length === 36 && val.includes('-')) targetId = val;
       }
       const order = mockOrders.find(o => o.id === targetId || o.external_order_id === targetId);
       if (order) {
         for (const chunk of (sqlObj.queryChunks || [])) {
           const val = (chunk && chunk.value !== undefined && !Array.isArray(chunk.value)) ? chunk.value : chunk;
           if (typeof val === 'string' && ['pending', 'accepted', 'cancelled', 'delivered', 'unknown'].includes(val.toLowerCase())) {
              order.status = val.toLowerCase();
           }
         }
         order.updated_at = new Date();
       }
       return [];
    }
    return [];
  }),
`;

content = content.replace(/execute: jest\.fn\(\)\.mockImplementation\(async \(sqlObj\) => \{[\s\S]*?transaction: jest\.fn\(\)/, executeMock.trim() + '\n\n  transaction: jest.fn()');

fs.writeFileSync(filePath, content);
console.log('Fixed execute mock in aggregator.e2e-spec.ts');
