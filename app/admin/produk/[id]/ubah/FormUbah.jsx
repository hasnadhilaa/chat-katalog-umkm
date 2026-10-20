"use client";

import { useActionState } from "react";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";

export default function FormUbah({ produk }) {
  const [state, formAction, isPending] = useActionState(ubahProduk, null);

  return (
    <FormProduk
      produk={produk}
      labelTombol={isPending ? "Menyimpan..." : "Simpan perubahan"}
      action={formAction}
      error={state?.error}
    />
  );
}

