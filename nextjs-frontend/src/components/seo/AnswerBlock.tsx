import { faqLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

interface AnswerBlockProps {
  /** Visible section heading, e.g. "Off-Market Properties in Dallas". */
  heading: string;
  items: { question: string; answer: string }[];
}

/**
 * Server-rendered Q&A block, paired 1:1 with a FAQPage schema.
 *
 * The visible <dl> and the JSON-LD are built from the SAME array, so the
 * markup an AI/search crawler can lift from the page always matches the
 * schema — a mismatch between visible text and structured data is a common
 * reason AI Overview / rich-result eligibility gets rejected.
 */
export default function AnswerBlock({ heading, items }: AnswerBlockProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="answer-block-heading" className="space-y-4">
      <JsonLd data={faqLd(items)} />
      <h2 id="answer-block-heading" className="text-xl font-bold text-[#0A2647] font-heading">
        {heading}
      </h2>
      <dl className="space-y-4">
        {items.map((item) => (
          <div key={item.question} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <dt className="font-semibold text-[#0A2647] text-sm sm:text-base">{item.question}</dt>
            <dd className="mt-1.5 text-slate-600 text-sm leading-relaxed">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
