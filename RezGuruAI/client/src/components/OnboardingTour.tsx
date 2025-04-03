import React, { useState, useEffect } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface OnboardingTourProps {
  isAuthenticated: boolean;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isAuthenticated }) => {
  const [hasTakenTour, setHasTakenTour] = useLocalStorage('rezguru-tour-completed', false);
  const [tour, setTour] = useState<Shepherd.Tour | null>(null);

  useEffect(() => {
    // Only show the tour for authenticated users who haven't taken it yet
    if (isAuthenticated && !hasTakenTour) {
      const newTour = new Shepherd.Tour({
        defaultStepOptions: {
          cancelIcon: {
            enabled: true
          },
          classes: 'shadow-md rounded-lg',
          scrollTo: true,
          modalOverlayOpeningRadius: 10,
          modalOverlayOpeningPadding: 10,
          canClickTarget: false // Prevent interaction with the element
        },
        useModalOverlay: true
      });

      // Welcome step
      newTour.addStep({
        id: 'welcome',
        title: 'Welcome to RezGuruAI!',
        text: 'This quick tour will guide you through the main features of the application. Click "Next" to continue or "Skip" to exit the tour.',
        buttons: [
          {
            text: 'Skip',
            action: () => {
              newTour.complete();
              setHasTakenTour(true);
            }
          },
          {
            text: 'Next',
            action: () => newTour.next()
          }
        ]
      });

      // Dashboard overview
      newTour.addStep({
        id: 'dashboard',
        title: 'Dashboard',
        text: 'This is your central command center where you can see all your key metrics, leads, and recent activities at a glance.',
        attachTo: {
          element: '#metrics-section',
          on: 'bottom'
        },
        buttons: [
          {
            text: 'Back',
            action: () => newTour.back()
          },
          {
            text: 'Next',
            action: () => newTour.next()
          }
        ]
      });

      // Analytics section
      newTour.addStep({
        id: 'analytics',
        title: 'Analytics & Reporting',
        text: 'Here you can see detailed analytics about your leads, properties, and business performance. Use these insights to make data-driven decisions.',
        attachTo: {
          element: '#analytics-section',
          on: 'top'
        },
        buttons: [
          {
            text: 'Back',
            action: () => newTour.back()
          },
          {
            text: 'Next',
            action: () => newTour.next()
          }
        ]
      });

      // Lead Management
      newTour.addStep({
        id: 'leads',
        title: 'Lead Management',
        text: 'Track and manage all your leads through our intuitive kanban board. You can easily move leads through different stages of your sales pipeline.',
        attachTo: {
          element: '#leads-section',
          on: 'top'
        },
        buttons: [
          {
            text: 'Back',
            action: () => newTour.back()
          },
          {
            text: 'Next',
            action: () => newTour.next()
          }
        ]
      });

      // Documents
      newTour.addStep({
        id: 'documents',
        title: 'Document Generation',
        text: 'Create professional documents like property listings, offers, and contracts using our AI-powered templates.',
        attachTo: {
          element: '#documents-section',
          on: 'top'
        },
        buttons: [
          {
            text: 'Back',
            action: () => newTour.back()
          },
          {
            text: 'Next',
            action: () => newTour.next()
          }
        ]
      });

      // Automation
      newTour.addStep({
        id: 'automation',
        title: 'Workflow Automation',
        text: 'Set up automated workflows to save time on repetitive tasks. From lead follow-ups to document generation, let AI handle the routine work.',
        attachTo: {
          element: '#workflows-section',
          on: 'top'
        },
        buttons: [
          {
            text: 'Back',
            action: () => newTour.back()
          },
          {
            text: 'Next',
            action: () => newTour.next()
          }
        ]
      });

      // Web Scraping
      newTour.addStep({
        id: 'scraping',
        title: 'Web Scraping',
        text: 'Extract valuable market data from property listings, market reports, and other online sources to stay ahead of trends.',
        attachTo: {
          element: '#sidebar-scraping',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            action: () => newTour.back()
          },
          {
            text: 'Next',
            action: () => newTour.next()
          }
        ]
      });

      // AI Assistant
      newTour.addStep({
        id: 'assistant',
        title: 'AI Assistant',
        text: 'Your personal real estate AI assistant is always ready to help. Ask questions, get recommendations, or request analysis - all through natural conversation.',
        attachTo: {
          element: '#sidebar-assistant',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            action: () => newTour.back()
          },
          {
            text: 'Next',
            action: () => newTour.next()
          }
        ]
      });

      // Final step
      newTour.addStep({
        id: 'complete',
        title: 'You\'re All Set!',
        text: 'You\'ve completed the tour! Now you\'re ready to start using RezGuruAI to transform your real estate business. If you need help, click on the Help section or use the AI Assistant.',
        buttons: [
          {
            text: 'Back',
            action: () => newTour.back()
          },
          {
            text: 'Finish',
            action: () => {
              newTour.complete();
              setHasTakenTour(true);
            }
          }
        ]
      });

      setTour(newTour);
      newTour.start();
    }

    return () => {
      if (tour) {
        tour.cancel();
      }
    };
  }, [isAuthenticated, hasTakenTour, setHasTakenTour]);

  // Reset tour function to be used from parent components
  const resetTour = () => {
    setHasTakenTour(false);
  };

  return (
    <div className="shepherd-restart-container">
      {hasTakenTour && (
        <button 
          onClick={resetTour}
          className="hidden" // We'll keep this hidden and expose the resetTour function
        >
          Restart Tour
        </button>
      )}
    </div>
  );
};

const resetOnboardingTour = () => {
  localStorage.setItem('rezguru-tour-completed', 'false');
};

// Export both the component and the reset function
export { OnboardingTour, resetOnboardingTour };
export default OnboardingTour;