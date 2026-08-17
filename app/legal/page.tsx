import Link from "next/link";

export default function LegalPage() {
  return <main className="policy-page"><Link className="policy-back" href="/">← Back to POC</Link><p className="eyebrow">Legal notice</p><h1>Legal information</h1><p className="policy-lead">This page is reserved for the final legal notice and will be completed with the company, publication director and hosting details before launch.</p><section><h2>What will be covered</h2><ul><li>Legal name, legal form, registered address and registration details.</li><li>Publication director and responsible contact.</li><li>Hosting provider and technical contact.</li><li>Applicable terms for any confirmed service engagement.</li></ul></section></main>;
}
