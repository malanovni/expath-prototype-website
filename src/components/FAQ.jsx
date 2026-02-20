import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const FAQItem = ({ question, answer, isOpen, toggle }) => (
    <div className="faq-item">
        <button className="faq-question" onClick={toggle}>
            <span className="faq-q-text">{question}</span>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
);

const FAQ = ({ data, t }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    // Generate FAQ Schema for AI Discovery
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <div className="faq-section">
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            </Helmet>

            <div className="faq-header">
                <HelpCircle size={24} className="faq-icon" />
                <h2>{t("faq_title") || "Frequently Asked Questions"}</h2>
            </div>

            <p className="faq-intro">
                {t("faq_intro") || "Find quick answers about transport, tickets, and visiting Valencia."}
            </p>

            <div className="faq-list">
                {data.map((item, idx) => (
                    <FAQItem
                        key={idx}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openIndex === idx}
                        toggle={() => toggle(idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default FAQ;
