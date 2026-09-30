"use client";

import { useState } from "react";

const examples = [
  { name: "動画を楽しむ", amount: 1490 },
  { name: "音楽を聴く", amount: 980 },
  { name: "仕事を整える", amount: 1200 },
];
const monthlyTotal = examples.reduce((sum, item) => sum + item.amount, 0);
const yen = (value: number) => `¥${value.toLocaleString("ja-JP")}`;

/** A small, explicitly labelled example; no user financial data is collected. */
export function SubLogOverview({ iconSrc }: { iconSrc: string }) {
  const [yearly, setYearly] = useState(false);
  const multiplier = yearly ? 12 : 1;

  return (
    <section className="sublog-overview" aria-label="支払いの表示例">
      <div className="sublog-overview-top">
        <p><span lang="en">YOUR SUBSCRIPTIONS</span><span>3つのサブスクをまとめると</span></p>
        <div className="sublog-period" role="group" aria-label="表示する期間">
          <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>月額</button>
          <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>年額</button>
        </div>
      </div>
      <p className="sublog-total" aria-live="polite" aria-atomic="true">
        <strong>{yen(monthlyTotal * multiplier)}</strong><small> / {yearly ? "年" : "月"}</small>
      </p>
      <div className="sublog-demo-bars">
        {examples.map((item) => (
          <div className="sublog-demo-row" key={item.name}>
            <div><span>{item.name}</span><span>{yen(item.amount * multiplier)}</span></div>
            <div className="sublog-demo-track" aria-hidden="true"><i style={{ width: `${item.amount / monthlyTotal * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="sublog-demo-bottom">
        <p><span lang="en">LESS GUESSWORK.<br />MORE CLARITY.</span><small>表示例 · 金額はサンプルです。<br />年額は月額の12か月分で換算。</small></p>
        <div className="sublog-cube">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconSrc} width={128} height={128} alt="" />
        </div>
      </div>
    </section>
  );
}
