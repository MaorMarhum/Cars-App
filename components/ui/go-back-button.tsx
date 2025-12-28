"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/button-self";

export default function GoBackButton() {
  const router = useRouter();

  return (
    <Button
      label="Go Back"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/car");
      }}
    />
  );
}
