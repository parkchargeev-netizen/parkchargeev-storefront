export const COMPARE_STORAGE_KEY = "parkchargeev-compare-selection-v1";
export const COMPARE_SELECTION_EVENT = "parkchargeev:compare-selection";
export const MAX_COMPARE_SELECTIONS = 4;

function getValidIdSet(validProductIds?: readonly string[]) {
  return validProductIds?.length ? new Set(validProductIds) : null;
}

export function normalizeCompareProductIds(
  value: unknown,
  validProductIds?: readonly string[]
) {
  if (!Array.isArray(value)) {
    return [];
  }

  const validIds = getValidIdSet(validProductIds);
  const uniqueIds: string[] = [];

  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      continue;
    }

    const productId = item.trim();

    if (validIds && !validIds.has(productId)) {
      continue;
    }

    if (!uniqueIds.includes(productId)) {
      uniqueIds.push(productId);
    }
  }

  return uniqueIds.slice(-MAX_COMPARE_SELECTIONS);
}

export function readStoredCompareProductIds(validProductIds?: readonly string[]) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    return normalizeCompareProductIds(rawValue ? JSON.parse(rawValue) : [], validProductIds);
  } catch {
    window.localStorage.removeItem(COMPARE_STORAGE_KEY);
    return [];
  }
}

export function writeStoredCompareProductIds(productIds: readonly string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedIds = normalizeCompareProductIds([...productIds]);

  if (normalizedIds.length === 0) {
    window.localStorage.removeItem(COMPARE_STORAGE_KEY);
  } else {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(normalizedIds));
  }

  window.dispatchEvent(
    new CustomEvent(COMPARE_SELECTION_EVENT, {
      detail: normalizedIds
    })
  );
}
