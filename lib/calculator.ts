/**
 * v1.5.0: Calculator utility for safe expression evaluation
 * Uses expr-eval library to avoid security risks of eval()
 */

import { Parser } from "expr-eval";

const parser = new Parser();

export interface EvaluationResult {
  success: boolean;
  value: number | null;
  error: string | null;
}

/**
 * Safely evaluate a mathematical expression
 * Supports: +, -, *, /, (), decimals
 */
export function evaluate(expression: string): EvaluationResult {
  // Empty expression
  if (!expression.trim()) {
    return { success: true, value: null, error: null };
  }

  // Clean expression (remove spaces for processing)
  const cleanExpr = expression.replace(/\s+/g, "");

  // Check for empty parentheses
  if (cleanExpr.includes("()")) {
    return { success: false, value: null, error: "Parentesis vacios" };
  }

  // Check for balanced parentheses
  let parenCount = 0;
  for (const char of cleanExpr) {
    if (char === "(") parenCount++;
    if (char === ")") parenCount--;
    if (parenCount < 0) {
      return {
        success: false,
        value: null,
        error: "Parentesis desbalanceados",
      };
    }
  }
  if (parenCount !== 0) {
    return { success: false, value: null, error: "Parentesis desbalanceados" };
  }

  try {
    const result = parser.evaluate(cleanExpr);

    // Check for valid number
    if (typeof result !== "number" || !isFinite(result)) {
      return { success: false, value: null, error: "Resultado invalido" };
    }

    return { success: true, value: result, error: null };
  } catch (err) {
    // Parse error message to provide friendly feedback
    const message = err instanceof Error ? err.message : "Error de sintaxis";

    if (message.includes("divide by zero") || message.includes("division")) {
      return { success: false, value: null, error: "Division por cero" };
    }

    return { success: false, value: null, error: "Expresion invalida" };
  }
}

/**
 * Check if an expression is valid without evaluating
 */
export function isValidExpression(expression: string): boolean {
  if (!expression.trim()) return true;

  try {
    parser.parse(expression);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format a number for display
 */
export function formatResult(value: number, decimals: number = 2): string {
  // For very large or very small numbers, use scientific notation
  if (Math.abs(value) >= 1e12 || (Math.abs(value) < 0.0001 && value !== 0)) {
    return value.toExponential(decimals);
  }

  // Round to specified decimals
  const rounded =
    Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);

  // Format with locale
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(rounded);
}

/**
 * Smart parentheses insertion
 * Returns the character(s) to insert based on current expression
 */
export function getSmartParenthesis(expression: string): string {
  if (!expression) return "(";

  const lastChar = expression.slice(-1);
  const openCount = (expression.match(/\(/g) || []).length;
  const closeCount = (expression.match(/\)/g) || []).length;

  // After operator or open paren, add open paren
  if (["+", "-", "*", "/", "("].includes(lastChar)) {
    return "(";
  }

  // After number or close paren, add close if we have unclosed parens
  if (openCount > closeCount) {
    return ")";
  }

  // Default to open paren
  return "(";
}
