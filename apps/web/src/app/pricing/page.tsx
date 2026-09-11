'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import Head from 'next/head'; // For injecting global styles like keyframes and CSS vars

const inter = Inter({ subsets: ['latin'] });

// Define CSS variables and keyframes via a <style> tag in Head.
// This is the most practical way to adhere to "inline styles" (within the component file)
// and allow keyframe animations, global variables, and hover effects without external CSS files.
const GlobalStyles = () => (
    <Head>
        <style>{`
            :root {
                --color-dark-bg: #050508;
                --color-brand-blue: #3b82f6;
                --color-brand-purple: #8b5cf6;
                --color-accent-green: #10b981;
                --color-accent-orange: #f97316;
                --color-text-light: #e0e0e0;
                --color-text-muted: #a0a0a0;
                --color-card-bg: #0f0f12; /* Slightly lighter than main bg */
                --color-border-subtle: #222228;
                --gradient-bg: linear-gradient(90deg, var(--color-brand-blue) 0%, var(--color-brand-purple) 100%);
            }

            @keyframes gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Global hover styles for elements that need distinct hover effects
               but cannot be achieved with inline style properties directly. */
            .button-primary:hover {
                background-color: var(--color-brand-blue) !important;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
            }
            .button-secondary:hover {
                background-color: rgba(59, 130, 246, 0.1) !important;
                border-color: var(--color-brand-blue) !important;
                color: var(--color-brand-blue) !important;
                transform: translateY(-2px);
            }
            .button-accent:hover {
                background-color: #0e9f6e !important; /* Slightly darker green */
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
            }
            .pricing-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                border-color: var(--color-brand-blue);
            }
            .gradient-text {
                background: var(--gradient-bg);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                color: transparent; /* Fallback */
            }

            /* Responsive adjustments using raw media queries */
            @media (max-width: 1024px) {
                .pricing-grid {
                    flex-direction: column;
                    align-items: center;
                }
                .pricing-card {
                    max-width: 400px;
                    width: 90%;
                    margin-bottom: 2rem;
                }
                .pricing-section-title {
                    font-size: 2.5rem;
                }
                .hero-subtitle {
                    font-size: 1.2rem;
                }
            }

            @media (max-width: 768px) {
                .pricing-section-title {
                    font-size: 2rem;
                }
                .hero-subtitle {
                    font-size: 1.1rem;
                }
                .faq-question {
                    font-size: 1.1rem;
                    padding: 1.25rem;
                }
                .faq-answer-container {
                    padding: 0 1.25rem 1.25rem !important;
                }
                .bottom-banner h2 {
                    font-size: 1.8rem;
                }
                .bottom-banner p {
                    font-size: 1rem;
                }
                .bottom-banner button {
                    padding: 0.8rem 2rem;
                    font-size: 1.1rem;
                }
                .toggle-switch-container {
                    flex-direction: column;
                }
                .toggle-switch-label {
                    margin: 0.5rem 0;
                }
            }

            @media (max-width: 480px) {
                .pricing-section-title {
                    font-size: 1.8rem;
                }
                .bottom-banner h2 {
                    font-size: 1.5rem;
                }
                .pricing-card {
                    padding: 2rem 1.5rem;
                }
            }
        `}</style>
    </Head>
);

interface PricingTier {
    name: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    isFeatured?: boolean;
    priceSuffix?: string;
}

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

// ---------------------------------------------
// FAQItem Component
// ---------------------------------------------
const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
    return (
        <div
            style={{
                backgroundColor: 'var(--color-card-bg)',
                borderRadius: '0.75rem',
                border: '1px solid var(--color-border-subtle)',
                marginBottom: '1rem',
                overflow: 'hidden',
                transition: 'border-color 0.3s ease-in-out',
                ...(isOpen && { borderColor: 'var(--color-brand-blue)' }),
            }}
        >
            <button
                type="button"
                onClick={onClick}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '1.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-light)',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    textAlign: 'left',
                }}
                className="faq-question" // For media queries in GlobalStyles
            >
                {question}
                <span
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease-in-out',
                        display: 'block',
                        fontSize: '1.5rem',
                        lineHeight: '1',
                    }}
                >
                    &#x2B9F; {/* Unicode for down arrow */}
                </span>
            </button>
            <div
                style={{
                    maxHeight: isOpen ? '500px' : '0', // Arbitrary max-height for smooth transition
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease-in-out, padding 0.4s ease-in-out',
                    padding: isOpen ? '0 1.5rem 1.5rem' : '0 1.5rem',
                }}
                className="faq-answer-container" // For media queries in GlobalStyles
            >
                <p
                    style={{
                        color: 'var(--color-text-muted)',
                        lineHeight: '1.6',
                        fontSize: '1rem',
                    }}
                >
                    {answer}
                </p>
            </div>
        </div>
    );
};

// ---------------------------------------------
// PricingCard Component
// ---------------------------------------------
const PricingCard: React.FC<{ tier: PricingTier; isAnnual: boolean }> = ({ tier, isAnnual }) => {
    const isEnterprise = tier.name === 'Enterprise';

    const buttonBaseStyles = {
        padding: '1.25rem 1.5rem',
        borderRadius: '0.75rem',
        fontSize: '1.125rem',
        cursor: 'pointer',
        display: 'block',
        width: '100%',
    };

    const buttonStyles = {
        primary: {
            ...buttonBaseStyles,
            backgroundColor: 'var(--color-brand-blue)',
            color: 'white',
            border: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease-in-out',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
        },
        secondary: {
            ...buttonBaseStyles,
            backgroundColor: 'transparent',
            color: 'var(--color-brand-blue)',
            border: '1px solid var(--color-brand-blue)',
            fontWeight: '600',
            transition: 'all 0.3s ease-in-out',
        },
        accent: {
            ...buttonBaseStyles,
            backgroundColor: 'var(--color-accent-green)',
            color: 'white',
            border: 'none',
            fontWeight: '700',
            transition: 'all 0.3s ease-in-out',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
        }
    };

    const currentButtonType = tier.isFeatured ? 'accent' : (isEnterprise ? 'secondary' : 'primary');
    const currentButtonClass = tier.isFeatured ? 'button-accent' : (isEnterprise ? 'button-secondary' : 'button-primary');

    return (
        <div
            style={{
                backgroundColor: 'var(--color-card-bg)',
                borderRadius: '1rem',
                padding: '2.5rem',
                border: tier.isFeatured ? '2px solid var(--color-brand-blue)' : '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
                maxWidth: '380px', // Max width for desktop
                minWidth: '280px',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
            }}
            className="pricing-card" // For global hover effect
        >
            {tier.isFeatured && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--color-brand-blue)',
                        color: 'white',
                        padding: '0.25rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.5)',
                    }}
                >
                    Most Popular
                </div>
            )}
            <h3
                style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: 'var(--color-text-light)',
                    marginBottom: '0.75rem',
                }}
            >
                {tier.name}
            </h3>
            <p
                style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '1rem',
                    marginBottom: '1.5rem',
                    minHeight: '48px', // Ensure consistent height for description
                }}
            >
                {tier.description}
            </p>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    marginBottom: '1.5rem',
                }}
            >
                {isEnterprise ? (
                    <span
                        style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: 'var(--color-text-light)',
                        }}
                    >
                        {tier.price}
                    </span>
                ) : (
                    <>
                        <span
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--color-text-muted)',
                                marginRight: '0.25rem',
                            }}
                        >
                            $
                        </span>
                        <span
                            style={{
                                fontSize: '3.5rem',
                                fontWeight: '800',
                                color: 'var(--color-text-light)',
                                lineHeight: '1',
                            }}
                        >
                            {tier.price === 'Free' ? 'Free' : (isAnnual ? (parseInt(tier.price) * 0.8).toFixed(0) : tier.price)}
                        </span>
                        {tier.price !== 'Free' && (
                            <span
                                style={{
                                    fontSize: '1.125rem',
                                    color: 'var(--color-text-muted)',
                                    marginLeft: '0.5rem',
                                }}
                            >
                                {isAnnual ? '/yr' : tier.priceSuffix}
                            </span>
                        )}
                    </>
                )}
            </div>

            <ul
                style={{
                    flexGrow: '1',
                    marginBottom: '2rem',
                    listStyle: 'none',
                    padding: '0',
                    margin: '0',
                }}
            >
                {tier.features.map((feature, index) => (
                    <li
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: '1rem',
                            color: 'var(--color-text-light)',
                            fontSize: '1rem',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--color-accent-green)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginRight: '0.75rem', minWidth: '20px', minHeight: '20px' }}
                        >
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>

            <Link href={isEnterprise ? "/contact" : "/signup"} passHref>
                <button
                    style={buttonStyles[currentButtonType]}
                    className={currentButtonClass} // For global hover effect
                >
                    {tier.buttonText}
                </button>
            </Link>
        </div>
    );
};


// ---------------------------------------------
// Main Pricing Page Component
// ---------------------------------------------
const PricingPage: React.FC = () => {
    const [isAnnual, setIsAnnual] = useState(false);
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const tiers: PricingTier[] = [
        {
            name: 'Starter',
            price: 'Free',
            description: 'Essential tools to kickstart your business.',
            features: [
                '1 Location Included',
                'Basic POS System',
                'Up to 100 Orders/Month',
                'Standard Analytics',
                '24/7 Email Support',
            ],
            buttonText: 'Get Started for Free',
            priceSuffix: '/mo'
        },
        {
            name: 'Growth',
            price: '49',
            description: 'Scale your operations with advanced features.',
            features: [
                'Up to 3 Locations',
                'Online Ordering & Delivery Mgmt.',
                'Customer Loyalty Programs',
                'Payroll for up to 10 Employees',
                'Advanced Reporting',
                'Dedicated Account Manager',
            ],
            buttonText: 'Start 30-Day Free Trial',
            isFeatured: true,
            priceSuffix: '/mo'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'Tailored solutions for large-scale businesses.',
            features: [
                'Unlimited Locations',
                'Full White-Labeling',
                'Dedicated Priority Support',
                'API Access & Integrations',
                'Custom Feature Development',
                'On-site Training & Setup',
            ],
            buttonText: 'Contact Sales',
            priceSuffix: ''
        },
    ];

    const faqs = [
        {
            question: 'What payment methods does PaySurity accept?',
            answer: 'PaySurity supports all major credit and debit cards, including Visa, Mastercard, American Express, and Discover. We also facilitate mobile payments like Apple Pay and Google Pay, and offer ACH processing for bank transfers.'
        },
        {
            question: 'Is there a contract required for PaySurity services?',
            answer: 'No, we believe in flexibility. Our Starter and Growth plans are month-to-month, allowing you to cancel anytime. Enterprise plans are tailored and may involve a custom agreement based on specific needs.'
        },
        {
            question: 'How do I upgrade or downgrade my plan?',
            answer: 'You can easily upgrade or downgrade your plan anytime through your PaySurity dashboard. Changes will be prorated and reflected in your next billing cycle.'
        },
        {
            question: 'What kind of support is available?',
            answer: 'All plans include 24/7 email support. Growth plans also get a dedicated account manager, and Enterprise plans receive priority support with additional options like on-site assistance.'
        },
        {
            question: 'Can I customize my POS system?',
            answer: 'Yes, PaySurity offers highly customizable POS systems. From inventory management to menu layouts, you can tailor your POS to fit your specific business needs. Enterprise plans include full white-labeling and custom feature development.'
        },
        {
            question: 'Is my data secure with PaySurity?',
            answer: 'Absolutely. PaySurity employs industry-leading security measures, including end-to-end encryption, PCI DSS compliance, and fraud protection tools, to ensure your business and customer data is always secure.'
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div
            className={inter.className}
            style={{
                backgroundColor: 'var(--color-dark-bg)',
                minHeight: '100vh',
                color: 'var(--color-text-light)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <GlobalStyles />

            <main
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    padding: '4rem 1.5rem',
                    flexGrow: '1',
                }}
            >
                <section
                    style={{
                        textAlign: 'center',
                        marginBottom: '4rem',
                    }}
                >
                    <h1
                        style={{
                            fontSize: '3.5rem',
                            fontWeight: '800',
                            marginBottom: '1rem',
                            lineHeight: '1.2',
                        }}
                        className="pricing-section-title"
                    >
                        Simple, Transparent <span className="gradient-text">Pricing</span>
                    </h1>
                    <p
                        style={{
                            fontSize: '1.3rem',
                            color: 'var(--color-text-muted)',
                            maxWidth: '700px',
                            margin: '0 auto',
                            lineHeight: '1.6',
                        }}
                        className="hero-subtitle"
                    >
                        Choose the perfect plan for your business. No hidden fees, just powerful tools to help you succeed.
                    </p>
                </section>

                <section
                    style={{
                        marginBottom: '6rem',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '3rem',
                        }}
                        className="toggle-switch-container"
                    >
                        <span
                            style={{
                                marginRight: '1rem',
                                color: isAnnual ? 'var(--color-text-muted)' : 'var(--color-text-light)',
                                fontWeight: '600',
                                transition: 'color 0.3s ease',
                            }}
                            className="toggle-switch-label"
                        >
                            Monthly
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsAnnual(!isAnnual)}
                            style={{
                                width: '6rem',
                                height: '2.5rem',
                                borderRadius: '9999px',
                                backgroundColor: isAnnual ? 'var(--color-brand-blue)' : 'var(--color-border-subtle)',
                                position: 'relative',
                                cursor: 'pointer',
                                border: 'none',
                                transition: 'background-color 0.3s ease',
                                flexShrink: 0,
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    left: isAnnual ? 'calc(100% - 2.25rem)' : '0.25rem',
                                    top: '0.25rem',
                                    width: '2rem',
                                    height: '2rem',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    transition: 'left 0.3s ease',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                }}
                            ></span>
                        </button>
                        <span
                            style={{
                                marginLeft: '1rem',
                                color: isAnnual ? 'var(--color-text-light)' : 'var(--color-text-muted)',
                                fontWeight: '600',
                                transition: 'color 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            className="toggle-switch-label"
                        >
                            Annual
                            <span
                                style={{
                                    backgroundColor: 'var(--color-accent-orange)',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    marginLeft: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                20% Off
                            </span>
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '2rem',
                            justifyContent: 'center',
                            alignItems: 'stretch',
                            flexWrap: 'wrap',
                        }}
                        className="pricing-grid"
                    >
                        {tiers.map((tier) => (
                            <PricingCard key={tier.name} tier={tier} isAnnual={isAnnual} />
                        ))}
                    </div>
                </section>

                <section
                    style={{
                        marginBottom: '6rem',
                        maxWidth: '800px',
                        margin: '0 auto 6rem auto',
                    }}
                >
                    <h2
                        style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            textAlign: 'center',
                            marginBottom: '3rem',
                            color: 'var(--color-text-light)',
                        }}
                        className="pricing-section-title"
                    >
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h2>
                    <div>
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openFAQ === index}
                                onClick={() => toggleFAQ(index)}
                            />
                        ))}
                    </div>
                </section>
            </main>

            <section
                style={{
                    backgroundColor: 'var(--color-card-bg)',
                    width: '100%',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    borderTop: '1px solid var(--color-border-subtle)',
                }}
                className="bottom-banner"
            >
                <h2
                    style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: 'var(--color-text-light)',
                        marginBottom: '1rem',
                        lineHeight: '1.2',
                    }}
                >
                    Ready to Transform Your Business?
                </h2>
                <p
                    style={{
                        fontSize: '1.25rem',
                        color: 'var(--color-text-muted)',
                        maxWidth: '700px',
                        margin: '0 auto 2rem auto',
                    }}
                >
                    Start your 30-day free trial today and experience the complete payment and business platform.
                </p>
                <Link href="/signup" passHref>
                    <button
                        style={{
                            padding: '1rem 2.5rem',
                            borderRadius: '0.75rem',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            backgroundColor: 'var(--color-accent-green)',
                            color: 'white',
                            border: 'none',
                            transition: 'all 0.3s ease-in-out',
                            boxShadow: '0 5px 20px rgba(16, 185, 129, 0.4)',
                            display: 'inline-block',
                        }}
                        className="button-accent"
                    >
                        Start Your Free Trial Now
                    </button>
                </Link>
            </section>
        </div>
    );
};


export default PricingPage;