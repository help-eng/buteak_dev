// Escalation Configuration
// This file contains all configurable settings for the escalation system

export const ESCALATION_CONFIG = {
  // Initial wait times based on task category (in milliseconds)
  // These are used BEFORE starting escalation to give original staff time to respond
  INITIAL_WAIT_TIMES: {
    T1: 5000, // 5 seconds - Immediate Response tasks
    T2: 30000, // 30 seconds - Standard Service tasks
    T3: 60000, // 60 seconds - Technical Issues
    T4: 0, // 0 seconds - Critical Emergency (broadcast immediately)
  },

  // Escalation wait duration (in milliseconds)
  // Used for waits between escalation messages (initial → reminder → next level)
  ESCALATION_WAIT_DURATION: 15000, // 15 seconds

  // Reminder message text
  REMINDER_MESSAGE:
    "⚠️ REMINDER!! Please click acknowledge in the above message and take the actions accordingly",

  // Template name for escalation
  TEMPLATE_NAME: "escalation_template",

  // Broadcast name for WATI
  BROADCAST_NAME: "Escalation Alert",
};

// Helper function to get initial wait time for a task category
export function getInitialWaitTime(category: string): number {
  return (
    ESCALATION_CONFIG.INITIAL_WAIT_TIMES[
      category as keyof typeof ESCALATION_CONFIG.INITIAL_WAIT_TIMES
    ] || ESCALATION_CONFIG.INITIAL_WAIT_TIMES.T2
  );
}

// Helper function to get escalation wait duration in seconds
export function getEscalationWaitInSeconds(): number {
  return ESCALATION_CONFIG.ESCALATION_WAIT_DURATION / 1000;
}
