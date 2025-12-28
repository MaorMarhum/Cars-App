import { SessionProvider } from "next-auth/react";
import AccountContent from "./account-content";

export default function AccountPage() {
  return (
    <SessionProvider>
      <AccountContent />
    </SessionProvider>
  );
}