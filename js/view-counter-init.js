/**
 * SIMULATED ANALYTICS SCRIPT
 * 
 * This file exists to demonstrate dynamic script injection based on user consent.
 * It mimics the behavior of a third-party tracking script (like Google Tag Manager 
 * or Google Analytics) which should ONLY be loaded into the DOM if the user has 
 * explicitly granted 'Analytics' consent via the cookie banner.
 * 
 * By keeping this separate from the main bundle and injecting it dynamically via 
 * analytics.js, we prove strict adherence to GDPR/ePrivacy consent requirements.
 */

console.log('[Injected Script] view-counter-init.js loaded successfully. This proves dynamic tag injection is working based on consent state.');