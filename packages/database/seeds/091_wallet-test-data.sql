-- Disable foreign key checks for seeding
SET CONSTRAINTS ALL DEFERRED;

-- PaySurity Wallet Test Data Seed
-- This script creates 5 consumer wallets, 2 merchant wallets,
-- and 10 wallet transactions (top-ups and P2P transfers).
-- One consumer wallet is marked as 'suspended' for testing limits.

DO $$
DECLARE
    -- Global Tenant ID for all test data
    test_tenant_id UUID := 'e0e5a8f0-1a2b-4c3d-9e0f-1a2b3c4d5e6f';

    -- Consumer Wallet IDs
    consumer_wallet_1_id UUID := 'f1f2a3a4-b5b6-c7c8-d9d0-e1e2f3f4a5a6'; -- Active, Final Balance: $575.00
    consumer_wallet_2_id UUID := 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; -- Active, Final Balance: $500.00
    consumer_wallet_3_id UUID := 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'; -- Active, Final Balance: $250.00
    consumer_wallet_4_id UUID := 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'; -- Suspended, Final Balance: $0.00
    consumer_wallet_5_id UUID := 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f0a'; -- Active, Final Balance: $125.00

    -- Merchant Wallet IDs
    merchant_wallet_1_id UUID := 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f0a1b'; -- Active, Final Balance: $4450.00
    merchant_wallet_2_id UUID := 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f0a1b2c'; -- Active, Final Balance: $2150.00

    -- Wallet Transaction IDs
    txn_1_id UUID := '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d'; -- Topup C1 ($200)
    txn_2_id UUID := '1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e'; -- P2P C1 -> C2 ($100)
    txn_3_id UUID := '2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f'; -- P2P C2 -> C3 ($50)
    txn_4_id UUID := '3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f0a'; -- Topup C3 ($100)
    txn_5_id UUID := '4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f0a1b'; -- P2P C5 -> M1 ($150)
    txn_6_id UUID := '5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f0a1b2c'; -- Topup M1 ($500)
    txn_7_id UUID := '6a7b8c9d-0e1f-2a3b-4c5d-6e7f0a1b2c3d'; -- P2P M2 -> C1 ($50)
    txn_8_id UUID := '7b8c9d0e-1f2a-3b4c-5d6e-7f0a1b2c3d4e'; -- P2P C1 -> C5 ($75)
    txn_9_id UUID := '8c9d0e1f-2a3b-4c5d-6e7f-0a1b2c3d4e5f'; -- Topup C2 ($150)
    txn_10_id UUID := '9d0e1f2a-3b4c-5d6e-7f0a-1b2c3d4e5f6a'; -- P2P M1 -> M2 ($200)

BEGIN
    -- Insert Wallets with their final balances after all transactions
    INSERT INTO wallets (wallet_id, tenant_id, wallet_type, status, balance, created_at, updated_at) VALUES
    (consumer_wallet_1_id, test_tenant_id, 'consumer', 'active', 575.00, NOW(), NOW()),
    (consumer_wallet_2_id, test_tenant_id, 'consumer', 'active', 500.00, NOW(), NOW()),
    (consumer_wallet_3_id, test_tenant_id, 'consumer', 'active', 250.00, NOW(), NOW()),
    (consumer_wallet_4_id, test_tenant_id, 'consumer', 'suspended', 0.00, NOW(), NOW()), -- Suspended wallet for testing limits
    (consumer_wallet_5_id, test_tenant_id, 'consumer', 'active', 125.00, NOW(), NOW()),
    (merchant_wallet_1_id, test_tenant_id, 'merchant', 'active', 4450.00, NOW(), NOW()),
    (merchant_wallet_2_id, test_tenant_id, 'merchant', 'active', 2150.00, NOW(), NOW());

    -- Insert Wallet Transactions
    -- For P2P transfers, we'll use source_wallet_id and destination_wallet_id.
    -- For top-ups, source_wallet_id will be NULL.
    -- Assuming a 'type' column for transaction_type.
    INSERT INTO wallet_transactions (
        transaction_id,
        tenant_id,
        type,
        source_wallet_id,
        destination_wallet_id,
        amount,
        fee,
        status,
        description,
        created_at,
        updated_at
    ) VALUES
    -- 1. Topup C1 ($200)
    (txn_1_id, test_tenant_id, 'topup', NULL, consumer_wallet_1_id, 200.00, 0.00, 'completed', 'Initial topup for consumer wallet 1', NOW() - INTERVAL '100 seconds', NOW() - INTERVAL '100 seconds'),
    -- 2. P2P C1 -> C2 ($100)
    (txn_2_id, test_tenant_id, 'p2p_transfer', consumer_wallet_1_id, consumer_wallet_2_id, 100.00, 0.00, 'completed', 'P2P transfer from C1 to C2', NOW() - INTERVAL '90 seconds', NOW() - INTERVAL '90 seconds'),
    -- 3. P2P C2 -> C3 ($50)
    (txn_3_id, test_tenant_id, 'p2p_transfer', consumer_wallet_2_id, consumer_wallet_3_id, 50.00, 0.00, 'completed', 'P2P transfer from C2 to C3', NOW() - INTERVAL '80 seconds', NOW() - INTERVAL '80 seconds'),
    -- 4. Topup C3 ($100)
    (txn_4_id, test_tenant_id, 'topup', NULL, consumer_wallet_3_id, 100.00, 0.00, 'completed', 'Topup for consumer wallet 3', NOW() - INTERVAL '70 seconds', NOW() - INTERVAL '70 seconds'),
    -- 5. P2P C5 -> M1 ($150)
    (txn_5_id, test_tenant_id, 'p2p_transfer', consumer_wallet_5_id, merchant_wallet_1_id, 150.00, 0.00, 'completed', 'P2P transfer from C5 to M1', NOW() - INTERVAL '60 seconds', NOW() - INTERVAL '60 seconds'),
    -- 6. Topup M1 ($500)
    (txn_6_id, test_tenant_id, 'topup', NULL, merchant_wallet_1_id, 500.00, 0.00, 'completed', 'Topup for merchant wallet 1', NOW() - INTERVAL '50 seconds', NOW() - INTERVAL '50 seconds'),
    -- 7. P2P M2 -> C1 ($50)
    (txn_7_id, test_tenant_id, 'p2p_transfer', merchant_wallet_2_id, consumer_wallet_1_id, 50.00, 0.00, 'completed', 'P2P transfer from M2 to C1', NOW() - INTERVAL '40 seconds', NOW() - INTERVAL '40 seconds'),
    -- 8. P2P C1 -> C5 ($75)
    (txn_8_id, test_tenant_id, 'p2p_transfer', consumer_wallet_1_id, consumer_wallet_5_id, 75.00, 0.00, 'completed', 'P2P transfer from C1 to C5', NOW() - INTERVAL '30 seconds', NOW() - INTERVAL '30 seconds'),
    -- 9. Topup C2 ($150)
    (txn_9_id, test_tenant_id, 'topup', NULL, consumer_wallet_2_id, 150.00, 0.00, 'completed', 'Topup for consumer wallet 2', NOW() - INTERVAL '20 seconds', NOW() - INTERVAL '20 seconds'),
    -- 10. P2P M1 -> M2 ($200)
    (txn_10_id, test_tenant_id, 'p2p_transfer', merchant_wallet_1_id, merchant_wallet_2_id, 200.00, 0.00, 'completed', 'P2P transfer from M1 to M2', NOW() - INTERVAL '10 seconds', NOW() - INTERVAL '10 seconds');

END $$;

-- Re-enable foreign key checks if deferred at the beginning of the script
-- SET CONSTRAINTS ALL IMMEDIATE;