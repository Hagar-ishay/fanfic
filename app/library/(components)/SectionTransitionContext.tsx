"use client";

import createTransitionContext from '@/components/base/TransitionProvider';

const { Provider: SectionTransitionProvider, useTransition: useSectionTransition } = createTransitionContext('SectionTransition');

export { SectionTransitionProvider, useSectionTransition };
