/**
 * Filters the menu.json tree by effective permissions.
 *
 * Rules:
 * - `permissions == null`  -> no filtering (fail-open during rollout).
 * - A leaf item (has `path`) is kept only if its `key` has at least one
 *   granted action (usually "view").
 * - A parent / heading is kept only if at least one descendant survives.
 * - Items without a real menu code but with a path (rare) are kept.
 */
export function filterMenuByPermissions(items, permissions) {
  if (!permissions) return items;
  if (!Array.isArray(items)) return [];

  const walk = (list) =>
    list
      .map((item) => {
        if (!item) return null;

        const children = item.children ? walk(item.children) : undefined;
        const hasChildren = children && children.length > 0;

        if (item.children) {
          // group / heading node: keep only if something survived below
          return hasChildren ? { ...item, children } : null;
        }

        // leaf node: menu is visible only with 'view' permission
        const granted = permissions[item.key];
        if (granted && granted.includes("view")) return item;
        return null;
      })
      .filter(Boolean);

  return walk(items);
}
