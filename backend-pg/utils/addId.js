/**
 * Recursively add `_id` (alias of `id`) to every object in the data tree.
 * This keeps the JSON response shape identical to the MongoDB backend
 * where every document has an `_id` field.
 */
export const addId = (data) => {
  if (data === null || data === undefined) return data;

  // Convert to plain object if needed (e.g. class instances with toJSON)
  if (typeof data.toJSON === "function") data = data.toJSON();

  // Process arrays
  if (Array.isArray(data)) return data.map(addId);

  // Skip non-objects (numbers, strings, dates, etc.)
  if (typeof data !== "object" || data instanceof Date) return data;

  const result = { ...data };

  // Add _id alias
  if (result.id !== undefined && result._id === undefined) {
    result._id = result.id;
  }

  // Recurse into nested objects and arrays
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (val === null || val === undefined || val instanceof Date) continue;
    if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        item && typeof item === "object" && !(item instanceof Date)
          ? addId(item)
          : item
      );
    } else if (typeof val === "object" && val.id !== undefined) {
      result[key] = addId(val);
    }
  }

  return result;
};
