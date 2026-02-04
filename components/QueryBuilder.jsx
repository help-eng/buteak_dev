"use client";

import { useState } from "react";

// Available fields for filtering (based on Zoho Service_Requests schema)
const AVAILABLE_FIELDS = [
    { value: "Status", label: "Status", type: "string" },
    { value: "Type", label: "Type", type: "string" },
    { value: "Priority", label: "Priority", type: "string" },
    { value: "Room", label: "Room", type: "lookup" },
    { value: "Staff", label: "Staff", type: "lookup" },
    { value: "Name", label: "Name/Description", type: "string" },
    { value: "Owner", label: "Owner", type: "lookup" },
];

// Available operators
const OPERATORS = [
    { value: "equals", label: "equals (==)", symbol: "==" },
    { value: "not_equals", label: "not equals (!=)", symbol: "!=" },
    { value: "contains", label: "contains", symbol: "~" },
    { value: "not_contains", label: "not contains", symbol: "!~" },
    { value: "starts_with", label: "starts with", symbol: "^" },
    { value: "is_empty", label: "is empty", symbol: "∅" },
    { value: "is_not_empty", label: "is not empty", symbol: "!∅" },
];

// Logical operators between conditions
const LOGICAL_OPERATORS = [
    { value: "AND", label: "AND" },
    { value: "OR", label: "OR" },
];

export function QueryBuilder({ onApply, disabled }) {
    const [conditions, setConditions] = useState([
        { id: 1, field: "Status", operator: "equals", value: "", logic: "AND" }
    ]);

    const addCondition = () => {
        const newId = Math.max(...conditions.map(c => c.id)) + 1;
        setConditions([
            ...conditions,
            { id: newId, field: "Status", operator: "equals", value: "", logic: "AND" }
        ]);
    };

    const removeCondition = (id) => {
        if (conditions.length > 1) {
            setConditions(conditions.filter(c => c.id !== id));
        }
    };

    const updateCondition = (id, field, value) => {
        setConditions(conditions.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const clearConditions = () => {
        setConditions([
            { id: 1, field: "Status", operator: "equals", value: "", logic: "AND" }
        ]);
    };

    const handleApply = () => {
        // Filter out empty conditions (except is_empty/is_not_empty)
        const validConditions = conditions.filter(c =>
            c.value.trim() !== "" ||
            c.operator === "is_empty" ||
            c.operator === "is_not_empty"
        );

        if (validConditions.length === 0) {
            onApply(null);
            return;
        }

        onApply(validConditions);
    };

    // Generate query preview string
    const getPreviewString = () => {
        const validConditions = conditions.filter(c =>
            c.value.trim() !== "" ||
            c.operator === "is_empty" ||
            c.operator === "is_not_empty"
        );

        if (validConditions.length === 0) return "No conditions set";

        return validConditions.map((c, idx) => {
            const op = OPERATORS.find(o => o.value === c.operator);
            const prefix = idx > 0 ? ` ${c.logic} ` : "";

            if (c.operator === "is_empty" || c.operator === "is_not_empty") {
                return `${prefix}${c.field} ${op?.symbol || c.operator}`;
            }
            return `${prefix}${c.field} ${op?.symbol || c.operator} "${c.value}"`;
        }).join("");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Custom Query Builder
                </h4>
                <button
                    onClick={addCondition}
                    className="text-sm text-buteak-gold hover:text-buteak-gold/80 font-medium flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Condition
                </button>
            </div>

            {/* Conditions */}
            <div className="space-y-3">
                {conditions.map((condition, index) => (
                    <div key={condition.id} className="flex flex-wrap items-center gap-2">
                        {/* Logic operator (for 2nd+ conditions) */}
                        {index > 0 && (
                            <select
                                value={condition.logic}
                                onChange={(e) => updateCondition(condition.id, "logic", e.target.value)}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded border-0 focus:ring-2 focus:ring-buteak-gold"
                            >
                                {LOGICAL_OPERATORS.map(op => (
                                    <option key={op.value} value={op.value}>{op.label}</option>
                                ))}
                            </select>
                        )}

                        {/* Field selector */}
                        <select
                            value={condition.field}
                            onChange={(e) => updateCondition(condition.id, "field", e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-dark-surface-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-buteak-gold focus:border-transparent"
                        >
                            {AVAILABLE_FIELDS.map(field => (
                                <option key={field.value} value={field.value}>{field.label}</option>
                            ))}
                        </select>

                        {/* Operator selector */}
                        <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(condition.id, "operator", e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-dark-surface-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-buteak-gold focus:border-transparent"
                        >
                            {OPERATORS.map(op => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                        </select>

                        {/* Value input (hidden for is_empty/is_not_empty) */}
                        {condition.operator !== "is_empty" && condition.operator !== "is_not_empty" && (
                            <input
                                type="text"
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                                placeholder="Value..."
                                className="flex-1 min-w-[120px] px-3 py-2 bg-gray-50 dark:bg-dark-surface-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-buteak-gold focus:border-transparent"
                            />
                        )}

                        {/* Remove button */}
                        {conditions.length > 1 && (
                            <button
                                onClick={() => removeCondition(condition.id)}
                                className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                title="Remove condition"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Query Preview */}
            <div className="p-3 bg-gray-100 dark:bg-dark-surface-3 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-500">Query: </span>
                {getPreviewString()}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleApply}
                    disabled={disabled}
                    className="px-4 py-2 bg-buteak-primary hover:bg-buteak-primary/90 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Apply Query
                </button>
                <button
                    onClick={() => {
                        clearConditions();
                        onApply(null);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
                >
                    Clear Query
                </button>
            </div>
        </div>
    );
}
