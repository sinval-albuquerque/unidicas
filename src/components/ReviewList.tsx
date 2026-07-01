"use client";

import { useMemo, useState } from "react";
import type { Review } from "@/types/review";
import { filtrarReviews } from "@/lib/search";
import { ReviewCard } from "./ReviewCard";
import { SearchBar } from "./SearchBar";

/** Listagem de reviews com busca client-side. */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  const [termo, setTermo] = useState("");
  const filtradas = useMemo(() => filtrarReviews(reviews, termo), [reviews, termo]);

  return (
    <div>
      <div className="mb-5">
        <SearchBar onBuscar={setTermo} />
      </div>

      {filtradas.length === 0 ? (
        <p className="text-text-muted text-center py-10">
          Nenhuma review encontrada para &ldquo;{termo}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtradas.map((r) => (
            <ReviewCard key={r.slug} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}