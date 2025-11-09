# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - link "BANIBS" [ref=e7] [cursor=pointer]:
        - /url: /
        - heading "BANIBS" [level=1] [ref=e8]
      - paragraph [ref=e9]: Sign in to your account
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: Email
          - textbox "you@example.com" [ref=e14]
        - generic [ref=e15]:
          - generic [ref=e16]: Password
          - textbox "••••••••" [ref=e17]
        - button "Sign In" [ref=e18] [cursor=pointer]
      - paragraph [ref=e20]:
        - text: Don't have an account?
        - link "Sign up" [ref=e21] [cursor=pointer]:
          - /url: /register
    - link "← Back to Home" [ref=e23] [cursor=pointer]:
      - /url: /
  - link "Made with Emergent" [ref=e24] [cursor=pointer]:
    - /url: https://app.emergent.sh/?utm_source=emergent-badge
    - generic [ref=e25]:
      - img [ref=e26]
      - paragraph [ref=e27]: Made with Emergent
```