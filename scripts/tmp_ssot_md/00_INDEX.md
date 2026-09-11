# 00_INDEX

**Generated:** 2026-02-10 04:28:40 (America/Chicago)
## Authority order

1) 00_INDEX.md
2) 90_CROSSCUTTING_INVARIANTS.md
3) Topic docs (01–20)
4) 99_GLOSSARY.md


## Agent guard artifacts

The following files are part of the agent handover contract (do not modify casually):
- `AGENT_GUARD/agent_build_prompt.md`
- `AGENT_GUARD/preflight.schema.json`
- `AGENT_GUARD/preflight_runner_spec.md`
- `AGENT_GUARD/preflight_runner.js`
- `AGENT_GUARD/term_registry_builder_spec.md`

## Doc map (Phase 1 focus)

- 90_CROSSCUTTING_INVARIANTS.md

- 01_FOUNDATION_ADM.md
- 02_UI_DESIGN_SYSTEM.md
- 03_PUBLIC_WEBSITE_COM.md
- 04_MERCHANT_SERVICES_MER.md
- 05_MERCHANT_ONBOARDING_ONB.md
- 06_MERCHANT_SAVINGS_ESTIMATOR_SAV.md
- 07_AFFILIATES_RESELLERS_REFERRALS_AFR.md
- 08_PAYMENT_ORCHESTRATION_ORC.md
- 09_ECOMMERCE_ECO.md
- 10_POS_RETAIL_POS.md
- 11_POS_RESTAURANT_POSR.md
- 12_POS_GROCERY_POSG.md
- 13_DIGITAL_WALLETS_WAL.md
- 14_PAYROLL_PAY.md
- 15_SECURITY_PRIVACY.md
- 16_COMPLIANCE_LEGAL.md
- 17_MOBILE.md
- 20_DEFERRED_VERTICALS.md (Phase 2+)

## Recent corrections

- 2026-02-10: v11_25 agent-proofing — added executable preflight runner (AGENT_GUARD/preflight_runner.js) and ORC FluidPay endpoint mapping table.

- 2026-02-10: v11_24 hardening — added AGENT_GUARD artifacts, ORC adapter contract appendix, and Phase 1 payroll filing decision gate.

- 2026-02-10: Defined Go-live triggers (merchant.go_live_at) and wired post-go-live rules to this definition in ADM/ONB/POS docs.

- 2026-02-10: Expanded glossary to explicitly expand abbreviations (canonical semantic lock) to reduce agent ambiguity.

- 2026-02-10: Added FluidPay reuse-first integration addendum (PSR-EXT-FLUIDPAY-REUSE-20260210-001) and referenced it in ORC/ECO/COM + glossary to prevent rebuilding commodity gateway features.

- 2026-02-10: Added controlled POS module override policy (PSR-EXT-POS-OVERRIDE-20260210-001) in ONB and referenced in POS/POSR/POSG; updated glossary role/entity locks.

- 2026-02-10: SEC repass (added explicit decision gates + responsibility matrix to prevent agent scope confusion).
- 2026-02-10: Deferred verticals repass (removed legacy clarification noise; aligned to Phase 2 (Deferred); added explicit non-roadmap note).

- 2026-02-10: Polished `20_DEFERRED_VERTICALS.md` (made deferment rules explicit; normalized wording; removed misplaced ADM requirement).
- 2026-02-10: Re-homed PSR-V6-00596 into `01_FOUNDATION_ADM.md` (Phase 1 admin safety: re-entry guard for duplicate job triggers).

- 2026-02-09: Merchant onboarding doc was de-contaminated; 344 non-onboarding requirements were re-homed to their owning topic docs.
- 2026-02-10: Added PSR-EXT addenda for (a) Public Website: vertical hubs + AI blog ingestion/generation/publishing + social automation + QR attribution, (b) E-Commerce: PaySurity Checkout + Cart Widget + WooCommerce plugin + Shopify external-provider redirect integration, (c) Admin: configuration UI + job run dashboard + provenance logging. Updated ledger totals.
- 2026-02-10: Polished 13_DIGITAL_WALLETS_WAL.md (semantic regrouping + normalized wording; no change in requirement totals).
- 2026-02-10: Added WAL economics/monetization addendum (PSR-EXT-WAL-20260210-008..013).
- 2026-02-10: Added POS device fleet management + Retail Vertical Profiles addendum (PSR-EXT-POS-20260210-001..004) and remote support security controls (PSR-EXT-SEC-20260210-001..002).
- 2026-02-10: Hardened `15_SECURITY_PRIVACY.md` (removed redundant headers; added PSR-EXT build security gates + incident readiness addendum PSR-EXT-SEC-20260210-003..008).
- 2026-02-10: Reorganized `16_COMPLIANCE_LEGAL.md` by COM topics; normalized wording and endpoint titles; corrected requirement count to match refs (166).

## Ledger (proof of no misses)

- Baseline total requirements expected (from v11): **3878** (PSR-V6)
- Addendum requirements added (clarified target-state): **122** (PSR-EXT-*)
- Total requirements in current split set: **4000**

The split is valid only if these totals match and each PSR-V6 ref appears in exactly one topic doc.

### Per-file counts


> Note: `sha256` is authoritative for topic docs; `00_INDEX.md` is self-referential so its sha is listed as `n/a`.
| file | requirements | sha256 |
|:--|--:|:--|
| 00_INDEX.md | 0 | n/a |
| 01_FOUNDATION_ADM.md | 2314 | 556d22974900ca8ae0a186b7f5dd6c124f73ef55bc0e769937009b75fcf8b80a |
| 02_UI_DESIGN_SYSTEM.md | 10 | f053323650fce3a2eaad9534fa4b31add7ff39e884724753e482dd108bc41ed2 |
| 03_PUBLIC_WEBSITE_COM.md | 92 | 969137cff2790f61ed47f134b0a57c64515e59ec60c3f6f53bf17cfbe5275760 |
| 04_MERCHANT_SERVICES_MER.md | 169 | 53c12eb4fb919122c92a14d4d7d31f1803925ab196c7848992707260742f58d1 |
| 05_MERCHANT_ONBOARDING_ONB.md | 43 | 739dbc56bcf8bb9ba57d50f8d49d66da0d500d9ff5231966ef26b2e1afed7d7d |
| 06_MERCHANT_SAVINGS_ESTIMATOR_SAV.md | 40 | d96a09ee28bbb7d8a884b14a7e7b4eccdb21e56d8485faaff1df5383b9b2c552 |
| 07_AFFILIATES_RESELLERS_REFERRALS_AFR.md | 97 | e306ae4ec819db917ac17c26ba9655ab0912df85f17220b245e714c8b69ba626 |
| 08_PAYMENT_ORCHESTRATION_ORC.md | 101 | 2ef94e120bb5e1eae5d5d4741cf7d70456c7d3e13e2e307e4ffd0fe5cb371b00 |
| 09_ECOMMERCE_ECO.md | 129 | 0dc127ac272679876d22e8af7990772d81a4a8ab5be05a1e0671d536e713d30b |
| 10_POS_RETAIL_POS.md | 305 | 99287e1b1d2a841063873450aa181063a2ba6281258d6646d4c8a15fba09f120 |
| 11_POS_RESTAURANT_POSR.md | 62 | 7561b3b98ed140e6e862248998415698a3c7ff7fbc451800644cc109eb1cdfa5 |
| 12_POS_GROCERY_POSG.md | 64 | 37c85693d8b32f434015fe29e6ae00743accd75e825402dcb4f0dbf82c91713c |
| 13_DIGITAL_WALLETS_WAL.md | 203 | ca464928fb40c87ab4bb8deccfc03f63bc644c3e9bddf9f1087206a0c9032bd9 |
| 14_PAYROLL_PAY.md | 146 | ffa55e1a987a9fbc73c46d44d8866b91cf9118b1eca9393385265e2ad33fc777 |
| 15_SECURITY_PRIVACY.md | 23 | f35cc19c0b9d8481283b04e087d1e7d2cc214dc224c0fae0f579b674af8a3366 |
| 16_COMPLIANCE_LEGAL.md | 166 | e2ee756f7f09c828fee7df4b1b3da6360e8d1f1ddecad0dadb9b56cf682484eb |
| 17_MOBILE.md | 14 | 8089ab366bfc6a9229aa6d1f5159134b140ca640be7fff3be7533fd8fd45a622 |
| 20_DEFERRED_VERTICALS.md | 5 | b6b69084af95697d8283794cad5a47893b5bd8618cbf5d74345d05c4106bd46b |
| 90_CROSSCUTTING_INVARIANTS.md | 17 | 31ec071992944f4f50a11bb7fd8d96f5eaa2bc092e31421b4013ad7e503465e7 |
| 99_GLOSSARY.md | 0 | ecb6c865d62f48f56361d5aae14d5bba9f021baf0e4be312410c585c2ebd624c |
