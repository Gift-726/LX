/**
 * Content Controller
 * Handles static content like Help Center and Privacy Policy
 */

/* ============================================================
   GET HELP CENTER
============================================================ */
const getHelpCenter = async (req, res) => {
    try {
        // This could be stored in database or as static content
        const helpCenter = {
            title: "Help Center",
            sections: [
                {
                    id: "shipping",
                    title: "Shipping & Delivery",
                    questions: [
                        {
                            question: "How long does shipping take?",
                            answer: "Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business days."
                        },
                        {
                            question: "What are the shipping costs?",
                            answer: "Shipping costs vary based on your location and the shipping method selected. Free shipping is available for orders over N50,000."
                        },
                        {
                            question: "How can I track my order?",
                            answer: "You can track your order from the 'My Orders' section in your profile. Click on any order to see detailed tracking information."
                        }
                    ]
                },
                {
                    id: "returns",
                    title: "Returns & Refunds",
                    questions: [
                        {
                            question: "What is your return policy?",
                            answer: "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in original packaging with tags attached."
                        },
                        {
                            question: "How do I return an item?",
                            answer: "Go to 'My Orders' in your profile, select the order, and click 'Return'. Follow the instructions to complete your return request."
                        },
                        {
                            question: "When will I receive my refund?",
                            answer: "Refunds are processed within 5-7 business days after we receive and inspect the returned item."
                        }
                    ]
                },
                {
                    id: "orders",
                    title: "Orders & Payments",
                    questions: [
                        {
                            question: "What payment methods do you accept?",
                            answer: "We accept credit/debit cards, bank transfers, and mobile money payments."
                        },
                        {
                            question: "Can I cancel my order?",
                            answer: "Orders can be cancelled within 24 hours of placement if they haven't been shipped yet. Go to 'My Orders' to cancel."
                        },
                        {
                            question: "How do I use a discount code?",
                            answer: "Enter your discount code at checkout in the 'Coupons' section. Valid codes will be automatically applied to your order."
                        }
                    ]
                },
                {
                    id: "account",
                    title: "Account & Profile",
                    questions: [
                        {
                            question: "How do I update my profile?",
                            answer: "Go to your profile page and click 'Edit Profile' to update your personal information, shipping address, and preferences."
                        },
                        {
                            question: "How do I change my password?",
                            answer: "Go to your profile settings and select 'Change Password'. You'll need to verify your current password first."
                        },
                        {
                            question: "How do I save my favorite items?",
                            answer: "Click the heart icon on any product to add it to your favorites. View all favorites in the 'My Favorite Stores' section."
                        }
                    ]
                },
                {
                    id: "disputes",
                    title: "Disputes & Issues",
                    questions: [
                        {
                            question: "What should I do if I didn't receive my order?",
                            answer: "Go to 'Disputes' in your profile and submit a dispute. Select 'Didn't receive the goods' and provide your order details."
                        },
                        {
                            question: "What if I received damaged goods?",
                            answer: "Submit a dispute with reason 'Damage/Bad goods' and include photos if possible. Our team will review and process a refund or replacement."
                        },
                        {
                            question: "How long does dispute resolution take?",
                            answer: "We aim to resolve disputes within 3-5 business days. You'll receive updates via email and in your account."
                        }
                    ]
                }
            ],
            contact: {
                email: "support@mcgeorge.com",
                phone: "+234 800 123 4567",
                hours: "Monday - Friday: 9:00 AM - 6:00 PM"
            }
        };

        res.json({
            success: true,
            helpCenter
        });

    } catch (error) {
        console.error("Get help center error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET PRIVACY POLICY
============================================================ */
const getPrivacyPolicy = async (req, res) => {
    try {
        const privacyPolicy = {
            title: "Privacy Policy",
            lastUpdated: "January 2025",
            sections: [
                {
                    title: "Introduction",
                    content: "At McGeorge LX, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our e-commerce platform."
                },
                {
                    title: "Information We Collect",
                    content: "We collect information that you provide directly to us, including:\n\n- Personal information (name, email, phone number, address)\n- Payment information (processed securely through our payment partners)\n- Account credentials\n- Order history and preferences\n- Communication preferences\n\nWe also automatically collect certain information when you use our services, such as device information, IP address, and browsing behavior."
                },
                {
                    title: "How We Use Your Information",
                    content: "We use the information we collect to:\n\n- Process and fulfill your orders\n- Communicate with you about your orders and account\n- Send you marketing communications (with your consent)\n- Improve our services and user experience\n- Prevent fraud and ensure security\n- Comply with legal obligations"
                },
                {
                    title: "Information Sharing",
                    content: "We do not sell your personal information. We may share your information with:\n\n- Service providers who assist in operating our platform (payment processors, shipping companies)\n- Legal authorities when required by law\n- Business partners with your explicit consent\n\nAll third parties are required to maintain the confidentiality of your information."
                },
                {
                    title: "Data Security",
                    content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments."
                },
                {
                    title: "Your Rights",
                    content: "You have the right to:\n\n- Access your personal information\n- Correct inaccurate information\n- Request deletion of your information\n- Opt-out of marketing communications\n- Withdraw consent for data processing\n- Request a copy of your data\n\nTo exercise these rights, contact us at privacy@mcgeorge.com"
                },
                {
                    title: "Cookies and Tracking",
                    content: "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content. You can control cookie preferences through your browser settings."
                },
                {
                    title: "Children's Privacy",
                    content: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children."
                },
                {
                    title: "Changes to This Policy",
                    content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the 'Last Updated' date."
                },
                {
                    title: "Contact Us",
                    content: "If you have questions about this Privacy Policy, please contact us at:\n\nEmail: privacy@mcgeorge.com\nAddress: McGeorge LX, Nigeria\nPhone: +234 800 123 4567"
                }
            ]
        };

        res.json({
            success: true,
            privacyPolicy
        });

    } catch (error) {
        console.error("Get privacy policy error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getHelpCenter,
    getPrivacyPolicy
};

