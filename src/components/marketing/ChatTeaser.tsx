// ABOUTME: Embedded chat teaser section on homepage
// ABOUTME: Invites users to ask questions, opens the chat widget

'use client';

import React from 'react';

interface ChatTeaserProps {
  onOpenChat: () => void;
}

const ChatTeaser: React.FC<ChatTeaserProps> = ({ onOpenChat }) => {
  const sampleQuestions = [
    'How does SuprFi work for contractors?',
    'What makes your agent technology different?',
    'How can I get early access?',
  ];

  return (
    <section className="py-16 bg-light-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Left side */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
                  <img src="/logos/suprfi-s-icon.svg" alt="" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-navy font-display">
                  Have questions?
                </h3>
              </div>
              <p className="text-medium-gray mb-4">
                Our AI assistant can answer questions about SuprFi, how the platform works, 
                and how to get early access.
              </p>
              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal text-white font-medium rounded-lg hover:bg-teal/90 transition-colors"
              >
                Start a conversation
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Right side - sample questions */}
            <div className="md:w-64">
              <p className="text-xs text-medium-gray uppercase tracking-wide mb-2">Try asking:</p>
              <div className="space-y-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={onOpenChat}
                    className="block w-full text-left text-sm text-navy hover:text-teal transition-colors py-1.5 px-3 rounded-lg hover:bg-teal/5"
                  >
                    "{question}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatTeaser;
