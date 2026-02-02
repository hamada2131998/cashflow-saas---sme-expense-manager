# CashFlow SaaS Smoke Tests 🧪

Follow these steps to verify the deployment. Replace `<TOKEN>` with the token from the login response.

### 1. Health Check
`curl http://localhost:3000/api/health`
**Expected:** `{"status":"OK", "database":"CONNECTED"}`

### 2. Login (Company A Owner)
`curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"owner@a.com", "password":"password123"}'`
**Action:** Copy the `token` from response.

### 3. Login (Company B Employee)
`curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"emp@b.com", "password":"password123"}'`
**Action:** Copy this separate token.

### 4. Tenant Isolation Check
Using **Token B**, try to list expenses:
`curl http://localhost:3000/api/expenses -H "Authorization: Bearer <TOKEN_B>"`
**Expected:** Should only show 1 expense (from Company B).

Using **Token A**, try to list expenses:
`curl http://localhost:3000/api/expenses -H "Authorization: Bearer <TOKEN_A>"`
**Expected:** Should only show Company A expenses.

### 5. Create Expense (Company A)
`curl -X POST http://localhost:3000/api/expenses -H "Authorization: Bearer <TOKEN_JOHN_A>" -H "Content-Type: application/json" -d '{"amount":50, "description":"Smoke test lunch"}'`

### 6. Atomic Approval Test
`curl -X PATCH http://localhost:3000/api/expenses/<ID>/status -H "Authorization: Bearer <TOKEN_OWNER_A>" -H "Content-Type: application/json" -d '{"status":"APPROVED"}'`
**Expected:** Response code 200, and check `custody` balance for John A decreased by 50.
