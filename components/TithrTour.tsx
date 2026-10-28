// components/TithrTour.tsx
"use client";

import { useEffect, useState } from "react";

type TithrTourProps = {
  isOpen: boolean;
  onClose: () => void;
};

const tourSteps = [
  {
    eyebrow: "WELCOME TO TITHR",
    title: "Church collections, organized.",
    description:
      "Tithr helps your church record donations, manage collection records, and prepare reports. This short walkthrough introduces the main features.",
    tip: "You can close this tour at any time and reopen it from the navigation menu.",
    items: [
      "Record church collections",
      "Track individual donations",
      "Review records and prepare reports",
    ],
  },
  {
    eyebrow: "STEP 1 OF 7",
    title: "Set up your church",
    description:
      "Start by making sure your church information is correct. This information helps identify your church in its records and reports.",
    tip: "Review your church details before generating reports.",
    items: [
      "Open the profile menu in the top-right corner.",
      "Select Settings.",
      "Review your church information and logo.",
      "Save any changes you make.",
    ],
  },
  {
    eyebrow: "STEP 2 OF 7",
    title: "Create a collection",
    description:
      "The collection entry screen is where you record the offerings collected during a church service or other event.",
    tip: "Choose the correct service type and date before entering donations.",
    items: [
      "Open the collection entry screen.",
      "Select the collection date and service type.",
      "Enter the person recording the collection.",
      "Enter the person counting the collection.",
    ],
  },
  {
    eyebrow: "STEP 3 OF 7",
    title: "Record donations",
    description:
      "Add a donation entry for each contribution. Enter the information carefully so the collection record reflects what was received.",
    tip: "Check the amount and donation type before submitting your collection.",
    items: [
      "Enter the donor information when applicable.",
      "Enter a check number when applicable.",
      "Enter the donation amount.",
      "Choose the appropriate donation type.",
      "Use the anonymous-donation option when applicable rather than assigning the contribution to a named donor.",
    ],
  },
  {
    eyebrow: "STEP 4 OF 7",
    title: "Review your collections",
    description:
      "The Collections section lets you access previously recorded collection records and review their details.",
    tip: "If a collection was entered incorrectly, follow Tithr's voiding process rather than treating an incorrect record as valid.",
    items: [
      "Open the profile menu.",
      "Select Collections.",
      "Find the collection you want to review.",
      "Check its details and status.",
    ],
  },
  {
    eyebrow: "STEP 5 OF 7",
    title: "Generate and send reports",
    description:
      "Tithr supports collection reporting so your church can review recorded donations and share the appropriate report.",
    tip: "Review the collection details and confirm the recipient before sending a report.",
    items: [
      "Open the relevant collection.",
      "Review its recorded entries and totals.",
      "Use the available report or PDF controls.",
      "Confirm the destination email when sending a report.",
    ],
  },
  {
    eyebrow: "STEP 6 OF 7",
    title: "Manage donors and their history",
    description:
      "The Donors section helps you find donor records and review an individual's contribution history.",
    tip: "Donor history provides a record of contributions; anonymous donations should not be assigned to a named donor.",
    items: [
      "Open the profile menu.",
      "Select Donors.",
      "Find and open the appropriate donor.",
      "Review their contribution history.",
      "Generate the donor history PDF when needed.",
    ],
  },
  {
    eyebrow: "STEP 7 OF 7",
    title: "Understand voided collections",
    description:
      "A voided collection is retained for historical reference but should not be treated as a valid collection in reporting.",
    tip: "Review the void reason when investigating an incorrect or voided record.",
    items: [
      "Use the voiding process for an erroneous collection.",
      "Provide a clear reason when voiding a record.",
      "Consult the retained record when reviewing historical activity.",
      "Remember that voided collections are excluded from applicable collection totals and date-range exports.",
    ],
  },
];

export default function TithrTour({
  isOpen,
  onClose,
}: TithrTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = tourSteps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const step = tourSteps[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        setCurrentStep((current) =>
          Math.min(current + 1, totalSteps - 1)
        );
      }

      if (event.key === "ArrowLeft") {
        setCurrentStep((current) =>
          Math.max(current - 1, 0)
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, totalSteps]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const goBack = () => {
    setCurrentStep((current) => Math.max(current - 1, 0));
  };

  const goNext = () => {
    if (isLastStep) {
      setCurrentStep(totalSteps);
      return;
    }

    setCurrentStep((current) => current + 1);
  };

  const isComplete = currentStep >= totalSteps;

  const restartTour = () => {
    setCurrentStep(0);
  };

  return (
    <div
      className="tithr-tour-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="tithr-tour-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tithr-tour-title"
        aria-describedby="tithr-tour-description"
      >
        <div className="tithr-tour-header">
          <div className="tithr-tour-brand">
            <span className="tithr-tour-brand-mark">T</span>
            <span>Tithr Guide</span>
          </div>

          <button
            type="button"
            className="tithr-tour-close"
            onClick={onClose}
            aria-label="Close tutorial"
          >
            ×
          </button>
        </div>

        <div className="tithr-tour-progress">
          {tourSteps.map((tourStep, index) => {
            const active = !isComplete && index === currentStep;
            const completed = isComplete || index < currentStep;

            return (
              <button
                key={tourStep.title}
                type="button"
                className={[
                  "tithr-tour-progress-step",
                  active ? "active" : "",
                  completed ? "completed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}: ${tourStep.title}`}
                aria-current={active ? "step" : undefined}
                title={tourStep.title}
              />
            );
          })}
        </div>

        <div className="tithr-tour-content" aria-live="polite">
          {isComplete ? (
            <div className="tithr-tour-completion">
              <div className="tithr-tour-completion-icon">✓</div>

              <p className="tithr-tour-eyebrow">
                WALKTHROUGH COMPLETE
              </p>

              <h2 id="tithr-tour-title">
                You're ready to explore Tithr.
              </h2>

              <p id="tithr-tour-description">
                You've reviewed the main features of Tithr, from
                setting up your church to managing collections,
                reports, and donor history.
              </p>

              <div className="tithr-tour-tip">
                <strong>Remember</strong>
                <p>
                  You can reopen this walkthrough whenever you need
                  a refresher.
                </p>
              </div>

              <div className="tithr-tour-completion-actions">
                <button
                  type="button"
                  className="tithr-tour-button secondary"
                  onClick={restartTour}
                >
                  Restart tour
                </button>

                <button
                  type="button"
                  className="tithr-tour-button primary"
                  onClick={onClose}
                >
                  Finish
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="tithr-tour-eyebrow">
                {step.eyebrow}
              </p>

              <h2 id="tithr-tour-title">{step.title}</h2>

              <p
                id="tithr-tour-description"
                className="tithr-tour-description"
              >
                {step.description}
              </p>

              <div className="tithr-tour-card">
                <h3>What to do</h3>

                <ol>
                  {step.items.map((item, index) => (
                    <li key={item}>
                      <span className="tithr-tour-item-number">
                        {index + 1}
                      </span>

                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="tithr-tour-tip">
                <strong>Helpful tip</strong>
                <p>{step.tip}</p>
              </div>
            </>
          )}
        </div>

        {!isComplete && (
          <div className="tithr-tour-footer">
            <button
              type="button"
              className="tithr-tour-button text-button"
              onClick={onClose}
            >
              Skip tour
            </button>

            <div className="tithr-tour-navigation">
              <button
                type="button"
                className="tithr-tour-button secondary"
                onClick={goBack}
                disabled={currentStep === 0}
              >
                Back
              </button>

              <button
                type="button"
                className="tithr-tour-button primary"
                onClick={goNext}
              >
                {isLastStep ? "Complete tour" : "Next →"}
              </button>
            </div>
          </div>
        )}

        <p className="tithr-tour-keyboard-hint">
          Tip: Use ← and → to navigate, or Esc to close.
        </p>
      </section>

      <style jsx>{`
        .tithr-tour-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          background: rgba(15, 23, 42, 0.64);
          backdrop-filter: blur(3px);
        }

        .tithr-tour-dialog {
          width: 100%;
          max-width: 620px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
          color: #111827;
        }

        .tithr-tour-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .tithr-tour-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          font-weight: 700;
        }

        .tithr-tour-brand-mark {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #1e40af;
          color: #ffffff;
          font-size: 1.1rem;
        }

        .tithr-tour-close {
          width: 42px;
          height: 42px;
          padding: 0;
          background: transparent;
          color: #6b7280;
          font-size: 1.8rem;
          font-weight: 400;
        }

        .tithr-tour-close:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .tithr-tour-progress {
          display: flex;
          gap: 6px;
          padding: 18px 24px 0;
        }

        .tithr-tour-progress-step {
          flex: 1;
          height: 6px;
          min-width: 0;
          padding: 0;
          border-radius: 10px;
          background: #e5e7eb;
          transition: background 0.2s ease;
        }

        .tithr-tour-progress-step.active,
        .tithr-tour-progress-step.completed {
          background: #1e40af;
        }

        .tithr-tour-content {
          padding: 24px;
        }

        .tithr-tour-eyebrow {
          margin-bottom: 8px;
          color: #1e40af;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .tithr-tour-content h2 {
          margin: 0 0 14px;
          color: #111827;
          font-size: clamp(1.5rem, 4vw, 2rem);
          line-height: 1.25;
        }

        .tithr-tour-description {
          margin-bottom: 22px;
          color: #4b5563;
          line-height: 1.7;
        }

        .tithr-tour-card {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
        }

        .tithr-tour-card h3 {
          margin-bottom: 16px;
          font-size: 1rem;
          font-weight: 700;
        }

        .tithr-tour-card ol {
          display: flex;
          flex-direction: column;
          gap: 14px;
          list-style: none;
        }

        .tithr-tour-card li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #374151;
          line-height: 1.55;
        }

        .tithr-tour-item-number {
          display: flex;
          flex: 0 0 28px;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dbeafe;
          color: #1e40af;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .tithr-tour-tip {
          margin-top: 18px;
          padding: 14px 16px;
          border-left: 4px solid #1e40af;
          border-radius: 4px 8px 8px 4px;
          background: #eff6ff;
          color: #1f2937;
        }

        .tithr-tour-tip strong {
          display: block;
          margin-bottom: 4px;
          color: #1e40af;
          font-size: 0.85rem;
        }

        .tithr-tour-tip p {
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .tithr-tour-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 18px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .tithr-tour-navigation {
          display: flex;
          gap: 10px;
        }

        .tithr-tour-button {
          min-height: 44px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .tithr-tour-button.primary {
          border: 1px solid #1e40af;
          background: #1e40af;
          color: #ffffff;
        }

        .tithr-tour-button.primary:hover {
          background: #1d4ed8;
        }

        .tithr-tour-button.secondary {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
        }

        .tithr-tour-button.secondary:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .tithr-tour-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .tithr-tour-button.text-button {
          padding-left: 0;
          background: transparent;
          color: #6b7280;
        }

        .tithr-tour-button.text-button:hover {
          color: #111827;
          text-decoration: underline;
        }

        .tithr-tour-keyboard-hint {
          padding: 0 24px 18px;
          color: #9ca3af;
          font-size: 0.75rem;
          text-align: center;
        }

        .tithr-tour-completion {
          text-align: center;
        }

        .tithr-tour-completion-icon {
          display: flex;
          width: 58px;
          height: 58px;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: #dcfce7;
          color: #166534;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .tithr-tour-completion > p:not(.tithr-tour-eyebrow) {
          color: #4b5563;
          line-height: 1.7;
        }

        .tithr-tour-completion-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        @media (max-width: 520px) {
          .tithr-tour-backdrop {
            align-items: flex-start;
            padding: 10px;
          }

          .tithr-tour-dialog {
            max-height: calc(100vh - 20px);
            border-radius: 12px;
          }

          .tithr-tour-header {
            padding: 14px 16px;
          }

          .tithr-tour-progress {
            padding: 14px 16px 0;
          }

          .tithr-tour-content {
            padding: 20px 16px;
          }

          .tithr-tour-card {
            padding: 16px;
          }

          .tithr-tour-footer {
            padding: 14px 16px;
          }

          .tithr-tour-button {
            padding: 10px 12px;
          }

          .tithr-tour-keyboard-hint {
            padding: 0 16px 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tithr-tour-progress-step,
          .tithr-tour-button {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}