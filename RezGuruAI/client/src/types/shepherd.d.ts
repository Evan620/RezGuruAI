// Type definitions for shepherd.js
declare module 'shepherd.js' {
  namespace Shepherd {
    interface StepOptions {
      id?: string;
      title?: string;
      text?: string;
      classes?: string;
      buttons?: {
        text: string;
        action?: () => void;
        classes?: string;
      }[];
      canClickTarget?: boolean;
      scrollTo?: boolean;
      attachTo?: {
        element: string | HTMLElement;
        on: string;
      };
      beforeShowPromise?: () => Promise<void>;
      modalOverlayOpeningPadding?: number;
      modalOverlayOpeningRadius?: number;
      popperOptions?: object;
      when?: {
        show?: () => void;
        hide?: () => void;
      };
    }

    interface TourOptions {
      defaultStepOptions?: {
        cancelIcon?: {
          enabled?: boolean;
        };
        classes?: string;
        scrollTo?: boolean;
        modalOverlayOpeningRadius?: number;
        modalOverlayOpeningPadding?: number;
        canClickTarget?: boolean;
      };
      useModalOverlay?: boolean;
      keyboardNavigation?: boolean;
      exitOnEsc?: boolean;
      confirmCancel?: boolean;
      steps?: StepOptions[];
    }

    class Tour {
      constructor(options: TourOptions);
      addStep(options: StepOptions): Tour;
      start(): void;
      back(): void;
      cancel(): void;
      complete(): void;
      next(): void;
      isActive(): boolean;
      on(event: string, callback: () => void): void;
    }

    interface Step {
      id: string;
      options: StepOptions;
      tour: Tour;
      isOpen(): boolean;
      hide(): void;
      show(): void;
      destroy(): void;
    }
  }

  export = Shepherd;
}