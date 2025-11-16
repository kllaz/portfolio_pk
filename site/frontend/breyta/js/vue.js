const ReportSlider = {
    name: 'ReportSlider',
    template: '#report-slider',
    data() {
        return{
            activeIndex: 0,
            tabs:[
                {
                    id: 'report-1',
                    title: 'TaskFlow AI: User feedback analysis for product iteration',
                    dateInfoCur: 'Aug 7, 2025, 10:01 AM',
                    dateInfoNext: 'Aug 15, 2025, 09:00 AM',
                    insightSubtitle: 'Key Insights',
                    analyzed: '156 support tickets, 19 user interviews, 24 sales calls, 44cs calls',
                    insights: [
                        {
                            insight: 'Onboarding Drop-off at 43% (Critical)',
                            insightInfo: 'Users abandon setup during team invitation step. 68% report confusion about workspace permissions and role assignments. Potential 25% activation improvement if simplified.'
                        },
                        {
                            insight: 'AI Assistant Feature Drives Retention',
                            insightInfo: 'Users who engage with AI task suggestions within first week show 3.2x higher retention. Current adoption at 34% with low visibility as key barrier.'
                        },
                        {
                            insight: 'Integration Requests Signal Growth Opportunity',
                            insightInfo: '52% of Pro users request Slack/Teams integrations. High user demand with current workaround solutions proving ineffective for workflow needs.'
                        },
                        {
                            insight: 'Pricing Tier Validation: Enterprise Gap Identified',
                            insightInfo: 'Mid-market customers (50-200 users) find Pro plan limiting but Enterprise too expensive. Market gap represents 31% potential revenue increase.'
                        }
                    ],
                    changes: [
                        {
                            change: 'Positive mentions up',
                            changeInfo: 'Positive sentiment increased by 12% week-over-week, with more praise for ease-of-use and setup speed.'
                        },
                        {
                            change: 'Onboarding friction down',
                            changeInfo: 'Fewer mentions of first-time configuration issues; help docs and guided flows appear to be working.'
                        },
                        {
                            change: 'Pricing questions slightly up',
                            changeInfo: 'A mild rise in inquiries about annual discounts and invoicing options — not negatively framed, mostly clarification.'
                        },
                        {
                            change: 'New theme: localization',
                            changeInfo: 'Several accounts asked about language coverage and RTL support — consider adding to roadmap comms.'
                        },
                        {
                            change: 'No churn-risk signals',
                            changeInfo: 'No escalation or cancellation language detected; overall tone remains constructive and forward-looking.'
                        }
                    ]
                },
                {
                    id: 'report-2',
                    title: 'How is our revenue and business performance trending?',
                    dateInfoCur: 'Sep 1, 2025, 8:01 AM',
                    dateInfoNext: 'Oct 1, 2025, 8:00 AM',
                    updatesSubtitle: 'Updates',
                    analyzed: '156 files',
                    updates: [
                        {
                            update: 'Combined Ratio Improvement',
                            updateInfo: `September combined ratio improved to 71.4% from August's 74.8%, driven primarily by 23% reduction in weather-related property claims and enhanced underwriting protocols`,
                        },
                        {
                            update: 'Premium Revenue Growth Sustained',
                            updateInfo: `Total premium revenue of NOK 12,458,739 represents 3.2% month-over-month growth, with commercial policies showing strongest performance at 15% increase.`,
                        },
                        {
                            update: 'Customer Experience Metrics Strengthened',
                            updateInfo: `NPS improved from 68 to 73, while policy renewal rate maintained at 94.2%. Claims settlement time reduced to 4.2 days following digital process enhancements.`,
                        },
                        {
                            update: 'Capital Position Remains Strong',
                            updateInfo: `Solvency II ratio at 186% provides comfortable buffer above regulatory requirements. Investment portfolio outperformed benchmark by 0.4% this month.`,
                        },
                    ],
                    changes: [
                        {
                            change: 'Combined ratio improvement',
                            changeInfo: `September combined ratio improved to 71.4% from August's 74.8%, driven by 23% reduction in weather-related claims and enhanced underwriting protocols`
                        },
                        {
                            change: 'Premium revenue growth sustained',
                            changeInfo: 'Total premium revenue increased 3.2% month-over-month to NOK 12,458,739, with commercial lines showing strongest performance at 15% growth'
                        },
                        {
                            change: 'Weather impact favorable',
                            changeInfo: 'Mild September conditions (2.3°C above average, minimal precipitation) resulted in significantly fewer property and storm-related claims than seasonal norms.'
                        },
                        {
                            change: 'Customer satisfaction trending up',
                            changeInfo: 'NPS improved from 68 to 73, with particular gains in claims experience (+8 points) following digital transformation initiatives and faster settlement times.'
                        },
                        {
                            change: 'Investment performance strong',
                            changeInfo: 'Portfolio generated 2.8% return, outperforming benchmark by 0.4%, with gains from renewable energy and technology equity positions offsetting stable bond income.'
                        },
                        {
                            change: 'Capital position strengthened',
                            changeInfo: 'Solvency II ratio increased 4 points to 186%, providing comfortable buffer above targets while maintaining dividend capacity and supporting growth initiatives.'
                        }
                    ]
                },
                {
                    id: 'report-3',
                    title: 'How can I improve my sales conversations?',
                    dateInfoCur: 'Aug 7, 2025, 9:01 AM',
                    dateInfoNext: 'Aug 14, 2025, 09:00 AM',
                    updatesSubtitle: 'Updates',
                    analyzed: '67 files',
                    updates: [
                        {
                            update: 'Discovery Questions Gap Identified',
                            updateInfo: `Only 35% of calls include pain point qualification. Open-ended questions early in conversations correlate with higher close rates.`
                        },
                        {
                            update: 'Strong Demo Performance',
                            updateInfo: `Product demonstrations consistently generate positive responses and advance deals to next stage with 78% progression rate.`
                        },
                        {
                            update: 'Follow-up Timing Critical',
                            updateInfo: `Deals with 24-48 hour follow-up have 3x higher close rates than those with delayed responses beyond 72 hours.`
                        },
                        {
                            update: 'Price Objection Handling Gap',
                            updateInfo: `Price objections often go unaddressed in 67% of calls. Value-based selling approach shows stronger conversion in successful calls.`
                        },
                    ],
                    changes: [
                        {
                            change: 'Discovery question frequency declining',
                            changeInfo: `Only 35% of recorded calls included adequate pain point qualification, down from 42% last week. Focus needed on early-stage conversation techniques.`
                        },
                        {
                            change: 'Demo-to-close conversion improving',
                            changeInfo: `Product demonstrations showed 68% advancement to next stage, up from 61% previous period, indicating strong product-market fit messaging.`
                        },
                        {
                            change: 'Follow-up timing correlation identified',
                            changeInfo: `Deals with 24-48 hour follow-up showed 3x higher close rates, revealing critical timing window for maintaining momentum.`
                        },
                        {
                            change: 'Price objection handling gaps',
                            changeInfo: `Unaddressed price concerns increased 18% week-over-week, suggesting need for value-based selling training and better objection response frameworks.`
                        },
                        {
                            change: 'Pipeline velocity accelerating',
                            changeInfo: `Average deal cycle decreased from 32 to 28 days, driven by improved qualification and faster decision-maker identification.`
                        },
                        {
                            change: 'Competitive win rate stable',
                            changeInfo: `Won 73% of deals where competitors were present, maintaining strong position through superior discovery and relationship building.`
                        },
                    ]
                },
            ],
        };
    },

    computed: {
        currentReport() {
            return this.tabs[this.activeIndex];
        }
    }
};

const FlowSlider = {
    name: 'FlowSlider',
    template: '#flow-slider',
    data() {
        return{
            activeIndex: 0,
            tabs: [
                {
                    id: 'slide-1',
                    slideId: '1',
                    title: 'Add context',
                    caption: 'Tell the agent what matters — your questions, goals, or the outcome you are looking for.'
                },
                {
                    id: 'slide-2',
                    slideId: '2',
                    title: 'Choose cadence',
                    caption: 'Decide when you want it — daily, weekly, or monthly.'
                },
                {
                    id: 'slide-3',
                    slideId: '3',
                    title: 'Select data sources',
                    caption: 'Pick where the agent should look — OneDrive folders, BCC emails, CRM, tickets, docs, and more.'
                },
                {
                    id: 'slide-4',
                    slideId: '4',
                    title: 'Add subscribers',
                    caption: 'Choose who should receive the output — from teammates to execs.'
                },
                {
                    id: 'slide-5',
                    slideId: '5',
                    title: 'Select format',
                    caption: 'Decide how you want clarity delivered — report, brief, memo, or other outputs.'
                },
                {
                    id: 'slide-6',
                    slideId: '6',
                    title: 'Get your report',
                    caption: 'The agent analyzes your data sources and delivers actionable insights in your chosen format.'
                }
            ],
        };
    },
    methods: {
        next() {
            this.activeIndex = (this.activeIndex + 1) % this.tabs.length;
        }
    },
    computed: {
        currentSlide() {
            return this.tabs[this.activeIndex];
        }
    }
}

/*


{
    id: '',
    title: '',
    caption: ''
},

const ReportSlider = {
    name: 'ReportSlider',
    template: '#report-slider',
    data() {
        return{





computed: {
    currentSlide() {
        return this.tabs[this.activeIndex];
    }
}






{
    id: '',
    title: '',
    dateInfoCur: '',
    dateInfoNext: '',
    analyzed: '',
    updates: [
        {
            updates: '',
            updateInfo: ''
        }
    ],
    changes: [
        {
            change: '',
            changeInfo: ''
        }
    ]
},
*/