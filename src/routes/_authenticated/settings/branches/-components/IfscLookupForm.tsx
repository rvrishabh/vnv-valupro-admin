import { useLookupIfscMutation } from "@/api/mutations/branches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/**
 * Resolves an IFSC code to a fully-formed, already-created branch —
 * bank/institution, branch name, city, state, district and address all
 * come from the IFSC registry, so there's nothing left to type by hand.
 */
export function IfscLookupForm({ onCreated }: { onCreated: () => void }) {
  const [ifscCode, setIfscCode] = useState("");
  const lookup = useLookupIfscMutation();

  const normalized = ifscCode.trim().toUpperCase();
  const isValidFormat = IFSC_REGEX.test(normalized);

  const handleLookup = () => {
    lookup.mutate(normalized, {
      onSuccess: (result) => {
        if (result.found) onCreated();
      },
    });
  };

  return (
    <div className="space-y-2 pb-2">
      <div className="space-y-1.5">
        <Label htmlFor="ifsc-lookup">IFSC Code</Label>
        <Input
          id="ifsc-lookup"
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
          placeholder="HDFC0001234"
          maxLength={11}
          autoCapitalize="characters"
          onKeyDown={(e) => {
            if (e.key === "Enter" && isValidFormat && !lookup.isPending) {
              e.preventDefault();
              handleLookup();
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          The bank, branch name, city, state, district and address are all
          filled in automatically and the branch is created immediately —
          nothing else to enter.
        </p>
      </div>

      {lookup.data && !lookup.data.found ? (
        <p className="text-sm text-destructive">
          No branch found for "{lookup.data.ifscCode}" — check the code, or
          switch to "Enter Manually" below.
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full mt-2"
        disabled={!isValidFormat || lookup.isPending}
        onClick={handleLookup}
      >
        {lookup.isPending ? "Looking up…" : "Look Up & Create Branch"}
      </Button>
    </div>
  );
}
