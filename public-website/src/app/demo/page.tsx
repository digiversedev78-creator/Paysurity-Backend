import { redirect } from 'next/navigation';

/**
 * /demo — Legacy demo index page.
 * Decommissioned: redirected to the canonical DEMOAPRIL2026 hub.
 * This prevents stakeholder confusion between two demo pages.
 */
export default function DemoRedirect() {
  redirect('/DEMOAPRIL2026');
}
