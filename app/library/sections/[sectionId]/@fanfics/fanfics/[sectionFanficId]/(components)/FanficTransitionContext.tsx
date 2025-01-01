"use client";

import createTransitionContext from '@/components/base/TransitionProvider';

const { Provider: FanficTransitionProvider, useTransition: useFanficTransition } = createTransitionContext('FanficTransition');

export { FanficTransitionProvider, useFanficTransition };
