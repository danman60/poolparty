# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - navigation "Primary" [ref=e4]:
      - generic [ref=e5]:
        - link "PoolParty Home" [ref=e6] [cursor=pointer]:
          - /url: /
          - text: PoolParty
        - link "Dashboard" [ref=e7] [cursor=pointer]:
          - /url: /
        - link "Wallet" [ref=e8] [cursor=pointer]:
          - /url: /wallet
        - link "Status" [ref=e9] [cursor=pointer]:
          - /url: /status
      - generic [ref=e10]: "#ffb99b9"
  - main [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "Wallet" [level=1] [ref=e14]
        - button "Connect Wallet" [ref=e15]
      - paragraph [ref=e16]: Connect your wallet to view LP positions and perform actions.
      - generic [ref=e18]: Awaiting connection…
  - alert [ref=e19]
```