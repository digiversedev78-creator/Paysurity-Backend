export const AccountsTable = {
  id: 'uuid',
  balance: 'decimal',
  currency: 'string',
  version: 'integer', // Added for Optimistic Concurrency Control (OCC)
};

export const updateAccountBalance = async (accountId, newBalance, currentVersion) => {
  // DB query ensures the update only happens if the version matches
  const result = await db.query(
    'UPDATE accounts SET balance = $1, version = version + 1 WHERE id = $2 AND version = $3',
    [newBalance, accountId, currentVersion]
  );
  if (result.rowCount === 0) throw new Error('Concurrency Conflict: Version mismatch');
  return true;
};
