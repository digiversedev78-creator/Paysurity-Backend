'use client';
import TenantStorefrontLayout from '../../../components/TenantStorefrontLayout';
import { StorefrontProps } from '../../../types/storefront';

import { storefrontConfig } from './config';

export default function HouseOfBiryaniHomePage() {
  return <TenantStorefrontLayout config={storefrontConfig} />;
}