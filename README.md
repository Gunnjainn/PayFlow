# PayFlow

A UPI-inspired payments platform, built around one assumption: every request arriving at the API is hostile until proven otherwise.

**[Live demo](https://pay-flow-one.vercel.app)**

## The idea

Users hold a balance, send money to other users, and see the transfer land. Small surface area, a lot of ways to get it wrong — which is exactly why it was worth building.

## Money moves atomically, or not at all

A transfer debits one account and credits another. If the process dies between those two writes, money has left one account without arriving at the other, and the ledger is wrong forever.

So the transfer runs inside a **MongoDB transaction** via a Mongoose session. Every read and write in the flow — the balance check, the receiver lookup, both `$inc` updates, and the transaction record — is bound to that session, and any failure path calls `abortTransaction()` before returning. There is no state where one side of the transfer committed and the other didn't.

The checks that happen before the money moves:

| Check | Response |
| --- | --- |
| Payload doesn't match the schema | `400` with the Zod errors |
| Sender is the receiver | `400 Cannot transfer to yourself` |
| Sender's account missing | `404` |
| Balance below the amount | `400 Insufficient balance` |
| Receiver doesn't exist | `400 Invalid receiver` |

## The security model

This is the part of the project I actually cared about.

**The client cannot say who it is.** The transfer endpoint takes `amount` and `to` from the request body — and nothing else. The sender is `req.userId`, decoded from the JWT by the auth middleware. There is no `from` field to tamper with. This is the single most important line of defence in the whole app, and it's an absence rather than a check.

| Concern | Approach |
| --- | --- |
| Identity | JWT in an `Authorization: Bearer` header, verified on every protected route; the middleware rejects with `403` on a missing header, a bad signature, or a token without a `userId` |
| Token lifetime | Signed with `expiresIn: '24h'` |
| Password storage | bcrypt, cost factor 10; the hash is compared on sign-in and the plaintext is never stored or logged |
| Password strength | Enforced by schema at signup — minimum 8 characters, at least one uppercase, one lowercase, one digit |
| Input validation | Zod schemas parsed at the top of every route, before any database call. The update schema is `.strict()`, so unknown keys are rejected rather than silently ignored |
| Transfer bounds | Amount must be positive, at least 0.01, at most 100000 |
| User enumeration | Unknown email and wrong password both return the same `401 Invalid credentials` |

## API

Base path: `/api/v1`

### `POST /user/signup`
`{ username (email), password, firstName, lastName }` → `201 { token }`
Creates the user, hashes the password, and opens an account with a random starting balance.

### `POST /user/signin`
`{ username, password }` → `200 { token }`

### `GET /user/auth` 🔒
Returns the signed-in user's first name. Used by the frontend to confirm a token is still valid.

### `PUT /user` 🔒
`{ firstName?, lastName?, password? }` → `200`

### `GET /user/bulk?filter=` 🔒
Case-insensitive search across first and last name. Returns id, username and name for each match.

### `GET /account/balance` 🔒
→ `{ balance }`

### `GET /account/transactions?limit=50&skip=0` 🔒
Paginated history, newest first, with each side populated to a name and email and each entry tagged `sent` or `received` relative to the caller.

### `POST /account/transfer` 🔒
`{ to, amount }` → `{ message, TxnId }`
Runs inside a MongoDB transaction. See above.

🔒 = requires `Authorization: Bearer <token>`

## Stack

- **Frontend** — React, Recoil, Tailwind CSS, Vite
- **Backend** — Node.js, Express
- **Database** — MongoDB with Mongoose, using replica-set transactions
- **Validation** — Zod
- **Auth** — jsonwebtoken, bcrypt

## Running it locally

```bash
git clone https://github.com/Gunnjainn/PayFlow.git
cd PayFlow/PayFlow-main/backend
npm install
cp .env.example .env
```

Then fill in `.env`:

```bash
PORT=3000
MONGO_URL=mongodb://localhost:27017/payflow
JWT_SECRET=   # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Transactions need a replica set.** A standalone `mongod` will fail on `startSession`. Use MongoDB Atlas, or run a single-node replica set locally with `mongod --replSet rs0` followed by `rs.initiate()` in `mongosh`.

```bash
npm run dev
```

Then the frontend:

```bash
cd ../frontend
npm install
npm run dev
```

## What I'd do next

- **Idempotency keys on transfers.** A retried request after a timeout currently sends the money twice. The standard fix is a client-supplied key stored with the transaction record and checked before processing.
- **Rate limiting on `/user/signin`.** Nothing currently slows down credential stuffing.
- **Decimal amounts as integer paise** rather than floats. Floating-point money is a bug waiting for a large enough number.
