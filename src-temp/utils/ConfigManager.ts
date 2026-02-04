import fs from "fs";
import path from "path";

export interface EscalationTimings {
  T1: number;
  T2: number;
  T3: number;
  T4: number;
  escalationWait: number;
}

export interface EscalationLevels {
  [key: string]: string; // e.g., { "L1": "Reception", "L2": "Manager" }
}

export interface EscalationConfig {
  timings: EscalationTimings;
  levels: EscalationLevels;
}

const CONFIG_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "config",
  "escalation-settings.json"
);

/**
 * Read escalation configuration from JSON file
 */
export function readEscalationConfig(): EscalationConfig {
  try {
    const fileContent = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("[ConfigManager] Error reading config file:", error);
    // Return default configuration if file doesn't exist
    return getDefaultConfig();
  }
}

/**
 * Write escalation configuration to JSON file
 */
export function writeEscalationConfig(config: EscalationConfig): void {
  try {
    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(config, null, 2),
      "utf-8"
    );
    console.log("[ConfigManager] Configuration updated successfully");
  } catch (error) {
    console.error("[ConfigManager] Error writing config file:", error);
    throw new Error("Failed to save configuration");
  }
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): EscalationConfig {
  return {
    timings: {
      T1: 5000,
      T2: 30000,
      T3: 60000,
      T4: 0,
      escalationWait: 15000,
    },
    levels: {
      L1: "Reception",
      L2: "Manager",
      L3: "Owner",
    },
  };
}

/**
 * Validate timings configuration
 */
export function validateTimings(timings: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if timings object exists
  if (!timings || typeof timings !== "object") {
    errors.push("Timings must be an object");
    return { valid: false, errors };
  }

  // Required timing keys
  const requiredKeys = ["T1", "T2", "T3", "T4", "escalationWait"];

  for (const key of requiredKeys) {
    if (!(key in timings)) {
      errors.push(`Missing required timing: ${key}`);
    } else if (typeof timings[key] !== "number") {
      errors.push(`${key} must be a number`);
    } else if (timings[key] < 0) {
      errors.push(`${key} must be a non-negative number`);
    }
  }

  // Additional validation: T4 should be 0 for immediate broadcast
  if (timings.T4 && timings.T4 !== 0) {
    errors.push("T4 (Critical Emergency) must be 0 for immediate broadcast");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate levels configuration
 */
export function validateLevels(levels: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if levels object exists
  if (!levels || typeof levels !== "object") {
    errors.push("Levels must be an object");
    return { valid: false, errors };
  }

  // Check if at least one level exists
  const levelKeys = Object.keys(levels);
  if (levelKeys.length === 0) {
    errors.push("At least one level must be defined");
  }

  // Validate each level
  for (const [key, value] of Object.entries(levels)) {
    // Level key must match pattern L1, L2, L3, etc.
    if (!/^L\d+$/.test(key)) {
      errors.push(
        `Invalid level key: ${key}. Must match pattern L1, L2, L3, etc.`
      );
    }

    // Role must be a non-empty string
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`Level ${key} must have a non-empty role name`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate entire configuration
 */
export function validateConfig(config: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config || typeof config !== "object") {
    errors.push("Configuration must be an object");
    return { valid: false, errors };
  }

  // Validate timings
  if (config.timings) {
    const timingsValidation = validateTimings(config.timings);
    if (!timingsValidation.valid) {
      errors.push(...timingsValidation.errors);
    }
  } else {
    errors.push("Missing timings configuration");
  }

  // Validate levels
  if (config.levels) {
    const levelsValidation = validateLevels(config.levels);
    if (!levelsValidation.valid) {
      errors.push(...levelsValidation.errors);
    }
  } else {
    errors.push("Missing levels configuration");
  }

  return { valid: errors.length === 0, errors };
}
