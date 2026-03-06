## authRouter

- POST /signup
- POST /login
- POST /logout

## profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /porfile/password

## requestRouter

- POST /request/:status/:toUserId // here status will be either ignored OR interested
- POST /request/review/:status/:requestId // here status will be either accepted OR rejected

## userRouter

- GET /user/requests/received
- GET /user/connections
- GET /user/feed
