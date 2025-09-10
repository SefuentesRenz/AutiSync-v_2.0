import React from 'react';

const MotivationTips = () => {
  const motivationStrategies = [
    {
      category: "Celebrating Success",
      icon: "🎉",
      tips: [
        {
          title: "Badge Celebrations",
          description: "When your child earns a badge, celebrate together! Create a special 'badge ceremony' at home.",
          example: "Create a badge wall or scrapbook where you display their digital achievements."
        },
        {
          title: "Progress Parties",
          description: "Celebrate completing difficulty levels or categories with small rewards or special activities.",
          example: "After completing all Easy level activities, have a pizza night or movie evening."
        },
        {
          title: "Share Achievements",
          description: "Share their accomplishments with family members, friends, or teachers.",
          example: "Send a photo of their progress to grandparents or create a weekly achievement report."
        }
      ]
    },
    {
      category: "Building Motivation",
      icon: "🚀",
      tips: [
        {
          title: "Set Learning Goals Together",
          description: "Work with your child to set achievable short-term and long-term learning goals.",
          example: "This week, let's complete 3 Numbers activities and try 1 new Daily Life skill."
        },
        {
          title: "Create Learning Routines",
          description: "Establish consistent times for AutiSync activities to build healthy learning habits.",
          example: "Every day after snack time, we spend 15-20 minutes on AutiSync activities."
        },
        {
          title: "Connect to Real Life",
          description: "Show how the skills learned in the app apply to daily activities.",
          example: "After learning about numbers, count items during grocery shopping together."
        }
      ]
    },
    {
      category: "Supporting Emotional Well-being",
      icon: "💝",
      tips: [
        {
          title: "Acknowledge Feelings",
          description: "Use the emotion tracking to discuss how they felt during activities and validate their experiences.",
          example: "I see you felt happy during the color activity! What made it fun for you?"
        },
        {
          title: "Encourage Expression",
          description: "Help your child articulate their emotions and experiences during learning activities.",
          example: "How did that activity make you feel? It's okay if it was challenging - that means you're growing!"
        },
        {
          title: "Create Safe Spaces",
          description: "Ensure they know it's okay to make mistakes and that learning is a process.",
          example: "Everyone makes mistakes when learning. Let's try again together!"
        }
      ]
    },
   
    {
      category: "Overcoming Challenges",
      icon: "💪",
      tips: [
        {
          title: "Break Down Difficulties",
          description: "If an activity seems too challenging, help them approach it step by step.",
          example: "This seems tricky! Let's look at it piece by piece. What do we see first?"
        },
        {
          title: "Encourage Persistence",
          description: "Praise effort and persistence rather than just correct answers.",
          example: "I love how you kept trying even when it was hard! That shows real determination."
        },
        {
          title: "Adjust Expectations",
          description: "Remember that progress looks different for every child. Focus on their individual growth.",
          example: "You're doing so much better than last week! Look how much you've learned!"
        }
      ]
    },
    
  ];

  const quickTips = [
    {
      tip: "Keep sessions short and positive",
      icon: "⏰",
      description: "15-20 minutes is often the sweet spot for maintaining attention and enjoyment."
    },
    {
      tip: "Follow their interests",
      icon: "❤️", 
      description: "If they love animals, start with identification activities featuring animals."
    },
    {
      tip: "Be patient with progress",
      icon: "🐌",
      description: "Every child learns at their own pace. Celebrate small victories along the way."
    },
    {
      tip: "Use positive reinforcement",
      icon: "👏",
      description: "Focus on what they did well rather than what they got wrong."
    },
    {
      tip: "Create learning environments",
      icon: "🏠",
      description: "Set up a comfortable, distraction-free space for AutiSync activities."
    },
    {
      tip: "Stay consistent",
      icon: "📅",
      description: "Regular practice, even for short periods, is more effective than long irregular sessions."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
          <span className="text-4xl mr-3">💡</span>
          Motivation & Support Tips
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Practical strategies to help motivate your child and make their AutiSync learning journey even more rewarding
        </p>
      </div>

      {/* Quick Tips Section */}
      <div className="bg-gradient-to-br from-blue-100 to-violet-100 rounded-2xl p-6 border border-violet-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">⚡</span>
          Quick Tips for Success
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTips.map((tip, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{tip.icon}</span>
                <h4 className="font-semibold text-gray-800 text-sm">{tip.tip}</h4>
              </div>
              <p className="text-xs text-gray-600">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Strategies */}
      <div className="space-y-6">
        {motivationStrategies.map((strategy, strategyIndex) => (
          <div key={strategyIndex} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">{strategy.icon}</span>
              {strategy.category}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategy.tips.map((tip, tipIndex) => (
                <div key={tipIndex} className="bg-gradient-to-br from-gray-50 to-violet-50 rounded-xl p-5 border border-violet-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-lg">{tip.title}</h4>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">{tip.description}</p>
                  
                  <div className="bg-white/70 rounded-lg p-3 border-l-4 border-violet-400">
                    <div className="text-xs font-medium text-gray-700 mb-1">Example:</div>
                    <p className="text-xs text-gray-600 italic">"{tip.example}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Age-Specific Considerations */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">👶</span>
          Age-Specific Considerations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🌱</span>
              Ages 5-8
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Focus on visual learning and simple instructions</li>
              <li>• Use lots of praise and positive reinforcement</li>
              <li>• Keep sessions short (10-15 minutes)</li>
              <li>• Make learning feel like play</li>
              <li>• Use concrete, hands-on examples</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-violet-100 rounded-xl p-5 border border-violet-200">
            <h4 className="font-semibold text-violet-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🌳</span>
              Ages 9-12
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Introduce more complex problem-solving</li>
              <li>• Allow more independence in choosing activities</li>
              <li>• Connect learning to real-world applications</li>
              <li>• Encourage self-reflection on progress</li>
              <li>• Sessions can be 15-25 minutes</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🌟</span>
              Ages 13+
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Focus on independence and life skills</li>
              <li>• Involve them in goal-setting</li>
              <li>• Discuss practical applications</li>
              <li>• Support self-advocacy and expression</li>
              <li>• Flexible session lengths based on interest</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Warning Signs & When to Adjust */}
      <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-6 border border-red-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">⚠️</span>
          When to Adjust Your Approach
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Watch for these signs:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                Consistent frustration or meltdowns during activities
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                Avoiding or refusing to engage with the app
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                Consistently reporting negative emotions
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                No progress after several weeks of regular practice
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                Regression in previously mastered skills
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Adjustment strategies:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                Take a break and return to easier difficulty levels
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                Reduce session length or frequency
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                Try different categories that match their interests
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                Provide more support and work together
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                Consult with teachers or therapists for guidance
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Stories Inspiration */}
      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 border border-yellow-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">🌟</span>
          Remember: Every Child's Journey is Unique
        </h3>
        
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-yellow-300">
          <p className="text-lg text-gray-700 italic mb-4">
            "Progress isn't always linear, and that's perfectly okay. Some days will be better than others, and that's part of the learning process."
          </p>
          <p className="text-sm text-gray-600">
            Focus on celebrating the small victories, maintaining consistency, and most importantly, keeping the experience positive and enjoyable for your child.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MotivationTips;
