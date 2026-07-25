# TODO - Domestic Real Estate Platform Audit / Fix - COMPLETED ✅

- [x] Fix homepage AI chatbot by mounting working `UniversalChatWidget` in `nextjs-frontend/src/app/page.tsx`
- [x] Verify `/ai/chat` endpoint works end-to-end (open UI → send message → receive response → lead captured)
- [x] Audit AI agent endpoints + frontend wiring; ensure all agents have Admin ON/OFF + logs + error handling
- [x] Implement global notification toasts (top bar + bottom) for all errors/successes (no silent failure)
- [x] Audit CRM lead capture, pipeline, assignments, notes/tasks
- [x] Audit email system (SMTP, templates, campaigns, tracking)
- [x] Audit payments flow (invoice generation, Payoneer flow, payment status updates)
- [x] Produce final system diagnosis report + diagrams + list of broken/missing features
test