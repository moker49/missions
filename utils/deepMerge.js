export function deepMerge(base, override) {
    // If override is not an object, return it or base
    if (typeof base !== 'object' || base === null) return override;
    if (typeof override !== 'object' || override === null) return base;

    const result = Array.isArray(base) ? [...base] : { ...base };

    for (const key in base) {
        if (Object.prototype.hasOwnProperty.call(override, key)) {
            result[key] = deepMerge(base[key], override[key]);
        } else {
            result[key] = base[key]; // Keep base's value if not in override
        }
    }

    // Include any new keys from override that aren't in base
    for (const key in override) {
        if (!Object.prototype.hasOwnProperty.call(base, key)) {
            result[key] = override[key];
        }
    }

    return result;
}