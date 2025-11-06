# Testing Guide - Camp Alborz Platform

**Last Updated:** 2025-11-05

This document outlines the testing strategy and procedures for the Camp Alborz platform.

---

## Testing Philosophy

The Camp Alborz platform follows a pragmatic testing approach:

1. **Manual testing first** - For rapid iteration
2. **Automated testing second** - For regression prevention
3. **User testing always** - For real-world validation

---

## Manual Testing Checklist

### Pre-Deployment Checklist

Before any deployment, complete this checklist:

#### ✅ Build & Start
- [ ] `npm run build` completes without errors
- [ ] `npm run start` starts the production server
- [ ] No console errors in terminal
- [ ] Server responds on correct port

#### ✅ All Pages Load
Test each page loads without errors:

- [ ] `/` - Homepage
- [ ] `/about` - About page
- [ ] `/art` - Art gallery
- [ ] `/events` - Events calendar
- [ ] `/culture` - Culture page
- [ ] `/donate` - Donation page
- [ ] `/apply` - Application form
- [ ] `/members` - Members area
- [ ] `/search` - Search page
- [ ] `/admin` - Admin dashboard (auth required)

#### ✅ Navigation
- [ ] Main navigation works on all pages
- [ ] Dropdown menus function correctly
- [ ] Mobile menu opens and closes
- [ ] All navigation links go to correct pages
- [ ] Active page is highlighted in nav

#### ✅ Forms
Test all forms:

**Donation Form** (`/donate`):
- [ ] All fields accept input
- [ ] Validation shows appropriate errors
- [ ] Submit button is enabled when form is valid
- [ ] Form submission works (or shows appropriate message)
- [ ] Success/error messages display correctly

**Application Form** (`/apply`):
- [ ] All required fields marked
- [ ] File upload works (if implemented)
- [ ] Validation prevents invalid submissions
- [ ] Submit triggers appropriate action
- [ ] Thank you message displays

#### ✅ Responsive Design
Test on multiple screen sizes:

- [ ] Mobile (375px) - iPhone SE
- [ ] Tablet (768px) - iPad
- [ ] Desktop (1024px) - Standard laptop
- [ ] Large Desktop (1920px) - Full HD

For each size check:
- [ ] Layout doesn't break
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] Images scale properly
- [ ] Navigation is usable

#### ✅ Dark Mode
- [ ] Dark mode toggle works
- [ ] All pages look good in dark mode
- [ ] No contrast issues
- [ ] Images/logos work in both modes
- [ ] Preference persists on reload

#### ✅ Performance
- [ ] Homepage loads in < 3 seconds
- [ ] No layout shift (CLS)
- [ ] Images load progressively
- [ ] Smooth scrolling
- [ ] No janky animations

#### ✅ Browser Compatibility
Test in multiple browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

#### ✅ Accessibility
- [ ] Can navigate with keyboard only
- [ ] Screen reader can read content
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Focus indicators visible

---

## Browser Testing Matrix

### Required Browsers (Must Pass)

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|--------|--------|
| Chrome | Latest | ✅ | ✅ | |
| Safari | Latest | ✅ | ✅ | |
| Firefox | Latest | ✅ | ⚠️  | |
| Edge | Latest | ✅ | ⚠️  | |

✅ = Must work perfectly
⚠️  = Should work, minor issues acceptable

### Optional Browsers (Nice to Have)

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | Latest - 2 | For backward compatibility |
| Safari | iOS 15+ | For older iPhones |
| Samsung Internet | Latest | For Android Samsung devices |

---

## Device Testing

### Priority Devices

Test on these physical devices if available:

1. **iPhone** (any recent model)
   - Test Safari
   - Test vertical and horizontal orientation
   - Test donation form on mobile

2. **Android Phone** (any recent model)
   - Test Chrome
   - Test different screen sizes
   - Test application form

3. **iPad or Tablet**
   - Test Safari/Chrome
   - Test tablet-specific layouts
   - Verify images look good

4. **Desktop/Laptop**
   - Test on actual monitor (not just browser resize)
   - Test with different resolutions
   - Test with external monitor

### Simulated Testing

Use browser DevTools for:
- **Responsive mode** - Test various screen sizes
- **Network throttling** - Test on slow 3G
- **Device emulation** - Test touch interactions

---

## Feature-Specific Testing

### Authentication (When Implemented)

**Sign Up:**
- [ ] Can create new account
- [ ] Email validation works
- [ ] Password strength enforced
- [ ] Confirmation email sent
- [ ] Can verify email

**Sign In:**
- [ ] Can log in with email/password
- [ ] "Remember me" works
- [ ] Error message for wrong credentials
- [ ] Redirect to correct page after login

**Password Reset:**
- [ ] Can request reset link
- [ ] Reset email arrives
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can log in with new password

### Donation Processing (When Implemented)

- [ ] Stripe form loads
- [ ] Card validation works
- [ ] Test card (4242 4242 4242 4242) works
- [ ] Real cards are declined in test mode
- [ ] Receipt email sent
- [ ] Thank you page displays
- [ ] Donation appears in admin dashboard

### Admin Dashboard

**Access:**
- [ ] Requires authentication
- [ ] Non-admins redirected
- [ ] All sections load

**Member Management:**
- [ ] Can view member list
- [ ] Can filter/search members
- [ ] Can edit member details
- [ ] Can delete members
- [ ] Can export member data

**Event Management:**
- [ ] Can create new event
- [ ] Can edit existing event
- [ ] Can delete event
- [ ] Can view event RSVPs
- [ ] Calendar displays correctly

**Analytics:**
- [ ] Charts render correctly
- [ ] Data updates in real-time
- [ ] Export functions work
- [ ] Date filters work

---

## Performance Testing

### Lighthouse Audit

Run Lighthouse in Chrome DevTools:

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

**How to run:**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Desktop" or "Mobile"
4. Click "Analyze page load"
5. Review and fix issues

### Load Testing

Test under load (when backend is implemented):

```bash
# Install k6 load testing tool
brew install k6

# Run basic load test
k6 run load-test.js
```

**Targets:**
- Homepage: 100 concurrent users
- API endpoints: 50 requests/second
- Database queries: < 100ms average

---

## Security Testing

### Basic Security Checks

- [ ] SQL injection protection (test with `' OR '1'='1`)
- [ ] XSS protection (test with `<script>alert('xss')</script>`)
- [ ] CSRF tokens on forms
- [ ] Rate limiting on API endpoints
- [ ] HTTPS enforced
- [ ] Secure headers present
- [ ] Secrets not in client-side code
- [ ] Authentication tokens expire

### Security Headers Check

Use [securityheaders.com](https://securityheaders.com) to check:

- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security
- [ ] Referrer-Policy

---

## Accessibility Testing

### Keyboard Navigation

- [ ] Can tab through all interactive elements
- [ ] Focus indicator visible on all elements
- [ ] Can submit forms with Enter key
- [ ] Can close modals with Escape key
- [ ] Skip to main content link works
- [ ] Tab order is logical

### Screen Reader Testing

Test with:
- **macOS:** VoiceOver (Cmd + F5)
- **Windows:** NVDA (free) or JAWS
- **Mobile:** TalkBack (Android) or VoiceOver (iOS)

Check:
- [ ] All images have alt text
- [ ] Buttons are labeled
- [ ] Form fields have labels
- [ ] Error messages are announced
- [ ] Page title is descriptive
- [ ] Headings are hierarchical

### Color Contrast

Use [contrast checker](https://webaim.org/resources/contrastchecker/):

- [ ] Normal text: 4.5:1 contrast minimum
- [ ] Large text: 3:1 contrast minimum
- [ ] UI components: 3:1 contrast minimum
- [ ] Check in dark mode too

---

## User Acceptance Testing (UAT)

### UAT Checklist

Before considering a feature "done":

1. **Stakeholder Demo**
   - [ ] Demo feature to stakeholders
   - [ ] Get feedback on UX
   - [ ] Note requested changes

2. **Beta Testing**
   - [ ] Select 5-10 beta testers
   - [ ] Provide testing instructions
   - [ ] Collect feedback
   - [ ] Fix critical issues

3. **Real User Testing**
   - [ ] Have actual camp members try it
   - [ ] Observe them using it (don't help!)
   - [ ] Note where they get stuck
   - [ ] Improve based on observations

### Feedback Collection

**During Testing:**
- Record screen if possible
- Take notes on user behavior
- Ask "think aloud" questions
- Don't lead or help too much

**After Testing:**
- Ask what was confusing
- Ask what they liked
- Ask what they'd change
- Ask if they'd use it

---

## Regression Testing

### When to Run

Run regression tests:
- Before every deployment
- After fixing bugs
- After adding new features
- Weekly on main branch

### Critical User Flows

Test these flows work end-to-end:

**1. New Visitor Flow:**
1. Land on homepage
2. Browse to About page
3. Click "Apply" button
4. Fill out application
5. Submit successfully

**2. Donor Flow:**
1. Click "Donate" in navigation
2. Choose donation amount
3. Enter payment info
4. Complete donation
5. See thank you message

**3. Member Flow:**
1. Log in to account
2. View member dashboard
3. RSVP to an event
4. View profile
5. Update profile info

**4. Admin Flow:**
1. Log in as admin
2. View admin dashboard
3. Approve new member
4. Create new event
5. View analytics

---

## Bug Reporting

### Bug Report Template

When filing bugs, include:

```markdown
## Bug Title
Brief description of the issue

## Steps to Reproduce
1. Go to page X
2. Click button Y
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
(attach screenshots)

## Environment
- Browser: Chrome 120
- OS: macOS 14.0
- Device: MacBook Pro
- Screen size: 1920x1080
- Date/Time: 2025-11-05 10:30 AM

## Console Errors
(paste any console errors)

## Severity
- Critical / High / Medium / Low
```

### Severity Levels

**Critical:**
- Site is down
- Data loss
- Security vulnerability
- Payment processing broken

**High:**
- Major feature broken
- Affects most users
- No workaround available

**Medium:**
- Feature partially broken
- Affects some users
- Workaround available

**Low:**
- Minor visual issue
- Typo
- Enhancement request

---

## Testing Tools

### Recommended Tools

**Browser Testing:**
- [BrowserStack](https://www.browserstack.com) - Cross-browser testing
- [LambdaTest](https://www.lambdatest.com) - Browser compatibility

**Performance:**
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome
- [WebPageTest](https://www.webpagetest.org) - Detailed performance analysis
- [GTmetrix](https://gtmetrix.com) - Performance monitoring

**Accessibility:**
- [axe DevTools](https://www.deque.com/axe/devtools/) - Chrome extension
- [WAVE](https://wave.webaim.org) - Accessibility checker
- [Accessibility Insights](https://accessibilityinsights.io) - Microsoft tool

**Security:**
- [OWASP ZAP](https://www.zaproxy.org) - Security testing
- [securityheaders.com](https://securityheaders.com) - Header analysis
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL configuration test

**Mobile Testing:**
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/) - Built-in
- [Responsively App](https://responsively.app) - Multi-device testing

---

## Automated Testing (Future)

### Test Coverage Goals

**Unit Tests:**
- Target: 80% coverage
- Focus on business logic
- Test edge cases

**Integration Tests:**
- Test API endpoints
- Test database operations
- Test authentication

**End-to-End Tests:**
- Test critical user flows
- Use Playwright or Cypress
- Run on every deploy

### Example Test Structure

```
tests/
├── unit/
│   ├── lib/
│   ├── components/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── donation-flow.spec.ts
    ├── application-flow.spec.ts
    └── admin-flow.spec.ts
```

---

## Testing Schedule

### Daily (Development)
- Run affected tests before commit
- Check browser console for errors
- Test your feature manually

### Weekly (Pre-Release)
- Run full manual test checklist
- Test on multiple browsers
- Check Lighthouse scores
- Review and triage bugs

### Monthly (Health Check)
- Full UAT with real users
- Security audit
- Performance review
- Dependency updates

### Before Launch
- Complete all checklists
- Fix all critical bugs
- Get stakeholder approval
- Run penetration test

---

## Quality Gates

### Cannot Deploy If:

- ❌ Build fails
- ❌ Critical bugs open
- ❌ Accessibility score < 90
- ❌ Performance score < 80
- ❌ Security vulnerabilities found
- ❌ Main user flows broken

### Should Not Deploy If:

- ⚠️  High priority bugs open
- ⚠️  Major features not tested
- ⚠️  No stakeholder approval
- ⚠️  Documentation not updated

---

## Resources

### Learning Resources

- [Web.dev Testing Guide](https://web.dev/testing/)
- [MDN Testing Best Practices](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing)
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals)

### Accessibility Resources

- [WebAIM](https://webaim.org) - Accessibility guidelines
- [A11y Project](https://www.a11yproject.com) - Accessibility tips
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Official guidelines

---

## Conclusion

**Remember:**
- Testing is not optional
- Users are the best testers
- Fix bugs before adding features
- Accessibility is not optional
- Performance matters

**Questions?**
Contact the development team or refer to the main README.md for more information.

Happy testing! 🧪✨
