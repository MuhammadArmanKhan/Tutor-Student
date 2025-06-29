import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for individual tutors getting started',
      features: [
        'Up to 5 students',
        'Basic session recording',
        'Standard analytics',
        'Email support',
        '5GB storage',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: 79,
      description: 'Best for growing tutoring businesses',
      features: [
        'Up to 25 students',
        'HD session recording',
        'Advanced AI analytics',
        'Automated reports',
        'Priority support',
        '50GB storage',
        'Custom branding',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'For large educational institutions',
      features: [
        'Unlimited students',
        '4K session recording',
        'Premium AI insights',
        'White-label solution',
        'Dedicated support',
        'Unlimited storage',
        'Custom integrations',
        'SLA guarantee',
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-dark-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Simple, Transparent
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-500 to-accent-emerald bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. All plans include a 14-day free trial 
            with full access to features.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-primary-500/10 to-accent-emerald/10 border-primary-500/50 scale-105'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-primary-500 to-accent-emerald text-white px-4 py-2 rounded-full text-sm font-semibold">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary-500 to-accent-emerald text-white hover:shadow-2xl hover:shadow-primary-500/25'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Trial
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 text-gray-400 mb-4">
            <Zap className="h-5 w-5 text-primary-400" />
            <span>All plans include 14-day free trial • Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;