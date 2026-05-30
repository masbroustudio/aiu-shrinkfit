import React from 'react';
import * as JoyrideModule from 'react-joyride';
import { useAppContext } from '../context/AppContext';

// Handle ESM/CJS interop safely
const JoyrideComponent = (JoyrideModule as any).default || (JoyrideModule as any).Joyride || JoyrideModule;

export const OnboardingTour: React.FC = () => {
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useAppContext();

  const steps = [
    {
      target: '.tour-dashboard',
      content: 'Welcome to Shrinkflation AI! This is your main intelligence overview where you can see real-time margin expansion metrics.',
      disableBeacon: true,
    },
    {
      target: '.tour-agent',
      content: 'Chat with our Vertex AI agent to analyze margin impacts and search the web for the latest earnings news.',
    },
    {
      target: '.tour-pipeline',
      content: 'Manage your FMCG products and sync live data from Bright Data here. You can also auto-extract product details from URLs.',
    },
    {
      target: '.tour-alerts',
      content: 'Set up automated rules to get notified instantly when shrinkflation events occur.',
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];
    
    if (finishedStatuses.includes(status)) {
      setHasCompletedOnboarding(true);
    }
  };

  // Fallback if the module fails to load properly in the browser environment
  if (!JoyrideComponent || (typeof JoyrideComponent !== 'function' && typeof JoyrideComponent !== 'object')) {
    return null;
  }

  const FinalComponent = JoyrideComponent.default || JoyrideComponent;

  return (
    <FinalComponent
      steps={steps}
      run={!hasCompletedOnboarding}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10b981',
          backgroundColor: '#0f172a',
          textColor: '#f8fafc',
          arrowColor: '#0f172a',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#10b981',
        },
        buttonBack: {
          color: '#94a3b8',
        }
      }}
    />
  );
};
