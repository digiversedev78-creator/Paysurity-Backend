export default function DemoLayout({ children }: { children: React.ReactNode }) {
  // Returns just the nested children, bypassing local navigation overrides
  // (Note: To structurally bypass the root App Router layout, we rely on conditional checks in the root Navbar)
  return <>{children}</>;
}
