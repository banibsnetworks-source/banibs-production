import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Shield, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * WelcomePage - Post-registration onboarding screen
 * Introduces users to the Circles concept and relationship tiers
 */
const WelcomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles size={48} className="text-yellow-400" />,
      title: "Welcome to BANIBS!",
      description: "You're now part of a powerful community built for Black and Indigenous peoples to connect, grow, and thrive together.",
      highlight: "Your journey starts here"
    },
    {
      icon: <Users size={48} className="text-blue-400" />,
      title: "Introducing: Circles",
      description: "Circles are the heart of BANIBS. They help you organize your connections and control who sees what you share.",
      highlight: "Organize your relationships"
    },
    {
      icon: <Shield size={48} className="text-amber-400" />,
      title: "🔐 How Access Works in BANIBS",
      subtitle: "BANIBS is built to protect your peace, your privacy, and your inner circle.",
      tiers: [
        {
          name: "Others",
          emoji: "🌐",
          color: "text-gray-400",
          description: "Put people you just met, coworkers, supervisors, business contacts, neighbors, or acquaintances.",
          access: "They get the least access to your personal world."
        },
        {
          name: "Alright",
          emoji: "🤝",
          color: "text-green-400",
          description: "People you somewhat know or trust.",
          access: "They get limited access."
        },
        {
          name: "Cool",
          emoji: "😎",
          color: "text-blue-400",
          description: "People you know well.",
          access: "They get more visibility and connection."
        },
        {
          name: "Peoples",
          emoji: "👥",
          color: "text-pink-400",
          description: "Your inner circle — family, closest friends, and those you fully trust.",
          access: "They get the highest access."
        }
      ],
      description: "You control who's in each circle, and you can change it anytime.",
      highlight: "Your privacy, your way",
      principle: "✨ Principle: Protect your inner circle. Move people upward only when time, trust, and behavior prove it's right."
    },
    {
      icon: <Shield size={48} className="text-green-400" />,
      title: "You're In Control",
      description: "When you share a post, photo, or update, you choose which circles can see it. This gives you the power to be authentic while keeping your privacy intact.",
      highlight: "Share confidently",
      features: [
        "Control who sees your content",
        "Add people to circles as you connect",
        "Change privacy settings anytime",
        "Block or remove anyone instantly"
      ]
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete and redirect to social portal
      localStorage.removeItem('show_onboarding');
      localStorage.setItem('onboarding_completed', 'true');
      window.location.href = '/portal/social/home';
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('show_onboarding');
    window.location.href = '/portal/social/home';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-12 bg-yellow-400'
                  : index < currentStep
                  ? 'w-8 bg-blue-600'
                  : 'w-8 bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="card-v2 card-v2-lg shadow-xl-v2 overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              {currentStepData.icon}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              {currentStepData.title}
            </h1>

            {/* Highlight Badge */}
            {currentStepData.highlight && (
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-medium">
                  <Sparkles size={16} />
                  {currentStepData.highlight}
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-lg text-gray-300 text-center mb-8 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Tiers (for step 2) */}
            {currentStepData.tiers && (
              <div className="space-y-4 mb-8">
                {currentStepData.tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{tier.emoji}</span>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${tier.color} mb-1`}>
                          {tier.name}
                        </h3>
                        <p className="text-sm text-gray-400">{tier.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Features (for final step) */}
            {currentStepData.features && (
              <div className="space-y-3 mb-8">
                {currentStepData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSkip}
                className="btn-v2 btn-v2-secondary btn-v2-lg flex-1"
              >
                Skip for now
              </button>
              <button
                onClick={handleNext}
                className="btn-v2 btn-v2-primary btn-v2-lg flex-1 flex items-center justify-center gap-2"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Get Started
                    <CheckCircle size={20} />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
