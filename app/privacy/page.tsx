import Link from "next/link";

export default function PrivacyPage() {
  return <main className="policy-page"><Link className="policy-back" href="/">← Back to POC</Link><p className="eyebrow">Privacy</p><h1>Privacy policy</h1><p className="policy-lead">This page is reserved for the final privacy notice and will be completed with the legal identity, processing purposes, retention periods and contact details of the operating business before launch.</p><section><h2>What will be covered</h2><ul><li>Who controls the information submitted through the request form.</li><li>Which data is collected and why it is needed.</li><li>How long information is kept and who may process it.</li><li>How to exercise access, correction, deletion and other applicable rights.</li></ul></section></main>;
}
