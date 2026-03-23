import TawkToChat from "./TawkToChat";



export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <TawkToChat />
    </>
  );
}
