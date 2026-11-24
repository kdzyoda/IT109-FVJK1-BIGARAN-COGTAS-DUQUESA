"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CaptchaValue = { token: string; answer: string; ok: boolean };

type Props = { resetKey: number; onChange: (v: CaptchaValue) => void };

export function MathCaptcha({ resetKey, onChange }: Props) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [answer, setAnswer] = useState("");

  const generate = useCallback(() => {
    const x = 1 + Math.floor(Math.random() * 9);
    const y = 1 + Math.floor(Math.random() * 9);
    setA(x);
    setB(y);
    setAnswer("");
    // TEMP MOCK token. In the real app the backend creates the question and a signed token.
    onChange({ token: `${x}+${y}`, answer: "", ok: false });
  }, [onChange]);

  useEffect(() => {
    generate();
  }, [generate, resetKey]);

  function change(raw: string) {
    const v = raw.replace(/\D/g, "").slice(0, 2); // digits only
    setAnswer(v);
    onChange({ token: `${a}+${b}`, answer: v, ok: v !== "" && Number(v) === a + b });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha" className="t-nav">
        Are you human? What is {a > 0 ? `${a} + ${b}` : "..."}?
      </Label>
      <div className="flex gap-2">
        <Input
          id="captcha"
          inputMode="numeric"
          value={answer}
          onChange={(e) => change(e.target.value)}
          className="bg-card text-card-foreground"
          placeholder="Answer"
        />
        <Button type="button" variant="outline" onClick={generate}>
          New
        </Button>
      </div>
    </div>
  );
}