// app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {children}
    </div>
  );
}