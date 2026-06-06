const normalizeSearchToken = (value = "") =>
  String(value).toLowerCase().trim().replace(/\s+/g, " ");

export const extractQueryWords = (queryRaw) =>
  normalizeSearchToken(queryRaw).split(/\s+/).filter(Boolean);

export const buildIndexedModuleOptions = (
  items,
  parentIndex = [],
  ancestors = [],
) => {
  if (!Array.isArray(items)) return [];

  const visibleItems = items.filter((item) => item?.isShown !== false);
  const result = [];

  visibleItems.forEach((item, idx) => {
    const currentIndex = [...parentIndex, idx + 1];
    const currentIndexText = currentIndex.join("");
    const currentLabel = item?.label ? String(item.label) : "";
    const currentAncestors = currentLabel
      ? [...ancestors, currentLabel]
      : ancestors;

    if (item?.path) {
      const breadcrumb = currentAncestors.join(" > ");
      const aliases = Array.isArray(item.aliases) ? item.aliases : [];
      result.push({
        key: currentIndexText,
        value: item.path,
        label: currentLabel,
        breadcrumb,
        aliases,
        searchIndex: currentIndexText,
        searchLabel: normalizeSearchToken(currentLabel),
        searchBreadcrumb: normalizeSearchToken(breadcrumb),
        searchAliases: aliases.map(normalizeSearchToken),
      });
    }

    if (Array.isArray(item?.children) && item.children.length > 0) {
      result.push(
        ...buildIndexedModuleOptions(
          item.children,
          currentIndex,
          currentAncestors,
        ),
      );
    }
  });

  return result;
};

export const filterModuleOptions = (options, queryRaw) => {
  const words = extractQueryWords(queryRaw);
  if (!words.length) return [];

  return options
    .filter((option) =>
      words.every((word) => {
        const byLabel = option.searchLabel.includes(word);
        const byBreadcrumb = option.searchBreadcrumb.includes(word);
        const byPath = option.value?.toLowerCase().includes(word);
        const byAlias = option.searchAliases?.some((a) => a.includes(word));
        const byIndex = /^\d+$/.test(word) && option.searchIndex.includes(word);
        return byLabel || byBreadcrumb || byPath || byAlias || byIndex;
      }),
    )
    .slice(0, 10);
};
