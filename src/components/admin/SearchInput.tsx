// src/components/admin/SearchInput.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    // This effect ensures that if the user navigates back/forward, the input updates.
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    // Reset to page 1 for any new search
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full md:w-1/3">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="ابحث بالاسم..."
        className="pl-9"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}