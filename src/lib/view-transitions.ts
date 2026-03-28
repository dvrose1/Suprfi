// ABOUTME: View Transitions API utilities for cinematic page transitions
// ABOUTME: Falls back gracefully for browsers without support (Firefox)

/**
 * Check if View Transitions API is supported
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

/**
 * Start a view transition if supported, otherwise just run the callback
 */
export async function startViewTransition(callback: () => void | Promise<void>): Promise<void> {
  if (!supportsViewTransitions()) {
    await callback();
    return;
  }

  const transition = document.startViewTransition(async () => {
    await callback();
  });

  try {
    await transition.finished;
  } catch {
    // Transition was skipped or aborted - that's fine
  }
}

/**
 * Navigate with view transition (for use with Next.js router)
 */
export function navigateWithTransition(
  router: { push: (url: string) => void },
  url: string
): void {
  if (!supportsViewTransitions()) {
    router.push(url);
    return;
  }

  document.startViewTransition(() => {
    router.push(url);
  });
}

/**
 * CSS class to mark elements for view transition naming
 * Use: className={viewTransitionName('card-123')}
 */
export function viewTransitionName(name: string): string {
  return `[view-transition-name:${name}]`;
}

/**
 * Inline style for view-transition-name (more reliable than className)
 */
export function viewTransitionStyle(name: string): React.CSSProperties {
  return {
    viewTransitionName: name,
  } as React.CSSProperties;
}
